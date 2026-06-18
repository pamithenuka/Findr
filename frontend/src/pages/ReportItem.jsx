import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Search, Handshake, Calendar, ArrowLeft, Image as ImageIcon, MapPin } from 'lucide-react';

function ReportItem() {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('findr_user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    status: 'lost',
    dateLostFound: new Date().toISOString().split('T')[0]
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Set initial status from location state if available
  useEffect(() => {
    if (location.state?.openForm) {
      setFormData((prev) => ({ ...prev, status: location.state.openForm }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('status', formData.status);
      data.append('dateLostFound', formData.dateLostFound);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.post('/items', data);
      setSuccess(`Success! Your ${formData.status} listing has been posted.`);
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        status: formData.status,
        dateLostFound: new Date().toISOString().split('T')[0]
      });
      setImageFile(null);
      setImagePreview(null);

      // Auto-redirect to dashboard after 2 seconds to view active postings
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };

  const isLost = formData.status === 'lost';
  const themeColor = isLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
  const activeTabStyle = {
    backgroundColor: isLost ? 'rgba(249, 115, 22, 0.15)' : 'rgba(45, 212, 191, 0.15)',
    borderColor: themeColor,
    color: themeColor,
    boxShadow: `0 0 10px ${isLost ? 'rgba(249, 115, 22, 0.1)' : 'rgba(45, 212, 191, 0.1)'}`
  };

  return (
    <div style={styles.container} className="container fade-in">
      <div style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div style={styles.card}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Report Campus Item</h1>
          <p style={styles.subtitle}>Help your campus peers by reporting a lost or found item quickly and easily.</p>
        </div>

        {/* Status Selector Tabs */}
        <div style={styles.toggleGroup}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: 'lost' })}
            style={{ ...styles.toggleTab, ...(isLost ? activeTabStyle : {}) }}
          >
            <Search size={16} style={styles.tabIcon} /> Lost Item
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: 'found' })}
            style={{ ...styles.toggleTab, ...(!isLost ? activeTabStyle : {}) }}
          >
            <Handshake size={16} style={styles.tabIcon} /> Found Item
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={{ ...styles.successAlert, color: themeColor, borderColor: themeColor }}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Left Column Fields */}
            <div style={styles.formCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Item Name / Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  style={styles.input}
                  placeholder="e.g., Black Dell Laptop"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

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

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Campus Location
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  style={styles.input}
                  placeholder="e.g., Main Canteen"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Date Lost / Found
                </label>
                <input
                  type="date"
                  name="dateLostFound"
                  required
                  style={styles.input}
                  value={formData.dateLostFound}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right Column Fields (Description + Image Upload) */}
            <div style={styles.formCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Detailed Description</label>
                <textarea
                  name="description"
                  required
                  style={styles.textarea}
                  rows="5"
                  placeholder="Describe details, distinct tags, color, serial numbers, sticker placements, screen cracks..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Upload Image (Optional)</label>
                <div style={styles.uploadArea}>
                  <input
                    type="file"
                    id="image-file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                  <label htmlFor="image-file" style={styles.uploadBtn}>
                    <ImageIcon size={18} style={{ marginRight: '6px' }} /> 
                    {imageFile ? 'Change Image' : 'Select Image'}
                  </label>
                  {imageFile && <span style={styles.fileName}>{imageFile.name}</span>}
                </div>

                {imagePreview && (
                  <div style={styles.previewContainer}>
                    <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(null); }} 
                      style={styles.removePreviewBtn}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              backgroundColor: isLost ? 'var(--accent-coral)' : 'var(--accent-teal)',
              color: isLost ? 'var(--text-white)' : 'var(--bg-navy)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Submitting Report...' : `Submit`}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' },
  header: { marginBottom: '1.5rem' },
  backLink: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'color 0.2s ease',
    width: 'fit-content'
  },
  card: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '2.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)',
  },
  titleSection: { marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '0.5rem' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' },
  toggleGroup: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  toggleTab: {
    flex: 1,
    padding: '0.85rem',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-navy)',
    color: 'var(--text-muted)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  tabIcon: { flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' },
  formCol: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-white)', display: 'flex', alignItems: 'center' },
  input: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--text-white)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  select: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--text-white)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--text-white)',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    lineHeight: '1.5',
    transition: 'border-color 0.2s ease',
  },
  uploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  fileInput: { display: 'none' },
  uploadBtn: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-white)',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  fileName: { color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  previewContainer: {
    marginTop: '0.75rem',
    position: 'relative',
    width: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-muted)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain'
  },
  removePreviewBtn: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  submitBtn: {
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    display: 'block',
    width: '100%'
  },
  errorAlert: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    color: 'var(--accent-coral)',
    border: '1px solid var(--accent-coral)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  successAlert: {
    backgroundColor: 'rgba(45, 212, 191, 0.05)',
    border: '1px solid',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    fontWeight: '500'
  }
};

export default ReportItem;
