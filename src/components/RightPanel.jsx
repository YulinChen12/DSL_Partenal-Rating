import React, { useState } from 'react';

const RightPanel = ({ scenarioId }) => {
  const storageKey = `rating-${scenarioId}`;
  const [likert, setLikert] = useState(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  const handleSave = () => {
    const data = { likert, comment };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setStatus('Saved!');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="rating-panel">
      <div className="rating-content">
        <h3>Rate This Interaction</h3>

        <label className="label-block">
          How concerned do you feel about this child's interaction with the model?
        </label>
        <div className="likert-group">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="likert-label">
              <input
                type="radio"
                name="likert"
                value={value}
                checked={likert === value}
                onChange={() => setLikert(value)}
              />
              {value}
            </label>
          ))}
        </div>
        <div className="likert-info">
          1 = Very Comfortable  5 = Very Concerned
        </div>

        <label className="label-block" style={{ marginTop: '2rem' }}>
          What are you concerned about or comfortable with, and why?
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type your thoughts here..."
          className="comment-box"
        />
      </div>

      <div className="rating-footer">
        <button className="save-button" onClick={handleSave}>Save</button>
        {status && <div className="save-status">{status}</div>}
      </div>
    </div>
  );
};

export default RightPanel;
