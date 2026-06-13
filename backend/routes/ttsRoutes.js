const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST { text } → streams back MP3 audio
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.length > 2000) {
    return res.status(400).json({ error: 'Invalid text payload' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/audio/speech',
      {
        model: process.env.TTS_MODEL || 'openai/tts-1',
        input: text,
        voice: process.env.TTS_VOICE || 'onyx',
        response_format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://localhost:3000',
          'X-Title': 'Temporal Displacement Protocol'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('TTS error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Narration synthesis failed' });
  }
});

module.exports = router;
