import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getWeightProgression, getFullStats } from '../services/program';
import Navigation from '../components/Navigation';
import './ProgressPage.css';

const ProgressPage = () => {
  const [stats, setStats] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [progressionData, setProgressionData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load stats and progression data
      const [statsRes, progressionRes] = await Promise.all([
        getFullStats(),
        getWeightProgression()
      ]);

      setStats(statsRes);
      setProgressionData(progressionRes.progression || {});

      // Select first exercise with data by default
      const exercisesWithData = Object.keys(progressionRes.progression || {});
      if (exercisesWithData.length > 0) {
        setSelectedExercise(exercisesWithData[0]);
      }
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getChartData = () => {
    if (!selectedExercise || !progressionData[selectedExercise]) {
      return [];
    }

    return progressionData[selectedExercise].map(item => ({
      date: formatDate(item.date),
      weight: item.weight,
      fullDate: item.date
    }));
  };

  const exercisesWithData = Object.keys(progressionData);

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <Navigation active="progress" />

      <main className="progress-main">
        <div className="progress-title">
          <h2>Your Progress</h2>
          <p>Track your fitness journey and see how far you've come</p>
        </div>

        {/* Stats Overview */}
        <div className="progress-stats">
          <div className="stat-box">
            <span className="stat-number">{stats?.total_workouts_completed || 0}</span>
            <span className="stat-text">Total Workouts</span>
          </div>
          <div className="stat-box streak">
            <span className="stat-number">{stats?.current_streak_days || 0}</span>
            <span className="stat-text">Day Streak</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats?.longest_streak_days || 0}</span>
            <span className="stat-text">Best Streak</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats?.days_active_this_week || 0}</span>
            <span className="stat-text">This Week</span>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="chart-section">
          <h3>Weight Progression</h3>

          {exercisesWithData.length === 0 ? (
            <div className="no-data-message">
              <p>No workout data yet!</p>
              <p>Complete some workouts and log your weights to see your progression charts.</p>
              <button onClick={() => navigate('/app/workout')} className="start-workout-btn">
                Start a Workout
              </button>
            </div>
          ) : (
            <>
              <div className="exercise-selector">
                {exercisesWithData.map((exercise) => (
                  <button
                    key={exercise}
                    className={`exercise-btn ${selectedExercise === exercise ? 'active' : ''}`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    {exercise}
                  </button>
                ))}
              </div>

              <div className="chart-container">
                {getChartData().length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Weight', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value} lbs`, 'Weight']}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#9a031e"
                        strokeWidth={3}
                        dot={{ fill: '#9a031e', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="single-data-point">
                    <p>Only one data point for {selectedExercise}.</p>
                    <p className="hint">Complete more workouts to see your progression trend!</p>
                    {getChartData().length === 1 && (
                      <div className="current-weight">
                        <span className="weight-value">{getChartData()[0].weight} lbs</span>
                        <span className="weight-date">on {getChartData()[0].date}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              {getChartData().length > 1 && (
                <div className="progress-summary">
                  <div className="summary-item">
                    <span className="summary-label">Starting Weight</span>
                    <span className="summary-value">{getChartData()[0].weight} lbs</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Current Weight</span>
                    <span className="summary-value">{getChartData()[getChartData().length - 1].weight} lbs</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Progress</span>
                    <span className={`summary-value ${getChartData()[getChartData().length - 1].weight - getChartData()[0].weight >= 0 ? 'positive' : 'negative'}`}>
                      {getChartData()[getChartData().length - 1].weight - getChartData()[0].weight >= 0 ? '+' : ''}
                      {(getChartData()[getChartData().length - 1].weight - getChartData()[0].weight).toFixed(1)} lbs
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Workouts */}
        {stats?.recent_workouts?.length > 0 && (
          <div className="recent-section">
            <h3>Recent Workouts</h3>
            <div className="recent-workouts">
              {stats.recent_workouts.slice(0, 5).map((workout, index) => (
                <div key={index} className="workout-item">
                  <div className="workout-info">
                    <span className="workout-name">{workout.session_name}</span>
                    <span className="workout-day">{workout.day_name}</span>
                  </div>
                  <div className="workout-date">
                    {new Date(workout.workout_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgressPage;
