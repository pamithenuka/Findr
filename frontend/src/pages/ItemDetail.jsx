import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

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
              <span>📍 {item.location}</span>
              <span>📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}</span>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div style={styles.body}>
          <h3 style={styles.sectionTitle}>Description</h3>
          <p style={styles.description}>{item.description}</p>
        </div>

        {/* Contact Section */}
        <div style={styles.contactSection}>
          <h3 style={styles.sectionTitle}>Posted By</h3>
          {item.postedBy ? (
            <div style={styles.contactInfo}>
              <p style={styles.contactName}>{item.postedBy.name}</p>
              <div style={styles.contactDetails}>
                {item.postedBy.email && (
                  <a href={`mailto:${item.postedBy.email}`} style={styles.contactLink}>
                    ✉️ {item.postedBy.email}
                  </a>
                )}
                {item.postedBy.phoneNumber && (
                  <a href={`tel:${item.postedBy.phoneNumber}`} style={styles.contactLink}>
                    📞 {item.postedBy.phoneNumber}
                  </a>
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
  );
}

const styles = {
  container: {
    maxWidth: '800px',
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
  body: {
    padding: '2rem',
    borderBottom: '1px solid rgba(58, 66, 96, 0.4)',
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
  contactSection: {
    padding: '2rem',
    backgroundColor: 'rgba(26, 31, 53, 0.3)',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contactName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-white)',
  },
  contactDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
