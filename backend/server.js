import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { 
  getApplications, 
  createApp, 
  deleteApp, 
  selectApp, 
  saveApplications,
  resetDatabase,
  recalculateQualityMetrics
} from './database.js';
import { 
  detectReportType,
  parseAppiumXml, 
  parseJMeter, 
  parseMobSF 
} from './parser.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Setup Multer memory storage for multi-file uploads parsing
const upload = multer({ storage: multer.memoryStorage() });

/* ==========================================================================
   REST API ROUTES
   ========================================================================== */

// 1. Get all applications
app.get('/api/applications', (req, res) => {
  try {
    const apps = getApplications();
    res.json(apps);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Register a new application
app.post('/api/applications', (req, res) => {
  try {
    const { name, platform } = req.body;
    if (!name || !platform) {
      return res.status(400).json({ error: "Missing name or platform parameter." });
    }
    const newApp = createApp(name, platform);
    res.status(201).json(newApp);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 3. Delete an application
app.delete('/api/applications/:id', (req, res) => {
  try {
    deleteApp(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 4. Select active application
app.post('/api/applications/:id/select', (req, res) => {
  try {
    selectApp(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 5. Reset database
app.post('/api/applications/reset', (req, res) => {
  try {
    const defaultData = resetDatabase();
    res.json(defaultData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6. Ingest single or batch files (Drag & Drop or Manual)
app.post('/api/applications/:id/upload', upload.array('files'), (req, res) => {
  try {
    const { id } = req.params;
    const specifiedType = req.body.type || 'auto';
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const apps = getApplications();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({ error: "Application not found." });
    }

    const targetApp = apps[appIndex];
    const results = [];

    files.forEach(file => {
      const fileContent = file.buffer.toString('utf8');
      const resolvedType = (specifiedType === 'auto' || !specifiedType) 
        ? detectReportType(fileContent, file.originalname)
        : specifiedType;

      let parsed = null;

      if (resolvedType === 'appium') {
        parsed = parseAppiumXml(fileContent);
        targetApp.metrics.ui = {
          passed: parsed.passed,
          failed: parsed.failed,
          total: parsed.total
        };
        targetApp.appiumDetails = parsed.details.map((detail, idx) => ({
          ...detail,
          commitHash: detail.commitHash || `d3b7f${String(idx + 1).padStart(2, '0')}`,
          branchName: detail.branchName || "main",
          author: detail.author || "QA Automated Agent"
        }));
      } 
      else if (resolvedType === 'jmeter') {
        parsed = parseJMeter(fileContent, file.originalname);
        targetApp.metrics.performance = {
          meanResTime: parsed.meanResTime,
          throughput: parsed.throughput,
          errorPct: parsed.errorPct
        };
      } 
      else if (resolvedType === 'mobsf') {
        parsed = parseMobSF(fileContent);
        targetApp.metrics.security = {
          high: parsed.high,
          medium: parsed.medium,
          low: parsed.low
        };
        targetApp.mobsfDetails = parsed.details;
      }

      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      targetApp.uploadedFiles.unshift({
        name: file.originalname,
        type: resolvedType,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: timestamp,
        content: fileContent
      });

      results.push({ name: file.originalname, type: resolvedType });
    });

    // Recompute scores
    const scores = recalculateQualityMetrics(targetApp);
    targetApp.qualityScore = scores.overallScore;

    // Increment build numbers
    let buildNum = 101;
    if (targetApp.history.length > 0) {
      const lastBuild = targetApp.history[0].build;
      const num = parseInt(lastBuild.replace("Build ", ""), 10);
      if (!isNaN(num)) buildNum = num + 1;
    }

    targetApp.history.unshift({
      build: `Build ${String(buildNum).padStart(3, '0')}`,
      date: new Date().toISOString().split("T")[0],
      score: scores.overallScore,
      ui_fail: targetApp.metrics.ui.failed,
      perf_err: targetApp.metrics.performance.errorPct,
      sec_high: targetApp.metrics.security.high
    });

    apps[appIndex] = targetApp;
    saveApplications(apps);

    res.json({
      success: true,
      results: results,
      message: `Successfully processed ${files.length} report file(s).`,
      qualityScore: targetApp.qualityScore
    });

  } catch (e) {
    console.error("Upload handler error:", e);
    res.status(400).json({ error: e.message });
  }
});

// 7. CI/CD Webhook Pipeline Ingest API Endpoint (GitHub Actions / Jenkins / GitLab CI)
app.post('/api/applications/:id/pipeline/ingest', upload.array('reports'), (req, res) => {
  try {
    const { id } = req.params;
    const { commitHash, branchName, author, buildNumber } = req.body;
    const files = req.files || [];

    const apps = getApplications();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({ error: "Application not found." });
    }

    const targetApp = apps[appIndex];
    let processedCount = 0;

    files.forEach(file => {
      const content = file.buffer.toString('utf8');
      const resolvedType = detectReportType(content, file.originalname);

      if (resolvedType === 'appium') {
        const parsed = parseAppiumXml(content);
        targetApp.metrics.ui = { passed: parsed.passed, failed: parsed.failed, total: parsed.total };
        targetApp.appiumDetails = parsed.details.map(d => ({
          ...d,
          commitHash: commitHash || "e8a91f2",
          branchName: branchName || "main",
          author: author || "GitHub Action Runner"
        }));
      } else if (resolvedType === 'jmeter') {
        const parsed = parseJMeter(content, file.originalname);
        targetApp.metrics.performance = { meanResTime: parsed.meanResTime, throughput: parsed.throughput, errorPct: parsed.errorPct };
      } else if (resolvedType === 'mobsf') {
        const parsed = parseMobSF(content);
        targetApp.metrics.security = { high: parsed.high, medium: parsed.medium, low: parsed.low };
        targetApp.mobsfDetails = parsed.details;
      }

      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      targetApp.uploadedFiles.unshift({
        name: `[CI/CD] ${file.originalname}`,
        type: resolvedType,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: timestamp,
        content: content
      });
      processedCount++;
    });

    const scores = recalculateQualityMetrics(targetApp);
    targetApp.qualityScore = scores.overallScore;

    let buildLabel = buildNumber ? `Build ${buildNumber}` : `CI Build #${targetApp.history.length + 100}`;
    targetApp.history.unshift({
      build: buildLabel,
      date: new Date().toISOString().split("T")[0],
      score: scores.overallScore,
      ui_fail: targetApp.metrics.ui.failed,
      perf_err: targetApp.metrics.performance.errorPct,
      sec_high: targetApp.metrics.security.high
    });

    apps[appIndex] = targetApp;
    saveApplications(apps);

    res.json({
      success: true,
      build: buildLabel,
      processedReports: processedCount,
      qualityScore: targetApp.qualityScore,
      recommendation: scores.recommendation
    });

  } catch (e) {
    console.error("Pipeline Ingest Error:", e);
    res.status(400).json({ error: e.message });
  }
});

// 8. Simulated GitHub Actions Pipeline Build Trigger
app.post('/api/applications/:id/pipeline/simulate', (req, res) => {
  try {
    const { id } = req.params;
    const apps = getApplications();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({ error: "Application not found." });
    }

    const targetApp = apps[appIndex];
    
    // Simulate improved pipeline build run
    targetApp.metrics = {
      ui: { passed: 118, failed: 2, total: 120 },
      performance: { meanResTime: 410, throughput: 220, errorPct: 0.8 },
      security: { high: 0, medium: 3, low: 1 }
    };

    targetApp.appiumDetails = [
      { name: "testBiometricAuthFallback", class: "com.banking.tests.SettingsTests", error: "Timeout waiting for sensor state dialog.", commitHash: "c9f1a23", branchName: "feature/ci-automation", author: "GitHub Actions Bot" },
      { name: "testPDFExportZeroByte", class: "com.banking.tests.DashboardTests", error: "AssertionFailedError: File size 0 bytes.", commitHash: "c9f1a23", branchName: "feature/ci-automation", author: "GitHub Actions Bot" }
    ];

    targetApp.mobsfDetails = [
      { severity: "medium", title: "Weak Hash Function (SHA-1)", section: "Crypto", description: "SHA-1 used for legacy signature validation.", remediation: "Upgrade to SHA-256." },
      { severity: "medium", title: "Obfuscation Rule Warning", section: "App Hardening", description: "Proguard rules partially incomplete.", remediation: "Review Proguard mapping file." }
    ];

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    targetApp.uploadedFiles.unshift({
      name: "[GitHub Action #104] appium_results.xml",
      type: "appium",
      size: "4.5 KB",
      date: timestamp
    }, {
      name: "[GitHub Action #104] mobsf_scan.json",
      type: "mobsf",
      size: "14.2 KB",
      date: timestamp
    });

    const scores = recalculateQualityMetrics(targetApp);
    targetApp.qualityScore = scores.overallScore;

    const buildLabel = `Build ${100 + targetApp.history.length + 1}`;
    targetApp.history.unshift({
      build: buildLabel,
      date: new Date().toISOString().split("T")[0],
      score: scores.overallScore,
      ui_fail: targetApp.metrics.ui.failed,
      perf_err: targetApp.metrics.performance.errorPct,
      sec_high: targetApp.metrics.security.high
    });

    apps[appIndex] = targetApp;
    saveApplications(apps);

    res.json({
      success: true,
      build: buildLabel,
      qualityScore: targetApp.qualityScore,
      recommendation: scores.recommendation,
      commitHash: "c9f1a23",
      branch: "main",
      pipelineLogs: [
        "14:09:41 [CI] Triggered by push event on branch 'main' (commit c9f1a23)",
        "14:09:42 [CI] Running Appium UI Tests (120 cases)... Passed: 118, Failed: 2",
        "14:09:43 [CI] Running JMeter Load Test... Latency: 410ms, Throughput: 220 req/s, Error Rate: 0.8%",
        "14:09:44 [CI] Running MobSF Static Security Scan... High: 0, Medium: 3, Low: 1",
        "14:09:45 [CI] Pushing test reports to Unified Quality Platform API...",
        "14:09:45 [CI] Unified Quality Score updated: " + scores.overallScore + "% (" + scores.recommendation + ")"
      ]
    });

  } catch (e) {
    console.error("Pipeline simulate error:", e);
    res.status(400).json({ error: e.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
