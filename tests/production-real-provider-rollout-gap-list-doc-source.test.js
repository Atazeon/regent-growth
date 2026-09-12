const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_REAL_PROVIDER_ROLLOUT_GAPS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["rollout gap doc title exists", doc.includes("# Real-Provider Rollout Gap List")],
  ["rollout gap doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/real-provider/rollout-gap-list")],
  ["rollout gap doc names schema", doc.includes("regent-growth.real-provider-rollout-gap-list.v1")],
  ["rollout gap doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["rollout gap doc blocks canSend", doc.includes("canSend: false")],
  ["rollout gap doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["rollout gap doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["rollout gap doc names gmail", doc.includes("gmail")],
  ["rollout gap doc names outlook", doc.includes("outlook")],
  ["rollout gap doc links gmail export", doc.includes("/gmail/implementation-review/export")],
  ["rollout gap doc links outlook export", doc.includes("/outlook/implementation-review/export")],
  ["rollout gap doc links readiness review", doc.includes("/real-provider/production-readiness-review")],
  ["rollout gap doc names oauth", doc.includes("OAuth send adapter implementation")],
  ["rollout gap doc names suppression", doc.includes("suppression enforcement")],
  ["rollout gap doc names unsubscribe", doc.includes("unsubscribe enforcement")],
  ["rollout gap doc names response handling", doc.includes("provider response handling")],
  ["rollout gap doc names retry", doc.includes("bounded retry behavior")],
  ["rollout gap doc names audit", doc.includes("audit logging")],
  ["rollout gap doc blocks send approval", doc.includes("not send approval")],
  ["project plan next gap docs exists", projectPlan.includes("- First real-provider rollout gap list docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider rollout gap list doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider rollout gap list doc test passed.");
