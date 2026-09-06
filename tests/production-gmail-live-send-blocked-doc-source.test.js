const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_BLOCKED_SEND.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail blocked send doc title exists", doc.includes("# Production Gmail Live-Send Blocked Endpoint")],
  ["gmail blocked send doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/send")],
  ["gmail blocked send doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail blocked send doc names 403", doc.includes("HTTP `403`")],
  ["gmail blocked send doc names schema", doc.includes("regent-growth.gmail-send-blocked.v1")],
  ["gmail blocked send doc blocks accepted", doc.includes("accepted: false")],
  ["gmail blocked send doc keeps sent false", doc.includes("sent: false")],
  ["gmail blocked send doc keeps booked false", doc.includes("booked: false")],
  ["gmail blocked send doc clears provider id", doc.includes('providerMessageId: ""')],
  ["gmail blocked send doc names review field", doc.includes("readyForImplementationReview")],
  ["gmail blocked send doc names summary field", doc.includes("readinessSummary")],
  ["gmail blocked send doc names missing checks", doc.includes("missingChecks")],
  ["gmail blocked send doc blocks send", doc.includes("must not send Gmail messages")],
  ["gmail blocked send doc requires oauth", doc.includes("OAuth sending")],
  ["gmail blocked send doc requires suppression", doc.includes("suppression enforcement")],
  ["gmail blocked send doc requires unsubscribe", doc.includes("unsubscribe enforcement")],
  ["project plan next gmail blocked send docs exists", projectPlan.includes("- First Gmail live-send blocked endpoint docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail live-send blocked doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail live-send blocked doc test passed.");
