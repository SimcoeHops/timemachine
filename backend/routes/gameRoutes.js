const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { startNewGame, handleSceneChoice } = require('../services/gameService');

// POST: Standard generation of a fresh temporal trial
router.post('/start', async (req, res) => {
  try {
    const game = await startNewGame();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: RE-READ ROUTE (CONSTRAINED: Never call LLM generation on Fetch — stored scenes are returned verbatim)
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Timeline session not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Timeline continuation (LLM call restricted purely to processing forward choices)
router.post('/choice', async (req, res) => {
  try {
    const { gameId, choiceId } = req.body;
    const updatedGameStatus = await handleSceneChoice(gameId, choiceId);
    res.json(updatedGameStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
