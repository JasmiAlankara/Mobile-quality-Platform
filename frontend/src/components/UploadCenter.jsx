import React, { useState, useRef } from 'react';
import { SampleReports } from '../samples';

export default function UploadCenter({ app, onUploadSuccess, onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('dragdrop'); // 'dragdrop' | 'pipeline'
  const [uploadType, setUploadType] = useState('auto'); // 'auto' | 'appium' | 'jmeter' | 'mobsf'
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  // Pipeline simulation state
  const [simulating, setSimulating] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState([]);

  const fileInputRef = useRef(null);

  const getFormatDescription = () => {
    if (uploadType === 'auto') return "Smart Auto-Detect: Drop Appium XML (.xml), JMeter CSV/JSON, or MobSF JSON (.json)";
    if (uploadType === 'appium') return "Supported format: Appium JUnit XML (.xml)";
    if (uploadType === 'jmeter') return "Supported format: JMeter JSON Summary (.json) or CSV Log (.csv)";
    if (uploadType === 'mobsf') return "Supported format: MobSF Static Scanner JSON Export (.json)";
    return "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      setUploadResults(null);
      
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('type', uploadType);

      const res = await fetch(`/api/applications/${app.id}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        setUploadResults({
          success: true,
          count: files.length,
          qualityScore: result.qualityScore,
          items: result.results || []
        });
        onUploadSuccess();
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (e) {
      console.error(e);
      alert(`Error connecting to Express backend: ${e.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSimulateGitHubPipeline = async () => {
    try {
      setSimulating(true);
      setPipelineLogs(["[CI] Connecting to GitHub Actions runner..."]);
      
      const res = await fetch(`/api/applications/${app.id}/pipeline/simulate`, {
        method: 'POST'
      });

      const data = await res.json();
      if (res.ok) {
        setPipelineLogs(data.pipelineLogs || []);
        onUploadSuccess();
      } else {
        alert(`Pipeline error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert(`Error triggering CI pipeline simulation: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const downloadTemplate = (type) => {
    let content = '';
    let filename = '';
    
    if (type === 'appium') {
      content = SampleReports.appium;
      filename = 'appium_ui_report.xml';
    } else if (type === 'jmeter-json') {
      content = SampleReports.jmeterJson;
      filename = 'jmeter_perf_report.json';
    } else if (type === 'jmeter-csv') {
      content = SampleReports.jmeterCsv;
      filename = 'jmeter_perf_report.csv';
    } else if (type === 'mobsf') {
      content = SampleReports.mobsf;
      filename = 'mobsf_sec_report.json';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sampleGitHubYaml = `name: Mobile Application Quality Gate

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  quality-eval:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Run Appium UI Tests
        run: |
          npm run test:appium -- --reporter mocha-junit-reporter --reporter-options mochaFile=./appium_results.xml

      - name: Run JMeter Performance Test
        run: |
          jmeter -n -t ./tests/load_test.jmx -l ./jmeter_results.csv -e -o ./dashboard

      - name: Run MobSF Static Security Scan
        run: |
          curl -F "file=@app-release.apk" http://mobsf-server:8000/api/v1/upload -H "Authorization:\${{ secrets.MOBSF_KEY }}" > mobsf_scan.json

      - name: Push Reports to Unified Quality Evaluation Platform
        run: |
          curl -X POST "http://localhost:8080/api/applications/${app.id}/pipeline/ingest" \\
            -H "Authorization: Bearer mqp_pat_${app.id}_8f3d927a" \\
            -F "reports=@appium_results.xml" \\
            -F "reports=@jmeter_results.csv" \\
            -F "reports=@mobsf_scan.json" \\
            -F "commitHash=\${{ github.sha }}" \\
            -F "branchName=\${{ github.ref_name }}" \\
            -F "author=\${{ github.actor }}"
`;

  const downloadGitHubYaml = () => {
    const blob = new Blob([sampleGitHubYaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mobile-quality-check.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Ingestion & Pipeline Hub</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Ingest mobile test outputs via Smart Drag & Drop file upload or trigger automated GitHub Actions / CI/CD pipeline webhooks.
      </p>

      {/* Primary Mode Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveSubTab('dragdrop')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'dragdrop' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeSubTab === 'dragdrop' ? 'white' : 'var(--text-muted)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📁 Drag & Drop Ingestion
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'pipeline' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeSubTab === 'pipeline' ? 'white' : 'var(--text-muted)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ⚡ CI/CD Pipeline & GitHub Integration
        </button>
      </div>

      {activeSubTab === 'dragdrop' && (
        <div className="upload-grid">
          
          <div className="dropzone-container">
            {/* Tool Selection */}
            <div className="uploader-tool-selector">
              <button 
                className={`tool-badge-btn ${uploadType === 'auto' ? 'active' : ''}`}
                onClick={() => setUploadType('auto')}
              >
                ✨ Smart Auto-Detect
              </button>
              <button 
                className={`tool-badge-btn ${uploadType === 'appium' ? 'active appium-btn' : ''}`}
                onClick={() => setUploadType('appium')}
              >
                Appium UI
              </button>
              <button 
                className={`tool-badge-btn ${uploadType === 'jmeter' ? 'active jmeter-btn' : ''}`}
                onClick={() => setUploadType('jmeter')}
              >
                JMeter Perf
              </button>
              <button 
                className={`tool-badge-btn ${uploadType === 'mobsf' ? 'active mobsf-btn' : ''}`}
                onClick={() => setUploadType('mobsf')}
              >
                MobSF Security
              </button>
            </div>

            {/* Smart Multi-File Dropzone */}
            <div 
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.7 : 1 }}
            >
              <div className="dropzone-icon">
                {uploading ? (
                  <svg width="28" height="28" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M25 5 A20 20 0 0 1 45 25" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                    </path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                )}
              </div>
              <div className="dropzone-title">{uploading ? 'Parsing test report outputs...' : 'Drag & Drop report file(s) here'}</div>
              <div className="dropzone-desc">{getFormatDescription()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Supports single or batch multi-file drop (.xml, .json, .csv)</div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="file-input"
                multiple
              />
            </div>

            {/* Batch Processing Output Notification */}
            {uploadResults && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                  ✔ Successfully Ingested {uploadResults.count} Report File(s)!
                </div>
                <div style={{ fontSize: '0.85rem', color: 'white' }}>
                  New Overall Quality Score: <strong>{uploadResults.qualityScore}%</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn-primary" onClick={onNavigate}>View Updated Dashboard</button>
                </div>
              </div>
            )}
          </div>

          {/* Download Templates */}
          <div className="samples-box">
            <h3>Download Test Templates</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>Use these pre-formatted sample outputs from mobile device runs to test platform integration and metrics translation.</p>
            
            <div className="sample-file-row">
              <div className="sample-file-info">
                <span className="sample-file-name">appium_results.xml</span>
                <span className="sample-file-meta">120 UI cases, 5 fails</span>
              </div>
              <button className="download-link-btn" onClick={() => downloadTemplate('appium')}>XML</button>
            </div>

            <div className="sample-file-row">
              <div className="sample-file-info">
                <span className="sample-file-name">jmeter_results.json</span>
                <span className="sample-file-meta">Load statistics, 2% error</span>
              </div>
              <button className="download-link-btn" onClick={() => downloadTemplate('jmeter-json')}>JSON</button>
            </div>

            <div className="sample-file-row">
              <div className="sample-file-info">
                <span className="sample-file-name">jmeter_results.csv</span>
                <span className="sample-file-meta">Row-by-row load log format</span>
              </div>
              <button className="download-link-btn" onClick={() => downloadTemplate('jmeter-csv')}>CSV</button>
            </div>

            <div className="sample-file-row">
              <div className="sample-file-info">
                <span className="sample-file-name">mobsf_scan.json</span>
                <span className="sample-file-meta">Vulnerabilities static scan report</span>
              </div>
              <button className="download-link-btn" onClick={() => downloadTemplate('mobsf')}>JSON</button>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            
            {/* Webhook & API Token Section */}
            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-title">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  Pipeline Webhook & API Key
                </span>
              </div>

              <div className="form-group">
                <label>Pipeline Ingestion Endpoint</label>
                <input 
                  type="text" 
                  className="form-control" 
                  readOnly 
                  value={`http://localhost:8080/api/applications/${app.id}/pipeline/ingest`} 
                />
              </div>

              <div className="form-group">
                <label>Project API Token (Bearer Secret)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    readOnly 
                    value={`mqp_pat_${app.id}_8f3d927a`} 
                  />
                  <button 
                    className="download-link-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(`mqp_pat_${app.id}_8f3d927a`);
                      alert("API Token copied to clipboard!");
                    }}
                  >
                    Copy Token
                  </button>
                </div>
              </div>

              {/* Simulation Trigger Box */}
              <div style={{ marginTop: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.25rem', borderRadius: 'var(--border-radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Live Pipeline Runner Test</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Simulate a live GitHub Actions CI workflow pushing fresh build results (#104) directly to the REST API.
                </p>

                <button 
                  className="btn-primary" 
                  onClick={handleSimulateGitHubPipeline}
                  disabled={simulating}
                >
                  {simulating ? '⏳ Executing GitHub Action...' : '▶ Run Simulated GitHub Pipeline'}
                </button>
              </div>
            </div>

            {/* Pipeline Live Output Log Window */}
            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-title">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                  Live CI Build Logs
                </span>
              </div>

              <div style={{ 
                background: '#070a13', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius-sm)', 
                padding: '1rem', 
                minHeight: '220px', 
                maxHeight: '300px', 
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#7ee787'
              }}>
                {pipelineLogs.length > 0 ? (
                  pipelineLogs.map((log, i) => <div key={i} style={{ marginBottom: '0.4rem' }}>{log}</div>)
                ) : (
                  <div style={{ color: 'var(--text-dark)', textAlign: 'center', paddingTop: '4rem' }}>
                    Click "Run Simulated GitHub Pipeline" to view real-time runner streams.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* GitHub Actions YAML Workflow Configuration */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                GitHub Actions Workflow Configuration (.github/workflows/mobile-quality-check.yml)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="download-link-btn" onClick={downloadGitHubYaml}>Download .yml</button>
                <button 
                  className="download-link-btn" 
                  onClick={() => {
                    navigator.clipboard.writeText(sampleGitHubYaml);
                    alert("GitHub Actions Workflow YAML copied!");
                  }}
                >
                  Copy YAML
                </button>
              </div>
            </div>

            <pre className="code-block" style={{ color: '#92d6ff', maxHeight: '350px', overflowY: 'auto' }}>
              {sampleGitHubYaml}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}
