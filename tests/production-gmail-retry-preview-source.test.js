const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getGmailRetryPreview } = require("../production-provider-middleware");

const preview = getGmailRetryPreview(fixture);

const checks = [
  ["middleware exports gmail retry preview", typeof getGmailRetryPreview === "function"],
  ["middleware has gmail retry preview route", source.includes('requestUrl.pathname === "/gmail/retry-preview"')],
  ["retry preview schema exists", preview.schemaVersion === "regent-growth.gmail-retry-preview.v1"],
  ["retry preview has timestamp", typeof preview.generatedAt === "string" && preview.generatedAt.length > 0],
  ["retry preview names provider", preview.provider === "gmail"],
  ["retry preview blocks retry", preview.retryAllowed === false],
  ["retry preview blocks canSend", preview.canSend === false],
  ["retry preview keeps sent disabled", preview.sentEnabled === false],
  ["retry preview keeps booked disabled", preview.bookedEnabled === false],
  ["retry preview includes packet validity", typeof preview.reviewedPacketValid === "boolean"],
  ["retry preview includes env configured", typeof preview.envConfigured === "boolean"],
  ["retry preview includes implementation ready", typeof preview.implementationReady === "boolean"],
  ["retry preview includes suggested fixes", Array.isArray(preview.suggestedFixes) && preview.suggestedFixes.length > 0],
  ["retry preview points to status", preview.nextEndpoints.includes("/gmail/status")],
  ["retry preview points to preflight", preview.nextEndpoints.includes("/gmail/preflight")],
  ["retry preview points to audit preview", preview.nextEndpoints.includes("/gmail/audit-preview")],
  ["retry preview points to audit export", preview.nextEndpoints.includes("/gmail/audit-preview/export")],
  ["retry preview blocks send approval", preview.blockedReasons.includes("Gmail retry preview is not send approval.")],
  ["retry preview states not implemented", preview.blockedReasons.includes("Real Gmail retry behavior is not implemented.")],
  ["project plan next gmail retry preview exists", projectPlan.includes("- First Gmail provider retry preview")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail retry preview test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail retry preview test passed.");
