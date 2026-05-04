import React from 'react';

export default function EmptyState({ message }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '3rem', 
      color: 'var(--text-muted)', 
      fontSize: '1.1rem', 
      background: 'var(--surface)', 
      borderRadius: 'var(--radius)', 
      border: '1px dashed var(--border-dark)' 
    }}>
      {message || "No results found matching your criteria."}
    </div>
  );
}
