import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';

function AuthStats({ approvedListingCount }: { approvedListingCount: number }) {
  return (
    <div className="auth-stats-grid">
      <div className="auth-stat-box">
        <div className="auth-stat-value">{approvedListingCount}</div>
        <div className="auth-stat-label">Listings</div>
      </div>
      <div className="auth-stat-box">
        <div className="auth-stat-value">1</div>
        <div className="auth-stat-label">City Covered</div>
      </div>
      <div className="auth-stat-box">
        <div className="auth-stat-value">0</div>
        <div className="auth-stat-label">Happy Buyers</div>
      </div>
    </div>
  );
}

export function LoginRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { properties } = useProperties();
  
  const isLogin = location.pathname === '/login';
  const approvedListingCount = properties.filter(
    (property) => property.approvalStatus === 'APPROVED',
  ).length;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [signinForm, setSigninForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '' });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(signinForm.username, signinForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }
    setLoading(true);
    try {
      await register(signupForm.username, signupForm.email, signupForm.password, signupForm.phone);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLogin) {
    return (
      <div className="auth-page">
        <div className="auth-signin">
          <div className="auth-left">
            <div className="auth-left-bg"></div>
            <div className="auth-left-overlay"></div>
            <div className="auth-left-content">
              <div className="auth-logo-icon">
                <Home className="w-8 h-8" />
              </div>
              <h1 className="auth-welcome-title">Welcome back.</h1>
              <p className="auth-welcome-desc">
                Your dream home is one search away.<br />
                Sign in to continue your journey.
              </p>
              <AuthStats approvedListingCount={approvedListingCount} />
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-form-card">
              <h2 className="auth-form-title">Sign in to UrbanNest</h2>
              <p className="auth-form-subtitle">
                Don't have an account?{' '}
                <Link to="/register" style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                  Create one free
                </Link>
              </p>

              <div className="auth-divider">
                <div className="auth-divider-line"></div>
                <span className="auth-divider-text">or continue with email</span>
                <div className="auth-divider-line"></div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSignIn}>
                <div className="auth-field">
                  <label>Username</label>
                  <div className="auth-field-row">
                    <Mail className="w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={signinForm.username}
                      onChange={(e) => setSigninForm({ ...signinForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-field-row">
                    <Lock className="w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signinForm.password}
                      onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-loading"></span> : 'Sign In'}
                </button>
              </form>

              <p className="auth-terms">
                By signing in, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-register">
        <div className="auth-register-icon">
          <Home className="w-8 h-8" />
        </div>
        <h1 className="auth-register-title">Create your account</h1>
        <p className="auth-register-subtitle">
          Already have one?{' '}
          <Link to="/login" style={{ fontSize: 'inherit', fontWeight: 'inherit', color: '#2563eb' }}>
            Sign in
          </Link>
        </p>

        <AuthStats approvedListingCount={approvedListingCount} />

        <div className="auth-register-card">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignUp}>
            <div className="auth-field">
              <label>Username</label>
              <div className="auth-field-row">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-field-row">
                <Mail className="w-5 h-5" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Phone</label>
              <div className="auth-field-row">
                <input
                  type="tel"
                  placeholder="09-XXXXXXXXX"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-field-row">
                <Lock className="w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm password</label>
              <div className="auth-field-row">
                <Lock className="w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-terms-check">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="agree">
                I agree to UrbanNest's <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-loading"></span> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
