const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const replayFixture = require("./fixtures/production-middleware-replay-request.json");
const {
  getMiddlewareReplayExport,
  getMiddlewareAuditTrail
} = require("../production-provider-middleware");

const beforeCount = getMiddlewareAuditTrail().length;
const replayExport = getMiddlewareReplayExport(replayFixture);
const afterCount = getMiddlewareAuditTrail().length;
const serializedExport = JSON.stringify(replayExport);

const checks = [
  ["middleware exports replay export", typeof getMiddlewareReplayExport === "function"],
  ["middleware has replay export route", source.includes('requestUrl.pathname === "/replay/export"')],
  ["replay export has schema", replayExport.schemaVersion === "regent-growth.middleware-replay.v1"],
  ["replay export has timestamp", typeof replayExport.generatedAt === "string" && replayExport.generatedAt.length > 0],
  ["replay export states body not stored", replayExport.bodyContentStored === false],
  ["replay export includes replay", replayExport.replay && replayExport.replay.replay === true],
  ["replay export keeps unsent state", replayExport.replay.sent === false && replayExport.replay.booked === false],
  ["replay export remains unrecorded", replayExport.replay.recorded === false],
  ["replay export includes result", replayExport.replay.result && replayExport.replay.result.skeleton === true],
  ["replay export includes audit preview", replayExport.replay.auditPreview && replayExport.replay.auditPreview.method === "REPLAY"],
  ["replay export omits body content", !serializedExport.includes(replayFixture.packet.message.body)],
  ["replay export does not mutate audit trail", afterCount === beforeCount],
  ["project plan next replay export exists", projectPlan.includes("- Production middleware replay export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware replay export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware replay export test passed.");
