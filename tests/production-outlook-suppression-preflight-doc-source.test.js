const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_SUPPRESSION_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook suppression doc title exists", doc.includes("# Production Outlook Suppression Preflight")],
  ["outlook suppression doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/suppression-preflight")],
  ["outlook suppression doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook suppression doc names schema", doc.includes("regent-growth.outlook-suppression-preflight.v1")],
  ["outlook suppression doc blocks canSend", doc.includes("canSend: false")],
  ["outlook suppression doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook suppression doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook suppression doc names shared env", doc.includes("REGENT_SUPPRESSION_EMAILS")],
  ["outlook suppression doc names outlook env", doc.includes("REGENT_OUTLOOK_SUPPRESSION_EMAILS")],
  ["outlook suppression doc explains normalization", doc.includes("lowercased and trimmed")],
  ["outlook suppression doc names recipient field", doc.includes("recipientEmail")],
  ["outlook suppression doc names configured field", doc.includes("suppressionListConfigured")],
  ["outlook suppression doc names suppressed field", doc.includes("suppressed")],
  ["outlook suppression doc names count field", doc.includes("suppressedEmailCount")],
  ["outlook suppression doc blocks contact", doc.includes("must not be contacted")],
  ["outlook suppression doc blocks approval", doc.includes("not send approval")],
  ["project plan next outlook suppression docs exists", projectPlan.includes("- First Outlook suppression preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook suppression preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook suppression preflight doc test passed.");
