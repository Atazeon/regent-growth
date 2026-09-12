const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_BLOCKED_SEND.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook blocked send doc title exists", doc.includes("# Production Outlook Live-Send Blocked Endpoint")],
  ["outlook blocked send doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/send")],
  ["outlook blocked send doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook blocked send doc names 403", doc.includes("HTTP `403`")],
  ["outlook blocked send doc names schema", doc.includes("regent-growth.outlook-send-blocked.v1")],
  ["outlook blocked send doc blocks accepted", doc.includes("accepted: false")],
  ["outlook blocked send doc keeps sent false", doc.includes("sent: false")],
  ["outlook blocked send doc keeps booked false", doc.includes("booked: false")],
  ["outlook blocked send doc clears provider id", doc.includes('providerMessageId: ""')],
  ["outlook blocked send doc names review field", doc.includes("readyForImplementationReview")],
  ["outlook blocked send doc names summary field", doc.includes("readinessSummary")],
  ["outlook blocked send doc names missing checks", doc.includes("missingChecks")],
  ["outlook blocked send doc blocks send", doc.includes("must not send Outlook messages")],
  ["outlook blocked send doc requires oauth", doc.includes("Microsoft Graph OAuth sending")],
  ["outlook blocked send doc requires suppression", doc.includes("suppression enforcement")],
  ["outlook blocked send doc requires unsubscribe", doc.includes("unsubscribe enforcement")],
  ["project plan next outlook blocked send docs exists", projectPlan.includes("- First Outlook live-send blocked endpoint docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook live-send blocked doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook live-send blocked doc test passed.");
