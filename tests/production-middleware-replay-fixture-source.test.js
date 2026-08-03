const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const replayFixturePath = path.join(root, "tests", "fixtures", "production-middleware-replay-request.json");
const replayFixture = require("./fixtures/production-middleware-replay-request.json");
const {
  replayMiddlewareFixture,
  getMiddlewareAuditTrail
} = require("../production-provider-middleware");

const beforeCount = getMiddlewareAuditTrail().length;
const replay = replayMiddlewareFixture(replayFixture);
const afterCount = getMiddlewareAuditTrail().length;
const serializedReplay = JSON.stringify(replay);

const checks = [
  ["replay fixture file exists", fs.existsSync(replayFixturePath)],
  ["middleware exports replay helper", typeof replayMiddlewareFixture === "function"],
  ["middleware has replay route", source.includes('requestUrl.pathname === "/replay"')],
  ["replay marks replay true", replay.replay === true],
  ["replay never sends", replay.sent === false],
  ["replay never books", replay.booked === false],
  ["replay is not recorded", replay.recorded === false],
  ["replay has skeleton result", replay.result && replay.result.skeleton === true],
  ["replay has audit preview", replay.auditPreview && replay.auditPreview.action === "reviewed-send"],
  ["replay audit uses replay method", replay.auditPreview.method === "REPLAY"],
  ["replay audit uses reviewed send path", replay.auditPreview.path === "/reviewed-send"],
  ["replay audit omits body content", !serializedReplay.includes(replayFixture.packet.message.body)],
  ["replay does not mutate audit trail", afterCount === beforeCount],
  ["project plan next replay fixture exists", projectPlan.includes("- Production middleware replay fixture")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware replay fixture test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware replay fixture test passed.");
