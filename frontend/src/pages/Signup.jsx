import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const passwordRules = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$...)', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

const strengthLevels = [
  { label: 'Too weak', color: '#CC3333' },
  { label: 'Weak', color: '#CC3333' },
  { label: 'Fair', color: '#CC8833' },
  { label: 'Good', color: '#888888' },
  { label: 'Strong', color: '#111111' },
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Password strength calculation
  const strength = useMemo(() => {
    if (!password) return { score: 0, passed: [] };
    const passed = passwordRules.map((rule) => rule.test(password));
    const score = passed.filter(Boolean).length;
    return { score, passed };
  }, [password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength.score < 4) {
      setError('Password is not strong enough. Please meet at least 4 of the 5 requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/_/backend/api';
      const res = await axios.post(`${API_URL}/register`, {
        username, email, password
      });
      if (res.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header-line"></div>
      <h1>Create Account</h1>
      <p className="subtitle">Enter your details to get started</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="username">Full Name</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* ─── Password Strength Indicator ─── */}
          {password && (
            <div className="pw-strength">
              <div className="pw-strength-bar">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="pw-strength-segment"
                    style={{
                      background: i < strength.score
                        ? strengthLevels[strength.score - 1]?.color
                        : '#E0E0E0',
                    }}
                  />
                ))}
              </div>
              <span
                className="pw-strength-label"
                style={{ color: strengthLevels[strength.score - 1]?.color }}
              >
                {strengthLevels[strength.score - 1]?.label}
              </span>

              <ul className="pw-rules">
                {passwordRules.map((rule, i) => (
                  <li key={i} className={strength.passed[i] ? 'passed' : ''}>
                    <span className="pw-rule-icon">{strength.passed[i] ? '✓' : '–'}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        <button type="submit" className="btn">Create Account</button>
      </form>
      
      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
};

export default Signup;
