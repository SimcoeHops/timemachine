import React from 'react';

function Summary({ game }) {
  // Renders historical arrays (guaranteed strictly correct since no LLM runs on pull)
  return (
    <div>
      <h3>CHRONOLOGY RECONSTRUCTION ANALYSIS</h3>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {game.scenes.map((s, idx) => (
          <div
            key={s._id || idx}
            style={{
              borderLeft: '2px solid #1f8b0c',
              paddingLeft: '15px',
              marginBottom: '20px'
            }}
          >
            <h4 style={{ margin: 0, color: '#39ff14' }}>
              Jump {s.sceneNumber}: {s.yearInGame} A.D. - Loc: {s.location}
            </h4>
            <p style={{ fontStyle: 'italic', margin: '5px 0' }}>{s.narrative}</p>
            {s.choiceSelectedText && (
              <p style={{ color: '#dfef2e', fontSize: '0.9rem' }}>
                &gt; Selection: {s.choiceSelectedText}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Summary;
