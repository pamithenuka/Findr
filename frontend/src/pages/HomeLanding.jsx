import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomeLanding() {
  const navigate = useNavigate();
  
  // Check auth state to see if we let them post or redirect them to login
  const isAuthenticated = !!localStorage.getItem('findr_user');

  const handleAction = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Once we build the creation forms/modals, we will route them there
      navigate('/dashboard', { state: { openForm: type } });
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HERO SECTION --- */}
      <header style={styles.hero}>
        <h1 style={styles.headline}>
          Lost it? <span style={{ color: 'var(--accent-coral)' }}>Find it.</span> <br />
          Found it? <span style={{ color: 'var(--accent-teal)' }}>Return it.</span>
        </h1>
        <p style={styles.subheadline}>
          The smart, secure lost and found ecosystem built exclusively for the campus community.
        </p>

        {/* Action-First Dual Buttons */}
        <div style={styles.ctaGroup}>
          <button 
            onClick={() => handleAction('lost')} 
            style={styles.lostBtn}
          >
            🔍 I Lost Something
          </button>
          
          <button 
            onClick={() => handleAction('found')} 
            style={styles.foundBtn}
          >
            🤝 I Found Something
          </button>
        </div>
      </header>

      {/* --- LIVE FEED PLACEHOLDER SECTION --- */}
      <section style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Recent Campus Postings</h2>
          <span style={styles.liveBadge}>● Live Feed</span>
        </div>
        
        <div style={styles.placeholderCard}>
          <p style={{ color: 'var(--text-muted)' }}>
            Connecting to database... Next, we will pull your real-time items array here!
          </p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '4rem 2rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  headline: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-1.5px',
    marginBottom: '1.5rem',
    color: 'var(--text-white)',
  },
  subheadline: {
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    marginBottom: '2.5rem',
    lineHeight: '1.6',
  },
  ctaGroup: {
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  lostBtn: {
    backgroundColor: 'transparent',
    color: 'var(--accent-coral)',
    border: '2px solid var(--accent-coral)',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer', // Fixed: Successfully wrapped as a valid string!
    transition: 'all 0.2s ease',
  },
  foundBtn: {
    backgroundColor: 'var(--accent-teal)',
    color: 'var(--bg-navy)',
    border: '2px solid var(--accent-teal)',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer', // Fixed: Successfully wrapped as a valid string!
    transition: 'all 0.2s ease',
  },
  feedSection: {
    borderTop: '1px solid var(--border-muted)',
    paddingTop: '3rem',
  },
  feedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  feedTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  liveBadge: {
    color: 'var(--accent-teal)',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
  },
  placeholderCard: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '3rem',
    textAlign: 'center',
  }
};

export default HomeLanding;