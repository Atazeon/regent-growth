const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_AUDIT_PREVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail audit preview doc title exists", doc.includes("# Production Gmail Audit Preview")],
  ["gmail audit preview doc documents post endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/audit-preview")],
  ["gmail audit preview doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail audit preview doc names result schema", doc.includes("regent-growth.gmail-audit-preview-result.v1")],
  ["gmail audit preview doc keeps sent false", doc.includes("sent: false")],
  ["gmail audit preview doc keeps booked false", doc.includes("booked: false")],
  ["gmail audit preview doc documents export endpoint", doc.includes("GET http://127.0.0.1:5195/gmail/audit-preview/export")],
  ["gmail audit preview doc names export schema", doc.includes("regent-growth.gmail-audit-preview.v1")],
  ["gmail audit preview doc stores sender metadata", doc.includes("sender email")],
  ["gmail audit preview doc stores recipient metadata", doc.includes("recipient email")],
  ["gmail audit preview doc stores subject presence", doc.includes("subject presence")],
  ["gmail audit preview doc stores issue count", doc.includes("issue count")],
  ["gmail audit preview doc stores env status", doc.includes("environment configuration status")],
  ["gmail audit preview doc blocks body storage entry", doc.includes("bodyStored: false")],
  ["gmail audit preview doc blocks body storage export", doc.includes("bodyContentStored: false")],
  ["gmail audit preview doc blocks send approval", doc.includes("not Gmail send approval")],
  ["project plan next gmail audit preview docs exists", projectPlan.includes("- First Gmail provider audit preview docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail audit preview doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail audit preview doc test passed.");
