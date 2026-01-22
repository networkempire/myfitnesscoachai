import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProgram, startWorkout, updateExerciseLog, completeWorkout, getTodaysWorkoutLog } from '../services/program';
import Navigation from '../components/Navigation';
import './ProgramPages.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WorkoutPage = () => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState(null);
  const [exercisesLogged, setExercisesLogged] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);
  const navigate = useNavigate();

  const today = DAYS[new Date().getDay()];

  useEffect(() => {
    loadProgram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProgram = async () => {
    try {
      const data = await getActiveProgram();
      setProgram(data.workout);
      if (data.workout?.weekly_schedule?.length > 0) {
        // Try to find today's workout first, otherwise default to first day
        const todaysWorkout = data.workout.weekly_schedule.find(d => d.day === today);
        const selectedWorkout = todaysWorkout || data.workout.weekly_schedule[0];
        setSelectedDay(selectedWorkout);

        // Check if there's an in-progress workout for today
        if (todaysWorkout) {
          try {
            const logData = await getTodaysWorkoutLog(today);
            if (logData.exists && !logData.completed) {
              // Resume the in-progress workout
              setWorkoutLogId(logData.log_id);
              setExercisesLogged(logData.exercises_logged);
              setWorkoutActive(true);
            }
          } catch (logErr) {
            // No existing log, that's fine
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No program found. Complete your intake first.');
      } else {
        setError('Failed to load program.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!selectedDay) return;

    try {
      const result = await startWorkout(
        selectedDay.day,
        selectedDay.session_name,
        selectedDay.exercises
      );
      setWorkoutLogId(result.log_id);
      setExercisesLogged(result.exercises_logged);
      setWorkoutActive(true);
      if (result.resumed) {
        // Workout was resumed from earlier
      }
    } catch (err) {
      console.error('Failed to start workout:', err);
    }
  };

  const handleSetComplete = async (exerciseIndex) => {
    const exercise = exercisesLogged[exerciseIndex];
    const newSetsCompleted = Math.min(exercise.sets_completed + 1, exercise.sets_total);

    // Optimistic update
    const updatedExercises = [...exercisesLogged];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      sets_completed: newSetsCompleted
    };
    setExercisesLogged(updatedExercises);

    try {
      await updateExerciseLog(workoutLogId, exerciseIndex, {
        sets_completed: newSetsCompleted
      });
    } catch (err) {
      // Revert on error
      setExercisesLogged(exercisesLogged);
      console.error('Failed to update exercise:', err);
    }
  };

  const handleWeightChange = async (exerciseIndex, newWeight) => {
    const exercise = exercisesLogged[exerciseIndex];

    // Optimistic update
    const updatedExercises = [...exercisesLogged];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      weight_used: newWeight
    };
    setExercisesLogged(updatedExercises);

    try {
      await updateExerciseLog(workoutLogId, exerciseIndex, {
        weight_used: newWeight
      });
    } catch (err) {
      // Revert on error
      setExercisesLogged(exercisesLogged);
      console.error('Failed to update weight:', err);
    }
  };

  const handleCompleteWorkout = async () => {
    setCompleting(true);
    try {
      const result = await completeWorkout(workoutLogId);
      setCompletionMessage(result.message);
      setWorkoutActive(false);
      // Show success for a moment then reset
      setTimeout(() => {
        setCompletionMessage(null);
        setWorkoutLogId(null);
        setExercisesLogged([]);
      }, 3000);
    } catch (err) {
      console.error('Failed to complete workout:', err);
    } finally {
      setCompleting(false);
    }
  };

  const allExercisesComplete = exercisesLogged.length > 0 &&
    exercisesLogged.every(e => e.sets_completed >= e.sets_total);

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
        <Navigation active="workout" />
        <div className="program-error">
          <p>{error}</p>
          <button onClick={() => navigate('/intake')}>Start Intake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="program-container">
      <Navigation active="workout" />

      <main className="program-main">
        <div className="program-title">
          <h2>{program?.program_name || 'Your Workout Program'}</h2>
          <p>{program?.overview}</p>
        </div>

        <div className="day-selector">
          {program?.weekly_schedule?.map((day, index) => (
            <button
              key={index}
              className={`day-button ${selectedDay?.day === day.day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.day}
            </button>
          ))}
        </div>

        {selectedDay && (
          <div className="workout-detail">
            <div className="workout-header">
              <h3>{selectedDay.session_name}</h3>
              <span className="workout-meta">
                {selectedDay.duration_minutes} min • {selectedDay.focus}
              </span>
            </div>

            {selectedDay.warmup && (
              <div className="workout-section warmup">
                <h4>Warm-up</h4>
                <p>{selectedDay.warmup}</p>
              </div>
            )}

            <div className="exercises-list">
              <h4>Exercises</h4>
              {selectedDay.exercises?.map((exercise, index) => {
                const loggedExercise = exercisesLogged[index];
                const setsCompleted = loggedExercise?.sets_completed || 0;
                const isComplete = setsCompleted >= exercise.sets;

                return (
                  <div key={index} className={`exercise-card ${workoutActive && isComplete ? 'completed' : ''}`}>
                    <div className="exercise-header">
                      <span className="exercise-number">{index + 1}</span>
                      <h5>{exercise.name}</h5>
                      {workoutActive && isComplete && <span className="exercise-check">✓</span>}
                    </div>
                    <div className="exercise-details">
                      <div className="detail">
                        <span className="label">Sets</span>
                        <span className="value">
                          {workoutActive ? `${setsCompleted}/${exercise.sets}` : exercise.sets}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">Reps</span>
                        <span className="value">{exercise.reps}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Weight</span>
                        {workoutActive ? (
                          <input
                            type="text"
                            className="weight-input"
                            value={loggedExercise?.weight_used || exercise.weight || ''}
                            onChange={(e) => handleWeightChange(index, e.target.value)}
                            placeholder="e.g. 20 lbs"
                          />
                        ) : (
                          <span className="value">{exercise.weight}</span>
                        )}
                      </div>
                      <div className="detail">
                        <span className="label">Rest</span>
                        <span className="value">{exercise.rest_seconds}s</span>
                      </div>
                    </div>
                    {workoutActive && !isComplete && (
                      <button
                        className="set-complete-btn"
                        onClick={() => handleSetComplete(index)}
                      >
                        Complete Set {setsCompleted + 1}
                      </button>
                    )}
                    {exercise.notes && (
                      <p className="exercise-notes">{exercise.notes}</p>
                    )}
                    {exercise.substitution && (
                      <p className="exercise-sub">Alternative: {exercise.substitution}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDay.cooldown && (
              <div className="workout-section cooldown">
                <h4>Cool-down</h4>
                <p>{selectedDay.cooldown}</p>
              </div>
            )}

            {/* Workout Action Buttons */}
            <div className="workout-actions">
              {!workoutActive && !completionMessage && (
                <button className="start-workout-btn" onClick={handleStartWorkout}>
                  Start Workout
                </button>
              )}

              {workoutActive && (
                <button
                  className={`complete-workout-btn ${allExercisesComplete ? 'ready' : ''}`}
                  onClick={handleCompleteWorkout}
                  disabled={completing}
                >
                  {completing ? 'Saving...' : allExercisesComplete ? 'Complete Workout!' : 'Finish Early'}
                </button>
              )}

              {completionMessage && (
                <div className="completion-message">
                  <span className="completion-icon">🎉</span>
                  <p>{completionMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {program?.tips && (
          <div className="program-tips">
            <h4>Tips for Success</h4>
            <ul>
              {program.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {program?.progression_plan && (
          <div className="program-progression">
            <h4>Progression Plan</h4>
            <p>{program.progression_plan}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutPage;
