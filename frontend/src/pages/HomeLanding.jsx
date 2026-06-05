import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ItemCard from '../components/ItemCard'; 

function HomeLanding() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const isAuthenticated = !!localStorage.getItem('findr_user');

  // Fetch recent posts directly from backend database array on load
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await API.get('/items');
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Derive filtered items via useMemo (no unnecessary re-renders)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Status filter
      if (statusFilter !== 'all' && item.status?.toLowerCase() !== statusFilter) {
        return false;
      }

      // 2. Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // 3. Search query — match against title, description, location
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLocation = item.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  // Extract unique categories from fetched data for the dropdown
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((item) => item.category).filter(Boolean))];
    return cats.sort();
  }, [items]);

  const handleAction = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/dashboard', { state: { openForm: type } });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div style={styles.container}>
      {/* --- HERO SECTION --- */}
      <header style={styles.hero}>
        <h1 style={styles.headline}>
          Lost it? <span style={{ color: 'var(--accent-coral)' }}>Find it.</span> <br />
          Found it? <span style={{ color: 'var(--accent-teal)' }}>Return it.</span>
        </h1>
        <p style={styles.subheadline}>
          The smart, secure lost and found ecosystem built exclusively for the campus community.
        </p>

        <div style={styles.ctaGroup}>
          <button onClick={() => handleAction('lost')} style={styles.lostBtn}>
            🔍 I Lost Something
          </button>
          <button onClick={() => handleAction('found')} style={styles.foundBtn}>
            🤝 I Found Something
          </button>
        </div>
      </header>

      {/* --- LIVE FEED SECTION --- */}
      <section style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Recent Campus Postings</h2>
          <span style={styles.liveBadge}>● Live Feed</span>
        </div>

        {/* --- SEARCH & FILTER TOOLBAR --- */}
        <div style={styles.filterToolbar}>
          {/* Search Bar */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by item name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                style={styles.clearSearchBtn}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div style={styles.filterRow}>
            {/* Status Tabs */}
            <div style={styles.statusTabs}>
              {[
                { key: 'all', label: 'All Items' },
                { key: 'lost', label: '🔍 Lost' },
                { key: 'found', label: '🤝 Found' },
              ].map((tab) => {
                const isActive = statusFilter === tab.key;
                let activeStyle = {};
                if (isActive && tab.key === 'lost') {
                  activeStyle = { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'var(--accent-coral)', color: 'var(--accent-coral)' };
                } else if (isActive && tab.key === 'found') {
                  activeStyle = { backgroundColor: 'rgba(45, 212, 191, 0.15)', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' };
                } else if (isActive && tab.key === 'all') {
                  activeStyle = { backgroundColor: 'rgba(232, 234, 240, 0.1)', borderColor: 'var(--text-white)', color: 'var(--text-white)' };
                }

                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    style={{ ...styles.filterTab, ...(isActive ? activeStyle : {}) }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.categorySelect}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Results Count & Clear */}
          <div style={styles.resultsRow}>
            <span style={styles.resultsCount}>
              Showing <strong>{filteredItems.length}</strong> of {items.length} items
              {hasActiveFilters && (
                <span style={styles.filterIndicator}> — filtered</span>
              )}
            </span>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} style={styles.clearFiltersBtn}>
                Clear All Filters
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div style={styles.statusBox}>Loading active feeds...</div>
        ) : items.length === 0 ? (
          <div style={styles.statusBox}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No lost or found items reported on campus yet.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent-teal)' }}>Be the first to help out the community!</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.statusBox}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No items match your current filters.</p>
            <button onClick={clearAllFilters} style={styles.clearFiltersBtnAlt}>
              Reset Filters
            </button>
          </div>
        ) : (
          /* Responsive CSS Grid to display items neatly */
          <div style={styles.grid}>
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' },
  hero: { textAlign: 'center', marginBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headline: { fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-1.5px', marginBottom: '1.5rem', color: 'var(--text-white)' },
  subheadline: { fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: '1.6' },
  ctaGroup: { display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' },
  lostBtn: { backgroundColor: 'transparent', color: 'var(--accent-coral)', border: '2px solid var(--accent-coral)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '600', borderRadius: 'var(--border-radius)', cursor: 'pointer', transition: 'all 0.2s ease' },
  foundBtn: { backgroundColor: 'var(--accent-teal)', color: 'var(--bg-navy)', border: '2px solid var(--accent-teal)', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '600', borderRadius: 'var(--border-radius)', cursor: 'pointer', transition: 'all 0.2s ease' },
  feedSection: { borderTop: '1px solid var(--border-muted)', paddingTop: '3rem' },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  feedTitle: { fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' },
  liveBadge: { color: 'var(--accent-teal)', fontSize: '0.875rem', fontWeight: '600', backgroundColor: 'rgba(45, 212, 191, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px' },
  statusBox: { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-muted)', borderRadius: 'var(--border-radius)', padding: '3rem', textAlign: 'center' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },

  // --- Search & Filter Toolbar Styles ---
  filterToolbar: {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '1.25rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    fontSize: '1rem',
    pointerEvents: 'none',
    opacity: 0.5,
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.85rem 2.5rem 0.85rem 2.75rem',
    color: 'var(--text-white)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  statusTabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterTab: {
    padding: '0.5rem 1rem',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  categorySelect: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    color: 'var(--text-white)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '180px',
  },
  resultsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(58, 66, 96, 0.4)',
    paddingTop: '0.75rem',
  },
  resultsCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  filterIndicator: {
    color: 'var(--accent-teal)',
    fontWeight: '500',
  },
  clearFiltersBtn: {
    background: 'none',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-muted)',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  clearFiltersBtnAlt: {
    background: 'none',
    border: '1px solid var(--accent-teal)',
    color: 'var(--accent-teal)',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '1rem',
    transition: 'all 0.2s ease',
  },
};

export default HomeLanding;