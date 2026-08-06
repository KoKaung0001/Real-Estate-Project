import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const isLogin = location.pathname === '/login' || location.pathname === '/signin';
  const [mode, setMode] = useState(isLogin ? 'signin' : 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [signinForm, setSigninForm] = useState({ email: '', password: '', remember: false });
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'buyer' });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = signinForm.email;
      const role = email.includes('admin') ? 'admin' : email.includes('seller') ? 'seller' : 'buyer';
      await login(email, signinForm.password, role);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Use demo buttons below.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
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
      await register(`${signupForm.firstName} ${signupForm.lastName}`, signupForm.email, signupForm.password, signupForm.role);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const emails = { buyer: 'buyer@demo.com', seller: 'seller@demo.com', admin: 'admin@demo.com' };
      await login(emails[role], 'demo', role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'signin') {
    return (
      <div className="auth-page">
        <div className="auth-signin">
          {/* Left Panel */}
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
              <div className="auth-stats-grid">
                <div className="auth-stat-box">
                  <div className="auth-stat-value">12K+</div>
                  <div className="auth-stat-label">Listings</div>
                </div>
                <div className="auth-stat-box">
                  <div className="auth-stat-value">48K+</div>
                  <div className="auth-stat-label">Happy Buyers</div>
                </div>
                <div className="auth-stat-box">
                  <div className="auth-stat-value">280</div>
                  <div className="auth-stat-label">Cities</div>
                </div>
                <div className="auth-stat-box">
                  <div className="auth-stat-value">4.9★</div>
                  <div className="auth-stat-label">App Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <div className="auth-form-card">
              <h2 className="auth-form-title">Sign in to UrbanNest</h2>
              <p className="auth-form-subtitle">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>
                  Create one free
                </button>
              </p>

              {/* Social Login */}
              <div className="auth-social-btns">
                <button className="auth-social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button className="auth-social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </div>

              <div className="auth-divider">
                <div className="auth-divider-line"></div>
                <span className="auth-divider-text">or continue with email</span>
                <div className="auth-divider-line"></div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSignIn}>
                <div className="auth-field">
                  <label>Email address</label>
                  <div className="auth-field-row">
                    <Mail className="w-5 h-5" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={signinForm.email}
                      onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Password</label>
                    <a href="/forgot-password" className="auth-field-link">Forgot password?</a>
                  </div>
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

                <div className="auth-remember">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={signinForm.remember}
                    onChange={(e) => setSigninForm({ ...signinForm, remember: e.target.checked })}
                  />
                  <label htmlFor="remember">Remember me for 30 days</label>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-loading"></span> : 'Sign In'}
                </button>
              </form>

              <p className="auth-terms">
                By signing in, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
              </p>

              <div className="auth-demo-section">
                <p className="auth-demo-label">Quick demo login</p>
                <div className="auth-demo-btns">
                  <button onClick={() => quickLogin('buyer')} className="auth-demo-btn" disabled={loading}>Buyer</button>
                  <button onClick={() => quickLogin('seller')} className="auth-demo-btn" disabled={loading}>Seller</button>
                  <button onClick={() => quickLogin('admin')} className="auth-demo-btn" disabled={loading}>Admin</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  return (
    <div className="auth-page">
      <div className="auth-register">
        <div className="auth-register-icon">
          <Home className="w-8 h-8" />
        </div>
        <h1 className="auth-register-title">Create your account</h1>
        <p className="auth-register-subtitle">
          Already have one?{' '}
          <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit', color: '#2563eb' }}>
            Sign in
          </button>
        </p>

        <div className="auth-register-card">
          {/* Role Toggle */}
          <div className="auth-role-toggle">
            <button
              type="button"
              onClick={() => setSignupForm({ ...signupForm, role: 'buyer' })}
              className={`auth-role-btn ${signupForm.role === 'buyer' ? 'active' : ''}`}
            >
              🏠 I Want To Buy/Rent
            </button>
            <button
              type="button"
              onClick={() => setSignupForm({ ...signupForm, role: 'seller' })}
              className={`auth-role-btn ${signupForm.role === 'seller' ? 'active' : ''}`}
            >
              🔑 I Want To Sell/List
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignUp}>
            <div className="auth-name-row">
              <div className="auth-field">
                <label>First name</label>
                <div className="auth-field-row">
                  <input
                    type="text"
                    placeholder="Alex"
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Last name</label>
                <div className="auth-field-row">
                  <input
                    type="text"
                    placeholder="Johnson"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    required
                  />
                </div>
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
                I agree to UrbanNest's <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
              </label>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-loading"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-demo-section">
            <p className="auth-demo-label">Quick demo login</p>
            <div className="auth-demo-btns">
              <button onClick={() => quickLogin('buyer')} className="auth-demo-btn" disabled={loading}>Buyer</button>
              <button onClick={() => quickLogin('seller')} className="auth-demo-btn" disabled={loading}>Seller</button>
              <button onClick={() => quickLogin('admin')} className="auth-demo-btn" disabled={loading}>Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}