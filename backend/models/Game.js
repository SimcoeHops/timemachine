const mongoose = require('mongoose');

const ChoiceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  risk: { type: String, enum: ['Low', 'Medium', 'High', 'Temporal'], required: true }
});

const SceneSchema = new mongoose.Schema({
  sceneNumber: { type: Number, required: true },
  narrative: { type: String, required: true },
  yearInGame: { type: Number, required: true },
  location: { type: String, default: 'Unknown Coordinates' },
  choices: [ChoiceSchema],
  choiceSelected: { type: Number, default: null },
  choiceSelectedText: { type: String, default: null }
});

const ButterflyEffectSchema = new mongoose.Schema({
  sceneNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true }
});

const GameSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  currentSceneNumber: { type: Number, default: 1 },
  startYear: { type: Number, required: true },
  gameState: {
    currentYear: { type: Number, required: true },
    location: { type: String, default: 'Chrono-Arrival Zone' },
    deviceCharge: { type: Number, default: 100 },
    butterflyEffectScore: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false }
  },
  butterflyEffects: [ButterflyEffectSchema],
  scenes: [SceneSchema],
  ending: {
    missionRating: String,
    timelinePreservationScore: Number,
    debriefing: String
  }
});

module.exports = mongoose.model('Game', GameSchema);
