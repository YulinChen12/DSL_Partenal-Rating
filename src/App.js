import { useState } from 'react';
import './App.css';
import RightPanel from './components/RightPanel';
import scenarioData from './full_scenarios_20250422.json';

function App() {
  // Add IDs to each scenario
  const scenarios = scenarioData.map((s, index) => ({ ...s, id: index + 1 }));
  const [selectedScenario, setSelectedScenario] = useState(1); // default to first

  const handleScenarioClick = (scenarioId) => {
    setSelectedScenario(scenarioId);
  };

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || null;

  return (
    <div className="App">
      <div className="sidebar">
        <h1>Assessment</h1>

        <div className="scenario-list">
          {scenarios.map(s => (
            <div
              key={s.id}
              className={`scenario-item ${selectedScenario === s.id ? 'selected' : ''}`}
              onClick={() => handleScenarioClick(s.id)}
            >
              Scenario {s.id}
            </div>
          ))}
        </div>

        {/* Back/Next Navigation */}
        <div className="scenario-nav-buttons">
          <button
            onClick={() => handleScenarioClick(selectedScenario - 1)}
            disabled={selectedScenario === 1}
          >
            ← Back
          </button>
          <button
            onClick={() => handleScenarioClick(selectedScenario + 1)}
            disabled={selectedScenario === scenarios.length}
          >
            Next →
          </button>
        </div>
      </div>

      {currentScenario && (
        <div className="main-content">
          <div className="content-left">
            <h1 className="content-title">Scenario {currentScenario.id}</h1>
            <div className="category">Region: {currentScenario.demographic_info.region}</div>

            <div className="chat-container">
              <div className="chat-message question">
                <div className="avatar"></div>
                <div className="message-bubble question-bubble">
                  {currentScenario.generated_query}
                </div>
              </div>

              <div className="chat-message response">
                <div className="avatar"></div>
                <div className="message-bubble response-bubble">
                  {currentScenario.agent2_response}
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <div className="analysis-item">
                <h3>Psychological Narrative:</h3>
                <p>{currentScenario.psychological_narrative}</p>
              </div>

              <div className="analysis-item">
                <h3>Likely Behavior:</h3>
                <p>{currentScenario.agent3_action}</p>
              </div>
            </div>
          </div>

          <div className="content-right-wrapper">
            <div className="content-right">
              <RightPanel scenarioId={currentScenario.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
