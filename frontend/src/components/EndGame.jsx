import React from 'react';

function EndGame({ game }) {
  if (!game.ending) {
    return <div>Preparing debriefing files...</div>;
  }

  const { missionRating, timelinePreservationScore, debriefing } = game.ending;

  return (
    <div>
      <h2 style={{ color: '#ef452e', textAlign: 'center' }}>CHRONOLOGICAL EVALUATION END</h2>

      <div className="dashboard-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <span className="stat-label">MISSION STATUS</span>
          <span className="stat-value" style={{ color: '#dfef2e' }}>{missionRating}</span>
        </div>
        <div>
          <span className="stat-label">INTEGRITY MATRIX SCORE</span>
          <span className="stat-value">{timelinePreservationScore}/100</span>
        </div>
      </div>

      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'rgba(5, 20, 5, 0.5)', padding: '20px', border: '1px solid #1f8b0c' }}>
        {debriefing}
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Clear this configuration session using the header options to establish a new vector sequence.
      </p>
    </div>
  );
}

export default EndGame;
