const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_AUDIT_PREVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook audit preview doc title exists", doc.includes("# Production Outlook Audit Preview")],
  ["outlook audit preview doc documents post endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/audit-preview")],
  ["outlook audit preview doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook audit preview doc names result schema", doc.includes("regent-growth.outlook-audit-preview-result.v1")],
  ["outlook audit preview doc keeps sent false", doc.includes("sent: false")],
  ["outlook audit preview doc keeps booked false", doc.includes("booked: false")],
  ["outlook audit preview doc documents export endpoint", doc.includes("GET http://127.0.0.1:5195/outlook/audit-preview/export")],
  ["outlook audit preview doc names export schema", doc.includes("regent-growth.outlook-audit-preview.v1")],
  ["outlook audit preview doc stores sender metadata", doc.includes("sender email")],
  ["outlook audit preview doc stores recipient metadata", doc.includes("recipient email")],
  ["outlook audit preview doc stores subject presence", doc.includes("subject presence")],
  ["outlook audit preview doc stores issue count", doc.includes("issue count")],
  ["outlook audit preview doc stores env status", doc.includes("environment configuration status")],
  ["outlook audit preview doc blocks body storage entry", doc.includes("bodyStored: false")],
  ["outlook audit preview doc blocks body storage export", doc.includes("bodyContentStored: false")],
  ["outlook audit preview doc blocks send approval", doc.includes("not Outlook send approval")],
  ["project plan next outlook audit preview docs exists", projectPlan.includes("- First Outlook provider audit preview docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook audit preview doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook audit preview doc test passed.");
