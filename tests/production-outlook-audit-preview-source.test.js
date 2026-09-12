const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getOutlookReviewedPacketPreflight,
  createOutlookAuditPreviewEntry,
  recordOutlookAuditPreviewEntry,
  getOutlookAuditPreviewExport
} = require("../production-provider-middleware");

const preflight = getOutlookReviewedPacketPreflight(fixture);
const preview = createOutlookAuditPreviewEntry(fixture, preflight);
recordOutlookAuditPreviewEntry(fixture, preflight);
const auditExport = getOutlookAuditPreviewExport();
const serializedExport = JSON.stringify(auditExport);

const checks = [
  ["middleware exports outlook audit preview entry", typeof createOutlookAuditPreviewEntry === "function"],
  ["middleware exports outlook audit preview recorder", typeof recordOutlookAuditPreviewEntry === "function"],
  ["middleware exports outlook audit preview export", typeof getOutlookAuditPreviewExport === "function"],
  ["middleware has outlook audit preview route", source.includes('requestUrl.pathname === "/outlook/audit-preview"')],
  ["middleware has outlook audit preview export route", source.includes('requestUrl.pathname === "/outlook/audit-preview/export"')],
  ["audit preview action exists", preview.action === "outlook-preflight"],
  ["audit preview provider exists", preview.provider === "outlook"],
  ["audit preview keeps accepted false", preview.accepted === false],
  ["audit preview keeps sent false", preview.sent === false],
  ["audit preview keeps booked false", preview.booked === false],
  ["audit preview stores sender metadata", preview.senderEmail === fixture.packet.provider.senderEmail],
  ["audit preview stores recipient metadata", preview.recipientEmail === fixture.packet.message.to],
  ["audit preview stores subject presence", preview.subjectPresent === true],
  ["audit preview does not store body", preview.bodyStored === false],
  ["audit export schema exists", auditExport.schemaVersion === "regent-growth.outlook-audit-preview.v1"],
  ["audit export has timestamp", typeof auditExport.generatedAt === "string" && auditExport.generatedAt.length > 0],
  ["audit export marks no body content", auditExport.bodyContentStored === false],
  ["audit export has entries", auditExport.entries.length > 0],
  ["audit export summary counts total", auditExport.summary.total === auditExport.entries.length],
  ["audit export keeps sent zero", auditExport.summary.sent === 0],
  ["audit export keeps booked zero", auditExport.summary.booked === 0],
  ["audit export omits body content", !serializedExport.includes(fixture.packet.message.body)],
  ["project plan next outlook audit preview exists", projectPlan.includes("- First Outlook provider audit preview")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook audit preview test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook audit preview test passed.");
