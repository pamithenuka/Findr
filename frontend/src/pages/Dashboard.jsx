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
  const [showResolved, setShowResolved] = useState(false);

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

  // Handle marking item as resolved
  const handleResolve = async (itemId) => {
    if (!window.confirm('Mark this item as resolved? It will be removed from the public feed.')) return;

    try {
      await API.put(`/items/${itemId}/resolve`);
      // Optimistically update frontend state
      setMyItems(myItems.map((item) => 
        item._id === itemId ? { ...item, isResolved: true } : item
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark item as resolved.');
    }
  };

  // Handle post deletion
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      await API.delete(`/items/${itemId}`);
      setMyItems(myItems.filter((item) => item._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Filter items based on toggle
  const activeItems = myItems.filter((item) => !item.isResolved);
  const resolvedItems = myItems.filter((item) => item.isResolved);
  const displayedItems = showResolved ? myItems : activeItems;

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
                <option value="Documents &amp; IDs">Documents &amp; ID Cards</option>
                <option value="Bags &amp; Wallets">Bags &amp; Wallets</option>
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
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitle}>
              My Postings ({activeItems.length} active{resolvedItems.length > 0 ? `, ${resolvedItems.length} resolved` : ''})
            </h2>
            {resolvedItems.length > 0 && (
              <button 
                onClick={() => setShowResolved(!showResolved)} 
                style={styles.toggleResolvedBtn}
              >
                {showResolved ? 'Hide Resolved' : 'Show Resolved'}
              </button>
            )}
          </div>
          
          {historyLoading ? (
            <div style={styles.statusText}>Syncing history logs...</div>
          ) : displayedItems.length === 0 ? (
            <div style={styles.placeholderBox}>
              <p style={{ color: 'var(--text-muted)' }}>
                {showResolved ? 'No items to display.' : "You haven't posted any active items yet."}
              </p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {displayedItems.map((item) => {
                const itemIsLost = item.status?.toLowerCase() === 'lost';
                const itemColor = itemIsLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
                const isResolved = item.isResolved;

                return (
                  <div 
                    key={item._id} 
                    style={{
                      ...styles.historyRow,
                      ...(isResolved ? styles.resolvedRow : {}),
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={styles.rowMeta}>
                        <span style={{ 
                          color: isResolved ? 'var(--text-muted)' : itemColor, 
                          fontWeight: '700', 
                          fontSize: '0.75rem' 
                        }}>
                          {item.status?.toUpperCase()}
                        </span>
                        {isResolved && (
                          <span style={styles.resolvedBadge}>✅ RESOLVED</span>
                        )}
                        <span style={styles.rowDate}>📍 {item.location}</span>
                      </div>
                      <h4 style={{
                        ...styles.rowTitle,
                        ...(isResolved ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}),
                      }}>
                        {item.title}
                      </h4>
                    </div>
                    
                    <div style={styles.actionGroup}>
                      {!isResolved && (
                        <button 
                          onClick={() => handleResolve(item._id)}
                          style={styles.resolveBtn}
                        >
                          ✅ Resolve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item._id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
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
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
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
  successAlert: { backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1px solid', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: '500' },
  
  // History list layout
  historyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  historyRow: { 
    backgroundColor: 'var(--bg-navy)', 
    border: '1px solid var(--border-muted)', 
    padding: '1rem', 
    borderRadius: '8px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.2s ease',
  },
  resolvedRow: {
    opacity: 0.6,
    borderStyle: 'dashed',
  },
  rowMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' },
  rowDate: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  rowTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-white)' },
  resolvedBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
  },
  resolveBtn: { 
    backgroundColor: 'transparent', 
    color: '#22c55e', 
    border: '1px solid #22c55e', 
    padding: '0.4rem 0.8rem', 
    borderRadius: '6px', 
    fontSize: '0.8rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  deleteBtn: { 
    backgroundColor: 'transparent', 
    color: 'var(--accent-coral)', 
    border: '1px solid var(--accent-coral)', 
    padding: '0.4rem 0.8rem', 
    borderRadius: '6px', 
    fontSize: '0.8rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  toggleResolvedBtn: {
    background: 'none',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-muted)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
};

export default Dashboard;