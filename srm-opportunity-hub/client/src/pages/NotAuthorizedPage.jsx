import { Link } from 'react-router-dom';

export default function NotAuthorizedPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', marginBottom: '0.5rem' }}>403 - Not Authorized</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        You do not have permission to access the admin portal.
      </p>
      <Link to="/" className="btn-primary">Go to Home</Link>
    </div>
  );
}
