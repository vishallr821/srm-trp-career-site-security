import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true);
      else setShowTopBtn(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="brand-logo">
            SRM TRP <span>Opportunity Hub</span>
          </Link>
        </div>
        
        <div className="navbar-center">
          {user && <Link to="/" className="nav-link">Home</Link>}
          {user && <Link to="/bookmarks" className="nav-link">Bookmarks</Link>}
          {user && user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                <div className="user-greeting">Hi, {user.full_name?.split(' ')[0] || 'Student'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{user.department} Dept</div>
              </div>
              <button onClick={handleLogout} className="btn-outline">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>SRM TRP Placement Cell &copy; 2026</p>
      </footer>

      {showTopBtn && (
        <button 
          onClick={scrollToTop} 
          style={{
            position: 'fixed', bottom: '30px', right: '30px', 
            background: 'var(--primary)', color: 'white', 
            border: 'none', borderRadius: '50%', width: '45px', height: '45px', 
            fontSize: '1.2rem', cursor: 'pointer', boxShadow: 'var(--shadow)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Back to Top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
