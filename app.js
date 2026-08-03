/* ==========================================================================
   STATE MANAGEMENT & STORAGE (MOCK DATABASE)
   ========================================================================== */

// Default mock applications
const DEFAULT_APPLICATIONS = [
  {
    id: "apex-bank",
    name: "Apex Mobile Banking",
    platform: "Android",
    created: "2026-06-15",
    active: true,
    qualityScore: 88,
    metrics: {
      ui: { passed: 115, failed: 5, total: 120 },
      performance: { meanResTime: 650, throughput: 180, errorPct: 2.0 },
      security: { high: 5, medium: 10, low: 2 }
    },
    history: [
      { build: "Build 102", date: "2026-07-18", score: 88, ui_fail: 5, perf_err: 2.0, sec_high: 5 },
      { build: "Build 101", date: "2026-07-10", score: 85, ui_fail: 12, perf_err: 3.5, sec_high: 6 },
      { build: "Build 100", date: "2026-07-02", score: 91, ui_fail: 2, perf_err: 1.2, sec_high: 3 },
      { build: "Build 099", date: "2026-06-25", score: 79, ui_fail: 18, perf_err: 5.0, sec_high: 8 }
    ],
    mobsfDetails: [
      { severity: "high", title: "Cleartext HTTP Traffic Allowed", section: "Manifest", description: "Cleartext HTTP traffic is permitted (android:usesCleartextTraffic=true) to all endpoints.", remediation: "Configure a Network Security Config file and enforce HTTPS." },
      { severity: "high", title: "Hardcoded Cryptographic Secret Key", section: "Code Analysis", description: "Found a hardcoded 128-bit AES key in com.banking.security.CryptoManager.", remediation: "Migrate encryption key storage to the Android Keystore system." },
      { severity: "high", title: "Biometric Bypass Vulnerability", section: "Authentication", description: "Biometric validation is implemented without crypto object validation. Bypassable via Frida instrumentation.", remediation: "Implement biometric validation using a Keystore CryptoObject." },
      { severity: "high", title: "Exported Content Providers", section: "Components", description: "The content provider 'com.apex.db.DataProvider' is exported without restrictions.", remediation: "Set android:exported=\"false\" or require custom permissions." },
      { severity: "high", title: "Insecure Clipboard Copy", section: "Data Leakage", description: "Sensitive authorization tokens are copied to the clipboard where other apps can access them.", remediation: "Flag clips containing credentials as sensitive content." },
      { severity: "medium", title: "Weak Hash (SHA-1)", section: "Cryptographic Errors", description: "SHA-1 is used for integrity check signatures.", remediation: "Upgrade hashing functions to SHA-256." },
      { severity: "medium", title: "Obfuscation Disabled", section: "Manifest", description: "Release build lacks class and field obfuscation rules.", remediation: "Enable minifyEnabled true in build.gradle." }
    ],
    appiumDetails: [
      { name: "testTransferBetweenAccounts", class: "com.banking.tests.TransactionTests", error: "Assertion failed: expected balance update after transaction. Timeout waiting for element id/balance_text." },
      { name: "testBillPaymentElectric", class: "com.banking.tests.BillPayTests", error: "TimeoutException: Expected condition to be: visibility of element located by By.id: bill_pay_success_banner" },
      { name: "testBiometricAuthenticationSetup", class: "com.banking.tests.SettingsTests", error: "WebDriverException: An unknown server-side error occurred. Original error: Could not verify fingerprint enrollment state." },
      { name: "testContactSupportChat", class: "com.banking.tests.SupportTests", error: "AssertionError: Expected support agent status to be 'Online' or 'Away', but got 'Connection Terminated'." },
      { name: "testCreditCardStatementDownload", class: "com.banking.tests.DashboardTests", error: "AssertionFailedError: PDF download was triggered but file size was 0 bytes." }
    ],
    uploadedFiles: [
      { name: "appium-banking-run-102.xml", type: "appium", size: "4.2 KB", date: "2026-07-18 14:22" },
      { name: "jmeter-banking-load-102.json", type: "jmeter", size: "1.8 KB", date: "2026-07-18 14:24" },
      { name: "mobsf-banking-scan-102.json", type: "mobsf", size: "12.5 KB", date: "2026-07-18 14:25" }
    ]
  },
  {
    id: "swift-cart",
    name: "SwiftCart E-Commerce",
    platform: "iOS",
    created: "2026-07-01",
    active: false,
    qualityScore: 92,
    metrics: {
      ui: { passed: 98, failed: 2, total: 100 },
      performance: { meanResTime: 320, throughput: 250, errorPct: 0.5 },
      security: { high: 1, medium: 4, low: 8 }
    },
    history: [
      { build: "Build 45", date: "2026-07-17", score: 92, ui_fail: 2, perf_err: 0.5, sec_high: 1 },
      { build: "Build 44", date: "2026-07-08", score: 89, ui_fail: 5, perf_err: 1.0, sec_high: 2 }
    ],
    mobsfDetails: [
      { severity: "high", title: "App Transport Security Disabled", section: "iOS Security", description: "NSAllowsArbitraryLoads is set to true in Info.plist. Restricts secure network defaults.", remediation: "Remove NSAllowsArbitraryLoads or list explicit HTTPS domains." }
    ],
    appiumDetails: [
      { name: "testApplePayCheckout", class: "com.swiftcart.checkout", error: "AssertionError: Apple Pay sheet did not appear within 10 seconds." },
      { name: "testPromoCodeApply", class: "com.swiftcart.cart", error: "ElementClickInterceptedException: Promo text box was blocked by tutorial overlay." }
    ],
    uploadedFiles: [
      { name: "appium-ios-run-45.xml", type: "appium", size: "3.1 KB", date: "2026-07-17 11:00" },
      { name: "jmeter-ios-load-45.json", type: "jmeter", size: "1.2 KB", date: "2026-07-17 11:05" },
      { name: "mobsf-ios-scan-45.json", type: "mobsf", size: "8.4 KB", date: "2026-07-17 11:10" }
    ]
  }
];

