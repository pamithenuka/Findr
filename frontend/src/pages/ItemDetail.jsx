import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { MapPin, Calendar, Mail, Phone } from 'lucide-react';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await API.get(`/items/${id}`);
        setItem(response.data);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>Loading item details...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={styles.container}>
        <div style={styles.statusBox}>
          <p style={{ color: 'var(--accent-coral)' }}>{error || 'Item not found.'}</p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginTop: '1rem' }}>
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const isLost = item.status?.toLowerCase() === 'lost';
  const statusColor = isLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
  const badgeBg = isLost ? 'rgba(249, 115, 22, 0.1)' : 'rgba(45, 212, 191, 0.1)';

  return (
    <div style={styles.container} className="container fade-in">
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>

      <div style={styles.pageLayout} className="content-split">
        {/* Left Main Column */}
        <div style={styles.mainColumn}>
          <div style={styles.detailCard}>
            {/* Optional Image Section */}
            {item.imageUrl && (
              <div style={styles.imageContainer}>
                <img src={`http://localhost:5001${item.imageUrl}`} alt={item.title} style={styles.detailImage} />
              </div>
            )}

            {/* Header Section */}
            <div style={styles.header}>
              <div>
                <div style={styles.metaRow}>
                  <span style={{ ...styles.badge, color: statusColor, backgroundColor: badgeBg }}>
                    {item.status?.toUpperCase()}
                  </span>
                  <span style={styles.category}>{item.category}</span>
                </div>
                <h1 style={styles.title}>{item.title}</h1>
                <div style={styles.locationDate}>
                  <span><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}/> {item.location}</span>
                  <span><Calendar size={16} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}/> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                </div>
              </div>
            </div>

            {/* Body Section */}
            <div style={styles.body}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.description}>{item.description}</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div style={styles.sidebarColumn}>
          <div style={styles.contactCard}>
            <h3 style={styles.sectionTitle}>Posted By</h3>
            {item.postedBy ? (
              <div style={styles.contactInfo}>
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>Name</span>
                  <p style={styles.contactName}>{item.postedBy.name}</p>
                </div>
                
                <div style={styles.contactDetails}>
                  {item.postedBy.email && (
                    <div style={styles.contactItem}>
                      <span style={styles.contactLabel}>Email</span>
                      <a href={`mailto:${item.postedBy.email}`} style={styles.contactLink}>
                        <Mail size={16} style={{ marginRight: '4px' }}/> {item.postedBy.email}
                      </a>
                    </div>
                  )}
                  {item.postedBy.phoneNumber && (
                    <div style={styles.contactItem}>
                      <span style={styles.contactLabel}>Phone Number</span>
                      <a href={`tel:${item.postedBy.phoneNumber}`} style={styles.contactLink}>
                        <Phone size={16} style={{ marginRight: '4px' }}/> {item.postedBy.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
                <a 
                  href={`mailto:${item.postedBy.email}?subject=Regarding your ${item.status} item: ${item.title}`}
                  className="btn-primary" 
                  style={{ ...styles.contactBtn, backgroundColor: statusColor }}
                >
                  Contact Poster
                </a>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Contact information is unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  statusBox: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'color 0.2s ease',
  },
  detailCard: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    maxHeight: '400px',
    backgroundColor: 'rgba(26, 31, 53, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(58, 66, 96, 0.4)',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    maxHeight: '400px',
  },
  header: {
    padding: '2rem',
    borderBottom: '1px solid rgba(58, 66, 96, 0.4)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  badge: {
    fontSize: '0.8rem',
    fontWeight: '700',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  category: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-white)',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  locationDate: {
    display: 'flex',
    gap: '1.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  pageLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },
  mainColumn: {
    flex: 2,
    minWidth: 0,
  },
  sidebarColumn: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-white)',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  contactCard: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '2rem',
    position: 'sticky',
    top: '100px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  contactItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  contactLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contactName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-white)',
    margin: 0,
  },
  contactDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  contactLink: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'color 0.2s ease',
  },
  contactBtn: {
    marginTop: '1rem',
    alignSelf: 'flex-start',
    textDecoration: 'none',
    color: 'var(--bg-navy)',
    fontWeight: '700',
  },
};

export default ItemDetail;
