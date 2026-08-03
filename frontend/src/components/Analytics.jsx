import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function Analytics({ app }) {
  const scoreCanvasRef = useRef(null);
  const metricsCanvasRef = useRef(null);
  const scoreChartInstance = useRef(null);
  const metricsChartInstance = useRef(null);

  useEffect(() => {
    if (!app || !app.history || app.history.length === 0) return;

    // Destructure build histories in chronological order
    const history = [...app.history].reverse();
    const labels = history.map(h => h.build);
    const scores = history.map(h => h.score);
    const uiFailures = history.map(h => h.ui_fail);
    const perfErrors = history.map(h => h.perf_err);
    const secHighs = history.map(h => h.sec_high);

    // 1. Render Quality Score Trend Line
    if (scoreCanvasRef.current) {
      if (scoreChartInstance.current) {
        scoreChartInstance.current.destroy();
      }

      const ctx = scoreCanvasRef.current.getContext('2d');
      scoreChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Quality Score (%)',
            data: scores,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              min: 50,
              max: 100,
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Render Metrics Failures lines
    if (metricsCanvasRef.current) {
      if (metricsChartInstance.current) {
        metricsChartInstance.current.destroy();
      }

      const ctx = metricsCanvasRef.current.getContext('2d');
      metricsChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Appium Failed Tests',
              data: uiFailures,
              borderColor: '#ef4444',
              tension: 0.2,
              fill: false,
              borderWidth: 2,
              pointBackgroundColor: '#ef4444'
            },
            {
              label: 'MobSF High Risks',
              data: secHighs,
              borderColor: '#f59e0b',
              tension: 0.2,
              fill: false,
              borderWidth: 2,
              pointBackgroundColor: '#f59e0b'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#9ca3af' } }
          },
          scales: {
            y: {
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { display: false }
            }
          }
        }
      });
    }

    // Cleanup instances on unmount
    return () => {
      if (scoreChartInstance.current) scoreChartInstance.current.destroy();
      if (metricsChartInstance.current) metricsChartInstance.current.destroy();
    };

  }, [app]);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quality Analytics</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Analyze development and quality trends over consecutive build compile intervals.</p>
      
      {app.history && app.history.length > 0 ? (
        <div className="analytics-grid">
          <div className="chart-card">
            <div className="chart-title-section">
              <span className="chart-label">Unified Quality Score Trend</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Target Threshold: 90%</span>
            </div>
            <div className="chart-canvas-container">
              <canvas ref={scoreCanvasRef}></canvas>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title-section">
              <span className="chart-label">Metric Failures Over Builds</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lower is Better</span>
            </div>
            <div className="chart-canvas-container">
              <canvas ref={metricsCanvasRef}></canvas>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No historical data points yet.</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Please upload test reports in the Upload Center to populate analytics charts.</p>
        </div>
      )}
    </div>
  );
}
