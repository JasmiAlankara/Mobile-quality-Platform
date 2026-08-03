const SAMPLE_APPIUM = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Appium Mobile UI Tests" tests="120" failures="5" errors="0" time="452.8">
  <testcase name="testUserLoginSuccessful" classname="com.banking.tests.AuthTests" time="12.4"/>
  <testcase name="testUserLogout" classname="com.banking.tests.AuthTests" time="8.1"/>
  <testcase name="testCheckAccountBalance" classname="com.banking.tests.DashboardTests" time="15.3"/>
  <testcase name="testTransferBetweenAccounts" classname="com.banking.tests.TransactionTests" time="25.6">
    <failure message="Assertion failed: expected balance update after transaction. Timeout waiting for element id/balance_text.">
      at com.banking.tests.TransactionTests.testTransferBetweenAccounts(TransactionTests.java:78)
    </failure>
  </testcase>
  <testcase name="testQuickTransferShortcut" classname="com.banking.tests.TransactionTests" time="18.2"/>
  <testcase name="testBillPaymentElectric" classname="com.banking.tests.BillPayTests" time="30.5">
    <failure message="TimeoutException: Expected condition to be: visibility of element located by By.id: bill_pay_success_banner">
      at org.openqa.selenium.support.ui.WebDriverWait.timeoutException(WebDriverWait.java:95)
    </failure>
  </testcase>
  <testcase name="testAddNewPayee" classname="com.banking.tests.BillPayTests" time="22.1"/>
  <testcase name="testProfileSettingsUpdate" classname="com.banking.tests.SettingsTests" time="14.5"/>
  <testcase name="testBiometricAuthenticationSetup" classname="com.banking.tests.SettingsTests" time="10.8">
    <failure message="WebDriverException: An unknown server-side error occurred. Could not verify fingerprint enrollment sensor state.">
      at io.appium.java_client.AppiumDriver.execute(AppiumDriver.java:1)
    </failure>
  </testcase>
  <testcase name="testDarkModeToggle" classname="com.banking.tests.SettingsTests" time="9.4"/>
  <testcase name="testHelpCenterFAQSearch" classname="com.banking.tests.SupportTests" time="13.1"/>
  <testcase name="testContactSupportChat" classname="com.banking.tests.SupportTests" time="45.2">
    <failure message="AssertionError: Expected support agent status to be 'Online' or 'Away', but got 'Connection Terminated'.">
      at com.banking.tests.SupportTests.testContactSupportChat(SupportTests.java:142)
    </failure>
  </testcase>
  <testcase name="testATMBranchLocator" classname="com.banking.tests.SupportTests" time="19.7"/>
  <testcase name="testNotificationSettings" classname="com.banking.tests.SettingsTests" time="11.2"/>
  <testcase name="testCreditCardStatementDownload" classname="com.banking.tests.DashboardTests" time="28.9">
    <failure message="AssertionFailedError: PDF download was triggered but file size was 0 bytes.">
      at junit.framework.Assert.fail(Assert.java:57)
    </failure>
  </testcase>