// Initialize LocalStorage Data
function initDatabase() {
  if (!localStorage.getItem("mobile_quality_apps")) {
    localStorage.setItem("mobile_quality_apps", JSON.stringify(DEFAULT_APPLICATIONS));
  }
}

function getApplications() {
  return JSON.parse(localStorage.getItem("mobile_quality_apps"));
}

function saveApplications(apps) {
  localStorage.setItem("mobile_quality_apps", JSON.stringify(apps));
}

function getActiveApplication() {
  const apps = getApplications();
  let active = apps.find(app => app.active);
  if (!active && apps.length > 0) {
    apps[0].active = true;
    saveApplications(apps);
    active = apps[0];
  }
  return active;
}

function setActiveApplication(appId) {
  const apps = getApplications();
  apps.forEach(app => {
    app.active = app.id === appId;
  });
  saveApplications(apps);
}

function updateApplicationData(appId, data) {
  const apps = getApplications();
  const idx = apps.findIndex(app => app.id === appId);
  if (idx !== -1) {
    apps[idx] = { ...apps[idx], ...data };
    saveApplications(apps);
  }
}

// Clear Database Reset Option
function resetDatabase() {
  localStorage.setItem("mobile_quality_apps", JSON.stringify(DEFAULT_APPLICATIONS));
  window.location.reload();
}

/* ==========================================================================
   ALGORITHMS: METRIC CALCULATION
   ========================================================================== */

function calculateQualityMetrics(app) {
  const metrics = app.metrics;
  
  // 1. UI Quality Score (Appium)
  let uiScore = 100;
  if (metrics.ui.total > 0) {
    uiScore = (metrics.ui.passed / metrics.ui.total) * 100;
  }
  
  // 2. Performance Quality Score (JMeter)
  // Base 100. Subtract 2 points per 1% error rate.
  // Subtract 1 point per 40ms above 200ms latency.
  let errorPenalty = metrics.performance.errorPct * 2.0;
  let latencyPenalty = Math.max(0, (metrics.performance.meanResTime - 200) / 40);
  let perfScore = Math.max(0, 100 - (errorPenalty + latencyPenalty));
  
  // 3. Security Quality Score (MobSF)
  // Custom weights reflecting research standards
  let securityPenalty = (metrics.security.high * 2.0 + metrics.security.medium * 0.5 + metrics.security.low * 0.1) * 1.25;
  let securityScore = Math.max(0, 100 - securityPenalty);

  // 4. Overall Weighted Quality Score
  // UI: 30%, Performance: 35%, Security: 35%
  let overallScore = (uiScore * 0.30) + (perfScore * 0.35) + (securityScore * 0.35);
  
  // Rounded scores
  uiScore = Math.round(uiScore);
  perfScore = Math.round(perfScore);
  securityScore = Math.round(securityScore);
  overallScore = Math.round(overallScore);

  // Determine Recommendation
  let recommendation = "READY FOR TESTING";
  let recClass = "release-testing";
  let recDesc = "Requires secondary review and staging tests.";

  if (overallScore >= 90 && metrics.security.high === 0) {
    recommendation = "RELEASE READY";
    recClass = "release-ready";
    recDesc = "All quality parameters satisfied. Approved for production deploy.";
  } else if (metrics.security.high > 2 || overallScore < 75) {
    recommendation = "NEEDS REFACTORING";
    recClass = "release-danger";
    recDesc = "Critical failures detected. Block deployment and address security/UI bugs.";
  } else if (metrics.security.high > 0) {
    recommendation = "NEEDS SECURITY IMPROVEMENTS";
    recClass = "release-testing";
    recDesc = "Overall metrics passed, but high risk vulnerabilities must be patched.";
  }

  return {
    uiScore,
    perfScore,
    securityScore,
    overallScore,
    recommendation,
    recClass,
    recDesc
  };
}

