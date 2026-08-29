const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_DECISION_RECORD.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["decision doc title exists", doc.includes("# Production Provider Decision Record")],
  ["decision doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/provider-decision-record?provider=gmail")],
  ["decision doc names supported gmail", doc.includes("gmail")],
  ["decision doc names supported outlook", doc.includes("outlook")],
  ["decision doc names supported custom", doc.includes("custom")],
  ["decision doc names env fallback", doc.includes("REGENT_SELECTED_EMAIL_PROVIDER")],
  ["decision doc names schema", doc.includes("regent-growth.real-provider-decision-record.v1")],
  ["decision doc records valid provider", doc.includes("validProvider")],
  ["decision doc links selection endpoint", doc.includes("selectionPlanEndpoint")],
  ["decision doc links preflight endpoint", doc.includes("preflightEndpoint")],
  ["decision doc keeps sends blocked", doc.includes("approvedForRealSend: false")],
  ["decision doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["decision doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["decision doc requires adapter", doc.includes("Provider-specific send adapter")],
  ["decision doc requires suppression", doc.includes("Suppression-list enforcement")],
  ["decision doc requires unsubscribe", doc.includes("Unsubscribe or opt-out enforcement")],
  ["decision doc requires audit logging", doc.includes("Provider audit logging")],
  ["decision doc documents invalid provider", doc.includes("validProvider: false")],
  ["project plan next decision docs exists", projectPlan.includes("- First real provider adapter decision docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real provider decision doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real provider decision doc test passed.");
