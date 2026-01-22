import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveProgram, getUserStats } from '../services/program';
import Navigation from '../components/Navigation';
import './Dashboard.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasProgram, setHasProgram] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const today = DAYS[new Date().getDay()];

  useEffect(() => {
    checkForProgram();
    fetchStats();
  }, []);

  const checkForProgram = async () => {
    try {
      const data = await getActiveProgram();
      setHasProgram(true);
      setProgram(data);
    } catch (err) {
      setHasProgram(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (err) {
      // Stats not critical, ignore errors
    }
  };

  // Find today's workout
  const todaysWorkout = program?.workout?.weekly_schedule?.find(
    (day) => day.day === today
  );

  // Helper to convert string to title case
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  // Get user's first name from email
  const userName = user?.email?.split('@')[0] || '';

  // Check if today is a rest day
  const isRestDay = program?.workout?.rest_days?.includes(today);

  return (
    <div className="dashboard-container">
      <Navigation active="dashboard" />

      <main className="dashboard-main">
        <div className="welcome-section">
          {hasProgram ? (
            <>
              <h2>{toTitleCase(userName)}, Your Program is Ready!</h2>
              <p className="program-name">{toTitleCase(program?.program_name)}</p>
              <p className="program-cta">
                Your personalized workout, nutrition, and flexibility plans have been crafted just for you.
                Explore each one below and start your transformation today!
              </p>
            </>
          ) : (
            <>
              <h2>Welcome!</h2>
              <p>Complete your intake to get your personalized program.</p>
            </>
          )}
        </div>

        {/* Quick Stats Section */}
        {hasProgram && stats && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.current_streak_days}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💪</div>
                <div className="stat-value">{stats.total_workouts_completed}</div>
                <div className="stat-label">Workouts Done</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{stats.days_active_this_week}</div>
                <div className="stat-label">Active This Week</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{stats.longest_streak_days}</div>
                <div className="stat-label">Best Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Workout Section */}
        {hasProgram && (
          <div className="todays-section">
            <h3>Today's Workout — {today}</h3>
            {isRestDay ? (
              <div className="rest-day-card">
                <div className="rest-icon">😴</div>
                <h4>Rest Day</h4>
                <p>Take it easy today! Your body recovers and grows stronger during rest.</p>
                <p className="rest-tip">Consider doing some light stretching or a relaxing walk.</p>
              </div>
            ) : todaysWorkout ? (
              <div className="todays-workout-card">
                <div className="workout-card-header">
                  <div>
                    <h4>{todaysWorkout.session_name}</h4>
                    <span className="workout-focus">{todaysWorkout.focus}</span>
                  </div>
                  <span className="workout-duration">{todaysWorkout.duration_minutes} min</span>
                </div>

                <div className="exercise-preview">
                  {todaysWorkout.exercises?.slice(0, 4).map((exercise, index) => (
                    <div key={index} className="exercise-preview-item">
                      <span className="exercise-num">{index + 1}</span>
                      <span className="exercise-name">{exercise.name}</span>
                      <span className="exercise-sets">{exercise.sets} × {exercise.reps}</span>
                    </div>
                  ))}
                  {todaysWorkout.exercises?.length > 4 && (
                    <div className="exercise-preview-more">
                      +{todaysWorkout.exercises.length - 4} more exercises
                    </div>
                  )}
                </div>

                <button
                  className="start-workout-button"
                  onClick={() => navigate('/workout')}
                >
                  Start Today's Workout
                </button>
              </div>
            ) : (
              <div className="no-workout-card">
                <p>No workout scheduled for today. Check your full program for your weekly schedule.</p>
                <button onClick={() => navigate('/workout')} className="view-program-link">
                  View Full Program
                </button>
              </div>
            )}
          </div>
        )}

        {/* Weekly Overview */}
        {hasProgram && program?.workout?.weekly_schedule && (
          <div className="weekly-overview">
            <h3>This Week</h3>
            <div className="week-days">
              {DAYS.map((day) => {
                const workout = program.workout.weekly_schedule.find(w => w.day === day);
                const isRest = program.workout.rest_days?.includes(day);
                const isToday = day === today;

                return (
                  <div
                    key={day}
                    className={`week-day ${isToday ? 'today' : ''} ${isRest ? 'rest' : ''}`}
                  >
                    <span className="day-name">{day.slice(0, 3)}</span>
                    <span className="day-workout">
                      {isRest ? 'Rest' : workout?.session_name?.split(' ')[0] || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="dashboard-cards">
          {!hasProgram ? (
            <div className="dashboard-card highlight">
              <div className="card-icon">💬</div>
              <h3>Start Intake</h3>
              <p>Begin your personalized consultation with our AI coach</p>
              <button className="card-button" onClick={() => navigate('/intake')}>Start Now</button>
            </div>
          ) : (
            <div className="dashboard-card">
              <div className="card-icon">💬</div>
              <h3>New Consultation</h3>
              <p>Start a new intake to update your program</p>
              <button className="card-button secondary" onClick={() => navigate('/intake')}>Start New</button>
            </div>
          )}

          <div className="dashboard-card">
            <div className="card-icon">🏋️</div>
            <h3>My Workout</h3>
            <p>View and track your workout program</p>
            <button
              className="card-button"
              onClick={() => navigate('/workout')}
              disabled={!hasProgram && !loading}
            >
              {hasProgram ? 'View Workout' : 'Complete Intake First'}
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🥗</div>
            <h3>My Nutrition</h3>
            <p>Check your personalized nutrition plan</p>
            <button
              className="card-button"
              onClick={() => navigate('/nutrition')}
              disabled={!hasProgram && !loading}
            >
              {hasProgram ? 'View Nutrition' : 'Complete Intake First'}
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🧘</div>
            <h3>My Flexibility</h3>
            <p>Stretching and mobility routines</p>
            <button
              className="card-button"
              onClick={() => navigate('/flexibility')}
              disabled={!hasProgram && !loading}
            >
              {hasProgram ? 'View Flexibility' : 'Complete Intake First'}
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📈</div>
            <h3>My Progress</h3>
            <p>Track your gains and see your journey</p>
            <button
              className="card-button secondary"
              onClick={() => navigate('/progress')}
            >
              View Progress
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