/* ==========================================================================
   REPORT PARSER ENGINE
   ========================================================================== */

const ReportParser = {
  // Parses Appium JUnit XML String
  parseAppiumXml: function(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML formatting: " + parserError.textContent);
      }

      const testsuite = xmlDoc.querySelector("testsuite");
      if (!testsuite) {
        throw new Error("Missing <testsuite> root element.");
      }

      const total = parseInt(testsuite.getAttribute("tests") || 0, 10);
      const failuresCount = parseInt(testsuite.getAttribute("failures") || 0, 10);
      const errorsCount = parseInt(testsuite.getAttribute("errors") || 0, 10);
      const failed = failuresCount + errorsCount;
      const passed = Math.max(0, total - failed);

      // Parse individual failure details
      const appiumDetails = [];
      const testcases = xmlDoc.querySelectorAll("testcase");
      
      testcases.forEach(tc => {
        const failureNode = tc.querySelector("failure");
        const errorNode = tc.querySelector("error");
        const problemNode = failureNode || errorNode;
        
        if (problemNode) {
          appiumDetails.push({
            name: tc.getAttribute("name") || "unknownTest",
            class: tc.getAttribute("classname") || "com.testing.Unknown",
            error: problemNode.getAttribute("message") || problemNode.textContent.trim()
          });
        }
      });

      return {
        passed,
        failed,
        total,
        details: appiumDetails
      };
    } catch (e) {
      console.error(e);
      alert("Appium Parsing Error: " + e.message);
      return null;
    }
  },

  // Parses JMeter JSON Report (or CSV)
  parseJMeter: function(fileContent, filename) {
    try {
      // 1. JSON Format
      if (filename.endsWith(".json") || fileContent.trim().startsWith("{")) {
        const data = JSON.parse(fileContent);
        const total = data.Total || data.total;
        if (!total) {
          throw new Error("Missing 'Total' transaction object in JMeter JSON summary.");
        }
        return {
          meanResTime: Math.round(total.meanResTime || total.elapsed || 0),
          throughput: Math.round(total.throughput || 0),
          errorPct: parseFloat(total.errorPct || total.errorPercent || 0)
        };
      } 
      // 2. CSV Format (standard jtl/csv output)
      else {
        const lines = fileContent.split("\n").filter(l => l.trim() !== "");
        if (lines.length < 2) {
          throw new Error("CSV contains insufficient transaction logs.");
        }
        
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const elapsedIdx = headers.indexOf("elapsed");
        const successIdx = headers.indexOf("success");
        
        if (elapsedIdx === -1 || successIdx === -1) {
          throw new Error("Missing standard columns ('elapsed', 'success') in JMeter CSV.");
        }

        let totalTime = 0;
        let failCount = 0;
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (cols.length <= Math.max(elapsedIdx, successIdx)) continue;
          
          const elapsed = parseInt(cols[elapsedIdx], 10);
          const success = cols[successIdx].trim().toLowerCase();
          
          if (!isNaN(elapsed)) {
            totalTime += elapsed;
            if (success === "false" || success === "0") {
              failCount++;
            }
            count++;
          }
        }

        if (count === 0) throw new Error("No valid transactions found in CSV.");

        const meanResTime = Math.round(totalTime / count);
        const errorPct = parseFloat(((failCount / count) * 100).toFixed(2));
        // Mock throughput based on build timestamp differences or a standard rate
        const throughput = Math.round(count / 10) || 50; 

        return {
          meanResTime,
          throughput,
          errorPct
        };
      }
    } catch (e) {
      console.error(e);
      alert("JMeter Parsing Error: " + e.message);
      return null;
    }
  },

  // Parses MobSF JSON Scan Report
  parseMobSF: function(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      const high = parseInt(data.high_vulnerabilities || 0, 10);
      const medium = parseInt(data.medium_vulnerabilities || 0, 10);
      const low = parseInt(data.low_vulnerabilities || 0, 10);
      
      const vulnerabilityDetails = [];
      const findings = data.vulnerability_details || data.findings || [];
      
      findings.forEach(f => {
        vulnerabilityDetails.push({
          severity: f.severity || "medium",
          title: f.title || "Vulnerability Alert",
          section: f.section || f.category || "General",
          description: f.description || "No description provided.",
          remediation: f.remediation || "Check compliance regulations for patches."
        });
      });

      return {
        high,
        medium,
        low,
        details: vulnerabilityDetails
      };
    } catch (e) {
      console.error(e);
      alert("MobSF Parsing Error: " + e.message);
      return null;
    }
  }
};

/* ==========================================================================
   ROUTER & NAVIGATION
   ========================================================================== */

