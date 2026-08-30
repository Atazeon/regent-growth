const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_PROVIDER_SKELETON.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail skeleton doc title exists", doc.includes("# Production Gmail Provider Skeleton")],
  ["gmail skeleton doc names factory", doc.includes('createProviderSendAdapter(getProviderAdapter("gmail"))')],
  ["gmail skeleton doc blocks accepted", doc.includes("accepted: false")],
  ["gmail skeleton doc keeps sent false", doc.includes("sent: false")],
  ["gmail skeleton doc keeps booked false", doc.includes("booked: false")],
  ["gmail skeleton doc names provider", doc.includes('provider: "gmail"')],
  ["gmail skeleton doc clears provider id", doc.includes('providerMessageId: ""')],
  ["gmail skeleton doc names guard schema", doc.includes("regent-growth.provider-implementation-guard.v1")],
  ["gmail skeleton doc lists send adapter control", doc.includes("send-adapter")],
  ["gmail skeleton doc lists suppression control", doc.includes("suppression-enforcement")],
  ["gmail skeleton doc lists unsubscribe control", doc.includes("unsubscribe-enforcement")],
  ["gmail skeleton doc lists audit control", doc.includes("audit-logging")],
  ["gmail skeleton doc lists retry control", doc.includes("retry-failure-handling")],
  ["gmail skeleton doc lists setup control", doc.includes("manual-setup-review")],
  ["gmail skeleton doc preserves compatibility issue", doc.includes("Provider adapter gmail is not send-capable yet.")],
  ["gmail skeleton doc blocks canSend", doc.includes("Do not set Gmail `canSend` to true")],
  ["project plan next gmail skeleton docs exists", projectPlan.includes("- First Gmail provider adapter skeleton docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail provider skeleton doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail provider skeleton doc test passed.");
