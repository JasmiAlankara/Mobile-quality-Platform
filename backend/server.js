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

// Sri Lankan Time (GMT+5:30) Formatters
function getSriLankanDateTime() {
  const d = new Date();
  const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }); // YYYY-MM-DD
  const timeStr = d.toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: '2-digit', minute: '2-digit' }); // HH:MM
  return `${dateStr} ${timeStr} (SLST)`;
}

function getSriLankanDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }); // YYYY-MM-DD
}

function getSriLankanTime() {
  return new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ==========================================================================
   USER AUTHENTICATION ACCOUNTS & ROLES DATABASE WITH ADMIN APPROVAL
   ========================================================================== */
function getRolePermissions(role) {
  switch (role) {
    case 'qa':
      return {
        roleLabel: "QA Engineer",
        permissions: {
          canUpload: true,
          canViewDashboard: true,
          canViewAnalytics: true,
          canViewHistory: true,
          canCreateApp: false,
          canDeleteApp: false,
          canResetDb: false,
          allowedTabs: ['dashboard', 'upload', 'applications', 'analytics', 'history']
        }
      };
    case 'dev':
      return {
        roleLabel: "Mobile Developer",
        permissions: {
          canUpload: true,
          canViewDashboard: true,
          canViewAnalytics: true,
          canViewHistory: true,
          canCreateApp: false,
          canDeleteApp: false,
          canResetDb: false,
          allowedTabs: ['dashboard', 'upload', 'applications', 'analytics', 'history']
        }
      };
    case 'pm':
      return {
        roleLabel: "Project Manager (Admin)",
        permissions: {
          canUpload: true,
          canViewDashboard: true,
          canViewAnalytics: true,
          canViewHistory: true,
          canCreateApp: true,
          canDeleteApp: true,
          canResetDb: true,
          allowedTabs: ['dashboard', 'upload', 'applications', 'analytics', 'history']
        }
      };
    case 'customer':
    default:
      return {
        roleLabel: "Customer / Client",
        permissions: {
          canUpload: false,
          canViewDashboard: true,
          canViewAnalytics: true,
          canViewHistory: false,
          canCreateApp: false,
          canDeleteApp: false,
          canResetDb: false,
          allowedTabs: ['dashboard', 'applications', 'analytics']
        }
      };
  }
}

const USER_ACCOUNTS = [
  {
    username: "qa_engineer",
    password: "qa123",
    name: "Sarah Jenkins",
    role: "qa",
    status: "approved",
    registeredAt: "2026-07-01 10:00",
    ...getRolePermissions('qa')
  },
  {
    username: "dev_lead",
    password: "dev123",
    name: "Alex Rivera",
    role: "dev",
    status: "approved",
    registeredAt: "2026-07-01 10:00",
    ...getRolePermissions('dev')
  },
  {
    username: "pm_admin",
    password: "pm123",
    name: "Marcus Vance",
    role: "pm",
    status: "approved",
    registeredAt: "2026-07-01 10:00",
    ...getRolePermissions('pm')
  },
  {
    username: "client_user",
    password: "client123",
    name: "Enterprise Client Stakeholder",
    role: "customer",
    status: "approved",
    registeredAt: "2026-07-01 10:00",
    ...getRolePermissions('customer')
  }
];

/* ==========================================================================
   REST API ROUTES
   ========================================================================== */

// 0a. User Login Endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }

    const user = USER_ACCOUNTS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password for selected profession." });
    }

    // Check if account status is pending PM Admin approval
    if (user.status === 'pending') {
      return res.status(403).json({ 
        error: "Access Pending: Your registration is awaiting approval by a Project Manager Admin (pm_admin). Please contact your administrator to grant access." 
      });
    }

    const { password: _, ...userProfile } = user;
    res.json({
      success: true,
      user: userProfile
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 0b. User Registration (Sign Up) Endpoint - Set to 'pending' by default
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password || !role) {
      return res.status(400).json({ error: "Please fill out all required registration fields." });
    }

    const existing = USER_ACCOUNTS.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Username is already taken. Please choose another username." });
    }

    const roleDetails = getRolePermissions(role);
    const timestamp = getSriLankanDateTime();

    const newUser = {
      username,
      password,
      name,
      role,
      status: "pending", // Pending PM Admin Approval
      registeredAt: timestamp,
      ...roleDetails
    };

    USER_ACCOUNTS.push(newUser);

    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: `Account registered successfully! Your requested role (${roleDetails.roleLabel}) is pending PM Admin approval before your first login.`
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 0c. GET Pending User Approvals (PM Admin Only)
app.get('/api/auth/pending-users', (req, res) => {
  try {
    const pendingUsers = USER_ACCOUNTS
      .filter(u => u.status === 'pending')
      .map(({ password: _, ...user }) => user);

    res.json(pendingUsers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 0d. Approve User Registration (PM Admin Action)
app.post('/api/auth/approve-user', (req, res) => {
  try {
    const { username } = req.body;
    const userIndex = USER_ACCOUNTS.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "User account not found." });
    }

    USER_ACCOUNTS[userIndex].status = "approved";

    res.json({
      success: true,
      message: `Account '${USER_ACCOUNTS[userIndex].username}' has been approved successfully.`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 0e. Reject User Registration (PM Admin Action)
app.post('/api/auth/reject-user', (req, res) => {
  try {
    const { username } = req.body;
    const userIndex = USER_ACCOUNTS.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "User account not found." });
    }

    const removed = USER_ACCOUNTS.splice(userIndex, 1);

    res.json({
      success: true,
      message: `Registration request for '${removed[0].username}' has been rejected and removed.`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

      const timestamp = getSriLankanDateTime();
      targetApp.uploadedFiles = targetApp.uploadedFiles || [];
      targetApp.uploadedFiles.unshift({
        name: file.originalname,
        type: resolvedType,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: timestamp,
        content: fileContent
      });

      results.push({ name: file.originalname, type: resolvedType });
    });

    const scores = recalculateQualityMetrics(targetApp);
    targetApp.qualityScore = scores.overallScore;

    let buildNum = 101;
    targetApp.history = targetApp.history || [];
    if (targetApp.history.length > 0) {
      const lastBuild = targetApp.history[0].build;
      const num = parseInt(lastBuild.replace("Build ", ""), 10);
      if (!isNaN(num)) buildNum = num + 1;
    }

    targetApp.history.unshift({
      build: `Build ${String(buildNum).padStart(3, '0')}`,
      date: getSriLankanDate(),
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

// 7. CI/CD Webhook Pipeline Ingest API Endpoint
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

      const timestamp = getSriLankanDateTime();
      targetApp.uploadedFiles = targetApp.uploadedFiles || [];
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
    targetApp.history = targetApp.history || [];
    targetApp.history.unshift({
      build: buildLabel,
      date: getSriLankanDate(),
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

    const timestamp = getSriLankanDateTime();
    const slTime = getSriLankanTime();
    targetApp.uploadedFiles = targetApp.uploadedFiles || [];
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

    targetApp.history = targetApp.history || [];
    const buildLabel = `Build ${100 + targetApp.history.length + 1}`;
    targetApp.history.unshift({
      build: buildLabel,
      date: getSriLankanDate(),
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
        `${slTime} [CI] Triggered by push event on branch 'main' (commit c9f1a23) [GMT+5:30]`,
        `${slTime} [CI] Running Appium UI Tests (120 cases)... Passed: 118, Failed: 2`,
        `${slTime} [CI] Running JMeter Load Test... Latency: 410ms, Throughput: 220 req/s, Error Rate: 0.8%`,
        `${slTime} [CI] Running MobSF Static Security Scan... High: 0, Medium: 3, Low: 1`,
        `${slTime} [CI] Pushing test reports to Unified Quality Platform API...`,
        `${slTime} [CI] Unified Quality Score updated: ${scores.overallScore}% (${scores.recommendation})`
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
