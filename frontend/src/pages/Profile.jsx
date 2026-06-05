import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/users/profile');
        setProfileData(response.data.user);
        setStats(response.data.stats);
        setFormData({
          name: response.data.user.name || '',
          phoneNumber: response.data.user.phoneNumber || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('findr_user');
            navigate('/login');
        } else {
            setError('Failed to load profile data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await API.put('/users/profile', formData);
      setProfileData(response.data);
      
      // Update local storage so Navbar reflects the name change if necessary
      const storedUser = JSON.parse(localStorage.getItem('findr_user') || '{}');
      storedUser.name = response.data.name;
      localStorage.setItem('findr_user', JSON.stringify(storedUser));
      
      // Dispatch a custom event to update Navbar if we wanted to be super dynamic
      window.dispatchEvent(new Event('storage'));

      setEditMode(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>Loading profile data...</div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>
          <p style={{ color: 'var(--accent-coral)' }}>{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginTop: '1rem' }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>User Profile</h1>
      <p style={styles.pageSubtitle}>Manage your account details and view your impact.</p>

      {message && <div style={styles.successAlert}>{message}</div>}
      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.dashboardGrid}>
        {/* Profile Form Card */}
        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Personal Details</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={styles.editBtn}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                style={styles.input} 
                value={editMode ? formData.name : profileData.name} 
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                style={styles.input} 
                value={profileData.email} 
                disabled={true} 
                title="Email cannot be changed"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input 
                type="text" 
                name="phoneNumber" 
                style={styles.input} 
                placeholder="Optional"
                value={editMode ? formData.phoneNumber : (profileData.phoneNumber || 'Not provided')} 
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Member Since</label>
              <div style={styles.staticValue}>
                {new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {editMode && (
              <div style={styles.actionGroup}>
                <button type="button" onClick={() => setEditMode(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Stats Card */}
        <div style={styles.statsCard}>
          <h2 style={styles.sectionTitle}>Community Impact</h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{stats?.totalPosts || 0}</div>
              <div style={styles.statLabel}>Total Listings</div>
            </div>
            
            <div style={{...styles.statBox, borderColor: 'var(--accent-coral)'}}>
              <div style={{...styles.statNumber, color: 'var(--accent-coral)'}}>{stats?.lostCount || 0}</div>
              <div style={styles.statLabel}>Lost Items</div>
            </div>
            
            <div style={{...styles.statBox, borderColor: 'var(--accent-teal)'}}>
              <div style={{...styles.statNumber, color: 'var(--accent-teal)'}}>{stats?.foundCount || 0}</div>
              <div style={styles.statLabel}>Found Items</div>
            </div>
          </div>
          
          <div style={styles.statsMessage}>
            Thank you for being an active member of the Findr community! 
            Your participation helps students reunite with their lost belongings.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  statusBox: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' },
  pageTitle: { fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.25rem' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '3rem' },
  
  successAlert: { backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' },
  errorAlert: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' },
  
  formCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  
  editBtn: { background: 'none', border: '1px solid var(--border-muted)', color: 'var(--text-white)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s ease' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-white)' },
  input: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s ease' },
  staticValue: { color: 'var(--text-muted)', fontSize: '0.95rem', padding: '0.25rem 0' },
  
  actionGroup: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  cancelBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-white)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease' },
  saveBtn: { flex: 2, backgroundColor: 'var(--accent-teal)', border: 'none', color: 'var(--bg-navy)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', transition: 'background-color 0.2s ease' },
  
  statsCard: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' },
  statBox: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  statNumber: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-white)', lineHeight: 1 },
  statLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
  statsMessage: { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', padding: '1rem', backgroundColor: 'rgba(232, 234, 240, 0.05)', borderRadius: '8px', textAlign: 'center' }
};

export default Profile;
