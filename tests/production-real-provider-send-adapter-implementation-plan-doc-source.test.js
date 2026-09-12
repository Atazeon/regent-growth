const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_REAL_PROVIDER_SEND_ADAPTER_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["send adapter plan doc title exists", doc.includes("# Real-Provider Send Adapter Implementation Plan")],
  ["send adapter plan doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/real-provider/send-adapter-implementation-plan")],
  ["send adapter plan doc names schema", doc.includes("regent-growth.real-provider-send-adapter-implementation-plan.v1")],
  ["send adapter plan doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["send adapter plan doc blocks canSend", doc.includes("canSend: false")],
  ["send adapter plan doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["send adapter plan doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["send adapter plan doc links readiness review", doc.includes("/real-provider/production-readiness-review")],
  ["send adapter plan doc links gap list", doc.includes("/real-provider/rollout-gap-list")],
  ["send adapter plan doc links gmail export", doc.includes("/gmail/implementation-review/export")],
  ["send adapter plan doc links outlook export", doc.includes("/outlook/implementation-review/export")],
  ["send adapter plan doc names oauth", doc.includes("OAuth token loading")],
  ["send adapter plan doc names suppression", doc.includes("suppression checks")],
  ["send adapter plan doc names unsubscribe", doc.includes("unsubscribe language enforcement")],
  ["send adapter plan doc names response mapping", doc.includes("provider response mapping")],
  ["send adapter plan doc names retry", doc.includes("bounded retry behavior")],
  ["send adapter plan doc names tests", doc.includes("Required Tests")],
  ["send adapter plan doc blocks send approval", doc.includes("not send approval")],
  ["project plan next implementation docs exists", projectPlan.includes("- First real-provider send adapter implementation plan docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider send adapter implementation plan doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider send adapter implementation plan doc test passed.");
