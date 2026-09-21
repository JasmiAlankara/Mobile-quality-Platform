import React, { useState, useEffect } from 'react';

export default function Dashboard({ app, currentUser, setStacktraceModal, onNavigateTab }) {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/auth/pending-users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPendingUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApproveUser = async (username) => {
    try {
      const res = await fetch('/api/auth/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || `User '${username}' approved! They can now log in.`);
        fetchPendingUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectUser = async (username) => {
    if (confirm(`Reject registration request for '${username}'?`)) {
      try {
        const res = await fetch('/api/auth/reject-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        if (res.ok) {
          fetchPendingUsers();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const metrics = app?.metrics || {
    ui: { passed: 0, failed: 0, total: 0 },
    performance: { meanResTime: 0, throughput: 0, errorPct: 0 },
    security: { high: 0, medium: 0, low: 0 }
  };
  
  // 1. UI Quality Score
  const uiTotal = metrics.ui?.total || 0;
  const uiPassed = metrics.ui?.passed || 0;
  const uiFailed = metrics.ui?.failed || 0;
  const uiScore = uiTotal > 0 ? Math.round((uiPassed / uiTotal) * 100) : 0;
  
  // 2. Performance Quality Score
  const meanResTime = metrics.performance?.meanResTime || 0;
  const throughput = metrics.performance?.throughput || 0;
  const errorPct = metrics.performance?.errorPct || 0;
  const errorPenalty = errorPct * 2.0;
  const latencyPenalty = Math.max(0, (meanResTime - 200) / 40);
  const perfScore = Math.max(0, Math.round(100 - (errorPenalty + latencyPenalty)));
  
  // 3. Security Quality Score
  const secHigh = metrics.security?.high || 0;
  const secMed = metrics.security?.medium || 0;
  const secLow = metrics.security?.low || 0;
  const totalSecVulns = secHigh + secMed + secLow;
  const securityPenalty = (secHigh * 2.0 + secMed * 0.5 + secLow * 0.1) * 1.25;
  const securityScore = Math.max(0, Math.round(100 - securityPenalty));

  // 4. Overall Weighted Quality Score
  const overallScore = Math.round((uiScore * 0.30) + (perfScore * 0.35) + (securityScore * 0.35));

  // Recommendation details
  let recommendation = "READY FOR TESTING";
  let recClass = "release-testing";
  let recDesc = "Requires secondary review and staging tests.";

  if (overallScore >= 90 && secHigh === 0) {
    recommendation = "RELEASE READY";
    recClass = "release-ready";
    recDesc = "All quality parameters satisfied. Approved for production deploy.";
  } else if (secHigh > 2 || overallScore < 75) {
    recommendation = "NEEDS REFACTORING";
    recClass = "release-danger";
    recDesc = "Critical failures detected. Block deployment and address security/UI bugs.";
  } else if (secHigh > 0) {
    recommendation = "NEEDS SECURITY IMPROVEMENTS";
    recClass = "release-testing";
    recDesc = "Overall metrics passed, but high risk vulnerabilities must be patched.";
  }

  // Gauge color
  let gaugeColor = "#10b981"; // Emerald
  if (overallScore < 75) gaugeColor = "#ef4444"; // Crimson
  else if (overallScore < 90) gaugeColor = "#f59e0b"; // Amber

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Appium UI Donut parameters
  const donutRadius = 36;
  const donutCirc = 2 * Math.PI * donutRadius;
  const passedPercentage = uiTotal > 0 ? (uiPassed / uiTotal) : 1;
  const donutPassedOffset = donutCirc - (passedPercentage * donutCirc);

  // Sparkline data points from app history (last 5 builds)
  const historyBuilds = app.history && app.history.length > 0 ? [...app.history].reverse().slice(-5) : [];
  const sparklineData = historyBuilds.length > 0 
    ? historyBuilds.map(h => Math.round(650 - (h.score * 4)))
    : [720, 680, 650, 620, meanResTime];
  
  const maxVal = Math.max(...sparklineData, 1000);
  const minVal = Math.min(...sparklineData, 200);
  const sparkPoints = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1 || 1)) * 120 + 5;
    const y = 35 - ((val - minVal) / (maxVal - minVal || 1)) * 25;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Project Manager Admin Quick Action Toolbar (PM Only) */}
      {currentUser?.role === 'pm' && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          padding: '1.25rem', 
          borderRadius: 'var(--border-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👑</span>
              <span>Project Manager Admin Control Console</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Full administrative privileges unlocked for <strong>{app.name}</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onNavigateTab && onNavigateTab('applications')}>
              + Create New Project
            </button>
            <button className="btn-primary" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={() => onNavigateTab && onNavigateTab('upload')}>
              📁 Ingest Reports
            </button>
            <button className="btn-primary" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={() => onNavigateTab && onNavigateTab('analytics')}>
              📊 View Analytics
            </button>
          </div>
        </div>
      )}

      {/* Pending Registration Requests Card for PM Admin */}
      {currentUser?.role === 'pm' && pendingUsers.length > 0 && (
        <div style={{ 
          marginTop: '0.5rem', 
          backgroundColor: 'rgba(245, 158, 11, 0.08)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '1.25rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⏳</span>
              <span>Pending Account Registration Requests ({pendingUsers.length})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action Required: Review and approve or reject user logins</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingUsers.map(user => (
              <div key={user.username} style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius-md)', 
                padding: '0.85rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{user.name}</span>
                    <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user.username}</code>
                    <span className={`role-pill ${user.role}`}>{user.roleLabel}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Requested: {user.registeredAt} — Awaiting first-time sign in authorization.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', backgroundColor: 'var(--color-success)', backgroundImage: 'none' }}
                    onClick={() => handleApproveUser(user.username)}
                  >
                    ✔ Approve Access
                  </button>
                  <button 
                    style={{ 
                      padding: '0.4rem 0.85rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: 'transparent', 
                      border: '1px solid var(--color-danger)', 
                      color: 'var(--color-danger)', 
                      borderRadius: 'var(--border-radius-sm)', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleRejectUser(user.username)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Main Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Overall Quality Score Gauge */}
        <div className="overview-metrics-card">
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Quality Score</div>
          
          <div className="quality-gauge-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r={radius} fill="transparent" stroke="#1f2c47" strokeWidth="12" />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={gaugeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="quality-gauge-value">
              <span className="gauge-num">{overallScore}%</span>
              <span className="gauge-lbl">Score</span>
            </div>
          </div>

          <div className={`release-badge ${recClass}`}>
            <span className="status-dot" style={{ backgroundColor: 'currentColor' }}></span>
            {recommendation}
          </div>
          <p className="release-desc">{recDesc}</p>
        </div>

        {/* 3 Domain Category Cards */}
        <div className="category-grid">
          
          {/* 1. Appium UI Testing Card */}
          <div className="category-card">
            <div className="card-header">
              <span className="card-title">UI Testing (Appium)</span>
              <div className="card-icon-container ui-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
                <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="42" cy="42" r={donutRadius} fill="transparent" stroke="#ef4444" strokeWidth="10" />
                  <circle
                    cx="42"
                    cy="42"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={donutCirc}
                    strokeDashoffset={donutPassedOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
                  {uiScore}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>UI Pass Rate</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{uiPassed} / {uiTotal}</div>
                <div style={{ fontSize: '0.75rem', color: uiFailed > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600, marginTop: '0.15rem' }}>
                  {uiFailed > 0 ? `🚨 ${uiFailed} Test Failures` : '✔ 100% UI Assertion Pass'}
                </div>
              </div>
            </div>

            <div className="card-metric-list">
              <div className="card-metric-row">
                <span className="card-metric-label">Total Cases</span>
                <span className="card-metric-val">{uiTotal}</span>
              </div>
              <div className="card-metric-row">
                <span className="card-metric-label">Passed / Failed</span>
                <span className="card-metric-val">{uiPassed} <span style={{ color: 'var(--text-muted)' }}>/</span> <span style={{ color: uiFailed > 0 ? 'var(--color-danger)' : 'white' }}>{uiFailed}</span></span>
              </div>
            </div>

            <button className="card-action-btn" onClick={() => onNavigateTab && onNavigateTab('history')}>
              Inspect UI Logs
            </button>
          </div>

          {/* 2. JMeter Performance Card */}
          <div className="category-card">
            <div className="card-header">
              <span className="card-title">Performance (JMeter)</span>
              <div className="card-icon-container perf-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div className="card-main-score" style={{ marginBottom: 0 }}>{perfScore}%</div>
                
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '12px',
                  backgroundColor: errorPct <= 2.0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: errorPct <= 2.0 ? 'var(--color-success)' : 'var(--color-danger)',
                  border: `1px solid ${errorPct <= 2.0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {errorPct <= 2.0 ? (
                    <>
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                      Safe Error (&le;2.0%)
                    </>
                  ) : (
                    <>🚨 Error &gt; 2.0%</>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.2)', padding: '0.4rem 0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Response Trend</span>
                <svg width="130" height="40" style={{ overflow: 'visible' }}>
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    points={sparkPoints}
                  />
                  {sparkPoints.split(' ').map((pt, i) => {
                    const [px, py] = pt.split(',');
                    return <circle key={i} cx={px} cy={py} r="3" fill="#06b6d4" />;
                  })}
                </svg>
              </div>
            </div>

            <div className="card-metric-list">
              <div className="card-metric-row">
                <span className="card-metric-label">Latency (Avg)</span>
                <span className="card-metric-val">{meanResTime} ms</span>
              </div>
              <div className="card-metric-row">
                <span className="card-metric-label">Throughput / Error</span>
                <span className="card-metric-val">{throughput} req/s <span style={{ color: 'var(--text-muted)' }}>|</span> {errorPct}%</span>
              </div>
            </div>

            <button className="card-action-btn" onClick={() => onNavigateTab && onNavigateTab('analytics')}>
              Analyze Latency
            </button>
          </div>

          {/* 3. MobSF Security Card */}
          <div className="category-card">
            <div className="card-header">
              <span className="card-title">Security (MobSF)</span>
              <div className="card-icon-container sec-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div className="card-main-score" style={{ marginBottom: 0 }}>{securityScore}%</div>
                
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '12px',
                  backgroundColor: secHigh > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: secHigh > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                  border: `1px solid ${secHigh > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {secHigh > 0 ? (
                    <>🚨 {secHigh} High Risks Alert</>
                  ) : (
                    <>✔ Zero High Risks</>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Severity Distribution</span>
                  <span>{totalSecVulns} Total</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  {secHigh > 0 && <div style={{ width: `${(secHigh / (totalSecVulns || 1)) * 100}%`, backgroundColor: '#ef4444' }} title={`High: ${secHigh}`}></div>}
                  {secMed > 0 && <div style={{ width: `${(secMed / (totalSecVulns || 1)) * 100}%`, backgroundColor: '#f59e0b' }} title={`Medium: ${secMed}`}></div>}
                  {secLow > 0 && <div style={{ width: `${(secLow / (totalSecVulns || 1)) * 100}%`, backgroundColor: '#06b6d4' }} title={`Low: ${secLow}`}></div>}
                </div>
              </div>
            </div>

            <div className="card-metric-list">
              <div className="card-metric-row">
                <span className="card-metric-label">High / Med / Low</span>
                <span className="card-metric-val">
                  <span style={{ color: secHigh > 0 ? 'var(--color-danger)' : 'white' }}>{secHigh}H</span> | <span style={{ color: secMed > 0 ? 'var(--color-warning)' : 'white' }}>{secMed}M</span> | <span style={{ color: 'var(--color-info)' }}>{secLow}L</span>
                </span>
              </div>
            </div>

            <button className="card-action-btn" onClick={() => onNavigateTab && onNavigateTab('dashboard')}>
              Audit Vulnerabilities
            </button>
          </div>

        </div>
      </div>

      {/* Secondary Grid: Failures List with Git Metadata & Security Remediation Alerts */}
      <div className="secondary-dashboard-grid dev-only qa-only pm-only">
        
        {/* UI Failures List + Git Traceability */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Failed UI Test Cases & Git Traceability (Appium)
            </span>
            <span className="qa-only" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QA & Dev Defect Mapping</span>
          </div>
          
          <div className="failure-list">
            {app.appiumDetails && app.appiumDetails.length > 0 ? (
              app.appiumDetails.map((fail, i) => (
                <div className="failure-item" key={i}>
                  <div className="failure-item-header">
                    <span className="failure-name">{fail.name}</span>
                    <span className="failure-class">{fail.class.split('.').pop()}</span>
                  </div>
                  <div className="failure-msg">{fail.error}</div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginTop: '0.4rem', 
                    paddingTop: '0.4rem', 
                    borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
                      Commit: <code style={{ color: 'white' }}>{fail.commitHash || '8f3d7a1'}</code>
                    </span>
                    <span>Branch: <strong style={{ color: 'white' }}>{fail.branchName || 'main'}</strong></span>
                    <span>Author: <strong style={{ color: 'white' }}>{fail.author || 'Jenkins Runner'}</strong></span>

                    <button 
                      className="failure-details-btn" 
                      style={{ marginLeft: 'auto' }}
                      onClick={() => setStacktraceModal({ open: true, name: fail.name, error: fail.error })}
                    >
                      View Stacktrace
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span className="empty-state-text">No functional failures detected! Appium UI assertions passed.</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Threats List + High Risk Warning Alert Badges */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              MobSF Security Findings
            </span>
            <span className="dev-only" style={{ fontSize: '0.75rem', color: 'var(--color-warning)' }}>Fix Guidelines Appended</span>
          </div>

          <div className="sec-vulnerability-list">
            {app.mobsfDetails && app.mobsfDetails.length > 0 ? (
              app.mobsfDetails.map((vuln, i) => (
                <div className={`sec-vulnerability-item ${vuln.severity}`} key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span className={`vuln-badge ${vuln.severity}`}>{vuln.severity}</span>
                    {vuln.severity === 'high' && (
                      <span title="Actionable High Risk Alert" style={{ fontSize: '1rem' }}>🚨</span>
                    )}
                  </div>

                  <div className="vuln-content">
                    <div className="vuln-title">{vuln.title}</div>
                    <div className="vuln-desc">{vuln.description}</div>
                    <div className="vuln-remediation"><strong>Patch Guideline:</strong> {vuln.remediation}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span className="empty-state-text">No security vulnerabilities found! MobSF checks clean.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Customer / Stakeholder Summary */}
      <div className="customer-only">
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">Simplified Summary for Client Review</span>
          </div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            All functional capabilities are verified using automated UI tests, showing <strong>{uiScore}% compliance</strong>. 
            Performance metrics show responsive transactions under load with an average server processing latency of <strong>{meanResTime} ms</strong>. 
            The project is recommended for <strong>{recommendation}</strong> while the team resolves outstanding security patches.
          </div>
        </div>
      </div>

    </div>
  );
}
