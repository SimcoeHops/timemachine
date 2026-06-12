import React from 'react';

function ChoiceButton({ choice, onSelect }) {
  let riskClass = 'btn-risk-low';
  if (choice.risk === 'Medium') riskClass = 'btn-risk-medium';
  if (choice.risk === 'High') riskClass = 'btn-risk-high';
  if (choice.risk === 'Temporal') riskClass = 'btn-risk-temporal';

  return (
    <button
      className={`terminal-button ${riskClass}`}
      onClick={onSelect}
      style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
    >
      <span>{choice.text}</span>
      <span style={{ fontSize: '0.7rem', paddingLeft: '8px', verticalAlign: 'middle' }}>
        [RISK: {choice.risk}]
      </span>
    </button>
  );
}

export default ChoiceButton;
