const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_UNSUBSCRIBE_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail unsubscribe doc title exists", doc.includes("# Production Gmail Unsubscribe Preflight")],
  ["gmail unsubscribe doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/unsubscribe-preflight")],
  ["gmail unsubscribe doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail unsubscribe doc names schema", doc.includes("regent-growth.gmail-unsubscribe-preflight.v1")],
  ["gmail unsubscribe doc blocks canSend", doc.includes("canSend: false")],
  ["gmail unsubscribe doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail unsubscribe doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail unsubscribe doc blocks body storage", doc.includes("bodyContentStored: false")],
  ["gmail unsubscribe doc requires unsubscribe", doc.includes("unsubscribe")],
  ["gmail unsubscribe doc requires opt out", doc.includes("opt out")],
  ["gmail unsubscribe doc explains case insensitive", doc.includes("case-insensitive")],
  ["gmail unsubscribe doc names language field", doc.includes("hasUnsubscribeLanguage")],
  ["gmail unsubscribe doc names required terms", doc.includes("requiredTerms")],
  ["gmail unsubscribe doc names issues", doc.includes("issues")],
  ["gmail unsubscribe doc blocks send approval", doc.includes("not Gmail send approval")],
  ["gmail unsubscribe doc requires draft fix", doc.includes("draft must be fixed")],
  ["project plan next gmail unsubscribe docs exists", projectPlan.includes("- First Gmail unsubscribe preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail unsubscribe preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail unsubscribe preflight doc test passed.");
