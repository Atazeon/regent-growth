const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const valid = require("./fixtures/production-reviewed-send-valid.json");
const {
  createMiddlewareResponse,
  createMiddlewareAuditEntry,
  recordMiddlewareAuditEntry,
  getMiddlewareAuditTrail
} = require("../production-provider-middleware");

const response = createMiddlewareResponse(valid);
const auditEntry = createMiddlewareAuditEntry(valid, response, { method: "POST", path: "/reviewed-send" });
const previousCount = getMiddlewareAuditTrail().length;
const recorded = recordMiddlewareAuditEntry(valid, response, { method: "POST", path: "/reviewed-send" });
const nextTrail = getMiddlewareAuditTrail();

const checks = [
  ["middleware audit cap exists", source.includes("const maxAuditEntries = 100")],
  ["middleware audit storage exists", source.includes("const middlewareAuditTrail = []")],
  ["middleware exports audit trail getter", typeof getMiddlewareAuditTrail === "function"],
  ["middleware exports audit creator", typeof createMiddlewareAuditEntry === "function"],
  ["middleware exports audit recorder", typeof recordMiddlewareAuditEntry === "function"],
  ["middleware has audit route", source.includes('requestUrl.pathname === "/audit"')],
  ["reviewed send records audit", source.includes("recordMiddlewareAuditEntry(body, result")],
  ["response includes audit id", source.includes("result.auditId = audit.id")],
  ["audit action is reviewed send", auditEntry.action === "reviewed-send"],
  ["audit keeps provider", auditEntry.provider === response.provider],
  ["audit keeps acceptance state", auditEntry.accepted === response.accepted],
  ["audit keeps issue count", auditEntry.issueCount === response.issues.length],
  ["audit keeps schema version", auditEntry.schemaVersion === "regent-growth.reviewed-send.v1"],
  ["audit keeps sender email", auditEntry.senderEmail === valid.packet.provider.senderEmail],
  ["audit keeps recipient email", auditEntry.recipientEmail === valid.packet.message.to],
  ["audit confirms subject presence", auditEntry.subjectPresent === true],
  ["audit does not store body", auditEntry.bodyStored === false],
  ["audit omits body content", !JSON.stringify(auditEntry).includes(valid.packet.message.body)],
  ["audit records request path", auditEntry.path === "/reviewed-send"],
  ["audit recorder prepends entry", nextTrail[0].id === recorded.id],
  ["audit recorder increases trail", nextTrail.length === previousCount + 1],
  ["project plan next audit exists", projectPlan.includes("- Production middleware audit trail")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware audit trail test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware audit trail test passed.");
