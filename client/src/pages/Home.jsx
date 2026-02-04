import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-logo">MyFitnessCoachAI</h1>
        <nav className="home-nav">
          {user ? (
            <Link to="/app" className="nav-button primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="nav-button">Sign In</Link>
              <Link to="/signup" className="nav-button primary">Get Started</Link>
            </>
          )}
        </nav>
      </header>

      <main className="home-hero">
        <h2 className="hero-title">
          Your Personal AI<br />
          <span className="highlight">Fitness Coach</span>
        </h2>
        <p className="hero-subtitle">
          Get a truly personalized workout, nutrition, and flexibility program
          created through a natural conversation with AI. No templates.
          Just programs built specifically for you.
        </p>
        <div className="hero-cta">
          {user ? (
            <Link to="/app" className="cta-button">Go to Dashboard</Link>
          ) : (
            <Link to="/signup" className="cta-button">Start Your Journey</Link>
          )}
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">💬</div>
            <h3>Conversational Intake</h3>
            <p>Tell us about your goals, schedule, and limitations through a natural chat</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🏋️</div>
            <h3>Custom Workouts</h3>
            <p>Get workout programs tailored to your equipment and experience level</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🥗</div>
            <h3>Nutrition Plans</h3>
            <p>Receive personalized meal guidelines that fit your lifestyle</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🧘</div>
            <h3>Flexibility Routines</h3>
            <p>Improve mobility with stretches designed for your needs</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
