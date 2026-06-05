import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current logged-in user details
  const storedUser = localStorage.getItem('findr_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // State Management
  const [myItems, setMyItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Electronics', location: '', status: 'lost'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Sync state from homepage button triggers
  useEffect(() => {
    if (location.state?.openForm) {
      setFormData((prev) => ({ ...prev, status: location.state.openForm }));
    }
    fetchMyItems();
  }, [location.state]);

  // Fetch this user's items via the dedicated server-side filtered endpoint
  const fetchMyItems = async () => {
    try {
      setHistoryLoading(true);
      const response = await API.get('/items/dashboard');
      setMyItems(response.data);
    } catch (err) {
      console.error('Error fetching personal history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new item handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      await API.post('/items', formData);
      setSuccess(`Success! Your ${formData.status} listing has been posted.`);
      setFormData({ title: '', description: '', category: 'Electronics', location: '', status: formData.status });
      fetchMyItems(); // Refresh history immediately!
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };

  // Handle post deletion (Resolving an item)
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    try {
      // Calls your DELETE /api/items/:id backend endpoint
      await API.delete(`/items/${itemId}`);
      // Optimistically remove it from frontend state tracking
      setMyItems(myItems.filter((item) => item._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const isLost = formData.status === 'lost';
  const themeColor = isLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
  const activeTabStyle = {
    backgroundColor: isLost ? 'rgba(249, 115, 22, 0.15)' : 'rgba(45, 212, 191, 0.15)',
    borderColor: themeColor, color: themeColor,
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>User Dashboard</h1>
      <p style={styles.pageSubtitle}>Welcome back, {user?.name || 'Student'}! Manage your campus postings here.</p>

      <div style={styles.dashboardGrid}>
        {/* LEFT COLUMN: THE INTERACTIVE POST CREATION FORM */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Report an Item</h2>
          
          <div style={styles.toggleGroup}>
            <button type="button" onClick={() => setFormData({ ...formData, status: 'lost' })} style={{ ...styles.toggleTab, ...(isLost ? activeTabStyle : {}) }}>🔍 Lost Item</button>
            <button type="button" onClick={() => setFormData({ ...formData, status: 'found' })} style={{ ...styles.toggleTab, ...(!isLost ? activeTabStyle : {}) }}>🤝 Found Item</button>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}
          {success && <div style={{ ...styles.successAlert, color: themeColor, borderColor: themeColor }}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}><label style={styles.label}>Item Name / Title</label><input type="text" name="title" required style={styles.input} placeholder="e.g., Black Dell Laptop" value={formData.title} onChange={handleChange} /></div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select name="category" style={styles.select} value={formData.category} onChange={handleChange}>
                <option value="Electronics">Electronics</option>
                <option value="Documents & IDs">Documents & ID Cards</option>
                <option value="Bags & Wallets">Bags & Wallets</option>
                <option value="Clothing">Clothing</option>
                <option value="Keys">Keys</option>
                <option value="Others">Other Belongings</option>
              </select>
            </div>
            <div style={styles.inputGroup}><label style={styles.label}>Campus Location</label><input type="text" name="location" required style={styles.input} placeholder="e.g., Main Canteen" value={formData.location} onChange={handleChange} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Detailed Description</label><textarea name="description" required style={styles.textarea} rows="4" placeholder="Provide distinctive features..." value={formData.description} onChange={handleChange} /></div>
            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, backgroundColor: isLost ? 'var(--accent-coral)' : 'var(--accent-teal)', color: isLost ? 'var(--text-white)' : 'var(--bg-navy)' }}>
              {loading ? 'Submitting...' : `Submit ${formData.status.toUpperCase()} Listing`}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE ACTIVE POSTINGS HISTORY */}
        <div style={styles.historyCard}>
          <h2 style={styles.sectionTitle}>My Active Postings ({myItems.length})</h2>
          
          {historyLoading ? (
            <div style={styles.statusText}>Syncing history logs...</div>
          ) : myItems.length === 0 ? (
            <div style={styles.placeholderBox}>
              <p style={{ color: 'var(--text-muted)' }}>You haven't posted any items yet.</p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {myItems.map((item) => {
                const itemIsLost = item.status?.toLowerCase() === 'lost';
                return (
                  <div key={item._id} style={styles.historyRow}>
                    <div>
                      <div style={styles.rowMeta}>
                        <span style={{ color: itemIsLost ? 'var(--accent-coral)' : 'var(--accent-teal)', fontWeight: '700', fontSize: '0.75rem' }}>
                          {item.status?.toUpperCase()}
                        </span>
                        <span style={styles.rowDate}>📍 {item.location}</span>
                      </div>
                      <h4 style={styles.rowTitle}>{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
  historyCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem', minHeight: '480px', display: 'flex', flexDirection: 'column' },
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
  statusText: { color: 'var(--text-muted)', textAlign: 'center', margin: 'auto 0' },
  errorAlert: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' },
  successAlert: { backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1px solid dashed', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: '500' },
  
  // History list layout styling adjustments
  historyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  historyRow: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowMeta: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.25rem' },
  rowDate: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  rowTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-white)' },
  deleteBtn: { backgroundColor: 'transparent', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }
};

// Clean handling for button pointer behavior
styles.deleteBtn.onmouseenter = (e) => { e.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'; };
styles.deleteBtn.onmouseleave = (e) => { e.target.style.backgroundColor = 'transparent'; };

export default Dashboard;