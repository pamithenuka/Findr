import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ItemCard from '../components/ItemCard'; 

function HomeLanding() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = !!localStorage.getItem('findr_user');

  // Fetch recent posts directly from backend database array on load
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await API.get('/items');
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAction = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
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

        <div style={styles.ctaGroup}>
          <button onClick={() => handleAction('lost')} style={styles.lostBtn}>
            🔍 I Lost Something
          </button>
          <button onClick={() => handleAction('found')} style={styles.foundBtn}>
            🤝 I Found Something
          </button>
        </div>
      </header>

      {/* --- LIVE FEED LIVE SECTION --- */}
      <section style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Recent Campus Postings</h2>
          <span style={styles.liveBadge}>● Live Feed</span>
        </div>
        
        {loading ? (
          <div style={styles.statusBox}>Loading active feeds...</div>
        ) : items.length === 0 ? (
          <div style={styles.statusBox}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No lost or found items reported on campus yet.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent-teal)' }}>Be the first to help out the community!</p>
          </div>
        ) : (
          /* Responsive CSS Grid to display items neatly */
          <div style={styles.grid}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' },
  hero: { textAlign: 'center', marginBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headline: { fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-1.5px', marginBottom: '1.5rem', color: 'var(--text-white)' },
  subheadline: { fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: '1.6' },
  ctaGroup: { display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' },
  lostBtn: { backgroundColor: 'transparent', color: 'var(--accent-coral)', border: '2px solid var(--accent-coral)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '600', borderRadius: 'var(--border-radius)', cursor: 'pointer', transition: 'all 0.2s ease' },
  foundBtn: { backgroundColor: 'var(--accent-teal)', color: 'var(--bg-navy)', border: '2px solid var(--accent-teal)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '600', borderRadius: 'var(--border-radius)', cursor: 'pointer', transition: 'all 0.2s ease' },
  feedSection: { borderTop: '1px solid var(--border-muted)', paddingTop: '3rem' },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  feedTitle: { fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' },
  liveBadge: { color: 'var(--accent-teal)', fontSize: '0.875rem', fontWeight: '600', backgroundColor: 'rgba(45, 212, 191, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px' },
  statusBox: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '3rem', textAlign: 'center' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  }
};

export default HomeLanding;