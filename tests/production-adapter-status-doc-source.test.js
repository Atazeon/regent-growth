const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_ADAPTER_STATUS.md"), "utf8");
const planDoc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["adapter status title exists", doc.includes("# Production Adapter Status")],
  ["adapter status says none can send", doc.includes("None can send yet")],
  ["adapter status has stub", doc.includes("## Stub")],
  ["adapter status has gmail", doc.includes("## Gmail")],
  ["adapter status has outlook", doc.includes("## Outlook")],
  ["adapter status has custom", doc.includes("## Custom")],
  ["adapter status lists gmail env", doc.includes("REGENT_GMAIL_CLIENT_ID")],
  ["adapter status lists outlook env", doc.includes("REGENT_OUTLOOK_TENANT_ID")],
  ["adapter status lists custom env", doc.includes("REGENT_CUSTOM_SEND_URL")],
  ["adapter status documents status endpoint", doc.includes("http://127.0.0.1:5195/status")],
  ["adapter status keeps sent disabled", doc.includes("sentEnabled: false")],
  ["middleware plan links adapter status", planDoc.includes("docs/PRODUCTION_ADAPTER_STATUS.md")],
  ["project plan next adapter status docs exists", projectPlan.includes("- Production middleware adapter status docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production adapter status doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production adapter status doc test passed.");
