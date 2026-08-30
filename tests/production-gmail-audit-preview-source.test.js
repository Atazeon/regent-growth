const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getGmailReviewedPacketPreflight,
  createGmailAuditPreviewEntry,
  recordGmailAuditPreviewEntry,
  getGmailAuditPreviewExport
} = require("../production-provider-middleware");

const preflight = getGmailReviewedPacketPreflight(fixture);
const preview = createGmailAuditPreviewEntry(fixture, preflight);
recordGmailAuditPreviewEntry(fixture, preflight);
const auditExport = getGmailAuditPreviewExport();
const serializedExport = JSON.stringify(auditExport);

const checks = [
  ["middleware exports gmail audit preview entry", typeof createGmailAuditPreviewEntry === "function"],
  ["middleware exports gmail audit preview recorder", typeof recordGmailAuditPreviewEntry === "function"],
  ["middleware exports gmail audit preview export", typeof getGmailAuditPreviewExport === "function"],
  ["middleware has gmail audit preview route", source.includes('requestUrl.pathname === "/gmail/audit-preview"')],
  ["middleware has gmail audit preview export route", source.includes('requestUrl.pathname === "/gmail/audit-preview/export"')],
  ["audit preview action exists", preview.action === "gmail-preflight"],
  ["audit preview provider exists", preview.provider === "gmail"],
  ["audit preview keeps accepted false", preview.accepted === false],
  ["audit preview keeps sent false", preview.sent === false],
  ["audit preview keeps booked false", preview.booked === false],
  ["audit preview stores sender metadata", preview.senderEmail === fixture.packet.provider.senderEmail],
  ["audit preview stores recipient metadata", preview.recipientEmail === fixture.packet.message.to],
  ["audit preview stores subject presence", preview.subjectPresent === true],
  ["audit preview does not store body", preview.bodyStored === false],
  ["audit export schema exists", auditExport.schemaVersion === "regent-growth.gmail-audit-preview.v1"],
  ["audit export has timestamp", typeof auditExport.generatedAt === "string" && auditExport.generatedAt.length > 0],
  ["audit export marks no body content", auditExport.bodyContentStored === false],
  ["audit export has entries", auditExport.entries.length > 0],
  ["audit export summary counts total", auditExport.summary.total === auditExport.entries.length],
  ["audit export keeps sent zero", auditExport.summary.sent === 0],
  ["audit export keeps booked zero", auditExport.summary.booked === 0],
  ["audit export omits body content", !serializedExport.includes(fixture.packet.message.body)],
  ["project plan next gmail audit preview exists", projectPlan.includes("- First Gmail provider audit preview")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail audit preview test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail audit preview test passed.");
