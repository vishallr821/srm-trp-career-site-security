import React, { useState, useEffect } from 'react';
import * as bookmarkApi from '../api/bookmarks';
import * as oppApi from '../api/opportunities';
import HackathonCard from '../components/cards/HackathonCard';
import InternshipCard from '../components/cards/InternshipCard';
import ContestCard from '../components/cards/ContestCard';
import './BookmarksPage.css';

export default function BookmarksPage() {
  const [loading, setLoading] = useState(true);
  const [bookmarkedHackathons, setBookmarkedHackathons] = useState([]);
  const [bookmarkedInternships, setBookmarkedInternships] = useState([]);
  const [bookmarkedContests, setBookmarkedContests] = useState([]);

  useEffect(() => {
    const fetchBookmarksData = async () => {
      try {
        setLoading(true);
        // Fetch user's bookmarks
        const bookmarks = await bookmarkApi.getBookmarks();
        
        if (bookmarks.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all opportunities and filter by bookmarked IDs
        const [allHacks, allInterns, allContests] = await Promise.all([
          oppApi.getHackathons(),
          oppApi.getInternships(),
          oppApi.getContests()
        ]);

        const hackIds = new Set(bookmarks.filter(b => b.opportunity_type === 'hackathon').map(b => b.opportunity_id));
        const internIds = new Set(bookmarks.filter(b => b.opportunity_type === 'internship').map(b => b.opportunity_id));
        const contestIds = new Set(bookmarks.filter(b => b.opportunity_type === 'contest').map(b => b.opportunity_id));

        setBookmarkedHackathons(allHacks.filter(h => hackIds.has(h.id)));
        setBookmarkedInternships(allInterns.filter(i => internIds.has(i.id)));
        setBookmarkedContests(allContests.filter(c => contestIds.has(c.id)));

      } catch (error) {
        console.error("Error fetching bookmarks data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarksData();
  }, []);

  const handleRemoveBookmark = async (id, type) => {
    try {
      await bookmarkApi.removeBookmark(id);
      
      if (type === 'hackathon') {
        setBookmarkedHackathons(prev => prev.filter(item => item.id !== id));
      } else if (type === 'internship') {
        setBookmarkedInternships(prev => prev.filter(item => item.id !== id));
      } else if (type === 'contest') {
        setBookmarkedContests(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading your saved opportunities...</div>;
  }

  const hasBookmarks = bookmarkedHackathons.length > 0 || 
                       bookmarkedInternships.length > 0 || 
                       bookmarkedContests.length > 0;

  if (!hasBookmarks) {
    return (
      <div className="bookmarks-page">
        <header className="bookmarks-header">
          <h1 className="bookmarks-title">Your Bookmarks</h1>
        </header>
        <div className="empty-state">
          No bookmarks yet — browse opportunities on the Home Page and save ones you're interested in!
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <header className="bookmarks-header">
        <h1 className="bookmarks-title">Your Saved Opportunities</h1>
        <p className="bookmarks-subtitle">Track and prepare for your next big break.</p>
      </header>

      {bookmarkedHackathons.length > 0 && (
        <section className="bookmarks-section">
          <h2 className="section-title">🏆 Hackathons</h2>
          <div className="cards-grid">
            {bookmarkedHackathons.map(item => (
              <HackathonCard 
                key={item.id} 
                hackathon={item} 
                isBookmarked={true}
                customIcon="✕"
                onBookmarkToggle={handleRemoveBookmark}
              />
            ))}
          </div>
        </section>
      )}

      {bookmarkedInternships.length > 0 && (
        <section className="bookmarks-section">
          <h2 className="section-title">💼 Internships</h2>
          <div className="cards-grid">
            {bookmarkedInternships.map(item => (
              <InternshipCard 
                key={item.id} 
                internship={item} 
                isBookmarked={true}
                customIcon="✕"
                onBookmarkToggle={handleRemoveBookmark}
              />
            ))}
          </div>
        </section>
      )}

      {bookmarkedContests.length > 0 && (
        <section className="bookmarks-section">
          <h2 className="section-title">⚙️ Core Domain Contests</h2>
          <div className="cards-grid">
            {bookmarkedContests.map(item => (
              <ContestCard 
                key={item.id} 
                contest={item} 
                isBookmarked={true}
                customIcon="✕"
                onBookmarkToggle={handleRemoveBookmark}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
