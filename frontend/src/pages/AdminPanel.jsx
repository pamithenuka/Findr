import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { CheckCircle } from 'lucide-react';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check role
  useEffect(() => {
    const userStr = localStorage.getItem('findr_user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/');
    } else {
      fetchAdminData();
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, itemsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/items')
      ]);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing as admin?')) return;
    try {
      await API.delete(`/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const handlePromoteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to promote ${userName} to an Admin? They will have full access to delete items and promote others.`)) return;
    try {
      await API.put(`/admin/users/${userId}/promote`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote user.');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>
          <p style={{ color: 'var(--accent-coral)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="container fade-in">
      <h1 style={styles.pageTitle}>Admin Moderation Panel</h1>
      <p style={styles.pageSubtitle}>Manage users and oversee all platform listings.</p>

      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('users')}
        >
          👥 Manage Users
        </button>
        <button 
          style={{ ...styles.tabBtn, ...(activeTab === 'items' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('items')}
        >
          📦 Manage Items
        </button>
      </div>

      <div style={styles.panelCard}>
        {activeTab === 'users' && (
          <div>
            <h2 style={styles.sectionTitle}>Registered Users ({users.length})</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Joined Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={u.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handlePromoteUser(u._id, u.name)} 
                            style={styles.promoteBtn}
                          >
                            ⭐ Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div>
            <h2 style={styles.sectionTitle}>All Platform Listings ({items.length})</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Posted By</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} style={{...styles.tr, ...(item.isResolved ? { opacity: 0.6 } : {})}}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge, 
                          color: item.status === 'lost' ? 'var(--accent-coral)' : 'var(--accent-teal)'
                        }}>
                          {item.isResolved ? <><CheckCircle size={14} style={{ verticalAlign: 'text-bottom', marginRight: '2px' }}/> RESOLVED</> : item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>{item.title}</td>
                      <td style={styles.td}>{item.postedBy?.name || 'Unknown'}</td>
                      <td style={styles.td}>{item.location}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteItem(item._id)} style={styles.deleteBtn}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>No items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  statusBox: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' },
  pageTitle: { fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.25rem' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' },
  
  tabContainer: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  tabBtn: { padding: '0.75rem 1.5rem', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', color: 'var(--text-white)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease' },
  activeTab: { backgroundColor: 'var(--bg-navy)', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' },

  panelCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '-0.5px' },

  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '1px solid rgba(58, 66, 96, 0.4)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '1rem', borderBottom: '1px solid rgba(58, 66, 96, 0.4)', fontSize: '0.95rem' },
  tr: { transition: 'background-color 0.2s ease' },
  emptyTd: { padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', borderBottom: 'none' },

  adminBadge: { backgroundColor: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  userBadge: { backgroundColor: 'rgba(232, 234, 240, 0.05)', color: 'var(--text-muted)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  statusBadge: { fontSize: '0.75rem', fontWeight: '700' },
  
  deleteBtn: { backgroundColor: 'transparent', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  promoteBtn: { backgroundColor: 'transparent', color: '#eab308', border: '1px solid #eab308', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
};

export default AdminPanel;
