const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_SUPPRESSION_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail suppression doc title exists", doc.includes("# Production Gmail Suppression Preflight")],
  ["gmail suppression doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/suppression-preflight")],
  ["gmail suppression doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail suppression doc names schema", doc.includes("regent-growth.gmail-suppression-preflight.v1")],
  ["gmail suppression doc blocks canSend", doc.includes("canSend: false")],
  ["gmail suppression doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail suppression doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail suppression doc names shared env", doc.includes("REGENT_SUPPRESSION_EMAILS")],
  ["gmail suppression doc names gmail env", doc.includes("REGENT_GMAIL_SUPPRESSION_EMAILS")],
  ["gmail suppression doc explains normalization", doc.includes("lowercased and trimmed")],
  ["gmail suppression doc names recipient field", doc.includes("recipientEmail")],
  ["gmail suppression doc names configured field", doc.includes("suppressionListConfigured")],
  ["gmail suppression doc names suppressed field", doc.includes("suppressed")],
  ["gmail suppression doc names count field", doc.includes("suppressedEmailCount")],
  ["gmail suppression doc blocks contact", doc.includes("must not be contacted")],
  ["gmail suppression doc blocks approval", doc.includes("not send approval")],
  ["project plan next gmail suppression docs exists", projectPlan.includes("- First Gmail suppression preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail suppression preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail suppression preflight doc test passed.");
