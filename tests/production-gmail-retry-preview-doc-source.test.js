const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_RETRY_PREVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail retry preview doc title exists", doc.includes("# Production Gmail Retry Preview")],
  ["gmail retry preview doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/retry-preview")],
  ["gmail retry preview doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail retry preview doc names schema", doc.includes("regent-growth.gmail-retry-preview.v1")],
  ["gmail retry preview doc blocks retry", doc.includes("retryAllowed: false")],
  ["gmail retry preview doc blocks canSend", doc.includes("canSend: false")],
  ["gmail retry preview doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail retry preview doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail retry preview doc names packet validity", doc.includes("reviewedPacketValid")],
  ["gmail retry preview doc names env configured", doc.includes("envConfigured")],
  ["gmail retry preview doc names implementation ready", doc.includes("implementationReady")],
  ["gmail retry preview doc names suggested fixes", doc.includes("suggestedFixes")],
  ["gmail retry preview doc names next endpoints", doc.includes("nextEndpoints")],
  ["gmail retry preview doc links status", doc.includes("/gmail/status")],
  ["gmail retry preview doc links preflight", doc.includes("/gmail/preflight")],
  ["gmail retry preview doc links audit", doc.includes("/gmail/audit-preview")],
  ["gmail retry preview doc blocks real retry", doc.includes("does not retry a Gmail send")],
  ["project plan next gmail retry preview docs exists", projectPlan.includes("- First Gmail provider retry preview docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail retry preview doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail retry preview doc test passed.");
