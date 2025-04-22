import React, { useState, useEffect } from 'react';

const RightPanel = ({ scenarioId }) => {
  const storageKey = `rating-${scenarioId}`;
  const [likert, setLikert] = useState(3);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  // Load saved data when scenarioId changes
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const { likert: savedLikert, comment: savedComment } = JSON.parse(savedData);
      setLikert(savedLikert);
      setComment(savedComment);
    } else {
      // Reset to default values if no saved data exists
      setLikert(3);
      setComment('');
    }
  }, [scenarioId, storageKey]);

  // Save data whenever likert or comment changes
  useEffect(() => {
    const data = { likert, comment };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [likert, comment, storageKey]);

  const handleSave = () => {
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
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="5"
            value={likert}
            onChange={(e) => setLikert(Number(e.target.value))}
            className="likert-slider"
          />
          <div className="slider-labels">
            <span>Very comfortable</span>
            <span>Very concerned</span>
          </div>
          <div className="slider-ticks">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
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