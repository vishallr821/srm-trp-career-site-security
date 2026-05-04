import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Card.css';

export default function HackathonCard({ hackathon, onBookmarkToggle, isBookmarked, customIcon }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

  return (
    <div className="opp-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{hackathon.name}</h3>
          <div className="card-org">{hackathon.org}</div>
        </div>
        {user && (
          <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmarkToggle(hackathon.id, 'hackathon')}
          >
            {customIcon ? customIcon : (isBookmarked ? '★' : '☆')}
          </button>
        )}
      </div>

      <div className="badges">
        <span className="badge level">{hackathon.level}</span>
        {hackathon.jobs && <span className="badge job">Job Linked</span>}
        {hackathon.depts && hackathon.depts.map(dept => (
          <span key={dept} className="badge dept">{dept.toUpperCase()}</span>
        ))}
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span>{hackathon.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🎯</span>
          <span><strong>Focus:</strong> {hackathon.focus}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🏆</span>
          <span><strong>Prize:</strong> {hackathon.prize}</span>
        </div>
      </div>

      <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="expanded-panel">
          <div className="expanded-section">
            <h4>Rounds</h4>
            <p>{hackathon.round_detail}</p>
            <ul>
              {hackathon.rounds && hackathon.rounds.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          
          {hackathon.perks && (
            <div className="expanded-section">
              <h4>Perks</h4>
              <p>{hackathon.perks}</p>
            </div>
          )}

          {hackathon.winners && hackathon.winners.length > 0 && (
            <div className="expanded-section">
              <h4>Past Winning Solutions</h4>
              <div className="winner-boxes">
                {hackathon.winners.map((w, i) => (
                  <div key={i} className="winner-box">
                    <strong>PS: {w.ps}</strong>
                    <span>Sol: {w.sol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hackathon.tip && (
            <div className="pro-tip">
              <strong>Pro Tip:</strong> {hackathon.tip}
            </div>
          )}

          <div className="action-row">
            <a href={hackathon.link} target="_blank" rel="noreferrer" className="btn-primary">Official Link</a>
          </div>
        </div>
      )}
    </div>
  );
}
