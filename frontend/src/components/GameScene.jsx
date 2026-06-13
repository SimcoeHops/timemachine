import React, { useState, useEffect, useRef } from 'react';
import ChoiceButton from './ChoiceButton';

const TTS_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tts`;
const USE_BACKEND_TTS = import.meta.env.VITE_USE_BACKEND_TTS === 'true';

function GameScene({ scene, onChoiceSelect }) {
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const audioRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (synthRef.current) synthRef.current.cancel();
    setNarrating(false);
  };

  useEffect(() => {
    if (!narrationEnabled || !scene?.narrative) { stopAll(); return; }

    if (USE_BACKEND_TTS) {
      // High-quality backend TTS (OpenAI onyx via OpenRouter)
      setNarrating(true);
      fetch(TTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scene.narrative })
      })
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          if (!audioRef.current) audioRef.current = new Audio();
          audioRef.current.src = url;
          audioRef.current.onended = () => { setNarrating(false); URL.revokeObjectURL(url); };
          audioRef.current.play();
        })
        .catch(() => setNarrating(false));
    } else {
      // Browser Web Speech API fallback (Apple Neural voices on iOS — sounds good)
      const synth = synthRef.current;
      if (!synth) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.narrative);
      utterance.rate = 0.9;
      utterance.pitch = 0.85;
      const voices = synth.getVoices();
      const preferred = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google US English'));
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => setNarrating(false);
      setNarrating(true);
      synth.speak(utterance);
    }

    return stopAll;
  }, [scene?.narrative, narrationEnabled]);

  if (!scene) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>COORDINATE LOCATOR: {scene.location} ({scene.yearInGame} A.D.)</strong>
        <button
          className="terminal-button"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={() => setNarrationEnabled(v => !v)}
        >
          {narrationEnabled ? (narrating ? '🔊 TRANSMITTING...' : '🔊 AUDIO ON') : '🔇 AUDIO OFF'}
        </button>
      </div>

      <p style={{ marginTop: '20px', lineHeight: '1.6', fontSize: '1.1rem' }}>
        {scene.narrative}
      </p>

      <div className="choices-grid">
        {scene.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            onSelect={() => { stopAll(); onChoiceSelect(choice.id); }}
          />
        ))}
      </div>
    </div>
  );
}

export default GameScene;
