// src/App.js
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import SurveyChoice from './SurveyChoice';
import RightPanel from './components/RightPanel';
import RealismPage from './RealismPage';
import allScenarios from './20_examples.json';

function App() {
  // Modes: 'login' | 'main' | 'realism'
  const [mode, setMode] = useState('login');

  // Parent & Child Info
  const [username, setUsername] = useState('');
  const [childInfo, setChildInfo] = useState({});

  // Main‐survey state
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(1);
  const [feedbackData, setFeedbackData] = useState({}); // holds { [id]: { …data, timeSpentMs } }
  const [startTimes, setStartTimes] = useState({});     // holds { [id]: timestamp }

  // 1) When we flip into 'main', shuffle & pick 5, clear feedback, start timer for 1
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
    setStartTimes({ 1: Date.now() });
  }, [mode]);

  // 2) Whenever you navigate to a new scenario, start its timer if needed
  useEffect(() => {
    if (mode !== 'main') return;
    setStartTimes(prev => {
      if (prev[selectedScenario]) return prev;
      return { ...prev, [selectedScenario]: Date.now() };
    });
  }, [selectedScenario, mode]);

  // 3) Save feedback + accumulate timeSpent
  const handleSaveFeedback = data => {
    const now = Date.now();
    const started = startTimes[data.id] || now;
    const delta = now - started;
    const previous = feedbackData[data.id]?.timeSpentMs || 0;
    const timeSpentMs = previous + delta;

    const entry = {
      ...data,
      timeSpentMs,
      timestamp: new Date(now).toISOString()
    };

    // update feedback and reset that scenario's start time
    setFeedbackData(prev => ({ ...prev, [data.id]: entry }));
    setStartTimes(prev => ({ ...prev, [data.id]: now }));
  };

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  // — LOGIN PAGE —
  if (mode === 'login') {
    return (
      <SurveyChoice
        onNext={info => {
          setUsername(info.username);
          setChildInfo(info);
          setMode('main');
        }}
      />
    );
  }

  // — REALISM SURVEY PAGE —
  if (mode === 'realism') {
    return (
      <RealismPage
        scenarios={scenarios}
        feedbackData={feedbackData}
        username={username}
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
              className={`scenario-item ${selectedScenario === s.id ? 'selected' : ''}`}
              onClick={() => setSelectedScenario(s.id)}
            >
              Scenario {s.id}
            </div>
          ))}
        </div>
        <div className="scenario-nav-buttons">
          <button
            onClick={() => setSelectedScenario(i => Math.max(1, i - 1))}
            disabled={selectedScenario === 1}
          >
            ← Back
          </button>
          <button
            onClick={() => setSelectedScenario(i => Math.min(scenarios.length, i + 1))}
            disabled={selectedScenario === scenarios.length}
          >
            Next →
          </button>
        </div>
        <button onClick={() => setMode('realism')} className="export-button">
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
