import React from 'react';

function ItemCard({ item }) {
  
  const isLost = item.status?.toLowerCase() === 'lost';
  const statusColor = isLost ? 'var(--accent-coral)' : 'var(--accent-teal)';
  const badgeBg = isLost ? 'rgba(249, 115, 22, 0.1)' : 'rgba(45, 212, 191, 0.1)';

  return (
    <div style={styles.card}>
      {/* Top Meta Row: Status Badge & Category */}
      <div style={styles.metaRow}>
        <span style={{ ...styles.badge, color: statusColor, backgroundColor: badgeBg }}>
          {item.status?.toUpperCase()}
        </span>
        <span style={styles.category}>{item.category}</span>
      </div>

      {/* Item Details */}
      <h3 style={styles.title}>{item.title}</h3>
      <p style={styles.description}>{item.description}</p>

      {/* Card Footer: Location & Date */}
      <div style={styles.footerRow}>
        <span style={styles.location}>📍 {item.location}</span>
        <span style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  category: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-white)',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
    flexGrow: 1,
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(58, 66, 96, 0.4)',
    paddingTop: '0.75rem',
    fontSize: '0.85rem',
  },
  location: {
    color: 'var(--text-white)',
    fontWeight: '500',
  },
  date: {
    color: 'var(--text-muted)',
  },
};

export default ItemCard;