const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getOutlookProviderRunPacket } = require("../production-provider-middleware");

const packet = getOutlookProviderRunPacket();

const checks = [
  ["middleware exports outlook run packet", typeof getOutlookProviderRunPacket === "function"],
  ["middleware has outlook run packet route", source.includes('requestUrl.pathname === "/outlook/run-packet"')],
  ["outlook run packet schema exists", packet.schemaVersion === "regent-growth.outlook-provider-run-packet.v1"],
  ["outlook run packet has timestamp", typeof packet.generatedAt === "string" && packet.generatedAt.length > 0],
  ["outlook run packet names provider", packet.provider === "outlook"],
  ["outlook run packet names mode", packet.mode === "blocked-send-prep"],
  ["outlook run packet blocks approval", packet.approvedForRealSend === false],
  ["outlook run packet blocks canSend", packet.canSend === false],
  ["outlook run packet keeps sent disabled", packet.sentEnabled === false],
  ["outlook run packet keeps booked disabled", packet.bookedEnabled === false],
  ["outlook run packet points to fixture", packet.fixture === "tests/fixtures/production-reviewed-send-valid.json"],
  ["outlook run packet lists status endpoint", packet.endpoints.status === "/outlook/status"],
  ["outlook run packet lists preflight endpoint", packet.endpoints.preflight === "/outlook/preflight"],
  ["outlook run packet lists audit export endpoint", packet.endpoints.auditPreviewExport === "/outlook/audit-preview/export"],
  ["outlook run packet lists retry preview endpoint", packet.endpoints.retryPreview === "/outlook/retry-preview"],
  ["outlook run packet lists response mapping endpoint", packet.endpoints.responseMappingPreview === "/outlook/response-mapping-preview"],
  ["outlook run packet lists suppression endpoint", packet.endpoints.suppressionPreflight === "/outlook/suppression-preflight"],
  ["outlook run packet lists unsubscribe endpoint", packet.endpoints.unsubscribePreflight === "/outlook/unsubscribe-preflight"],
  ["outlook run packet lists readiness endpoint", packet.endpoints.sendReadiness === "/outlook/send-readiness"],
  ["outlook run packet lists blocked send endpoint", packet.endpoints.blockedSend === "/outlook/send"],
  ["outlook run packet includes required proof", packet.requiredProof.some((item) => item.includes("Blocked send endpoint returns 403"))],
  ["project plan next outlook run packet exists", projectPlan.includes("- First Outlook provider run packet")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook provider run packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook provider run packet test passed.");
