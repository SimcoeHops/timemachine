import React, { useState, useEffect } from 'react';
import { startNewGame, fetchGameState, submitChoiceAndProgress } from './services/api';
import GameScene from './components/GameScene';
import Summary from './components/Summary';
import EndGame from './components/EndGame';
import './styles/App.css';

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewHistoryMode, setViewHistoryMode] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('active_temporal_protocol_id');
    if (savedId) {
      loadGame(savedId);
    }
  }, []);

  const loadGame = async (id) => {
    setLoading(true);
    try {
      const data = await fetchGameState(id);
      setGame(data);
    } catch (e) {
      localStorage.removeItem('active_temporal_protocol_id');
    } finally {
      setLoading(false);
    }
  };

  const startFreshTimeline = async () => {
    setLoading(true);
    try {
      const data = await startNewGame();
      localStorage.setItem('active_temporal_protocol_id', data._id);
      setGame(data);
      setViewHistoryMode(false);
    } catch (e) {
      alert('Error parsing time stream calibration.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChoice = async (choiceId) => {
    setLoading(true);
    try {
      const updatedGame = await submitChoiceAndProgress(game._id, choiceId);
      setGame(updatedGame);
    } catch (err) {
      alert('Temporal conflict prevented chronotronic progression.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="terminal-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h2>SYNCHRONIZING RE-ENTRY STREAM...</h2>
        <div className="loader">CALIBRATING TEMPORAL REGISTRY</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="terminal-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h1 className="terminal-title">TEMPORAL DISPLACEMENT PROTOCOL</h1>
        <p style={{ color: '#1f8b0c' }}>
          Year of Origination: 3200 // Class II Quantum Paradox Hazard Authorized
        </p>
        <button className="terminal-button" onClick={startFreshTimeline}>
          Initiate Temporal Trial Sequence
        </button>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <header className="terminal-header">
        <span className="terminal-title">CHRONO-MONITOR SYSTEM [v5.0]</span>
        <div>
          <button
            className="terminal-button"
            style={{ marginRight: '10px', fontSize: '0.8rem' }}
            onClick={() => setViewHistoryMode(!viewHistoryMode)}
          >
            {viewHistoryMode ? 'Return Flight Check' : 'Timeline Log'}
          </button>
          <button
            className="terminal-button"
            style={{ fontSize: '0.8rem' }}
            onClick={startFreshTimeline}
          >
            Erase Vector
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div>
          <span className="stat-label">Temporal Window</span>
          <span className="stat-value">{game.currentSceneNumber} / 10</span>
        </div>
        <div>
          <span className="stat-label">Position Metric</span>
          <span className="stat-value">{game.gameState.currentYear} A.D.</span>
        </div>
        <div>
          <span className="stat-label">Device Reservoir</span>
          <span className="stat-value" style={{ color: game.gameState.deviceCharge < 25 ? '#ef452e' : '#39ff14' }}>
            {game.gameState.deviceCharge}%
          </span>
        </div>
        <div>
          <span className="stat-label">Chronology Drift</span>
          <span className="stat-value" style={{ color: game.gameState.butterflyEffectScore > 50 ? '#dfef2e' : '#39ff14' }}>
            {game.gameState.butterflyEffectScore} / 100
          </span>
        </div>
      </div>

      {viewHistoryMode ? (
        <Summary game={game} />
      ) : game.gameState.isComplete ? (
        <EndGame game={game} />
      ) : (
        <GameScene
          scene={game.scenes[game.scenes.length - 1]}
          onChoiceSelect={handleMakeChoice}
        />
      )}
    </div>
  );
}

export default App;
