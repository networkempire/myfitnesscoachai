import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitBetaRequest } from '../services/beta';
import './BetaLanding.css';

const BetaLanding = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const scrollToSignup = (e) => {
    e.preventDefault();
    const target = document.getElementById('signup');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitBetaRequest(name, email);
      setSuccess(true);
    } catch (err) {
      if (err.response?.data?.alreadySubmitted) {
        setError('This email has already been submitted. We\'ll be in touch soon!');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="beta-landing">
      {/* Hero Section */}
      <section className="beta-hero">
        <div className="beta-container">
          <h1>Stop Getting Generic Workouts.<br />Get YOUR Workout.</h1>
          <p className="subtitle">The first AI fitness coach that actually knows you</p>
          <button onClick={scrollToSignup} className="highlight">
            BETA TESTERS WANTED: Free Lifetime Premium Access
          </button>
          <p className="beta-hero-text">
            We're looking for 25 people to test our revolutionary AI fitness app.
            In exchange, you'll get free lifetime premium access (valued at $240/year).
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="beta-problem">
        <div className="beta-container">
          <h2>Tired of Cookie-Cutter Fitness Apps?</h2>
          <p className="intro">
            Every fitness app claims to be "personalized." But they're not talking to YOU.
          </p>

          <div className="problem-grid">
            <div className="problem-card">
              <h3>Generic Templates</h3>
              <p>Apps give everyone the same "beginner" or "intermediate" program. A 30-year-old athlete and a 60-year-old with bad knees get similar workouts.</p>
            </div>
            <div className="problem-card">
              <h3>Fake AI</h3>
              <p>They call it "AI" but it's just algorithms tweaking templates. No understanding of YOUR life, YOUR injuries, YOUR schedule.</p>
            </div>
            <div className="problem-card">
              <h3>Expensive or Useless</h3>
              <p>Real personal trainers cost $200-800/month. Template apps are cheap but don't work. There's nothing in between.</p>
            </div>
            <div className="problem-card">
              <h3>Boring & Rigid</h3>
              <p>Same workout every week. Can't adapt when life changes. No conversation, no understanding, no flexibility.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="beta-solution">
        <div className="beta-container">
          <h2>Meet MyFitnessCoachAI</h2>
          <p className="intro">
            The first fitness app that has an actual conversation with you, understands your complete situation,
            and generates a program built specifically for YOUR life.
          </p>

          <div className="solution-features">
            <div className="feature">
              <div className="feature-icon">💬</div>
              <h3>Real Conversation</h3>
              <p>Chat with AI like you would with a personal trainer. It asks follow-up questions, understands context, and learns about your goals, injuries, schedule, and preferences.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Truly Custom Programs</h3>
              <p>Not templates. Programs built from scratch for YOU: workout plan with specific weights, nutrition with your dietary preferences, flexibility for your goals.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔄</div>
              <h3>Adapts With You</h3>
              <p>Got injured? Equipment changed? Goals shifted? Life got busier? Your program instantly adapts. Quarterly check-ins keep you on track.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Benefits Section */}
      <section className="beta-benefits">
        <div className="beta-container">
          <h2>What Beta Testers Get</h2>
          <p className="intro">
            Help us build the future of fitness coaching and get incredible benefits in return:
          </p>

          <div className="benefits-list">
            <div className="benefit-item">
              <h3><span className="check">✓</span> Free Lifetime Premium</h3>
              <p>$19.99/month value = $240/year. You get it FREE for life. No credit card required. Ever.</p>
            </div>
            <div className="benefit-item">
              <h3><span className="check">✓</span> Early Access</h3>
              <p>Be among the first to experience true AI-powered fitness coaching before public launch.</p>
            </div>
            <div className="benefit-item">
              <h3><span className="check">✓</span> Shape the Product</h3>
              <p>Your feedback directly influences features and improvements. You're helping build this with us.</p>
            </div>
            <div className="benefit-item">
              <h3><span className="check">✓</span> Direct Support</h3>
              <p>Priority access to our team. Questions answered quickly. You're VIPs.</p>
            </div>
            <div className="benefit-item">
              <h3><span className="check">✓</span> Recognition</h3>
              <p>Beta testers featured on our website and in marketing (with your permission).</p>
            </div>
            <div className="benefit-item">
              <h3><span className="check">✓</span> Community</h3>
              <p>Join a small group of fitness enthusiasts building something revolutionary together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="beta-requirements">
        <div className="beta-container">
          <h2>What We Need From Beta Testers</h2>
          <p className="intro">
            To ensure quality feedback and help us improve, we're looking for committed testers who will:
          </p>

          <div className="requirements-grid">
            <div className="requirement-card">
              <h3>1. Complete the AI Intake</h3>
              <ul>
                <li>Have a 10-15 minute conversation with our AI</li>
                <li>Answer questions about your fitness goals, experience, and constraints</li>
                <li>Be honest and thorough (this makes your program better!)</li>
              </ul>
            </div>

            <div className="requirement-card">
              <h3>2. Follow Your Program</h3>
              <ul>
                <li>Try the workouts we generate for you</li>
                <li>Follow the program for at least 4 weeks</li>
                <li>Log your workouts and track your progress</li>
                <li>Test the nutrition and flexibility plans</li>
              </ul>
            </div>

            <div className="requirement-card">
              <h3>3. Give Honest Feedback</h3>
              <ul>
                <li>Weekly feedback surveys (5-10 minutes)</li>
                <li>Report bugs or issues you encounter</li>
                <li>Share what works and what doesn't</li>
                <li>Suggest improvements</li>
              </ul>
            </div>

            <div className="requirement-card">
              <h3>4. Write a Review</h3>
              <ul>
                <li>After 4 weeks, write an honest review</li>
                <li>Share your experience on our website (optional: social media)</li>
                <li>Be truthful - we want real feedback, good and bad</li>
              </ul>
            </div>
          </div>

          <div className="who-looking-for">
            <h3>Who We're Looking For:</h3>
            <ul>
              <li><span className="checkmark">✓</span> All fitness levels welcome (beginners to advanced)</li>
              <li><span className="checkmark">✓</span> Any age (we especially value diversity: 20s, 40s, 60s+, all welcome)</li>
              <li><span className="checkmark">✓</span> People with unique situations (injuries, limited equipment, busy schedules, health conditions)</li>
              <li><span className="checkmark">✓</span> Committed to testing thoroughly and providing honest feedback</li>
              <li><span className="checkmark">✓</span> Willing to share your experience through reviews</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="beta-social-proof">
        <div className="beta-container">
          <h2>Why This Matters</h2>
          <div className="stat-grid">
            <div className="stat">
              <div className="stat-number">50%</div>
              <div className="stat-label">of people would use AI for fitness but current apps disappoint</div>
            </div>
            <div className="stat">
              <div className="stat-number">$46B</div>
              <div className="stat-label">AI fitness market by 2034 - be part of the revolution</div>
            </div>
            <div className="stat">
              <div className="stat-number">90%</div>
              <div className="stat-label">cheaper than human coaches with similar personalization</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="signup" className="beta-cta">
        <div className="beta-container">
          <h2>Ready to Be a Beta Tester?</h2>
          <p>
            Join 25 people who will shape the future of AI fitness coaching.
            Get free lifetime premium access. Help us build something revolutionary.
          </p>

          {success ? (
            <div className="beta-success">
              <h3>Thank You!</h3>
              <p>Your beta access request has been submitted. We'll review your application and get back to you soon!</p>
            </div>
          ) : (
            <>
              {error && <div className="beta-error">{error}</div>}
              <form className="beta-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Request Beta Access'}
                </button>
              </form>
            </>
          )}

          <p className="limited">Limited to 25 testers - First come, first served</p>

          <p className="existing-user-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="beta-footer">
        <div className="beta-container">
          <p className="beta-footer-brand">
            <strong>MyFitnessCoachAI</strong> - The First Real AI Personal Trainer
          </p>
          <p className="beta-footer-copyright">
            © 2026 MyFitnessCoachAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BetaLanding;
