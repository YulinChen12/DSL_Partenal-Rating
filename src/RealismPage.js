import React, { useState } from 'react';

export default function RealismPage({
  scenarios = [],         // default to empty array
  feedbackData = {},      // default to empty object
  username = 'user'       // default username
}) {
  // initialize each realism rating to 3
  const [ratings, setRatings] = useState(
    scenarios.reduce((acc, s) => {
      acc[s.id] = 3;
      return acc;
    }, {})
  );

  const handleChange = (id, value) => {
    setRatings(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const merged = scenarios.map(s => ({
      ...feedbackData[s.id],
      realism_survey: ratings[s.id]
    }));
    const blob = new Blob([JSON.stringify(merged, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // use username in filename
    a.download = `${username}_full_feedback.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    window.alert('Thank you for completing the survey!');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Realism Survey</h1>
      {scenarios.map(s => (
        <div key={s.id} style={{ marginBottom: '2rem' }}>
          <h2>Scenario {s.id}</h2>
          <p>{s.generated_query}</p>
          <input
            type="range"
            min="1"
            max="5"
            value={ratings[s.id]}
            onChange={e => handleChange(s.id, Number(e.target.value))}
          />
          <div>Rating: {ratings[s.id]}</div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Submit All Feedback
      </button>
    </div>
  );
}
