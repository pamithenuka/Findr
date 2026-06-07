import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  // Check if a user is logged in by looking for our 30-day token package
  const storedUser = localStorage.getItem('findr_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Log out mechanism: Wipe the browser cache and send them to the landing page
  const handleLogout = () => {
    localStorage.removeItem('findr_user');
    navigate('/login');
    window.location.reload(); // Refresh to update global component states
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo Linked to Home Feed */}
        <Link to="/" style={styles.logo}>
          Findr<span style={{ color: 'var(--accent-teal)' }}>.</span>
        </Link>

        {/* Dynamic Navigation Links based on Auth State */}
        <div style={styles.navLinks}>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.link}>My Dashboard</Link>
              <Link to="/profile" style={styles.link}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ ...styles.link, color: 'var(--accent-coral)' }}>Admin Panel</Link>
              )}
              <span style={styles.welcomeText}>Hi, {user.name.split(' ')[0]} 👋</span>
              <button onClick={handleLogout} className="btn-secondary" style={styles.logoutBtn}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Log In</Link>
              <button onClick={() => navigate('/register')} className="btn-primary">
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Styling aligned perfectly to your Deep Navy & Teal Design System
const styles = {
  nav: {
    backgroundColor: 'var(--surface-card)',
    borderBottom: '1px solid var(--border-muted)',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    color: 'var(--text-white)',
    fontSize: '1.5rem',
    fontWeight: '700',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    color: 'var(--text-white)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
  },
  welcomeText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
  }
};

export default Navbar;