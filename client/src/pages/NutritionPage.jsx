import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProgram } from '../services/program';
import Navigation from '../components/Navigation';
import './ProgramPages.css';

const NutritionPage = () => {
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProgram();
  }, []);

  const loadProgram = async () => {
    try {
      const data = await getActiveProgram();
      setNutrition(data.nutrition);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No program found. Complete your intake first.');
      } else {
        setError('Failed to load nutrition plan.');
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
        <Navigation active="nutrition" />
        <div className="program-error">
          <p>{error}</p>
          <button onClick={() => navigate('/app/intake')}>Start Intake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="program-container">
      <Navigation active="nutrition" />

      <main className="program-main">
        <div className="program-title">
          <h2>{nutrition?.plan_name || 'Your Nutrition Plan'}</h2>
          <p>{nutrition?.overview}</p>
        </div>

        <div className="macro-cards">
          <div className="macro-card calories">
            <span className="macro-value">{nutrition?.daily_targets?.calories}</span>
            <span className="macro-label">Calories</span>
          </div>
          <div className="macro-card protein">
            <span className="macro-value">{nutrition?.daily_targets?.protein_g}g</span>
            <span className="macro-label">Protein</span>
          </div>
          <div className="macro-card carbs">
            <span className="macro-value">{nutrition?.daily_targets?.carbs_g}g</span>
            <span className="macro-label">Carbs</span>
          </div>
          <div className="macro-card fat">
            <span className="macro-value">{nutrition?.daily_targets?.fat_g}g</span>
            <span className="macro-label">Fat</span>
          </div>
        </div>

        {nutrition?.calorie_explanation && (
          <div className="explanation-box">
            <p>{nutrition.calorie_explanation}</p>
          </div>
        )}

        <div className="nutrition-section">
          <h3>Sample Meals</h3>
          {nutrition?.sample_meals?.map((meal, index) => (
            <div key={index} className="meal-card">
              <div className="meal-header">
                <h4>{meal.meal}</h4>
                <span className="meal-time">{meal.time}</span>
              </div>
              <div className="meal-options">
                {meal.options?.map((option, optIndex) => (
                  <div key={optIndex} className="meal-option">
                    <h5>{option.name}</h5>
                    <p>{option.description}</p>
                    <div className="option-macros">
                      <span>{option.calories} cal</span>
                      <span>{option.protein_g}g protein</span>
                      <span>{option.prep_time_minutes} min prep</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {nutrition?.meal_timing && (
          <div className="nutrition-section">
            <h3>Workout Nutrition</h3>
            <div className="timing-cards">
              <div className="timing-card">
                <h4>Pre-Workout</h4>
                <p>{nutrition.meal_timing.pre_workout}</p>
              </div>
              <div className="timing-card">
                <h4>Post-Workout</h4>
                <p>{nutrition.meal_timing.post_workout}</p>
              </div>
            </div>
          </div>
        )}

        {nutrition?.grocery_staples && (
          <div className="nutrition-section">
            <h3>Grocery Staples</h3>
            <div className="staples-list">
              {nutrition.grocery_staples.map((item, index) => (
                <span key={index} className="staple-item">{item}</span>
              ))}
            </div>
          </div>
        )}

        {nutrition?.practical_tips && (
          <div className="program-tips">
            <h4>Nutrition Tips</h4>
            <ul>
              {nutrition.practical_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default NutritionPage;
