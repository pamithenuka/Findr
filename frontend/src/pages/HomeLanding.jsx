import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ItemCard from '../components/ItemCard'; 
import { Search, Handshake, SlidersHorizontal } from 'lucide-react';

function HomeLanding() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [showLost, setShowLost] = useState(true);
  const [showFound, setShowFound] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
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
    let result = items.filter((item) => {
      // 1. Status filter
      if (!showLost && item.status?.toLowerCase() === 'lost') {
        return false;
      }
      if (!showFound && item.status?.toLowerCase() === 'found') {
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

    // 4. Sort sorting logic
    return result.sort((a, b) => {
      const dateA = new Date(a.dateLostFound || a.createdAt);
      const dateB = new Date(b.dateLostFound || b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [items, searchQuery, showLost, showFound, categoryFilter, sortOrder]);

  // Categories are now statically loaded from the schema for direct and complete filtering options

  const handleAction = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/dashboard', { state: { openForm: type } });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShowLost(true);
    setShowFound(true);
    setSortOrder('newest');
  };

  const hasActiveFilters = searchQuery.trim() || categoryFilter !== 'all' || !showLost || !showFound || sortOrder !== 'newest';

  return (
    <div style={styles.container} className="container fade-in">
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
            <Search size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> I Lost Something
          </button>
          <button onClick={() => handleAction('found')} style={styles.foundBtn}>
            <Handshake size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}/> I Found Something
          </button>
        </div>
      </header>

      {/* --- LIVE FEED SECTION --- */}
      <section style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Recent Campus Postings</h2>
          <span style={styles.liveBadge}>● Live Feed</span>
        </div>

        <div style={styles.filterToolbar}>
          {/* Search Bar & Filter Toggle Row */}
          <div style={styles.searchRow}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}><Search size={16} /></span>
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

            <div style={styles.filterButtonContainer}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  ...styles.filterToggleBtn,
                  ...(showFilters ? styles.filterToggleBtnActive : {})
                }}
                className="filter-toggle-btn"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {(categoryFilter !== 'all' || sortOrder !== 'newest' || !showLost || !showFound) && (
                  <span style={styles.filterActiveDot} />
                )}
              </button>

              {/* Dropdown Popover Filters Panel */}
              {showFilters && (
                <div style={styles.filterPopover} className="fade-in">
                  <div style={styles.popoverField}>
                    <label style={styles.popoverLabel}>Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={styles.popoverSelect}
                    >
                      <option value="all">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Documents & IDs">Documents & IDs</option>
                      <option value="Bags & Wallets">Bags & Wallets</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Keys">Keys</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div style={styles.popoverField}>
                    <label style={styles.popoverLabel}>Sort By</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      style={styles.popoverSelect}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>

                  <div style={styles.popoverField}>
                    <label style={styles.popoverLabel}>Status</label>
                    <div style={styles.checkboxContainer}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={showLost}
                          onChange={(e) => setShowLost(e.target.checked)}
                          style={styles.checkboxInput}
                        />
                        <span style={styles.checkboxText}>Lost</span>
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={showFound}
                          onChange={(e) => setShowFound(e.target.checked)}
                          style={styles.checkboxInput}
                        />
                        <span style={styles.checkboxText}>Found</span>
                      </label>
                    </div>
                  </div>

                  <div style={styles.popoverFooter}>
                    <button
                      onClick={clearAllFilters}
                      style={styles.popoverResetBtn}
                      className="popover-reset-btn"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      style={styles.popoverApplyBtn}
                      className="popover-apply-btn"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          <div style={styles.grid} className="items-grid">
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
  searchRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
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
  filterButtonContainer: {
    position: 'relative',
  },
  filterToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.85rem 1.25rem',
    color: 'var(--text-white)',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  filterToggleBtnActive: {
    borderColor: 'var(--accent-teal)',
    backgroundColor: 'var(--border-muted)',
    boxShadow: '0 0 10px rgba(45, 212, 191, 0.25)',
  },
  filterActiveDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-coral)',
    boxShadow: '0 0 6px var(--accent-coral)',
  },
  filterPopover: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius)',
    padding: '1.5rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    backdropFilter: 'blur(10px)',
  },
  popoverField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  popoverLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  popoverSelect: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-muted)',
    borderRadius: '8px',
    padding: '0.65rem 0.75rem',
    color: 'var(--text-white)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'border-color 0.2s ease',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '1.25rem',
    marginTop: '0.25rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-navy)',
    cursor: 'pointer',
    accentColor: 'var(--accent-teal)',
  },
  checkboxText: {
    fontSize: '0.9rem',
    color: 'var(--text-white)',
    fontWeight: '500',
  },
  popoverFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(58, 66, 96, 0.4)',
    paddingTop: '1rem',
    marginTop: '0.5rem',
  },
  popoverResetBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    transition: 'color 0.2s ease',
  },
  popoverApplyBtn: {
    backgroundColor: 'var(--accent-teal)',
    color: 'var(--bg-navy)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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