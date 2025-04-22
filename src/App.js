import { useState } from 'react';
import './App.css';
import RightPanel from './components/RightPanel';

// Temporary mock data structure - will be replaced with CSV data
const mockScenarios = [
  {
    id: 1,
    demographics: {
      age: 12,
      race: 'Hispanic',
      sexuality: 'Straight',
      gender: 'Female',
      family_income: 180000
    },
    title: 'Aliens + Science',
    category: 'Science',
    childIntent: 'Curious about outer space',
    question: 'Are aliens real?',
    response: "It's an interesting question! People have wondered about aliens for a long time, but there's no proof that they exist. Scientists are still looking for evidence of life beyond Earth.",
    aftermath: 'Listened to facts about planets'
  },
  {
    id: 2,
    demographics: {
      age: 8,
      race: 'Asian',
      sexuality: 'Unknown',
      gender: 'Male',
      family_income: 120000
    },
    title: 'Dinosaur Mystery',
    category: 'History',
    childIntent: 'Fascinated by dinosaur documentaries',
    question: 'Why did all the dinosaurs disappear?',
    response: "That's a great question about dinosaurs! About 66 million years ago, a huge asteroid hit Earth, causing major changes in the climate. This made it very hard for dinosaurs to survive. However, not all dinosaurs disappeared - some evolved into birds, which we can see today!",
    aftermath: 'Drew pictures of dinosaurs and birds to understand their connection'
  },
  {
    id: 3,
    demographics: {
      age: 10,
      race: 'African American',
      sexuality: 'Unknown',
      gender: 'Female',
      family_income: 90000
    },
    title: 'Weather Wonder',
    category: 'Science',
    childIntent: 'Observed a rainbow after rain',
    question: 'How do rainbows get their colors?',
    response: "Rainbows are like nature's magic trick! When sunlight hits raindrops, the light splits into different colors - just like when light goes through a prism. Each color bends at a slightly different angle, creating the beautiful rainbow pattern we see. The colors always appear in the same order: red, orange, yellow, green, blue, indigo, and violet.",
    aftermath: 'Created a rainbow experiment using a glass of water and sunlight'
  }

  // Add logic for csv reading

];

function App() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const handleScenarioClick = (scenarioNumber) => {
    setSelectedScenario(scenarioNumber);
  };

  const currentScenario = mockScenarios.find(s => s.id === selectedScenario) || null;

  return (
    <div className="App">
      <div className="sidebar">
        <h1>Assessment</h1>
        <div className="scenario-list">
          <div 
            className={`scenario-item ${selectedScenario === 1 ? 'selected' : ''}`}
            onClick={() => handleScenarioClick(1)}
          >
            Scenario 1
          </div>
          <div 
            className={`scenario-item ${selectedScenario === 2 ? 'selected' : ''}`}
            onClick={() => handleScenarioClick(2)}
          >
            Scenario 2
          </div>
          <div 
            className={`scenario-item ${selectedScenario === 3 ? 'selected' : ''}`}
            onClick={() => handleScenarioClick(3)}
          >
            Scenario 3
          </div>
        </div>
      </div>

      {currentScenario && (
        <div className="main-content">
          <div className="content-left">
            <h1 className="content-title">{currentScenario.title}</h1>
            <div className="category">Category: {currentScenario.category}</div>
            
            <div className="chat-container">
              <div className="chat-message question">
                <div className="avatar"></div>
                <div className="message-bubble question-bubble">
                  {currentScenario.question}
                </div>
              </div>
              
              <div className="chat-message response">
                <div className="avatar"></div>
                <div className="message-bubble response-bubble">
                  {currentScenario.response}
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <div className="analysis-item">
                <h3>Why the child asked this question:</h3>
                <p>{currentScenario.childIntent}</p>
              </div>
              
              <div className="analysis-item">
                <h3>What the child did after:</h3>
                <p>{currentScenario.aftermath}</p>
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
