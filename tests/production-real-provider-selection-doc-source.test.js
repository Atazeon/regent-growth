const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_SELECTION.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["selection doc title exists", doc.includes("# Production Provider Selection")],
  ["selection doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/provider-selection-plan")],
  ["selection doc names schema", doc.includes("regent-growth.real-provider-selection-plan.v1")],
  ["selection doc names gmail", doc.includes("gmail")],
  ["selection doc names outlook", doc.includes("outlook")],
  ["selection doc names custom", doc.includes("custom")],
  ["selection doc blocks real sends", doc.includes("approvedForRealSend: false")],
  ["selection doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["selection doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["selection doc requires mailbox owner", doc.includes("Primary sending mailbox owner")],
  ["selection doc requires oauth path", doc.includes("OAuth or API key creation path")],
  ["selection doc requires suppression source", doc.includes("Suppression-list source")],
  ["selection doc requires unsubscribe text", doc.includes("Unsubscribe or opt-out text")],
  ["selection doc requires daily send limit", doc.includes("Daily send limit")],
  ["selection doc keeps canSend false", doc.includes("keep `canSend` false")],
  ["project plan next selection docs exists", projectPlan.includes("- First real provider adapter selection docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real provider selection doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real provider selection doc test passed.");
