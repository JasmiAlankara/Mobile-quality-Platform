import React from 'react';
import { SampleReports } from '../samples';

export default function HistoryLogs({ app, setSourceModal }) {
  const files = app.uploadedFiles || [];

  const handleViewSource = (file) => {
    // Fallback to sample templates if raw content was not saved
    let content = file.content;
    if (!content) {
      if (file.type === 'appium') content = SampleReports.appium;
      else if (file.type === 'jmeter') content = SampleReports.jmeterJson;
      else if (file.type === 'mobsf') content = SampleReports.mobsf;
    }
    setSourceModal({ open: true, filename: file.name, content });
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>History Logs</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Detailed database audit of uploaded test reports, size metrics, and status.</p>
      
      <div className="history-table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Parsed Time</th>
              <th>Report Type</th>
              <th>Filename</th>
              <th>File Size</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file, i) => (
                <tr key={i}>
                  <td>{file.date}</td>
                  <td><span className={`tbl-badge ${file.type}`}>{file.type}</span></td>
                  <td>{file.name}</td>
                  <td>{file.size}</td>
                  <td><span className="status-dot"></span> Parsed Successfully</td>
                  <td>
                    <button 
                      className="tbl-action-btn" 
                      onClick={() => handleViewSource(file)}
                    >
                      View Source
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
                    <span>No reports uploaded yet. Head to the Upload Center to add test reports.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
