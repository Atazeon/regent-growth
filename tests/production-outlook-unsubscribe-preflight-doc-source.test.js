const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_UNSUBSCRIBE_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook unsubscribe doc title exists", doc.includes("# Production Outlook Unsubscribe Preflight")],
  ["outlook unsubscribe doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/unsubscribe-preflight")],
  ["outlook unsubscribe doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook unsubscribe doc names schema", doc.includes("regent-growth.outlook-unsubscribe-preflight.v1")],
  ["outlook unsubscribe doc blocks canSend", doc.includes("canSend: false")],
  ["outlook unsubscribe doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook unsubscribe doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook unsubscribe doc blocks body storage", doc.includes("bodyContentStored: false")],
  ["outlook unsubscribe doc requires unsubscribe", doc.includes("unsubscribe")],
  ["outlook unsubscribe doc requires opt out", doc.includes("opt out")],
  ["outlook unsubscribe doc explains case insensitive", doc.includes("case-insensitive")],
  ["outlook unsubscribe doc names language field", doc.includes("hasUnsubscribeLanguage")],
  ["outlook unsubscribe doc names required terms", doc.includes("requiredTerms")],
  ["outlook unsubscribe doc names issues", doc.includes("issues")],
  ["outlook unsubscribe doc blocks send approval", doc.includes("not Outlook send approval")],
  ["outlook unsubscribe doc requires draft fix", doc.includes("draft must be fixed")],
  ["project plan next outlook unsubscribe docs exists", projectPlan.includes("- First Outlook unsubscribe preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook unsubscribe preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook unsubscribe preflight doc test passed.");