const Router = {
  routes: ["dashboard", "upload", "applications", "analytics", "history"],
  
  init: function() {
    window.addEventListener("hashchange", () => this.handleHashChange());
    // Initial Route
    if (!window.location.hash) {
      window.location.hash = "#dashboard";
    } else {
      this.handleHashChange();
    }
  },

  handleHashChange: function() {
    const hash = window.location.hash.substring(1) || "dashboard";
    this.navigate(hash);
  },

  navigate: function(viewId) {
    // Toggles screen panels
    document.querySelectorAll(".view-panel").forEach(p => {
      p.classList.remove("active");
    });
    const panel = document.getElementById(`view-${viewId}`);
    if (panel) {
      panel.classList.add("active");
    }

    // Toggle navigation buttons
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
      const link = item.querySelector("a");
      if (link && link.getAttribute("href") === `#${viewId}`) {
        item.classList.add("active");
      }
    });

    // Run views specific logic
    if (viewId === "dashboard") {
      renderDashboard();
    } else if (viewId === "history") {
      renderHistoryTable();
    } else if (viewId === "analytics") {
      renderAnalyticsCharts();
    } else if (viewId === "applications") {
      renderApplications();
    }
  }
};

/* ==========================================================================
   CHARTS & VISUALIZATIONS (CHART.JS)
   ========================================================================== */

let charts = {};

function destroyCharts() {
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
    }
  });
  charts = {};
}

// Doughnut Gauge Chart
function initOverallGauge(score, containerId) {
  const ctx = document.getElementById(containerId).getContext("2d");
  
  if (charts.overallGauge) {
    charts.overallGauge.destroy();
  }

  let color = "#10b981"; // Emerald
  if (score < 75) color = "#ef4444"; // Crimson
  else if (score < 90) color = "#f59e0b"; // Amber

  charts.overallGauge = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [color, "#1f2c47"],
        borderWidth: 0,
        borderRadius: [10, 0]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "85%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function initCategoryCharts(metrics) {
  // 1. Appium Passed vs Failed
  const uiCtx = document.getElementById("uiTestChart").getContext("2d");
  if (charts.uiChart) charts.uiChart.destroy();
  
  charts.uiChart = new Chart(uiCtx, {
    type: "doughnut",
    data: {
      labels: ["Passed", "Failed"],
      datasets: [{
        data: [metrics.ui.passed, metrics.ui.failed],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: "#121829",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: "#9ca3af" } }
      }
    }
  });

  // 2. Security Vulnerabilities counts
  const secCtx = document.getElementById("securityVulnChart").getContext("2d");
  if (charts.secChart) charts.secChart.destroy();

  charts.secChart = new Chart(secCtx, {
    type: "bar",
    data: {
      labels: ["High Risks", "Medium Risks", "Low Risks"],
      datasets: [{
        label: "Vulnerabilities",
        data: [metrics.security.high, metrics.security.medium, metrics.security.low],
        backgroundColor: ["#ef4444", "#f59e0b", "#06b6d4"],
        borderRadius: 4
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
          ticks: { color: "#9ca3af", stepSize: 1 },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#9ca3af" },
          grid: { display: false }
        }
      }
    }
  });
}

/* ==========================================================================
   VIEW RENDER FUNCTIONS
   ========================================================================== */

