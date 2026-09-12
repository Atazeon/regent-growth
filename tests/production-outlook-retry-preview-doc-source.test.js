const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_RETRY_PREVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook retry preview doc title exists", doc.includes("# Production Outlook Retry Preview")],
  ["outlook retry preview doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/retry-preview")],
  ["outlook retry preview doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook retry preview doc names schema", doc.includes("regent-growth.outlook-retry-preview.v1")],
  ["outlook retry preview doc blocks retry", doc.includes("retryAllowed: false")],
  ["outlook retry preview doc blocks canSend", doc.includes("canSend: false")],
  ["outlook retry preview doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook retry preview doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook retry preview doc names packet validity", doc.includes("reviewedPacketValid")],
  ["outlook retry preview doc names env configured", doc.includes("envConfigured")],
  ["outlook retry preview doc names implementation ready", doc.includes("implementationReady")],
  ["outlook retry preview doc names suggested fixes", doc.includes("suggestedFixes")],
  ["outlook retry preview doc names next endpoints", doc.includes("nextEndpoints")],
  ["outlook retry preview doc links status", doc.includes("/outlook/status")],
  ["outlook retry preview doc links preflight", doc.includes("/outlook/preflight")],
  ["outlook retry preview doc links audit", doc.includes("/outlook/audit-preview")],
  ["outlook retry preview doc blocks real retry", doc.includes("does not retry an Outlook send")],
  ["project plan next outlook retry preview docs exists", projectPlan.includes("- First Outlook provider retry preview docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook retry preview doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook retry preview doc test passed.");
