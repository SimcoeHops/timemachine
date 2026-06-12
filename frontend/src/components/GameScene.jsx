import React, { useState, useEffect } from 'react';
import ChoiceButton from './ChoiceButton';

function GameScene({ scene, onChoiceSelect }) {
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    if (narrationEnabled && synth && scene?.narrative) {
      synth.cancel(); // Stop active voices
      const utterance = new SpeechSynthesisUtterance(scene.narrative);
      utterance.rate = 0.9;
      utterance.pitch = 0.85; // Machine aesthetic tone

      const voices = synth.getVoices();
      // Attempt to pick a clean narrative baritone voice
      const preferredVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google US English'));
      if (preferredVoice) utterance.voice = preferredVoice;

      synth.speak(utterance);
    }

    return () => {
      if (synth) synth.cancel();
    };
  }, [scene?.narrative, narrationEnabled, synth]);

  if (!scene) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>COORDINATE LOCATOR: {scene.location} ({scene.yearInGame} A.D.)</strong>
        <button
          className="terminal-button"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={() => setNarrationEnabled(!narrationEnabled)}
        >
          {narrationEnabled ? '🔊 AUDIO FEED ACTIVE' : '🔇 AUDIO SILENT'}
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
            onSelect={() => onChoiceSelect(choice.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default GameScene;