function renderDashboard() {
  const activeApp = getActiveApplication();
  if (!activeApp) return;

  // Header Title
  document.getElementById("active-app-name-display").textContent = activeApp.name;
  
  // Calculate Scores
  const evaluation = calculateQualityMetrics(activeApp);
  
  // Save overall score back
  if (activeApp.qualityScore !== evaluation.overallScore) {
    activeApp.qualityScore = evaluation.overallScore;
    updateApplicationData(activeApp.id, { qualityScore: evaluation.overallScore });
  }

  // Set Overall Score texts
  document.getElementById("overall-score-number").textContent = `${evaluation.overallScore}%`;
  
  // Set Recommendation Badge
  const recBadge = document.getElementById("recommendation-badge");
  recBadge.className = `release-badge ${evaluation.recClass}`;
  recBadge.innerHTML = `<span class="status-dot" style="background-color: currentColor"></span>${evaluation.recommendation}`;
  document.getElementById("recommendation-desc").textContent = evaluation.recDesc;

  // Render Gauge Chart
  initOverallGauge(evaluation.overallScore, "overallGaugeCanvas");

  // Render Section Scores & Metrics
  // UI
  document.getElementById("ui-score-display").textContent = `${evaluation.uiScore}%`;
  document.getElementById("ui-passed-display").textContent = activeApp.metrics.ui.passed;
  document.getElementById("ui-failed-display").textContent = activeApp.metrics.ui.failed;
  document.getElementById("ui-bar").style.width = `${evaluation.uiScore}%`;
  document.getElementById("ui-bar").style.backgroundColor = evaluation.uiScore >= 90 ? "var(--color-success)" : (evaluation.uiScore >= 75 ? "var(--color-warning)" : "var(--color-danger)");

  // Performance
  document.getElementById("perf-score-display").textContent = `${evaluation.perfScore}%`;
  document.getElementById("perf-latency-display").textContent = `${activeApp.metrics.performance.meanResTime} ms`;
  document.getElementById("perf-throughput-display").textContent = `${activeApp.metrics.performance.throughput} req/s`;
  document.getElementById("perf-error-display").textContent = `${activeApp.metrics.performance.errorPct}%`;
  document.getElementById("perf-bar").style.width = `${evaluation.perfScore}%`;
  document.getElementById("perf-bar").style.backgroundColor = evaluation.perfScore >= 90 ? "var(--color-success)" : (evaluation.perfScore >= 75 ? "var(--color-warning)" : "var(--color-danger)");

  // Security
  document.getElementById("sec-score-display").textContent = `${evaluation.securityScore}%`;
  document.getElementById("sec-high-display").textContent = activeApp.metrics.security.high;
  document.getElementById("sec-med-display").textContent = activeApp.metrics.security.medium;
  document.getElementById("sec-low-display").textContent = activeApp.metrics.security.low;
  document.getElementById("sec-bar").style.width = `${evaluation.securityScore}%`;
  document.getElementById("sec-bar").style.backgroundColor = evaluation.securityScore >= 90 ? "var(--color-success)" : (evaluation.securityScore >= 75 ? "var(--color-warning)" : "var(--color-danger)");

  // In-depth category charts
  initCategoryCharts(activeApp.metrics);

  // Render Failures List
  const failuresList = document.getElementById("dashboard-failures-list");
  failuresList.innerHTML = "";
  
  if (activeApp.appiumDetails && activeApp.appiumDetails.length > 0) {
    activeApp.appiumDetails.forEach(fail => {
      const item = document.createElement("div");
      item.className = "failure-item";
      item.innerHTML = `
        <div class="failure-item-header">
          <span class="failure-name">${fail.name}</span>
          <span class="failure-class">${fail.class.split(".").pop()}</span>
        </div>
        <div class="failure-msg">${fail.error}</div>
        <button class="failure-details-btn" onclick="openStacktraceModal('${fail.name}', \`${fail.error.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">View Full Stacktrace</button>
      `;
      failuresList.appendChild(item);
    });
  } else {
    failuresList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span class="empty-state-text">No functional failures detected! Appium UI assertions passed.</span>
      </div>
    `;
  }

  // Render Vulnerabilities List
  const vulnerabilityList = document.getElementById("dashboard-vulnerability-list");
  vulnerabilityList.innerHTML = "";

  if (activeApp.mobsfDetails && activeApp.mobsfDetails.length > 0) {
    activeApp.mobsfDetails.forEach(vuln => {
      const item = document.createElement("div");
      item.className = `sec-vulnerability-item ${vuln.severity}`;
      item.innerHTML = `
        <span class="vuln-badge ${vuln.severity}">${vuln.severity}</span>
        <div class="vuln-content">
          <div class="vuln-title">${vuln.title}</div>
          <div class="vuln-desc">${vuln.description}</div>
          <div class="vuln-remediation"><strong>Fix:</strong> ${vuln.remediation}</div>
        </div>
      `;
      vulnerabilityList.appendChild(item);
    });
  } else {
    vulnerabilityList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span class="empty-state-text">No security vulnerabilities found! MobSF checks clean.</span>
      </div>
    `;
  }
}

