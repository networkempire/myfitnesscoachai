import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = ({ active, onOpenProfileUpdate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/app' },
    { key: 'workout', label: 'Workout', path: '/app/workout' },
    { key: 'progress', label: 'Progress', path: '/app/progress' },
    { key: 'nutrition', label: 'Nutrition', path: '/app/nutrition' },
    { key: 'flexibility', label: 'Flexibility', path: '/app/flexibility' },
  ];

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Navigation Header */}
      <header className="top-nav">
        <div className="nav-logo" onClick={() => navigate('/app')}>
          <img src="/logo250.png" alt="MyFitnessCoachAI" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={active === item.key ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings Dropdown - Desktop */}
        <div className="settings-dropdown desktop-only" ref={settingsRef}>
          <button
            className="settings-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <span className="settings-icon">⚙️</span>
            <span className="settings-arrow">{settingsOpen ? '▲' : '▼'}</span>
          </button>

          {settingsOpen && (
            <div className="settings-menu">
              <div className="settings-user">
                <span className="user-email">{user?.email}</span>
              </div>
              <div className="settings-divider"></div>
              {onOpenProfileUpdate && (
                <button onClick={() => { setSettingsOpen(false); onOpenProfileUpdate(); }}>
                  Update My Profile
                </button>
              )}
              <button onClick={() => { setSettingsOpen(false); navigate('/app/account'); }}>
                Account Settings
              </button>
              <button onClick={() => { setSettingsOpen(false); navigate('/app/billing'); }}>
                Subscription & Billing
              </button>
              {user?.is_admin && (
                <>
                  <div className="settings-divider"></div>
                  <button onClick={() => { setSettingsOpen(false); navigate('/admin'); }}>
                    Admin Dashboard
                  </button>
                </>
              )}
              <div className="settings-divider"></div>
              <button className="signout-option" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src="/logo250.png" alt="MyFitnessCoachAI" />
        </div>
        <div className="mobile-user">
          <span>{user?.email}</span>
        </div>
        <nav className="mobile-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={active === item.key ? 'active' : ''}
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          <div className="mobile-nav-divider"></div>
          {onOpenProfileUpdate && (
            <button onClick={() => { setMenuOpen(false); onOpenProfileUpdate(); }}>
              Update My Profile
            </button>
          )}
          <button onClick={() => handleNavigate('/app/account')}>
            Account Settings
          </button>
          <button onClick={() => handleNavigate('/app/billing')}>
            Subscription & Billing
          </button>
          {user?.is_admin && (
            <>
              <div className="mobile-nav-divider"></div>
              <button onClick={() => handleNavigate('/admin')}>
                Admin Dashboard
              </button>
            </>
          )}
          <div className="mobile-nav-divider"></div>
          <button className="signout-mobile" onClick={handleLogout}>
            Sign Out
          </button>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
