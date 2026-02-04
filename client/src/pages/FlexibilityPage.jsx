import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProgram } from '../services/program';
import Navigation from '../components/Navigation';
import './ProgramPages.css';

// Generate YouTube search URL for stretch demonstrations
const getYouTubeSearchUrl = (stretchName) => {
  const searchQuery = `how to do ${stretchName} stretch`.replace(/\s+/g, '+');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
};

const FlexibilityPage = () => {
  const [flexibility, setFlexibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState('morning');
  const navigate = useNavigate();

  useEffect(() => {
    loadProgram();
  }, []);

  const loadProgram = async () => {
    try {
      const data = await getActiveProgram();
      setFlexibility(data.flexibility);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No program found. Complete your intake first.');
      } else {
        setError('Failed to load flexibility program.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="program-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-container">
        <Navigation active="flexibility" />
        <div className="program-error">
          <p>{error}</p>
          <button onClick={() => navigate('/app/intake')}>Start Intake</button>
        </div>
      </div>
    );
  }

  const routines = flexibility?.routines || {};
  const currentRoutine = routines[selectedRoutine];

  return (
    <div className="program-container">
      <Navigation active="flexibility" />

      <main className="program-main">
        <div className="program-title">
          <h2>{flexibility?.program_name || 'Your Flexibility Program'}</h2>
          <p>{flexibility?.overview}</p>
        </div>

        <div className="routine-info">
          <span>{flexibility?.frequency}</span>
          <span>{flexibility?.total_time_minutes} min total daily</span>
        </div>

        <div className="routine-selector">
          {Object.keys(routines).map((key) => (
            <button
              key={key}
              className={`routine-button ${selectedRoutine === key ? 'active' : ''}`}
              onClick={() => setSelectedRoutine(key)}
            >
              {routines[key]?.name || key}
            </button>
          ))}
        </div>

        {currentRoutine && (
          <div className="routine-detail">
            <div className="routine-header">
              <h3>{currentRoutine.name}</h3>
              <span className="routine-meta">
                {currentRoutine.duration_minutes} min • {currentRoutine.when}
              </span>
            </div>

            <div className="stretches-list">
              {currentRoutine.stretches?.map((stretch, index) => (
                <div key={index} className="stretch-card">
                  <div className="stretch-header">
                    <span className="stretch-number">{index + 1}</span>
                    <div>
                      <h5>
                        {stretch.name}
                        <a
                          href={getYouTubeSearchUrl(stretch.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="youtube-link"
                          title={`Watch how to do ${stretch.name}`}
                        >
                          ▶
                        </a>
                      </h5>
                      <span className="stretch-target">{stretch.target_area}</span>
                    </div>
                  </div>
                  <div className="stretch-details">
                    <div className="detail">
                      <span className="label">Hold</span>
                      <span className="value">{stretch.hold_seconds}s</span>
                    </div>
                    {stretch.reps && (
                      <div className="detail">
                        <span className="label">Reps</span>
                        <span className="value">{stretch.reps}</span>
                      </div>
                    )}
                  </div>
                  <p className="stretch-instructions">{stretch.instructions}</p>
                  {stretch.breathing && (
                    <p className="stretch-breathing">Breathing: {stretch.breathing}</p>
                  )}
                  {stretch.modification && (
                    <p className="stretch-mod">Modification: {stretch.modification}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {flexibility?.desk_breaks && flexibility.desk_breaks.length > 0 && (
          <div className="desk-breaks-section">
            <h3>Desk Breaks</h3>
            <p className="section-intro">Quick stretches to do throughout your workday</p>
            <div className="desk-breaks-list">
              {flexibility.desk_breaks.map((stretch, index) => (
                <div key={index} className="desk-break-card">
                  <h5>
                    {stretch.name}
                    <a
                      href={getYouTubeSearchUrl(stretch.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube-link"
                      title={`Watch how to do ${stretch.name}`}
                    >
                      ▶
                    </a>
                  </h5>
                  <span className="break-frequency">{stretch.frequency}</span>
                  <p>{stretch.instructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {flexibility?.tips && (
          <div className="program-tips">
            <h4>Flexibility Tips</h4>
            <ul>
              {flexibility.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {flexibility?.progression && (
          <div className="program-progression">
            <h4>Progression</h4>
            <p>{flexibility.progression}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FlexibilityPage;
