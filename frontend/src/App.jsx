import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UploadCenter from './components/UploadCenter';
import Applications from './components/Applications';
import Analytics from './components/Analytics';
import HistoryLogs from './components/HistoryLogs';

export default function App() {
  const [apps, setApps] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [persona, setPersona] = useState('qa');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [stacktraceModal, setStacktraceModal] = useState({ open: false, name: '', error: '' });
  const [sourceModal, setSourceModal] = useState({ open: false, filename: '', content: '' });

  // Fetch all applications
  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApps(data);
    } catch (e) {
      console.error("Error loading applications from backend:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Update body class whenever persona changes
  useEffect(() => {
    document.body.className = `view-${persona}`;
  }, [persona]);

  const activeApp = apps.find(app => app.active) || apps[0];

  const handleSelectApp = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}/select`, { method: 'POST' });
      if (res.ok) {
        const updated = apps.map(app => ({
          ...app,
          active: app.id === appId
        }));
        setApps(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDb = async () => {
    if (confirm("Reset database to baseline mock data? Any uploaded builds will be deleted.")) {
      try {
        const res = await fetch('/api/applications/reset', { method: 'POST' });
        const data = await res.json();
        setApps(data);
        setActiveTab('dashboard');
        alert("Unified Database has been reset.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getPersonaText = () => {
    if (!activeApp) return { title: 'No App Selected', text: '' };
    switch(persona) {
      case 'qa':
        return {
          title: "Quality Assurance Console",
          text: `Detailed regression logs and manual file ingestion is unlocked. Total parsed builds: ${activeApp.history?.length || 0}`
        };
      case 'dev':
        return {
          title: "Developer Debug Console",
          text: "Focusing on failed Appium UI element selectors, slow JMeter endpoints, and MobSF vulnerability patching rules."
        };
      case 'pm':
        return {
          title: "Project Manager Dashboard",
          text: `High-level project score stands at ${activeApp.qualityScore}%. Release Readiness recommendation is locked in based on testing benchmarks.`
        };
      case 'customer':
        return {
          title: "Stakeholder Release Summary",
          text: "Simplified view showing overall testing percentages. Technical logs and stack traces are suppressed for clarity."
        };
      default:
        return { title: '', text: '' };
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="site-wrapper">
      
      {/* MOBILE BACKDROP OVERLAY */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* STANDARD STICKY TOP NAVBAR */}
      <header className="site-header">
        <div className="site-header-inner">
          
          {/* Brand Logo & App Switcher */}
          <div className="header-brand-group">
            <div className="brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="9" x2="9" y2="9"></line>
                <line x1="3" y1="15" x2="9" y2="15"></line>
              </svg>
            </div>

            <div className="brand-text-container">
              <span className="brand-title">AgyMobile QP</span>
              <span className="brand-tagline">Quality Platform</span>
            </div>

            {/* Top Project Selector */}
            <div className="header-project-select">
              <select 
                className="app-select"
                value={activeApp ? activeApp.id : ''}
                onChange={(e) => handleSelectApp(e.target.value)}
              >
                {apps.map(app => (
                  <option key={app.id} value={app.id}>{app.name} ({app.platform})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <button 
              className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabChange('upload')}
            >
              Upload Center
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => handleTabChange('applications')}
            >
              Applications
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleTabChange('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              History Logs
            </button>
          </nav>

          {/* Right Group: Stakeholder Switcher & Mobile Menu Trigger */}
          <div className="header-actions-group">
            <div className="persona-switcher">
              <span className="persona-label">View:</span>
              {['qa', 'dev', 'pm', 'customer'].map(p => (
                <button 
                  key={p} 
                  className={`persona-btn ${persona === p ? 'active' : ''}`}
                  onClick={() => setPersona(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      <aside className={`sidebar-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="brand">
            <div className="brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="12" x2="21" y2="12"></line>
              </svg>
            </div>
            <span className="brand-title">Navigation Menu</span>
          </div>

          <button 
            className="sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close drawer"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav style={{ margin: '1.5rem 0' }}>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => handleTabChange('dashboard')}>Dashboard</button>
            </li>
            <li className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}>
              <button onClick={() => handleTabChange('upload')}>Upload Center</button>
            </li>
            <li className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}>
              <button onClick={() => handleTabChange('applications')}>Applications</button>
            </li>
            <li className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <button onClick={() => handleTabChange('analytics')}>Analytics & Trends</button>
            </li>
            <li className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}>
              <button onClick={() => handleTabChange('history')}>History Logs</button>
            </li>
          </ul>
        </nav>

        <div className="drawer-footer">
          <div className="app-selector-container">
            <label className="app-selector-label">Active Project</label>
            <select 
              className="app-select"
              value={activeApp ? activeApp.id : ''}
              onChange={(e) => handleSelectApp(e.target.value)}
            >
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* MAIN WEBSITE BODY CONTAINER */}
      <main className="main-content-container">
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Loading platform database...
          </div>
        ) : !activeApp ? (
          <div style={{ padding: '3rem', textAlign: 'center', minHeight: '50vh' }}>
            <h2>No active application registry found.</h2>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('applications')}>Go to Applications Manager</button>
          </div>
        ) : (
          <div className="view-panel">
            
            {/* Context Alert Banner */}
            <div className="persona-alert-banner" id="persona-alert-banner">
              <div className="persona-alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </div>
              <div className="persona-alert-text">
                <div className="persona-alert-title">{getPersonaText().title} - ({activeApp.name})</div>
                <div>{getPersonaText().text}</div>
              </div>
            </div>

            {/* Panel Views */}
            {activeTab === 'dashboard' && (
              <Dashboard 
                app={activeApp} 
                setStacktraceModal={setStacktraceModal} 
                openStacktraceModal={() => setStacktraceModal(prev => ({ ...prev, open: true }))}
              />
            )}
            {activeTab === 'upload' && (
              <UploadCenter 
                app={activeApp} 
                onUploadSuccess={fetchApps} 
                onNavigate={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'applications' && (
              <Applications 
                apps={apps} 
                fetchApps={fetchApps} 
                onSelect={handleSelectApp}
              />
            )}
            {activeTab === 'analytics' && (
              <Analytics app={activeApp} />
            )}
            {activeTab === 'history' && (
              <HistoryLogs 
                app={activeApp} 
                setSourceModal={setSourceModal} 
              />
            )}
          </div>
        )}
      </main>

      {/* STANDARD WEBSITE FOOTER */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          
          {/* Column 1: Brand & Research Statement */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>AgyMobile QP</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '0.75rem' }}>
              A Unified Quality Evaluation Platform for Mobile Applications — Aggregating Appium, Apache JMeter, and MobSF test outputs into actionable quality metrics.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              Platform Version v2.4.0-Release
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li><button onClick={() => handleTabChange('dashboard')}>Quality Dashboard</button></li>
              <li><button onClick={() => handleTabChange('upload')}>Report Ingestion Center</button></li>
              <li><button onClick={() => handleTabChange('applications')}>Applications Registry</button></li>
              <li><button onClick={() => handleTabChange('analytics')}>Analytics & Trends</button></li>
              <li><button onClick={() => handleTabChange('history')}>Audit Logs</button></li>
            </ul>
          </div>

          {/* Column 3: Testing Tool Integrations */}
          <div className="footer-col">
            <h4>Supported Pipelines</h4>
            <ul className="footer-links">
              <li><span className="footer-badge appium">Appium</span> UI JUnit XML</li>
              <li><span className="footer-badge jmeter">JMeter</span> Performance CSV/JSON</li>
              <li><span className="footer-badge mobsf">MobSF</span> Static Security JSON</li>
              <li><span className="footer-badge ci">CI/CD</span> GitHub Actions / Webhooks</li>
            </ul>
          </div>

          {/* Column 4: System Health & Options */}
          <div className="footer-col">
            <h4>System Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-dot"></span>
                <span>Express API Server (Port 8080)</span>
              </div>
              <div>Active App: <strong style={{ color: 'white' }}>{activeApp ? activeApp.name : 'None'}</strong></div>
              <div>Database: <strong style={{ color: 'white' }}>db.json Relational Store</strong></div>
              <button 
                onClick={handleResetDb} 
                style={{ 
                  background: 'none', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: 'var(--color-danger)', 
                  padding: '0.35rem 0.6rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: 'fit-content',
                  marginTop: '0.25rem'
                }}
              >
                Reset Database Defaults
              </button>
            </div>
          </div>

        </div>

        {/* Footer Copyright Bar */}
        <div className="footer-copyright-bar">
          <div>© 2026 Mobile Application Quality Evaluation Platform. All rights reserved.</div>
          <div style={{ color: 'var(--text-dark)' }}>Built with React, Vite & Express</div>
        </div>
      </footer>

      {/* Stacktrace Modal */}
      {stacktraceModal.open && (
        <div className="modal-overlay active" onClick={() => setStacktraceModal(prev => ({ ...prev, open: false }))}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{stacktraceModal.name}</div>
              <button className="modal-close-btn" onClick={() => setStacktraceModal(prev => ({ ...prev, open: false }))}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Failure Exception Stack Trace:</div>
              <pre className="code-block">{stacktraceModal.error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Source Modal */}
      {sourceModal.open && (
        <div className="modal-overlay active" onClick={() => setSourceModal(prev => ({ ...prev, open: false }))}>
          <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{sourceModal.filename}</div>
              <button className="modal-close-btn" onClick={() => setSourceModal(prev => ({ ...prev, open: false }))}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Parsed Raw Payload Data:</div>
              <pre className="code-block" style={{ color: '#92d6ff', maxHeight: '55vh', overflowY: 'auto' }}>{sourceModal.content}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