</testsuite>`;

const SAMPLE_JMETER = `{
  "Total": {
    "transaction": "Total",
    "sampleCount": 2500,
    "errorCount": 50,
    "errorPct": 2.0,
    "meanResTime": 650.0,
    "minResTime": 105.0,
    "maxResTime": 3500.0,
    "pct1ResTime": 820.0,
    "pct2ResTime": 1250.0,
    "pct3ResTime": 2400.0,
    "throughput": 180.5,
    "receivedKBytesPerSec": 3240.8,
    "sentKBytesPerSec": 480.2
  },
  "Auth_Login": {
    "transaction": "Auth_Login",
    "sampleCount": 800,
    "errorCount": 8,
    "errorPct": 1.0,
    "meanResTime": 420.0,
    "minResTime": 105.0,
    "maxResTime": 1500.0,
    "pct1ResTime": 550.0,
    "pct2ResTime": 800.0,
    "pct3ResTime": 1200.0,
    "throughput": 65.2,
    "receivedKBytesPerSec": 820.5,
    "sentKBytesPerSec": 150.3
  },
  "Account_Details": {
    "transaction": "Account_Details",
    "sampleCount": 1200,
    "errorCount": 12,
    "errorPct": 1.0,
    "meanResTime": 280.0,
    "minResTime": 90.0,
    "maxResTime": 980.0,
    "pct1ResTime": 350.0,
    "pct2ResTime": 450.0,
    "pct3ResTime": 720.0,
    "throughput": 98.4,
    "receivedKBytesPerSec": 1950.2,
    "sentKBytesPerSec": 220.5
  },
  "Transfer_Funds_API": {
    "transaction": "Transfer_Funds_API",
    "sampleCount": 500,
    "errorCount": 30,
    "errorPct": 6.0,
    "meanResTime": 1250.0,
    "minResTime": 400.0,
    "maxResTime": 3500.0,
    "pct1ResTime": 1850.0,
    "pct2ResTime": 2400.0,
    "pct3ResTime": 3200.0,
    "throughput": 16.9,
    "receivedKBytesPerSec": 470.1,
    "sentKBytesPerSec": 109.4
  }
}`;

const SAMPLE_JMETER_CSV = `timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,Latency,IdleTime,Connect
1721300000000,420,Auth_Login,200,OK,Thread Group 1-1,text,true,,245,120,5,5,400,0,25
1721300001000,280,Account_Details,200,OK,Thread Group 1-2,text,true,,180,95,5,5,260,0,18
1721300002000,1250,Transfer_Funds_API,500,Internal Server Error,Thread Group 1-3,text,false,Connection Timeout,0,110,5,5,1200,0,35`;

const SAMPLE_MOBSF = `{
  "security_score": 72,
  "high_vulnerabilities": 5,
  "medium_vulnerabilities": 10,
  "low_vulnerabilities": 2,
  "vulnerability_details": [
    {
      "severity": "high",
      "title": "Cleartext HTTP Traffic Allowed",
      "section": "Android Manifest",
      "description": "The application allows cleartext HTTP traffic (android:usesCleartextTraffic=true) to all domains. This exposes network communication to sniffing and MitM tampering.",
      "remediation": "Disable cleartext traffic in the Android Manifest and enforce HTTPS by configuring a Network Security Config file."
    },
    {
      "severity": "high",
      "title": "Exported Content Providers",
      "section": "Android Components",
      "description": "One or more database Content Providers are marked exported without requiring any permissions.",
      "remediation": "Set android:exported=\\"false\\" in AndroidManifest.xml or require custom permissions for accessing the content provider."
    },
    {
      "severity": "high",
      "title": "Hardcoded Cryptographic Secret Key",
      "section": "Static Code Analysis",
      "description": "A hardcoded AES symmetric encryption key was discovered in class com.banking.security.CryptoManager.",
      "remediation": "Do not hardcode cryptographic keys in code. Use the Android Keystore system to securely generate and store cryptographic keys."
    },
    {
      "severity": "high",
      "title": "Biometric Bypass Vulnerability",
      "section": "Biometric Authentication",
      "description": "Biometric prompt validation is implemented using client-side callbacks without crypto object verification.",
      "remediation": "Pass a cryptographic key initialized with BiometricPrompt.CryptoObject to authenticate and decrypt data."
    },
    {
      "severity": "high",
      "title": "Insecure Clipboard Usage",
      "section": "Data Leakage",
      "description": "Sensitive credentials and session tokens are copied to the system clipboard without setting them as sensitive content.",
      "remediation": "Avoid copying sensitive data to the clipboard. If necessary, use ClipDescription.EXTRA_IS_SENSITIVE to hide clipboard content."
    },
    {
      "severity": "medium",
      "title": "Weak Hashing Function (SHA-1)",
      "section": "Cryptographic Errors",
      "description": "The app uses SHA-1 algorithm for verifying local database cache signatures. SHA-1 is vulnerable to collision attacks.",
      "remediation": "Upgrade SHA-1 usage to SHA-256 or SHA-3 for secure signing and integrity verification."
    },
    {
      "severity": "medium",
      "title": "Obfuscation Disabled",
      "section": "App Hardening",
      "description": "Proguard/R8 code shrinking and obfuscation is disabled.",
      "remediation": "Enable minifyEnabled true in build.gradle to obfuscate class and method names during release compilation."
    },
    {
      "severity": "medium",
      "title": "Writable SD Card Storage Used",
      "section": "Storage Security",
      "description": "The application writes transaction logs to external public directories. Any application with read permissions can access these logs.",
      "remediation": "Store application-specific transaction logs in internal private storage directories."
    },
    {
      "severity": "low",
      "title": "Debug Log Leakage",
      "section": "Logging Check",
      "description": "The application contains active Log.d/Log.i statements exposing SQL queries and user IDs to Android Logcat console logs.",
      "remediation": "Configure Proguard/R8 rules to automatically strip logging statements in release builds."
    }
  ]
}`;

export const SampleReports = {
  appium: SAMPLE_APPIUM,
  jmeterJson: SAMPLE_JMETER,
  jmeterCsv: SAMPLE_JMETER_CSV,
  mobsf: SAMPLE_MOBSF
};