function renderHistoryTable() {
  const activeApp = getActiveApplication();
  if (!activeApp) return;

  const tbody = document.getElementById("history-table-body");
  tbody.innerHTML = "";

  if (activeApp.uploadedFiles && activeApp.uploadedFiles.length > 0) {
    activeApp.uploadedFiles.forEach(file => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${file.date}</td>
        <td><span class="tbl-badge ${file.type}">${file.type}</span></td>
        <td>${file.name}</td>
        <td>${file.size}</td>
        <td><span class="status-dot"></span> Parsed Successfully</td>
        <td>
          <button class="tbl-action-btn" onclick="openFilePreviewModal('${file.name}', '${file.type}')">View Source</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem;">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
            <span>No reports uploaded yet. Head to the Upload Center to add test reports.</span>
          </div>
        </td>
      </tr>
    `;
  }
}

function renderAnalyticsCharts() {
  const activeApp = getActiveApplication();
  if (!activeApp) return;

  // Destroy previous instances to avoid redraw gltiches
  if (charts.trendChart) charts.trendChart.destroy();
  if (charts.perfTrendChart) charts.perfTrendChart.destroy();

  const labels = activeApp.history.map(h => h.build).reverse();
  const scores = activeApp.history.map(h => h.score).reverse();
  const uiFailures = activeApp.history.map(h => h.ui_fail).reverse();
  const perfError = activeApp.history.map(h => h.perf_err).reverse();
  const secHigh = activeApp.history.map(h => h.sec_high).reverse();

  // 1. Overall Quality Score Trend
  const trendCtx = document.getElementById("historicalScoreTrendChart").getContext("2d");
  charts.trendChart = new Chart(trendCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Quality Score (%)",
        data: scores,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6"
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
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#9ca3af" },
          grid: { display: false }
        }
      }
    }
  });

  // 2. Multi-Metric Failures Trend (Appium UI Fails, Security High Risks)
  const perfTrendCtx = document.getElementById("historicalMetricsTrendChart").getContext("2d");
  charts.perfTrendChart = new Chart(perfTrendCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Appium Failed Tests",
          data: uiFailures,
          borderColor: "#ef4444",
          tension: 0.2,
          fill: false,
          borderWidth: 2,
          pointBackgroundColor: "#ef4444"
        },
        {
          label: "MobSF High Risks",
          data: secHigh,
          borderColor: "#f59e0b",
          tension: 0.2,
          fill: false,
          borderWidth: 2,
          pointBackgroundColor: "#f59e0b"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { color: "#9ca3af" } }
      },
      scales: {
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#9ca3af" },
          grid: { display: false }
        }
      }
    }
  });
}

function renderApplications() {
  const apps = getApplications();
  const grid = document.getElementById("applications-list-grid");
  grid.innerHTML = "";

  apps.forEach(app => {
    const evaluation = calculateQualityMetrics(app);
    let scoreClass = "good";
    if (evaluation.overallScore < 75) scoreClass = "poor";
    else if (evaluation.overallScore < 90) scoreClass = "warning";

    const card = document.createElement("div");
    card.className = `app-card ${app.active ? 'active-app' : ''}`;
    card.innerHTML = `
      <div class="app-card-header">
        <div class="app-card-title">${app.name}</div>
        <span class="app-card-platform">
          ${app.platform === 'Android' 
            ? '<svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M2.76 3.061a.5.5 0 0 1 .679.2l1.283 2.352A8.94 8.94 0 0 1 8 5c1.17 0 2.275.224 3.278.613l1.283-2.352a.5.5 0 1 1 .87.475l-1.252 2.296C13.75 7.378 14.7 9.07 14.94 11H1.06c.24-1.93 1.19-3.622 2.762-4.968l-1.252-2.296a.5.5 0 0 1 .19-.675zM1.5 12h13a.5.5 0 0 1 0 1H1.5a.5.5 0 0 1 0-1zM5 9.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0zm7 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/></svg>' 
            : '<svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422 2.112-2.188.58-4.494.52-4.588-.06-.094-1.85-1.048-3.682.358-1.577 1.208-1.636 1.208-2.396 1.208-.76 0-.82-.03-2.128-.975C3.39 3.125 1.83 4.22 1.77 4.314c-.06.094-1.996 2.378.188 5.688 2.184 3.31 1.94 4.596 1.988 4.693.048.096.906 2.923 3.596 2.923 2.69 0 2.827-1.52 4.966-1.52 2.138 0 2.27 1.52 4.96 1.52 2.69 0 3.56-2.828 3.608-2.924z"/></svg>'}
          ${app.platform}
        </span>
      </div>

      <div class="app-card-score-row">
        <div class="app-card-score-circle ${scoreClass}">
          ${evaluation.overallScore}%
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Release Quality</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: white;">${evaluation.recommendation}</div>
        </div>
      </div>

      <div class="app-card-metrics">
        <div class="app-card-metric-col">
          <span class="app-card-metric-lbl">UI</span>
          <span class="app-card-metric-val">${app.metrics.ui.passed}/${app.metrics.ui.total}</span>
        </div>
        <div class="app-card-metric-col">
          <span class="app-card-metric-lbl">Perf</span>
          <span class="app-card-metric-val">${app.metrics.performance.meanResTime}ms</span>
        </div>
        <div class="app-card-metric-col">
          <span class="app-card-metric-lbl">Sec</span>
          <span class="app-card-metric-val">${app.metrics.security.high} High</span>
        </div>
      </div>

      <div class="app-card-footer">
        <button class="btn-primary app-btn-select" onclick="handleSelectApp('${app.id}')" ${app.active ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''}>
          ${app.active ? 'Active Workspace' : 'Select Project'}
        </button>
        <button class="app-btn-delete" onclick="handleDeleteApp('${app.id}')" title="Delete application">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Add the "Create App" card at the end
  const createCard = document.createElement("div");
  createCard.className = "app-card create-app-card";
  createCard.onclick = () => openModal("createAppModal");
  createCard.innerHTML = `
    <div class="create-app-icon">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </div>
    <div style="font-weight: 700; font-size: 1rem; color: white;">Create New Project</div>
    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Add another mobile application</div>
  `;
  grid.appendChild(createCard);
}

/* ==========================================================================
   APP EVENT HANDLERS
   ========================================================================== */

function handleSelectApp(appId) {
  setActiveApplication(appId);
  // Re-sync UI selector in sidebar
  const sidebarSelect = document.getElementById("sidebar-app-selector");
  if (sidebarSelect) sidebarSelect.value = appId;
  
  // Refresh views
  renderApplications();
  renderDashboard();
  
  // If active page is history or analytics, refresh them
  const hash = window.location.hash.substring(1) || "dashboard";
  if (hash === "history") renderHistoryTable();
  if (hash === "analytics") renderAnalyticsCharts();
}

function handleDeleteApp(appId) {
  const apps = getApplications();
  if (apps.length <= 1) {
    alert("You must keep at least one active application in the workspace.");
    return;
  }
  if (confirm("Are you sure you want to delete this application? All parsed history will be cleared.")) {
    const filtered = apps.filter(app => app.id !== appId);
    // If deleted app was active, make the first remaining one active
    const wasActive = apps.find(app => app.id === appId)?.active;
    if (wasActive) {
      filtered[0].active = true;
    }
    saveApplications(filtered);
    
    // Refresh sidebar list
    syncSidebarSelector();
    renderApplications();
    renderDashboard();
  }
}

function handleCreateApp(e) {
  e.preventDefault();
  const name = document.getElementById("new-app-name").value.trim();
  const platform = document.getElementById("new-app-platform").value;
  
  if (!name) return;

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const apps = getApplications();
  
  if (apps.find(app => app.id === id)) {
    alert("An application with that name or identifier already exists.");
    return;
  }

  // Create new app skeleton
  const newApp = {
    id: id,
    name: name,
    platform: platform,
    created: new Date().toISOString().split("T")[0],
    active: false,
    qualityScore: 100,
    metrics: {
      ui: { passed: 0, failed: 0, total: 0 },
      performance: { meanResTime: 0, throughput: 0, errorPct: 0.0 },
      security: { high: 0, medium: 0, low: 0 }
    },
    history: [],
    mobsfDetails: [],
    appiumDetails: [],
    uploadedFiles: []
  };

  apps.push(newApp);
  saveApplications(apps);
  closeModal("createAppModal");
  document.getElementById("create-app-form").reset();
  
  // Sync sidebar & UI
  syncSidebarSelector();
  handleSelectApp(id);
}

function syncSidebarSelector() {
  const select = document.getElementById("sidebar-app-selector");
  if (!select) return;

  select.innerHTML = "";
  const apps = getApplications();
  apps.forEach(app => {
    const opt = document.createElement("option");
    opt.value = app.id;
    opt.textContent = app.name;
    opt.selected = app.active;
    select.appendChild(opt);
  });
}

/* ==========================================================================
   Stakeholder Persona Switching
   ========================================================================== */

function setStakeholderPersona(persona) {
  // Update body classes
  document.body.className = `view-${persona}`;
  
  // Update Header Banner message dynamically
  const banner = document.getElementById("persona-alert-banner");
  const bannerTitle = document.getElementById("persona-banner-title");
  const bannerText = document.getElementById("persona-banner-text");

  // Toggle active tab classes
  document.querySelectorAll(".persona-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick").includes(persona)) {
      btn.classList.add("active");
    }
  });

  const app = getActiveApplication();
  const score = app ? app.qualityScore : 100;

  switch(persona) {
    case "qa":
      bannerTitle.textContent = "Quality Assurance Console";
      bannerText.textContent = "Detailed regression logs and manual file ingestion is unlocked. Total parsed builds: " + (app ? app.history.length : 0);
      break;
    case "dev":
      bannerTitle.textContent = "Developer Debug Console";
      bannerText.textContent = "Focusing on failed Appium UI element selectors, slow JMeter endpoints, and MobSF vulnerability patching rules.";
      break;
    case "pm":
      bannerTitle.textContent = "Project Manager Dashboard";
      bannerText.textContent = `High-level project score stands at ${score}%. Release Readiness recommendation is locked in based on testing benchmarks.`;
      break;
    case "customer":
      bannerTitle.textContent = "Stakeholder Release Summary";
      bannerText.textContent = "Simplified view showing overall testing percentages. Technical logs and stack traces are suppressed for clarity.";
      break;
  }
}

