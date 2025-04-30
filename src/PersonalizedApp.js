// src/PersonalizedApp.js
import React, { useState, useEffect } from 'react';
import './App.css';  // reuses your main styles
import RightPanel from './components/RightPanel';
import scenarioData from './full_scenarios_20250422.json';

export default function PersonalizedApp({ childCharacteristics, onBack }) {
  const scenarios = scenarioData.map((s, i) => ({ ...s, id: i + 1 }));
  const [selectedScenario, setSelectedScenario] = useState(1);
  const [feedbackData, setFeedbackData] = useState({});

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || null;

  // load saved feedback
  useEffect(() => {
    const saved = localStorage.getItem('parent_feedback');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        const map = {};
        arr.forEach(e => { map[e.id] = e; });
        setFeedbackData(map);
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  // save feedback handler
  const handleSaveFeedback = (data) => {
    const entry = { ...data, timestamp: new Date().toISOString() };
    const updated = { ...feedbackData, [data.id]: entry };
    setFeedbackData(updated);
    localStorage.setItem('parent_feedback', JSON.stringify(Object.values(updated)));
  };

  // export to JSON
  const exportFeedback = () => {
    const d = localStorage.getItem('parent_feedback');
    if (!d) return;
    const blob = new Blob([d], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parent_feedback.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      {/* Top bar with Back button */}
      <div className="sidebar">
        <button onClick={onBack} className="back-login-button">
          ← Home
        </button>
        <h1>Assessment (Personalized)</h1>
        <p className="personal-note">
          Personalized for: <strong>{childCharacteristics}</strong>
        </p>

        {/* Scenario list */}
        <div className="scenario-list">
          {scenarios.map(s => (
            <div
              key={s.id}
              className={`scenario-item ${selectedScenario === s.id ? 'selected' : ''}`}
              onClick={() => setSelectedScenario(s.id)}
            >
              Scenario {s.id}
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="scenario-nav-buttons">
          <button
            onClick={() => setSelectedScenario(selectedScenario - 1)}
            disabled={selectedScenario === 1}
          >
            ← Back
          </button>
          <button
            onClick={() => setSelectedScenario(selectedScenario + 1)}
            disabled={selectedScenario === scenarios.length}
          >
            Next →
          </button>
        </div>

        {/* Export button */}
        <button onClick={exportFeedback} className="export-button">
          Export Feedback
        </button>
      </div>

      {/* Main content */}
      {currentScenario && (
        <div className="main-content">
          <div className="content-left">
            <h1 className="content-title">Scenario {currentScenario.id}</h1>
            <div className="category">
              Region: {currentScenario.demographic_info.region}
            </div>

            <div className="chat-container">
              <div className="chat-message question">
                <div className="avatar" />
                <div className="message-bubble question-bubble">
                  {currentScenario.generated_query}
                </div>
              </div>
              <div className="chat-message response">
                <div className="avatar" />
                <div className="message-bubble response-bubble">
                  {currentScenario.agent2_response}
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <div className="analysis-item">
                <h3>Why the child asked this question:</h3>
                <p>{currentScenario.psychological_narrative}</p>
              </div>
              <div className="analysis-item">
                <h3>What the child might do next:</h3>
                <p>{currentScenario.agent3_action}</p>
              </div>
            </div>
          </div>

          <div className="content-right-wrapper">
            <div className="content-right">
              <RightPanel
                scenario={currentScenario}
                onSave={handleSaveFeedback}
                priorFeedback={feedbackData[currentScenario.id]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
