// src/SurveyChoice.js
import React, { useState } from 'react';
import './SurveyChoice.css';

export default function SurveyChoice({ onNext }) {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [character, setCharacter] = useState('');
  const [favoriteActivity, setFavoriteActivity] = useState('');

  const isValid =
    username.trim() &&
    age.trim() &&
    sex &&
    character.trim() &&
    favoriteActivity.trim();

  return (
    <div className="survey-choice-container">
      <div className="survey-choice-card">
        {/* Parent Username at the top */}
        <div className="form-group">
          <label>Parent Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder=""
          />
        </div>

        <h2>Tell Us About Your Child</h2>

        {/* Age */}
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            min="0"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="e.g. 8"
          />
        </div>

        {/* Sex */}
        <div className="form-group">
          <label>Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value)}>
            <option value="">Select…</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Character */}
        <div className="form-group">
          <label>Character</label>
          <input
            type="text"
            value={character}
            onChange={e => setCharacter(e.target.value)}
            placeholder="e.g. curious, thoughtful…"
          />
        </div>

        {/* Favorite Activity */}
        <div className="form-group">
          <label>Favorite Activity</label>
          <textarea
            value={favoriteActivity}
            onChange={e => setFavoriteActivity(e.target.value)}
            placeholder="e.g. drawing, soccer, reading…"
          />
        </div>

        {/* Continue */}
        <button
          disabled={!isValid}
          onClick={() =>
            onNext({
              username: username.trim(),
              age: age.trim(),
              sex,
              character: character.trim(),
              favoriteActivity: favoriteActivity.trim()
            })
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}
