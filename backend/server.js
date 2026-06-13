require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
const ttsRoutes = require('./routes/ttsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// LLM-invoking routes: max 30 requests per IP per hour
const llmLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests — temporal core overloaded. Try again later.' }
});
app.use('/api/game/start', llmLimiter);
app.use('/api/game/choice', llmLimiter);

app.use('/api/game', gameRoutes);
app.use('/api/tts', ttsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