/* ==========================================================================
   FILE PREVIEW & STACKTRACE MODALS
   ========================================================================== */

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function openStacktraceModal(testName, errorLog) {
  document.getElementById("stacktrace-test-name").textContent = testName;
  document.getElementById("stacktrace-code-block").textContent = errorLog;
  openModal("stacktraceModal");
}

function openFilePreviewModal(filename, filetype) {
  document.getElementById("preview-filename").textContent = filename;
  
  let sourceCode = "";
  if (filetype === "appium") sourceCode = window.SampleReports.appium;
  else if (filetype === "jmeter") sourceCode = window.SampleReports.jmeterJson;
  else if (filetype === "mobsf") sourceCode = window.SampleReports.mobsf;

  document.getElementById("preview-code-block").textContent = sourceCode;
  openModal("filePreviewModal");
}

/* ==========================================================================
   DOWNLOAD SAMPLES CONTROLLER
   ========================================================================== */

function downloadSampleFile(reportType) {
  let content = "";
  let filename = "";
  
  if (reportType === "appium") {
    content = window.SampleReports.appium;
    filename = "appium_ui_report.xml";
  } else if (reportType === "jmeter-json") {
    content = window.SampleReports.jmeterJson;
    filename = "jmeter_perf_report.json";
  } else if (reportType === "jmeter-csv") {
    content = window.SampleReports.jmeterCsv;
    filename = "jmeter_perf_report.csv";
  } else if (reportType === "mobsf") {
    content = window.SampleReports.mobsf;
    filename = "mobsf_sec_report.json";
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   DRAG AND DROP FILE UPLOAD HANDLERS
   ========================================================================== */

let activeUploadType = "appium";

function setUploadType(type) {
  activeUploadType = type;
  document.querySelectorAll(".tool-badge-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.classList.contains(`${type}-btn`)) {
      btn.classList.add("active");
    }
  });

  const formatText = document.getElementById("upload-format-description");
  if (type === "appium") {
    formatText.textContent = "Supported formats: Appium JUnit XML (.xml)";
  } else if (type === "jmeter") {
    formatText.textContent = "Supported formats: JMeter JSON Summary (.json) or JTL Transaction Log (.csv)";
  } else if (type === "mobsf") {
    formatText.textContent = "Supported formats: MobSF Static Scanner JSON Export (.json)";
  }
}

