const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["preflight doc title exists", doc.includes("# Production Provider Preflight")],
  ["preflight doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/provider-preflight")],
  ["preflight doc names schema", doc.includes("regent-growth.real-provider-preflight.v1")],
  ["preflight doc keeps real sends blocked", doc.includes("approvedForRealSend: false")],
  ["preflight doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["preflight doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["preflight doc includes checklist evidence", doc.includes("provider-adapter-checklist")],
  ["preflight doc includes readiness evidence", doc.includes("adapter-readiness-export")],
  ["preflight doc includes status evidence", doc.includes("test-mailbox-status")],
  ["preflight doc includes run packet evidence", doc.includes("test-mailbox-run-packet")],
  ["preflight doc includes accepted capture evidence", doc.includes("test-mailbox-accepted-capture")],
  ["preflight doc includes rejected capture evidence", doc.includes("test-mailbox-rejected-capture")],
  ["preflight doc includes body storage evidence", doc.includes("body-content-not-stored")],
  ["preflight doc blocks real email", doc.includes("not permission to send real email")],
  ["project plan next preflight docs exists", projectPlan.includes("- First real provider adapter preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real provider preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real provider preflight doc test passed.");
