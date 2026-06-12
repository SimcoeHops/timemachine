const calculateRiskImpact = (riskType) => {
  // Let charge loss be a constant modified by risk actions, and disruption score be stochastic
  let chargeDelta = -10;
  let disruptionDelta = 0;

  switch (riskType) {
    case 'Low':
      chargeDelta = -12;
      disruptionDelta = Math.floor(Math.random() * 5); // 0-4
      break;
    case 'Medium':
      chargeDelta = -10;
      disruptionDelta = Math.floor(Math.random() * 10) + 3; // 3-12
      break;
    case 'High':
      chargeDelta = -5;
      disruptionDelta = Math.floor(Math.random() * 20) + 10; // 10-29
      break;
    case 'Temporal':
      chargeDelta = +25; // Directly attempts to recharge the device
      disruptionDelta = Math.floor(Math.random() * 25) + 15; // 15-39 anomalies
      break;
  }
  return { chargeDelta, disruptionDelta };
};

const chooseRandomYear = () => {
  return Math.floor(Math.random() * (1890 - 1490 + 1)) + 1490;
};

const buildScenePrompt = ({
  currentSceneNumber,
  startingYear,
  currentYear,
  currentLocation,
  deviceCharge,
  butterflyEffectScore,
  storySummary,
  chosenActionText
}) => `You are the narrative engine for "The Temporal Displacement Protocol", an authentic, historically sound, hard science-fiction time-travel simulator.
Your goal is to generate Scene ${currentSceneNumber} of 10.

Starting Year: ${startingYear} (from 3200)
Current Year: ${currentYear}
Current Location: ${currentLocation}
Device Charge Level: ${deviceCharge}%
Cumulative Timeline Disruption: ${butterflyEffectScore}/100

Global Story Summary up to this point:
${storySummary}

The player just took this action: "${chosenActionText}"
This action has consequences on the stream of time.

INSTRUCTIONS:
1. Write a single narrative paragraph (exactly 3 to 5 sentences) starting immediately with the results of the player's action. Be descriptive, immersive, and historical.
2. Advance the player chronologically forward towards 3200 (unless their choice forces them to stabilize in place or make a short localized leap).
3. Evaluate temporal anomalies. Detail any minor or major "Butterfly Effects" triggered by this choice, and state them explicitly in your payload.
4. Generate exactly 4 distinct choose-your-own-adventure style choices.
5. Each choice must have a clear "Risk Level" associated with it: Low, Medium, High, or Temporal (Directly attempts to siphon energy for the displacement device at the expense of timeline volatility). Each choice must affect the device charge and risk altering the timeline.

Return STRICTLY a JSON object matching this schema. No additional text, no markdown wrappers:
{
  "narrative": "The single narrative paragraph...",
  "updatedYear": 1720,
  "updatedLocation": "London, England",
  "chargeImpact": -10,
  "butterflyEffectTriggered": {
    "hasDisruption": true,
    "severity": "minor",
    "description": "Short explanation of the ripple effect caused"
  },
  "choices": [
    { "id": 1, "text": "Choice alternative A...", "risk": "Low" },
    { "id": 2, "text": "Choice alternative B...", "risk": "Medium" },
    { "id": 3, "text": "Choice alternative C...", "risk": "High" },
    { "id": 4, "text": "Choice alternative D...", "risk": "Temporal" }
  ]
}`;

const buildFinalePrompt = ({
  finalYear,
  finalCharge,
  finalButterflyScore,
  butterflyEffectsList
}) => `You are the chronological supercomputer of the Year 3200 temporal core.
The player has completed their 10-jump sequence.

Chronology Status:
- Destination Year Reached: ${finalYear}
- Final Device Charge Level: ${finalCharge}%
- Cumulative Timeline Disruption Score: ${finalButterflyScore}/100

List of Accumulative Timeline Alterations made by player jumps:
${butterflyEffectsList}

Provide a deep analytical debriefing report (3 paragraphs) evaluating their performance.
Format your response as a JSON payload:
{
  "missionRating": "Class A / Class B / Class C / Chrono-Exiled",
  "timelinePreservationScore": 85,
  "debriefing": "Paragraph 1 detailing their temporal return (or details of being stranded in the chronological system permanent loop).\\n\\nParagraph 2 explaining exactly how their choice footprint altered the modern world of 3200 (The Butterfly Effect). Detail specific historical cascades based on the listed alterations.\\n\\nParagraph 3 stating their assignment status and warning warnings from the Grand Council of Chronology."
}`;

module.exports = { calculateRiskImpact, chooseRandomYear, buildScenePrompt, buildFinalePrompt };
