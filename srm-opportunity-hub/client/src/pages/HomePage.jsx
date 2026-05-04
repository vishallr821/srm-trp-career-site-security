import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as oppApi from '../api/opportunities';
import * as bookmarkApi from '../api/bookmarks';
import HackathonCard from '../components/cards/HackathonCard';
import InternshipCard from '../components/cards/InternshipCard';
import ContestCard from '../components/cards/ContestCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './HomePage.css';

const TABS = [
  { id: 'hackathons', label: '🏆 Hackathons' },
  { id: 'internships', label: '💼 Internships' },
  { id: 'contests', label: '⚙️ Core Domain Contests' }
];

const DEPTS = ['all', 'cse', 'ece', 'eee', 'mech', 'civil'];
const LEVELS = ['all', 'national', 'international'];

export default function HomePage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('hackathons');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, hackathons: 0, internships: 0, contests: 0 });
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch Stats on mount
  useEffect(() => {
    oppApi.getStats().then(setStats).catch(console.error);
  }, []);

  // Fetch Bookmarks if logged in
  useEffect(() => {
    if (user) {
      bookmarkApi.getBookmarks().then(res => {
        setBookmarks(new Set(res.map(b => b.opportunity_id)));
      }).catch(console.error);
    } else {
      setBookmarks(new Set());
    }
  }, [user]);

  // Fetch Opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (deptFilter !== 'all') filters.dept = deptFilter;
      if (levelFilter !== 'all') filters.level = levelFilter;
      if (searchQuery) filters.search = searchQuery;

      let res = [];
      if (activeTab === 'hackathons') res = await oppApi.getHackathons(filters);
      else if (activeTab === 'internships') res = await oppApi.getInternships(filters);
      else if (activeTab === 'contests') res = await oppApi.getContests(filters);
      
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, deptFilter, levelFilter, searchQuery]);

  // Debounce search and trigger fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOpportunities]);

  const handleBookmarkToggle = async (id, type) => {
    if (!user) {
        alert("Please log in to bookmark opportunities.");
        return;
    }
    const isBookmarked = bookmarks.has(id);
    
    try {
      if (isBookmarked) {
        await bookmarkApi.removeBookmark(id);
        const newBookmarks = new Set(bookmarks);
        newBookmarks.delete(id);
        setBookmarks(newBookmarks);
      } else {
        await bookmarkApi.addBookmark(id, type);
        const newBookmarks = new Set(bookmarks);
        newBookmarks.add(id);
        setBookmarks(newBookmarks);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  return (
    <div className="homepage">
      {/* HEADER SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">SRM TRP Opportunity Hub</h1>
        <p className="hero-subtitle">
          Your centralized portal for discovering top hackathons, elite internships, and core domain contests. 
          Stay ahead of the curve and accelerate your career.
        </p>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Opportunities</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.hackathons}</span>
            <span className="stat-label">Hackathons</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.internships}</span>
            <span className="stat-label">Internships</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.contests}</span>
            <span className="stat-label">Contests</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem' }}>
            <span className="stat-value" style={{ color: 'var(--text)' }}>{data.length}</span>
            <span className="stat-label">Showing Now</span>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="tabs-container">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery(''); // Reset search on tab change
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Department:</span>
          {DEPTS.map(d => (
            <button 
              key={d} 
              className={`chip ${deptFilter === d ? 'active' : ''}`}
              onClick={() => setDeptFilter(d)}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Level:</span>
          {LEVELS.map(l => (
            <button 
              key={l} 
              className={`chip ${levelFilter === l ? 'active' : ''}`}
              onClick={() => setLevelFilter(l)}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by name, organization, or focus area..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* CARDS GRID */}
      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState message="No opportunities found matching your filters. Try adjusting your department or level." />
      ) : (
        <div className="cards-grid">
          {data.map(item => {
            if (activeTab === 'hackathons') {
              return (
                <HackathonCard 
                  key={item.id} 
                  hackathon={item} 
                  isBookmarked={bookmarks.has(item.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              );
            } else if (activeTab === 'internships') {
              return (
                <InternshipCard 
                  key={item.id} 
                  internship={item} 
                  isBookmarked={bookmarks.has(item.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              );
            } else {
              return (
                <ContestCard 
                  key={item.id} 
                  contest={item} 
                  isBookmarked={bookmarks.has(item.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
