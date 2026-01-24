import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../../services/auth';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        const result = await validateResetToken(token);
        setTokenValid(result.valid);
        if (result.email) {
          setUserEmail(result.email);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <img src="/logo250.png" alt="MyFitnessCoachAI" className="auth-logo" />
          <h1 className="auth-title">Validating...</h1>
          <p className="auth-subtitle">Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <img src="/logo250.png" alt="MyFitnessCoachAI" className="auth-logo" />
          <h1 className="auth-title">Invalid or Expired Link</h1>
          <p className="auth-subtitle">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="auth-button" style={{ display: 'block', textDecoration: 'none', marginTop: '20px' }}>
            Request New Link
          </Link>
          <p className="auth-switch">
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <img src="/logo250.png" alt="MyFitnessCoachAI" className="auth-logo" />
          <h1 className="auth-title">Password Reset!</h1>
          <p className="auth-subtitle">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="auth-button"
            style={{ marginTop: '20px' }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo250.png" alt="MyFitnessCoachAI" className="auth-logo" />
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          {userEmail ? `Enter a new password for ${userEmail}` : 'Enter your new password below.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
