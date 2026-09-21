import React, { useState } from 'react';

export const DEMO_CREDENTIALS = [
  {
    role: 'qa',
    label: 'QA Engineer',
    username: 'qa_engineer',
    password: 'qa123',
    name: 'Sarah Jenkins (Lead QA)',
    icon: '🧪',
    access: 'Upload Reports, View UI Failures, Inspect Payload Audit Logs',
    restricted: 'Cannot Create or Delete Applications'
  },
  {
    role: 'dev',
    label: 'Mobile Developer',
    username: 'dev_lead',
    password: 'dev123',
    name: 'Alex Rivera (Senior Mobile Dev)',
    icon: '💻',
    access: 'View Debug Stacktraces, MobSF Patch Guidelines, Git Traceability',
    restricted: 'Cannot Upload Files, Cannot Create/Delete Applications'
  },
  {
    role: 'pm',
    label: 'Project Manager (Admin)',
    username: 'pm_admin',
    password: 'pm123',
    name: 'Marcus Vance (Project Manager)',
    icon: '👑',
    access: 'Admin Console: Approve User Registrations, Create Apps, Delete Apps, Upload Reports, Reset DB',
    restricted: 'None (Full Admin Access)'
  },
  {
    role: 'customer',
    label: 'Customer / Client',
    username: 'client_user',
    password: 'client123',
    name: 'Enterprise Client Stakeholder',
    icon: '👔',
    access: 'Executive Quality Score Summary, Release Readiness Badge',
    restricted: 'No Access to Ingestion Center, Raw Stacktraces, or App Settings'
  }
];

export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState('qa');
  
  // Sign In state
  const [username, setUsername] = useState('qa_engineer');
  const [password, setPassword] = useState('qa123');

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('qa');

  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const activeDemo = DEMO_CREDENTIALS.find(c => c.role === selectedRole) || DEMO_CREDENTIALS[0];

  const handleRoleSelect = (cred) => {
    setSelectedRole(cred.role);
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
    setSuccessInfo('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessInfo('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessInfo('');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          password: regPassword,
          role: regRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsername(regUsername);
        setPassword(regPassword);
        setAuthMode('signin');
        setSuccessInfo(data.message || 'Registration submitted! Awaiting Project Manager Admin approval.');
        setRegName('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        
        {/* Header Branding */}
        <div className="login-header">
          <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="9" x2="9" y2="9"></line>
              <line x1="3" y1="15" x2="9" y2="15"></line>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Mobile Quality Evaluation Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            AgyMobile QP — Unified Quality Evaluation Platform
          </p>
        </div>

        {/* Primary Auth Mode Switcher: Sign In vs Sign Up */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`auth-mode-tab ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => { setAuthMode('signin'); setError(''); setSuccessInfo(''); }}
          >
            Sign In (Log In)
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => { setAuthMode('signup'); setError(''); setSuccessInfo(''); }}
          >
            Sign Up (Register New Account)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)', padding: '0.85rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'left', lineHeight: '1.5' }}>
            {error}
          </div>
        )}

        {/* Success / Pending Info Notice Banner */}
        {successInfo && (
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', color: 'var(--color-warning)', padding: '0.85rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            ⏳ <strong>Approval Required:</strong> {successInfo}
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <div>
            {/* Profession Quick Selector */}
            <div className="login-role-tabs">
              {DEMO_CREDENTIALS.map(cred => (
                <button
                  key={cred.role}
                  type="button"
                  className={`login-role-tab-btn ${selectedRole === cred.role ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(cred)}
                >
                  <span style={{ fontSize: '1.1rem' }}>{cred.icon}</span>
                  <span>{cred.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Role Permissions Preview Box */}
            <div className="login-permission-box">
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{activeDemo.icon}</span>
                <span>{activeDemo.name} ({activeDemo.label})</span>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                ✔ <strong>Granted Access:</strong> {activeDemo.access}
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>
                🔒 <strong>Access Restrictions:</strong> {activeDemo.restricted}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input 
                  id="login-username"
                  type="text" 
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input 
                  id="login-password"
                  type="password" 
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : `Sign In as ${activeDemo.label}`}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Pre-approved Admin & Role Demo Accounts:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                <div>PM Admin: <code>pm_admin / pm123</code></div>
                <div>QA: <code>qa_engineer / qa123</code></div>
                <div>DEV: <code>dev_lead / dev123</code></div>
                <div>CLIENT: <code>client_user / client123</code></div>
              </div>
            </div>
          </div>
        )}

        {/* SIGN UP / REGISTER FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input 
                id="reg-name"
                type="text" 
                className="form-control"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. David Miller"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-username">Choose Username</label>
              <input 
                id="reg-username"
                type="text" 
                className="form-control"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. david_qa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Requested Profession Role</label>
              <select 
                id="reg-role"
                className="form-control"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="qa">QA Engineer (Upload & Test Verification Access)</option>
                <option value="dev">Mobile Developer (Debug & Stacktrace Access)</option>
                <option value="pm">Project Manager (Full Admin & Project Creation Access)</option>
                <option value="customer">Customer / Client (Executive Summary View Access)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="reg-pass">Password</label>
                <input 
                  id="reg-pass"
                  type="password" 
                  className="form-control"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 chars"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input 
                  id="reg-confirm"
                  type="password" 
                  className="form-control"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-warning)', margin: '0.5rem 0 1rem', padding: '0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              🔒 <strong>Notice:</strong> Your registration will require approval from a Project Manager Admin (`pm_admin`) before your first sign-in.
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Submitting Registration...' : 'Submit Registration for Admin Approval'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
