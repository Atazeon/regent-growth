const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getGmailProviderRunPacket } = require("../production-provider-middleware");

const packet = getGmailProviderRunPacket();

const checks = [
  ["middleware exports gmail run packet", typeof getGmailProviderRunPacket === "function"],
  ["middleware has gmail run packet route", source.includes('requestUrl.pathname === "/gmail/run-packet"')],
  ["gmail run packet schema exists", packet.schemaVersion === "regent-growth.gmail-provider-run-packet.v1"],
  ["gmail run packet has timestamp", typeof packet.generatedAt === "string" && packet.generatedAt.length > 0],
  ["gmail run packet names provider", packet.provider === "gmail"],
  ["gmail run packet names mode", packet.mode === "blocked-send-prep"],
  ["gmail run packet blocks approval", packet.approvedForRealSend === false],
  ["gmail run packet blocks canSend", packet.canSend === false],
  ["gmail run packet keeps sent disabled", packet.sentEnabled === false],
  ["gmail run packet keeps booked disabled", packet.bookedEnabled === false],
  ["gmail run packet points to fixture", packet.fixture === "tests/fixtures/production-reviewed-send-valid.json"],
  ["gmail run packet lists status endpoint", packet.endpoints.status === "/gmail/status"],
  ["gmail run packet lists preflight endpoint", packet.endpoints.preflight === "/gmail/preflight"],
  ["gmail run packet lists audit export endpoint", packet.endpoints.auditPreviewExport === "/gmail/audit-preview/export"],
  ["gmail run packet lists retry preview endpoint", packet.endpoints.retryPreview === "/gmail/retry-preview"],
  ["gmail run packet lists response mapping endpoint", packet.endpoints.responseMappingPreview === "/gmail/response-mapping-preview"],
  ["gmail run packet lists suppression endpoint", packet.endpoints.suppressionPreflight === "/gmail/suppression-preflight"],
  ["gmail run packet lists unsubscribe endpoint", packet.endpoints.unsubscribePreflight === "/gmail/unsubscribe-preflight"],
  ["gmail run packet lists readiness endpoint", packet.endpoints.sendReadiness === "/gmail/send-readiness"],
  ["gmail run packet lists blocked send endpoint", packet.endpoints.blockedSend === "/gmail/send"],
  ["gmail run packet includes required proof", packet.requiredProof.some((item) => item.includes("Blocked send endpoint returns 403"))],
  ["project plan next gmail run packet exists", projectPlan.includes("- First Gmail provider run packet")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail provider run packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail provider run packet test passed.");