function initDragAndDrop() {
  const dropzone = document.getElementById("report-dropzone");
  const fileInput = document.getElementById("report-file-input");

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
      fileInput.value = ""; // Reset
    }
  });
}

function processUploadedFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    const activeApp = getActiveApplication();
    if (!activeApp) return;

    let parsedData = null;

    if (activeUploadType === "appium") {
      parsedData = ReportParser.parseAppiumXml(content);
      if (parsedData) {
        activeApp.metrics.ui = {
          passed: parsedData.passed,
          failed: parsedData.failed,
          total: parsedData.total
        };
        activeApp.appiumDetails = parsedData.details;
      }
    } 
    else if (activeUploadType === "jmeter") {
      parsedData = ReportParser.parseJMeter(content, file.name);
      if (parsedData) {
        activeApp.metrics.performance = {
          meanResTime: parsedData.meanResTime,
          throughput: parsedData.throughput,
          errorPct: parsedData.errorPct
        };
      }
    } 
    else if (activeUploadType === "mobsf") {
      parsedData = ReportParser.parseMobSF(content);
      if (parsedData) {
        activeApp.metrics.security = {
          high: parsedData.high,
          medium: parsedData.medium,
          low: parsedData.low
        };
        activeApp.mobsfDetails = parsedData.details;
      }
    }

    if (parsedData) {
      // Add record to history list
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      activeApp.uploadedFiles.unshift({
        name: file.name,
        type: activeUploadType,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: timestamp
      });

      // Update Overall metrics and trigger build trend push
      const evalMetrics = calculateQualityMetrics(activeApp);
      activeApp.qualityScore = evalMetrics.overallScore;

      // Check current build name to increment
      let buildNumber = 101;
      if (activeApp.history.length > 0) {
        const lastBuild = activeApp.history[0].build;
        const num = parseInt(lastBuild.replace("Build ", ""), 10);
        if (!isNaN(num)) buildNumber = num + 1;
      }

      // Add to analytics build history
      activeApp.history.unshift({
        build: `Build ${String(buildNumber).padStart(3, '0')}`,
        date: new Date().toISOString().split("T")[0],
        score: evalMetrics.overallScore,
        ui_fail: activeApp.metrics.ui.failed,
        perf_err: activeApp.metrics.performance.errorPct,
        sec_high: activeApp.metrics.security.high
      });

      // Save database
      updateApplicationData(activeApp.id, activeApp);

      // Trigger user success alert and navigate back to dashboard
      alert(`Successfully uploaded & aggregated "${file.name}"! Unified quality score is updated to ${evalMetrics.overallScore}%.`);
      
      window.location.hash = "#dashboard";
    }
  };

  reader.readAsText(file);
}

/* ==========================================================================
   APP BOOTSTRAP
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Database
  initDatabase();

  // Setup Sidebar Dropdown Select
  syncSidebarSelector();
  const select = document.getElementById("sidebar-app-selector");
  if (select) {
    select.addEventListener("change", (e) => {
      handleSelectApp(e.target.value);
    });
  }

  // Setup New App Submission
  const createAppForm = document.getElementById("create-app-form");
  if (createAppForm) {
    createAppForm.addEventListener("submit", handleCreateApp);
  }

  // Setup Router
  Router.init();

  // Setup Ingest File Drag and Drop
  initDragAndDrop();

  // Initialize Default Stakeholder view (QA)
  setStakeholderPersona("qa");
});
