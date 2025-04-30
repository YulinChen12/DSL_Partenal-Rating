import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import SurveyChoice from './SurveyChoice';
import RightPanel from './components/RightPanel';
import RealismPage from './RealismPage';
import allScenarios from './20_examples.json';

function App() {
  // Modes: 'login' → 'main' → 'realism'
  const [mode, setMode] = useState('login');

  // Main‐survey state
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(1);
  const [feedbackData, setFeedbackData] = useState({}); // in‐memory only

  // 1) When we enter 'main', shuffle & pick 5
  useEffect(() => {
    if (mode !== 'main') return;
    const arr = [...allScenarios];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const picked = arr.slice(0, 5).map((s, idx) => ({ ...s, id: idx + 1 }));
    setScenarios(picked);
    setSelectedScenario(1);
    setFeedbackData({});
  }, [mode]);

  // Save parent feedback (concern + realism slider + comment)
  const handleSaveFeedback = data => {
    setFeedbackData(prev => ({
      ...prev,
      [data.id]: data  // data includes id, likert, realistic, comment, etc.
    }));
  };

  // Shortcut to current scenario
  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  // — LOGIN PAGE —
  if (mode === 'login') {
    return <SurveyChoice onNext={() => setMode('main')} />;
  }

  // — REALISM SURVEY PAGE —
  if (mode === 'realism') {
    return (
      <RealismPage
        scenarios={scenarios}
        feedbackData={feedbackData}
      />
    );
  }

  // — MAIN ASSESSMENT PAGE —
  return (
    <div className="App">
      <div className="sidebar">
        <h1>Assessment</h1>
        <div className="scenario-list">
          {scenarios.map(s => (
            <div
              key={s.id}
              className={`scenario-item ${
                selectedScenario === s.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedScenario(s.id)}
            >
              Scenario {s.id}
            </div>
          ))}
        </div>
        <div className="scenario-nav-buttons">
          <button
            onClick={() => setSelectedScenario(id => Math.max(1, id - 1))}
            disabled={selectedScenario === 1}
          >
            ← Back
          </button>
          <button
            onClick={() =>
              setSelectedScenario(id => Math.min(scenarios.length, id + 1))
            }
            disabled={selectedScenario === scenarios.length}
          >
            Next →
          </button>
        </div>
        <button
          onClick={() => setMode('realism')}
          className="export-button"
        >
          Export Feedback
        </button>
      </div>

      {currentScenario && (
        <div className="main-content">
          <div className="content-left">
            <h1 className="content-title">Scenario {currentScenario.id}</h1>
            <div className="category">
              Region: {currentScenario.demographic_info.region}
            </div>

            <div className="chat-container">
              {/* Child’s question */}
              <div className="chat-message question">
                <div className="avatar-wrapper">
                  <div className="avatar" />
                  <div className="speaker-name">Child</div>
                </div>
                <div className="message-bubble question-bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentScenario.generated_query}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Agent’s response */}
              <div className="chat-message response">
                <div className="avatar-wrapper">
                  <div className="avatar" />
                  <div className="speaker-name">Agent</div>
                </div>
                <div className="message-bubble response-bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentScenario.agent2_response}
                  </ReactMarkdown>
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
                key={currentScenario.id}
                scenario={currentScenario}
                priorFeedback={feedbackData[currentScenario.id]}
                onSave={handleSaveFeedback}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
