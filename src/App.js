import './App.css';
import RightPanel from './components/RightPanel';

function App() {
  return (
    <div className="app-container">
      <div className="left-panel"></div>
      <div className="middle-panel"></div>
      <div className="right-panel">
        <RightPanel scenarioId="scenario1" />
      </div>
    </div>
  );
}

export default App;
