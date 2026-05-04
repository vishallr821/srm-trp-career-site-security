import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Card.css';

export default function ContestCard({ contest, onBookmarkToggle, isBookmarked, customIcon }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

  return (
    <div className="opp-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{contest.name}</h3>
          <div className="card-org">{contest.org}</div>
        </div>
        {user && (
          <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmarkToggle(contest.id, 'contest')}
          >
            {customIcon ? customIcon : (isBookmarked ? '★' : '☆')}
          </button>
        )}
      </div>

      <div className="badges">
        <span className="badge level">{contest.level} Contest</span>
        {contest.jobs && <span className="badge job">Job Linked</span>}
        {contest.depts && contest.depts.map(dept => (
          <span key={dept} className="badge dept">{dept.toUpperCase()}</span>
        ))}
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span>{contest.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🎯</span>
          <span><strong>Focus:</strong> {contest.focus}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🏆</span>
          <span><strong>Prize:</strong> {contest.prize}</span>
        </div>
      </div>

      <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="expanded-panel">
          <div className="expanded-section">
            <h4>Rounds</h4>
            <p>{contest.round_detail}</p>
            <ul>
              {contest.rounds && contest.rounds.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          
          {contest.perks && (
            <div className="expanded-section">
              <h4>Perks</h4>
              <p>{contest.perks}</p>
            </div>
          )}

          {contest.tip && (
            <div className="pro-tip">
              <strong>Pro Tip:</strong> {contest.tip}
            </div>
          )}

          <div className="action-row">
            <a href={contest.link} target="_blank" rel="noreferrer" className="btn-primary">Official Link</a>
          </div>
        </div>
      )}
    </div>
  );
}
