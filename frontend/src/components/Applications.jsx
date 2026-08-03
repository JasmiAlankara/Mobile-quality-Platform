import React, { useState } from 'react';

export default function Applications({ apps, fetchApps, onSelect }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Android');

  const handleDelete = async (appId, e) => {
    e.stopPropagation();
    if (apps.length <= 1) {
      alert("You must keep at least one active application in the database.");
      return;
    }
    if (confirm("Are you sure you want to delete this application? All parsed build history will be lost.")) {
      try {
        const res = await fetch(`/api/applications/${appId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchApps();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform })
      });
      const data = await res.json();
      
      if (res.ok) {
        setShowModal(false);
        setName('');
        fetchApps();
        onSelect(data.id);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 90) return 'good';
    if (score >= 75) return 'warning';
    return 'poor';
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Applications Manager</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Manage mobile application test suites in the workspace database.</p>
      
      <div className="apps-grid">
        {apps.map(app => {
          const scoreClass = getScoreClass(app.qualityScore);
          return (
            <div 
              key={app.id} 
              className={`app-card ${app.active ? 'active-app' : ''}`}
              onClick={() => onSelect(app.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="app-card-header">
                <div className="app-card-title">{app.name}</div>
                <span className="app-card-platform">
                  {app.platform === 'Android' ? (
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                      <path d="M2.76 3.061a.5.5 0 0 1 .679.2l1.283 2.352A8.94 8.94 0 0 1 8 5c1.17 0 2.275.224 3.278.613l1.283-2.352a.5.5 0 1 1 .87.475l-1.252 2.296C13.75 7.378 14.7 9.07 14.94 11H1.06c.24-1.93 1.19-3.622 2.762-4.968l-1.252-2.296a.5.5 0 0 1 .19-.675zM1.5 12h13a.5.5 0 0 1 0 1H1.5a.5.5 0 0 1 0-1zM5 9.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0zm7 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                      <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422 2.112-2.188.58-4.494.52-4.588-.06-.094-1.85-1.048-3.682.358-1.577 1.208-1.636 1.208-2.396 1.208-.76 0-.82-.03-2.128-.975C3.39 3.125 1.83 4.22 1.77 4.314c-.06.094-1.996 2.378.188 5.688 2.184 3.31 1.94 4.596 1.988 4.693.048.096.906 2.923 3.596 2.923 2.69 0 2.827-1.52 4.966-1.52 2.138 0 2.27 1.52 4.96 1.52 2.69 0 3.56-2.828 3.608-2.924z"/>
                    </svg>
                  )}
                  {app.platform}
                </span>
              </div>

              <div className="app-card-score-row">
                <div className={`app-card-score-circle ${scoreClass}`}>
                  {app.qualityScore}%
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Release Readiness</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
                    {app.qualityScore >= 90 && app.metrics.security.high === 0 ? 'RELEASE READY' : (app.metrics.security.high > 2 || app.qualityScore < 75 ? 'NEEDS REFACTORING' : 'READY FOR TESTING')}
                  </div>
                </div>
              </div>

              <div className="app-card-metrics">
                <div className="app-card-metric-col">
                  <span className="app-card-metric-lbl">UI</span>
                  <span className="app-card-metric-val">{app.metrics.ui.passed}/{app.metrics.ui.total}</span>
                </div>
                <div className="app-card-metric-col">
                  <span className="app-card-metric-lbl">Perf</span>
                  <span className="app-card-metric-val">{app.metrics.performance.meanResTime}ms</span>
                </div>
                <div className="app-card-metric-col">
                  <span className="app-card-metric-lbl">Sec</span>
                  <span className="app-card-metric-val">{app.metrics.security.high} High</span>
                </div>
              </div>

              <div className="app-card-footer">
                <button 
                  className="btn-primary app-btn-select" 
                  disabled={app.active}
                  onClick={(e) => { e.stopPropagation(); onSelect(app.id); }}
                >
                  {app.active ? 'Active Project' : 'Select Project'}
                </button>
                <button 
                  className="app-btn-delete" 
                  onClick={(e) => handleDelete(app.id, e)} 
                  title="Delete application"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Create App Trigger Card */}
        <div className="app-card create-app-card" onClick={() => setShowModal(true)}>
          <div className="create-app-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Create New Project</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Add another mobile application</div>
        </div>
      </div>

      {/* Modal dialog */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Mobile App Registry</div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label htmlFor="new-app-name">Application Name</label>
                  <input 
                    type="text" 
                    id="new-app-name" 
                    className="form-control" 
                    placeholder="e.g. SwiftPay App" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-app-platform">Operating Platform</label>
                  <select 
                    id="new-app-platform" 
                    className="form-control" 
                    style={{ cursor: 'pointer' }}
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                  </select>
                </div>
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', boxShadow: 'none', marginRight: '0.5rem' }} 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
