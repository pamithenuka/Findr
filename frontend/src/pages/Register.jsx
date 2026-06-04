import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/register', formData);
      localStorage.setItem('findr_user', JSON.stringify(response.data));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details and re-try.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Findr to start tracking campus items</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" name="name" required style={styles.input} placeholder="John Doe" value={formData.name} onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Campus Email</label>
            <input type="email" name="email" required style={styles.input} placeholder="student@sliit.lk" value={formData.email} onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input type="text" name="phoneNumber" required style={styles.input} placeholder="0771234567" value={formData.phoneNumber} onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" required style={styles.input} placeholder="Minimum 6 characters" value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    margin: '2rem auto'
  },
  title: { color: 'var(--text-white)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-0.5px' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' },
  errorAlert: { backgroundColor: 'rgba(249, 115, 22, 0.15)', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-white)' },
  input: { backgroundColor: 'var(--bg-navy)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-white)', fontSize: '0.95rem', outline: 'none' },
  submitBtn: { width: '100%', marginTop: '0.5rem', padding: '0.85rem' },
  footerText: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1.5rem' },
  link: { color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: '500' }
};

export default Register;