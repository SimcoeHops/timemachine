const Game = require('../models/Game');
const { callOpenRouter } = require('./geminiService');
const {
  calculateRiskImpact,
  chooseRandomYear,
  buildScenePrompt,
  buildFinalePrompt
} = require('../utils/gameHelpers');

const NARRATIVE_SYSTEM_PROMPT =
  'You are the narrative engine for "The Temporal Displacement Protocol", a hard science-fiction time-travel simulator. Always respond with a single strict JSON object and nothing else.';

const FINALE_SYSTEM_PROMPT =
  'You are the chronological supercomputer of the Year 3200 temporal core. Always respond with a single strict JSON object and nothing else.';

const TOTAL_SCENES = 10;

// Verbatim stored-history digest fed back to the LLM as context (read path stays DB-only)
const summarizeHistory = (game) =>
  game.scenes
    .map(
      (s) =>
        `Scene ${s.sceneNumber} (${s.yearInGame} A.D., ${s.location}): ${s.narrative.substring(0, 100)}... Chose: ${s.choiceSelectedText || 'pending'}`
    )
    .join('\n');

const startNewGame = async () => {
  const initialYear = chooseRandomYear();

  const firstScenePrompt = buildScenePrompt({
    currentSceneNumber: 1,
    startingYear: initialYear,
    currentYear: initialYear,
    currentLocation: 'Temporal Crashsite',
    deviceCharge: 100,
    butterflyEffectScore: 0,
    storySummary: 'No prior history. This is the opening scene.',
    chosenActionText: `The player, a displaced temporal researcher from the Year 3200, has just crash-landed in the Year ${initialYear} after a catastrophic displacement core failure. They must survive, stay inconspicuous, and begin the 10-jump sequence home.`
  });

  const initialData = await callOpenRouter(NARRATIVE_SYSTEM_PROMPT, firstScenePrompt);
  const initialLocation = initialData.updatedLocation || initialData.location || 'Temporal Crashsite';

  const game = new Game({
    startYear: initialYear,
    gameState: {
      currentYear: initialYear,
      location: initialLocation,
      deviceCharge: 100,
      butterflyEffectScore: 0,
      isComplete: false
    },
    scenes: [
      {
        sceneNumber: 1,
        narrative: initialData.narrative,
        yearInGame: initialYear,
        location: initialLocation,
        choices: initialData.choices
      }
    ]
  });

  await game.save();
  return game;
};

const handleSceneChoice = async (gameId, choiceId) => {
  const game = await Game.findById(gameId);
  if (!game || game.gameState.isComplete) throw new Error('Invalid game action');

  const currentScene = game.scenes.find((s) => s.sceneNumber === game.currentSceneNumber);
  const selectedChoice = currentScene.choices.find((c) => c.id === choiceId);
  if (!selectedChoice) throw new Error('Unknown choice for current scene');

  currentScene.choiceSelected = choiceId;
  currentScene.choiceSelectedText = selectedChoice.text;

  // Progress mechanics: C(i+1) = C(i) + deltaC(a), B(i+1) = B(i) + sigma(a)
  const { chargeDelta, disruptionDelta } = calculateRiskImpact(selectedChoice.risk);

  let newCharge = game.gameState.deviceCharge + chargeDelta;
  newCharge = Math.max(0, Math.min(100, newCharge));

  let newDisruption = game.gameState.butterflyEffectScore + disruptionDelta;
  newDisruption = Math.min(100, newDisruption);

  if (game.currentSceneNumber >= TOTAL_SCENES) {
    // Final jump: returning to 3200 requires residual charge in the device
    const finalYear = newCharge > 0 ? 3200 : game.gameState.currentYear;

    game.gameState.isComplete = true;
    game.gameState.deviceCharge = newCharge;
    game.gameState.butterflyEffectScore = newDisruption;
    game.gameState.currentYear = finalYear;

    const butterflyEffectsList = game.butterflyEffects.length
      ? game.butterflyEffects
          .map((b) => `- Scene ${b.sceneNumber}, ${b.year} A.D. [${b.severity}]: ${b.description}`)
          .join('\n')
      : 'No recorded timeline alterations.';

    const endingData = await callOpenRouter(
      FINALE_SYSTEM_PROMPT,
      buildFinalePrompt({
        finalYear,
        finalCharge: newCharge,
        finalButterflyScore: newDisruption,
        butterflyEffectsList
      })
    );

    game.ending = endingData;
    await game.save();
    return game;
  }

  const nextSceneNumber = game.currentSceneNumber + 1;
  const generatePrompt = buildScenePrompt({
    currentSceneNumber: nextSceneNumber,
    startingYear: game.startYear,
    currentYear: game.gameState.currentYear,
    currentLocation: game.gameState.location,
    deviceCharge: newCharge,
    butterflyEffectScore: newDisruption,
    storySummary: summarizeHistory(game),
    chosenActionText: selectedChoice.text
  });

  const nextSceneData = await callOpenRouter(NARRATIVE_SYSTEM_PROMPT, generatePrompt);
  const nextLocation = nextSceneData.updatedLocation || nextSceneData.location || game.gameState.location;

  if (nextSceneData.butterflyEffectTriggered?.hasDisruption) {
    game.butterflyEffects.push({
      sceneNumber: nextSceneNumber,
      year: nextSceneData.updatedYear,
      severity: nextSceneData.butterflyEffectTriggered.severity,
      description: nextSceneData.butterflyEffectTriggered.description
    });
  }

  game.currentSceneNumber = nextSceneNumber;
  game.gameState.currentYear = nextSceneData.updatedYear;
  game.gameState.location = nextLocation;
  game.gameState.deviceCharge = newCharge;
  game.gameState.butterflyEffectScore = newDisruption;

  // Write path: the narrative payload is persisted permanently and never regenerated
  game.scenes.push({
    sceneNumber: nextSceneNumber,
    narrative: nextSceneData.narrative,
    yearInGame: nextSceneData.updatedYear,
    location: nextLocation,
    choices: nextSceneData.choices
  });

  await game.save();
  return game;
};

module.exports = { startNewGame, handleSceneChoice };
