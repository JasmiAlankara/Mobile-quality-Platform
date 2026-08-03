import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const DEFAULT_DB = [
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
      { name: "testTransferBetweenAccounts", class: "com.banking.tests.TransactionTests", error: "Assertion failed: expected balance update after transaction. Timeout waiting for element id/balance_text.", commitHash: "8f3d7a1", branchName: "feature/auth-biometric", author: "Sarah Jenkins" },
      { name: "testBillPaymentElectric", class: "com.banking.tests.BillPayTests", error: "TimeoutException: Expected condition to be: visibility of element located by By.id: bill_pay_success_banner", commitHash: "4c9b2e5", branchName: "feature/billpay-v2", author: "Sarah Jenkins" },
      { name: "testBiometricAuthenticationSetup", class: "com.banking.tests.SettingsTests", error: "WebDriverException: An unknown server-side error occurred. Original error: Could not verify fingerprint enrollment state.", commitHash: "7d1a5f6", branchName: "main", author: "Alex Rivera" },
      { name: "testContactSupportChat", class: "com.banking.tests.SupportTests", error: "AssertionError: Expected support agent status to be 'Online' or 'Away', but got 'Connection Terminated'.", commitHash: "2e9a3b8", branchName: "hotfix/chat-disconnect", author: "Jane Doe" },
      { name: "testCreditCardStatementDownload", class: "com.banking.tests.DashboardTests", error: "AssertionFailedError: PDF download was triggered but file size was 0 bytes.", commitHash: "5f8c1d9", branchName: "main", author: "Alex Rivera" }
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
      { name: "testApplePayCheckout", class: "com.swiftcart.checkout", error: "AssertionError: Apple Pay sheet did not appear within 10 seconds.", commitHash: "3f8e2d4", branchName: "feature/apple-pay", author: "Jane Doe" },
      { name: "testPromoCodeApply", class: "com.swiftcart.cart", error: "ElementClickInterceptedException: Promo text box was blocked by tutorial overlay.", commitHash: "6c9d1a5", branchName: "main", author: "Sarah Jenkins" }
    ],
    uploadedFiles: [
      { name: "appium-ios-run-45.xml", type: "appium", size: "3.1 KB", date: "2026-07-17 11:00" },
      { name: "jmeter-ios-load-45.json", type: "jmeter", size: "1.2 KB", date: "2026-07-17 11:05" },
      { name: "mobsf-ios-scan-45.json", type: "mobsf", size: "8.4 KB", date: "2026-07-17 11:10" }
    ]
  }
];

export function initDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

export function resetDatabase() {
  fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  return DEFAULT_DB;
}

export function getApplications() {
  initDatabase();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function saveApplications(apps) {
  fs.writeFileSync(DB_PATH, JSON.stringify(apps, null, 2));
}

export function getApplicationById(id) {
  const apps = getApplications();
  return apps.find(app => app.id === id);
}

export function createApp(name, platform) {
  const apps = getApplications();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  if (apps.find(app => app.id === id)) {
    throw new Error("Application identifier already exists.");
  }

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
  return newApp;
}

export function deleteApp(id) {
  let apps = getApplications();
  if (apps.length <= 1) {
    throw new Error("Cannot delete the last remaining project.");
  }
  
  const wasActive = apps.find(app => app.id === id)?.active;
  apps = apps.filter(app => app.id !== id);
  
  if (wasActive && apps.length > 0) {
    apps[0].active = true;
  }
  
  saveApplications(apps);
}

export function selectApp(id) {
  const apps = getApplications();
  apps.forEach(app => {
    app.active = app.id === id;
  });
  saveApplications(apps);
}

// Recalculates unified scores based on raw metrics
export function recalculateQualityMetrics(app) {
  const metrics = app.metrics;
  
  let uiScore = 100;
  if (metrics.ui.total > 0) {
    uiScore = (metrics.ui.passed / metrics.ui.total) * 100;
  }
  
  let errorPenalty = metrics.performance.errorPct * 2.0;
  let latencyPenalty = Math.max(0, (metrics.performance.meanResTime - 200) / 40);
  let perfScore = Math.max(0, 100 - (errorPenalty + latencyPenalty));
  
  let securityPenalty = (metrics.security.high * 2.0 + metrics.security.medium * 0.5 + metrics.security.low * 0.1) * 1.25;
  let securityScore = Math.max(0, 100 - securityPenalty);

  let overallScore = (uiScore * 0.30) + (perfScore * 0.35) + (securityScore * 0.35);
  
  uiScore = Math.round(uiScore);
  perfScore = Math.round(perfScore);
  securityScore = Math.round(securityScore);
  overallScore = Math.round(overallScore);

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
