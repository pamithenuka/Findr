import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Search, Handshake, CheckCircle, MapPin, Award, FileText, Plus, Trash2, Pencil } from 'lucide-react';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current logged-in user details
  const storedUser = localStorage.getItem('findr_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // State Management
  const [myItems, setMyItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  // Fetch this user's items
  useEffect(() => {
    fetchMyItems();
  }, []);

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

  // Statistics calculation
  const totalPostings = myItems.length;
  const resolvedItemsCount = myItems.filter((item) => item.isResolved).length;
  const activeItems = myItems.filter((item) => !item.isResolved);
  const activeItemsCount = activeItems.length;
  const lostItemsCount = myItems.filter((item) => item.status?.toLowerCase() === 'lost').length;
  const foundItemsCount = myItems.filter((item) => item.status?.toLowerCase() === 'found').length;
  const successRate = totalPostings > 0 ? Math.round((resolvedItemsCount / totalPostings) * 100) : 0;

  const resolvedItems = myItems.filter((item) => item.isResolved);
  const displayedItems = showResolved ? myItems : activeItems;

  return (
    <div style={styles.container} className="container fade-in">
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>User Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back, {user?.name || 'Student'}! Track your reports and campus impact.</p>
        </div>
        <Link to="/report" className="btn-primary" style={styles.newReportBtn}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Report New Item
        </Link>
      </div>

      <div style={styles.dashboardGrid} className="dashboard-grid-layout">
        {/* LEFT COLUMN: STATISTICS PANEL */}
        <div style={styles.leftColumn}>
          {/* Welcome Card & Summary */}
          <div style={styles.welcomeCard}>
            <h3 style={styles.cardHeaderTitle}>Your Impact Overview</h3>
            <p style={styles.welcomeText}>
              Thank you for keeping our campus connected! By reporting items, you help classmates recover lost belongings.
            </p>
            
            <div style={styles.progressContainer}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Reunion Success Rate</span>
                <span style={styles.progressValue}>{successRate}%</span>
              </div>
              <div style={styles.progressBarTrack}>
                <div style={{ ...styles.progressBarFill, width: `${successRate}%` }} />
              </div>
              <p style={styles.progressSubtext}>
                {resolvedItemsCount} of your {totalPostings} reported posts successfully resolved.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={{ ...styles.statIconWrapper, color: 'var(--accent-teal)' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={styles.statNumber}>{totalPostings}</div>
                <div style={styles.statLabel}>Total Listings</div>
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={{ ...styles.statIconWrapper, color: '#22c55e' }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div style={styles.statNumber}>{resolvedItemsCount}</div>
                <div style={styles.statLabel}>Resolved Posts</div>
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={{ ...styles.statIconWrapper, color: 'var(--accent-coral)' }}>
                <Search size={20} />
              </div>
              <div>
                <div style={styles.statNumber}>{lostItemsCount}</div>
                <div style={styles.statLabel}>Lost Items</div>
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={{ ...styles.statIconWrapper, color: 'var(--accent-teal)' }}>
                <Handshake size={20} />
              </div>
              <div>
                <div style={styles.statNumber}>{foundItemsCount}</div>
                <div style={styles.statLabel}>Found Items</div>
              </div>
            </div>
          </div>

          {/* Quick Action Center */}
          <div style={styles.actionCard}>
            <h3 style={styles.actionTitle}>Need to report a new item?</h3>
            <p style={styles.actionText}>Choose a category below to submit a listing immediately.</p>
            <div style={styles.actionBtnRow}>
              <button 
                onClick={() => navigate('/report', { state: { openForm: 'lost' } })}
                style={styles.actionBtnLost}
              >
                <Search size={16} style={{ marginRight: '6px' }} /> I Lost Something
              </button>
              <button 
                onClick={() => navigate('/report', { state: { openForm: 'found' } })}
                style={styles.actionBtnFound}
              >
                <Handshake size={16} style={{ marginRight: '6px' }} /> I Found Something
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE ACTIVE POSTINGS HISTORY */}
        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitle}>
              My Postings ({activeItemsCount} active{resolvedItemsCount > 0 ? `, ${resolvedItemsCount} resolved` : ''})
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
                          <span style={styles.resolvedBadge}><CheckCircle size={12} style={{ verticalAlign: 'text-bottom', marginRight: '2px' }}/> RESOLVED</span>
                        )}
                        <span style={styles.rowDate}><MapPin size={12} style={{ verticalAlign: 'text-bottom', marginRight: '2px' }}/> {item.location}</span>
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
                        <>
                          <button 
                            onClick={() => navigate(`/report/${item._id}`)}
                            style={styles.editBtn}
                            aria-label="Edit listing"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleResolve(item._id)}
                            style={styles.resolveBtn}
                          >
                            <CheckCircle size={14} style={{ verticalAlign: 'text-bottom', marginRight: '2px' }} /> Resolve
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(item._id)}
                        style={styles.deleteBtn}
                        aria-label="Delete listing"
                      >
                        <Trash2 size={14} />
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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.25rem' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '1rem' },
  newReportBtn: { display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '0.75rem 1.25rem', fontSize: '0.95rem' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  
  // Welcome/Impact Card
  welcomeCard: { 
    backgroundColor: 'var(--surface-card)', 
    border: '1px solid var(--border-muted)', 
    borderRadius: 'var(--border-radius)', 
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  cardHeaderTitle: { fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-white)' },
  welcomeText: { color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' },
  
  // Progress/Success Rate indicator
  progressContainer: { marginTop: '0.5rem' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' },
  progressLabel: { color: 'var(--text-white)' },
  progressValue: { color: 'var(--accent-teal)' },
  progressBarTrack: { height: '8px', backgroundColor: 'var(--bg-navy)', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: 'var(--accent-teal)', borderRadius: '4px', transition: 'width 0.5s ease-out' },
  progressSubtext: { color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' },
  
  // Stats Grid
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
  statBox: { 
    backgroundColor: 'var(--surface-card)', 
    border: '1px solid var(--border-muted)', 
    borderRadius: 'var(--border-radius)', 
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statIconWrapper: { 
    backgroundColor: 'var(--bg-navy)', 
    borderRadius: '8px', 
    padding: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statNumber: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-white)', lineHeight: '1.1' },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.2rem' },
  
  // Quick Action Card
  actionCard: { 
    backgroundColor: 'var(--surface-card)', 
    border: '1px solid var(--border-muted)', 
    borderRadius: 'var(--border-radius)', 
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  actionTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-white)' },
  actionText: { color: 'var(--text-muted)', fontSize: '0.85rem' },
  actionBtnRow: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  actionBtnLost: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    color: 'var(--accent-coral)', 
    border: '1px solid var(--accent-coral)', 
    padding: '0.65rem', 
    borderRadius: '6px', 
    fontWeight: '600', 
    fontSize: '0.85rem', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  actionBtnFound: { 
    flex: 1, 
    backgroundColor: 'var(--accent-teal)', 
    color: 'var(--bg-navy)', 
    border: '1px solid var(--accent-teal)', 
    padding: '0.65rem', 
    borderRadius: '6px', 
    fontWeight: '600', 
    fontSize: '0.85rem', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  
  // History Column
  historyCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem', minHeight: '480px', display: 'flex', flexDirection: 'column' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  placeholderBox: { border: '2px dashed var(--border-muted)', borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  statusText: { color: 'var(--text-muted)', textAlign: 'center', margin: 'auto 0' },
  
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
    alignItems: 'center'
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
  editBtn: { 
    backgroundColor: 'transparent', 
    color: 'var(--accent-teal)', 
    border: '1px solid var(--accent-teal)', 
    padding: '0.5rem', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteBtn: { 
    backgroundColor: 'transparent', 
    color: 'var(--accent-coral)', 
    border: '1px solid var(--accent-coral)', 
    padding: '0.5rem', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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