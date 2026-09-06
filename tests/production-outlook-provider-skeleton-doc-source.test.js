const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_PROVIDER_SKELETON.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook skeleton doc title exists", doc.includes("# Production Outlook Provider Skeleton")],
  ["outlook skeleton doc names factory", doc.includes('createProviderSendAdapter(getProviderAdapter("outlook"))')],
  ["outlook skeleton doc blocks accepted", doc.includes("accepted: false")],
  ["outlook skeleton doc keeps sent false", doc.includes("sent: false")],
  ["outlook skeleton doc keeps booked false", doc.includes("booked: false")],
  ["outlook skeleton doc names provider", doc.includes('provider: "outlook"')],
  ["outlook skeleton doc clears provider id", doc.includes('providerMessageId: ""')],
  ["outlook skeleton doc names guard schema", doc.includes("regent-growth.provider-implementation-guard.v1")],
  ["outlook skeleton doc lists send adapter control", doc.includes("send-adapter")],
  ["outlook skeleton doc lists suppression control", doc.includes("suppression-enforcement")],
  ["outlook skeleton doc lists unsubscribe control", doc.includes("unsubscribe-enforcement")],
  ["outlook skeleton doc lists audit control", doc.includes("audit-logging")],
  ["outlook skeleton doc lists retry control", doc.includes("retry-failure-handling")],
  ["outlook skeleton doc lists setup control", doc.includes("manual-setup-review")],
  ["outlook skeleton doc preserves compatibility issue", doc.includes("Provider adapter outlook is not send-capable yet.")],
  ["outlook skeleton doc blocks canSend", doc.includes("Do not set Outlook `canSend` to true")],
  ["project plan next outlook skeleton docs exists", projectPlan.includes("- First Outlook provider adapter skeleton docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook provider skeleton doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook provider skeleton doc test passed.");
