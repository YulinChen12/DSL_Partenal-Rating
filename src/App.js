// src/App.js
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import SurveyChoice from './SurveyChoice';
import RightPanel from './components/RightPanel';
import RealismPage from './RealismPage';
import allScenarios from './20_examples.json';

// Timer display component for a specific scenario
const ScenarioTimer = ({ scenarioId, startTime, elapsedTime, isActive }) => {
  const [currentTime, setCurrentTime] = useState(elapsedTime || 0);
  
  useEffect(() => {
    // Only update active timer
    if (!isActive || !startTime) return;
    
    // Update the timer every second
    const timer = setInterval(() => {
      const currentElapsed = Date.now() - startTime;
      setCurrentTime(elapsedTime + currentElapsed);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, elapsedTime, isActive]);
  
  // Format time as mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Only render timer for active scenarios (that have been viewed)
  if (!isActive && currentTime === 0) return null;
  
  return (
    <span className="scenario-timer" style={{ 
      fontSize: '12px',
      marginLeft: '8px',
      opacity: isActive ? 1 : 0.6
    }}>
      {formatTime(currentTime)}
    </span>
  );
};

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
  const [elapsedTimes, setElapsedTimes] = useState({}); // holds { [id]: totalMsSpentSoFar }
  
  // For typing time tracking
  const [typingStartTimes, setTypingStartTimes] = useState({}); // holds { [id]: timestamp }
  const [typingElapsedTimes, setTypingElapsedTimes] = useState({}); // holds { [id]: totalMsSpentSoFar }

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
    setElapsedTimes({});
    setStartTimes({ 1: Date.now() });
    setTypingElapsedTimes({});
    setTypingStartTimes({});
  }, [mode]);

  // 2) When navigating to a different scenario, pause current timer and start/resume new one
  useEffect(() => {
    if (mode !== 'main') return;
    
    // Pause current timer (if any) by accumulating elapsed time
    setElapsedTimes(prev => {
      const prevScenarioId = Object.keys(startTimes).find(id => 
        Number(id) !== selectedScenario && startTimes[id]
      );
      
      if (prevScenarioId) {
        const timeSpent = Date.now() - startTimes[prevScenarioId];
        const prevElapsed = prev[prevScenarioId] || 0;
        return {
          ...prev,
          [prevScenarioId]: prevElapsed + timeSpent
        };
      }
      return prev;
    });
    
    // Pause current typing timer (if any) by accumulating elapsed typing time
    setTypingElapsedTimes(prev => {
      const prevScenarioId = Object.keys(typingStartTimes).find(id => 
        Number(id) !== selectedScenario && typingStartTimes[id]
      );
      
      if (prevScenarioId) {
        const timeSpent = Date.now() - typingStartTimes[prevScenarioId];
        const prevElapsed = prev[prevScenarioId] || 0;
        return {
          ...prev,
          [prevScenarioId]: prevElapsed + timeSpent
        };
      }
      return prev;
    });
    
    // Clear previous typing timer for the scenario we just left
    setTypingStartTimes(prev => {
      const newStartTimes = { ...prev };
      Object.keys(newStartTimes).forEach(id => {
        if (Number(id) !== selectedScenario) {
          delete newStartTimes[id];
        }
      });
      return newStartTimes;
    });
    
    // Clear previous timer and start/resume the new one
    setStartTimes(prev => {
      const newStartTimes = {};
      newStartTimes[selectedScenario] = Date.now();
      return newStartTimes;
    });
    
  }, [selectedScenario, mode]);

  // Handle starting and stopping the typing timer for the current scenario
  const handleTypingStart = (scenarioId) => {
    setTypingStartTimes(prev => ({
      ...prev,
      [scenarioId]: Date.now()
    }));
  };
  
  const handleTypingStop = (scenarioId) => {
    const now = Date.now();
    if (typingStartTimes[scenarioId]) {
      const timeSpent = now - typingStartTimes[scenarioId];
      
      // Accumulate elapsed time
      setTypingElapsedTimes(prev => ({
        ...prev,
        [scenarioId]: (prev[scenarioId] || 0) + timeSpent
      }));
      
      // Clear the start time
      setTypingStartTimes(prev => {
        const newStartTimes = { ...prev };
        delete newStartTimes[scenarioId];
        return newStartTimes;
      });
    }
  };

  // 3) Save feedback + accumulate timeSpent
  const handleSaveFeedback = data => {
    const now = Date.now();
    const started = startTimes[data.id] || now;
    const currentSessionTime = now - started;
    const previousElapsedTime = elapsedTimes[data.id] || 0;
    const totalTimeSpentMs = previousElapsedTime + currentSessionTime;
    
    // Calculate current typing time if active
    let typingTimeMs = typingElapsedTimes[data.id] || 0;
    if (typingStartTimes[data.id]) {
      const currentTypingTime = now - typingStartTimes[data.id];
      typingTimeMs += currentTypingTime;
      
      // Reset typing start time since we're including it in the saved data
      setTypingStartTimes(prev => {
        const newTimes = { ...prev };
        delete newTimes[data.id];
        return newTimes;
      });
      
      // Update accumulated typing time
      setTypingElapsedTimes(prev => ({
        ...prev,
        [data.id]: typingTimeMs
      }));
    }
    
    // Record both in feedback and in our running total
    const entry = {
      ...data,
      timeSpentMs: totalTimeSpentMs,
      typingTimeMs: typingTimeMs,
      timestamp: new Date(now).toISOString()
    };

    // update feedback
    setFeedbackData(prev => ({ ...prev, [data.id]: entry }));
    
    // Reset the timer for this scenario (still viewing it)
    setStartTimes(prev => ({ ...prev, [data.id]: now }));
    
    // Reset elapsed time for this scenario (we've already recorded it)
    setElapsedTimes(prev => ({ ...prev, [data.id]: 0 }));
  };

  // When exporting feedback or leaving the app, make sure to capture current scenario time
  const handleExportFeedback = () => {
    // First, accumulate time for the current scenario
    const currentId = selectedScenario;
    const now = Date.now();
    if (startTimes[currentId]) {
      const currentSessionTime = now - startTimes[currentId];
      const previousElapsedTime = elapsedTimes[currentId] || 0;
      const totalTimeSpentMs = previousElapsedTime + currentSessionTime;
      
      // If there's existing feedback, update the time
      if (feedbackData[currentId]) {
        // Also calculate final typing time if needed
        let typingTimeMs = feedbackData[currentId].typingTimeMs || typingElapsedTimes[currentId] || 0;
        if (typingStartTimes[currentId]) {
          const currentTypingTime = now - typingStartTimes[currentId];
          typingTimeMs += currentTypingTime;
        }
        
        setFeedbackData(prev => ({
          ...prev,
          [currentId]: {
            ...prev[currentId],
            timeSpentMs: totalTimeSpentMs,
            typingTimeMs: typingTimeMs,
            timestamp: new Date(now).toISOString(),
            relevanceLikert: prev[currentId].relevanceLikert || 3,
            relevanceComment: prev[currentId].relevanceComment || ''
          }
        }));
      }
    }
    
    // Now proceed to realism page
    setMode('realism');
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
              <ScenarioTimer 
                scenarioId={s.id}
                startTime={selectedScenario === s.id ? startTimes[s.id] : null}
                elapsedTime={elapsedTimes[s.id] || 0}
                isActive={selectedScenario === s.id}
              />
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
        <button onClick={handleExportFeedback} className="export-button">
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
              {/* Child's question */}
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

              {/* Agent's response */}
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
                onTypingStart={() => handleTypingStart(currentScenario.id)}
                onTypingStop={() => handleTypingStop(currentScenario.id)}
                typingElapsedTime={typingElapsedTimes[currentScenario.id] || 0}
                typingStartTime={typingStartTimes[currentScenario.id] || null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
