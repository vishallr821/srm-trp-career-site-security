import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Card.css';

export default function InternshipCard({ internship, onBookmarkToggle, isBookmarked, customIcon }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

  return (
    <div className="opp-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{internship.name}</h3>
          <div className="card-org">{internship.org}</div>
        </div>
        {user && (
          <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmarkToggle(internship.id, 'internship')}
          >
            {customIcon ? customIcon : (isBookmarked ? '★' : '☆')}
          </button>
        )}
      </div>

      <div className="badges">
        <span className="badge level">{internship.level} Internship</span>
        {internship.depts && internship.depts.map(dept => (
          <span key={dept} className="badge dept">{dept.toUpperCase()}</span>
        ))}
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span>{internship.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">💰</span>
          <span><strong>Stipend:</strong> {internship.stipend}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">🎓</span>
          <span><strong>Eligibility:</strong> {internship.eligibility}</span>
        </div>
      </div>

      <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="expanded-panel">
          <div className="expanded-section">
            <h4>Focus</h4>
            <p>{internship.focus}</p>
          </div>

          <div className="expanded-section">
            <h4>Selection Process</h4>
            <p>{internship.selection_detail}</p>
            <ul>
              {internship.selection && internship.selection.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          
          <div className="detail-row">
            <span className="detail-icon">🏢</span>
            <span><strong>Mode:</strong> {internship.mode}</span>
          </div>

          {internship.tip && (
            <div className="pro-tip">
              <strong>Pro Tip:</strong> {internship.tip}
            </div>
          )}

          <div className="action-row">
            <a href={internship.link} target="_blank" rel="noreferrer" className="btn-primary">Apply Now</a>
          </div>
        </div>
      )}
    </div>
  );
}
