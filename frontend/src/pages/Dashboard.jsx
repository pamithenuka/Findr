import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for the item creation form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics', // Default fallback value
    location: '',
    status: 'lost' // Initial fallback state
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if a user redirected here from the Hero action buttons
  useEffect(() => {
    if (location.state?.openForm) {
      setFormData((prev) => ({ ...prev, status: location.state.openForm }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Connects to your backend POST /api/items endpoint
      // Our API utility automatically injects the user's JWT token!
      await API.post('/items', formData);
      
      setSuccess(`Success! Your ${formData.status} item listing has been posted.`);
      
      // Reset text inputs but preserve the status type
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        status: formData.status
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Theme UI Toggles matching your design principles
  const isLost = formData.status === 'lost';
  const themeColor = isLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
  const activeTabStyle = {
    backgroundColor: isLost ? 'rgba(249, 115, 22, 0.15)' : 'rgba(45, 212, 191, 0.15)',
    borderColor: themeColor,
    color: themeColor,
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>User Dashboard</h1>
      <p style={styles.pageSubtitle}>Report a new campus listing or manage your items.</p>

      <div style={styles.dashboardGrid}>
        {/* LEFT COLUMN: THE INTRACTIVE POST CREATION FORM */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Report an Item</h2>
          
          {/* Status Toggle Switch */}
          <div style={styles.toggleGroup}>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, status: 'lost' })}
              style={{ ...styles.toggleTab, ...(isLost ? activeTabStyle : {}) }}
            >
              🔍 Lost Item
            </button>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, status: 'found' })}
              style={{ ...styles.toggleTab, ...(!isLost ? activeTabStyle : {}) }}
            >
              🤝 Found Item
            </button>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}
          {success && <div style={{ ...styles.successAlert, color: themeColor, borderColor: themeColor }}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Item Name / Title</label>
              <input 
                type="text" name="title" required style={styles.input}
                placeholder="e.g., Black Dell Laptop, Keys with red keychain"
                value={formData.title} onChange={handleChange}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select name="category" style={styles.select} value={formData.category} onChange={handleChange}>
                <option value="Electronics">Electronics</option>
                <option value="Documents/IDs">Documents / ID Cards</option>
                <option value="Clothing">Clothing & Bags</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other Belongings</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Campus Location</label>
              <input 
                type="text" name="location" required style={styles.input}
                placeholder="e.g., Main Canteen, 3rd Floor Lab 4"
                value={formData.location} onChange={handleChange}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Detailed Description</label>
              <textarea 
                name="description" required style={styles.textarea} rows="4"
                placeholder="Provide distinctive features (e.g., scratches, stickers, time spotted)..."
                value={formData.description} onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                ...styles.submitBtn, 
                backgroundColor: isLost ? 'var(--accent-coral)' : 'var(--accent-teal)',
                color: isLost ? 'var(--text-white)' : 'var(--bg-navy)'
              }}
            >
              {loading ? 'Submitting to database...' : `Submit ${formData.status.toUpperCase()} Listing`}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: THE ACCOUNT HISTORY LAYOUT PLACEHOLDER */}
        <div style={styles.historyCard}>
          <h2 style={styles.sectionTitle}>My Active Postings</h2>
          <div style={styles.placeholderBox}>
            <p style={{ color: 'var(--text-muted)' }}>
              Next up, we will fetch and render a list of your personal listings here so you can mark them as "Resolved" or delete them!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  pageTitle: { fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.25rem' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '3rem' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', alignItems: 'start' },
  formCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem' },
  historyCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '-0.5px' },
  toggleGroup: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  toggleTab: { flex: 1, padding: '0.75rem', border: '1px solid var(--border-muted)', backgroundColor: 'var(--bg-navy)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-white)' },
  input: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none' },
  select: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' },
  textarea: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none', resize: 'none' },
  submitBtn: { border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', transition: 'opacity 0.2s ease' },
  placeholderBox: { border: '2px dashed var(--border-muted)', borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  errorAlert: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' },
  successAlert: { backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1px solid dashed', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: '500' }
};

export default Dashboard;