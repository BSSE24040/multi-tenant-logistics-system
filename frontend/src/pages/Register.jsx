import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { saveAuth } from '../utils/auth';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantName: '', tenantEmail: '', tenantPhone: '',
    name: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      saveAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-logo">MLSCCS</h1>
          <p className="register-subtitle">Multi-Tenant Logistics Command System</p>
        </div>

        <h2 className="register-title">Create Account</h2>
        <p className="register-desc">Register your company and admin account</p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <p className="register-section">Company Details</p>

          <div className="register-field">
            <label className="register-label">Company Name</label>
            <input className="register-input" name="tenantName"
              placeholder="Alpha Logistics" value={form.tenantName}
              onChange={handleChange} required />
          </div>
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">Company Email</label>
              <input className="register-input" type="email" name="tenantEmail"
                placeholder="info@company.com" value={form.tenantEmail}
                onChange={handleChange} required />
            </div>
            <div className="register-field">
              <label className="register-label">Phone</label>
              <input className="register-input" name="tenantPhone"
                placeholder="03001234567" value={form.tenantPhone}
                onChange={handleChange} />
            </div>
          </div>

          <p className="register-section">Admin Account</p>

          <div className="register-field">
            <label className="register-label">Your Name</label>
            <input className="register-input" name="name"
              placeholder="John Doe" value={form.name}
              onChange={handleChange} required />
          </div>
          <div className="register-field">
            <label className="register-label">Email Address</label>
            <input className="register-input" type="email" name="email"
              placeholder="admin@company.com" value={form.email}
              onChange={handleChange} required />
          </div>
          <div className="register-field">
            <label className="register-label">Password</label>
            <input className="register-input" type="password" name="password"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} required />
          </div>

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="register-foot">
          Already have an account?{' '}
          <Link to="/login" className="register-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}