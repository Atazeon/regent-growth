const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const valid = require("./fixtures/production-reviewed-send-valid.json");
const {
  createMiddlewareResponse,
  recordMiddlewareAuditEntry,
  getMiddlewareAuditSummary,
  getMiddlewareAuditExport
} = require("../production-provider-middleware");

const response = createMiddlewareResponse(valid);
recordMiddlewareAuditEntry(valid, response, { method: "POST", path: "/reviewed-send" });
const auditExport = getMiddlewareAuditExport();
const summary = getMiddlewareAuditSummary(auditExport.entries);
const serializedExport = JSON.stringify(auditExport);

const checks = [
  ["middleware exports audit summary", typeof getMiddlewareAuditSummary === "function"],
  ["middleware exports audit export", typeof getMiddlewareAuditExport === "function"],
  ["middleware has audit export route", source.includes('requestUrl.pathname === "/audit/export"')],
  ["audit export has schema", auditExport.schemaVersion === "regent-growth.middleware-audit.v1"],
  ["audit export has generated timestamp", typeof auditExport.generatedAt === "string" && auditExport.generatedAt.length > 0],
  ["audit export states body not stored", auditExport.bodyContentStored === false],
  ["audit export includes entries", Array.isArray(auditExport.entries) && auditExport.entries.length > 0],
  ["audit export includes summary", auditExport.summary && auditExport.summary.total === auditExport.entries.length],
  ["audit summary counts accepted", summary.accepted <= summary.total],
  ["audit summary keeps provider counts", summary.providers[response.provider] >= 1],
  ["audit summary keeps issue count", summary.issueCount >= response.issues.length],
  ["audit export omits body content", !serializedExport.includes(valid.packet.message.body)],
  ["project plan next audit export exists", projectPlan.includes("- Production middleware audit export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware audit export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware audit export test passed.");
