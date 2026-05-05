import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'CSE',
    year: '1',
    password: '',
    confirm_password: '',
    registerAsAdmin: false
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const DEPARTMENTS = [
    { value: 'CSE', label: 'CSE / AIDS / AIML / IT' },
    { value: 'ECE', label: 'ECE' },
    { value: 'EEE', label: 'EEE' },
    { value: 'MECHANICAL', label: 'Mechanical' },
    { value: 'CIVIL', label: 'Civil' }
  ];

  const YEARS = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setIsLoading(true);
    
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        department: formData.department.toLowerCase(),
        year: parseInt(formData.year)
      };

      if (formData.registerAsAdmin) {
        payload.role = 'admin';
      }

      await register(payload);
      navigate('/');
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError?.code === 'DOMAIN_RESTRICTED') {
        setError(apiError.message);
      } else {
        setError(apiError?.message || err.message || 'Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the SRM TRP Opportunity Hub</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input 
              type="text" 
              id="full_name" 
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@trp.srmtrichy.edu.in"
            />
            <div className="auth-hint">Use your college email ending with @trp.srmtrichy.edu.in</div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select 
                id="department" 
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year of Study</label>
              <select 
                id="year" 
                name="year"
                value={formData.year}
                onChange={handleChange}
              >
                {YEARS.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input 
                type="password" 
                id="confirm_password" 
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="registerAsAdmin"
              checked={formData.registerAsAdmin}
              onChange={handleChange}
            />
            <span>Register as Admin (temporary)</span>
          </label>
          
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}
