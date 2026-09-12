const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getOutlookImplementationReviewExport } = require("../production-provider-middleware");

const reviewExport = getOutlookImplementationReviewExport(fixture);

const checks = [
  ["middleware exports outlook implementation review", typeof getOutlookImplementationReviewExport === "function"],
  ["middleware has outlook implementation review route", source.includes('requestUrl.pathname === "/outlook/implementation-review/export"')],
  ["review export schema exists", reviewExport.schemaVersion === "regent-growth.outlook-implementation-review-export.v1"],
  ["review export has timestamp", typeof reviewExport.generatedAt === "string" && reviewExport.generatedAt.length > 0],
  ["review export names provider", reviewExport.provider === "outlook"],
  ["review export blocks approval", reviewExport.approvedForRealSend === false],
  ["review export blocks canSend", reviewExport.canSend === false],
  ["review export keeps sent disabled", reviewExport.sentEnabled === false],
  ["review export keeps booked disabled", reviewExport.bookedEnabled === false],
  ["review export includes run packet", reviewExport.runPacket.schemaVersion === "regent-growth.outlook-provider-run-packet.v1"],
  ["review export includes decision record", reviewExport.decisionRecord.schemaVersion === "regent-growth.real-provider-decision-record.v1"],
  ["review export includes implementation guard", reviewExport.implementationGuard.schemaVersion === "regent-growth.provider-implementation-guard.v1"],
  ["review export includes readiness summary", reviewExport.readinessSummary.schemaVersion === "regent-growth.outlook-send-readiness-summary.v1"],
  ["review export includes status doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_PROVIDER_STATUS.md")],
  ["review export includes preflight doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_PREFLIGHT.md")],
  ["review export includes audit doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_AUDIT_PREVIEW.md")],
  ["review export includes retry doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_RETRY_PREVIEW.md")],
  ["review export includes response mapping doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_RESPONSE_MAPPING.md")],
  ["review export includes blocked send doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_BLOCKED_SEND.md")],
  ["review export blocks send approval", reviewExport.blockedReasons.includes("Outlook implementation review export is not send approval.")],
  ["project plan next outlook review export exists", projectPlan.includes("- First Outlook implementation review export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook implementation review export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook implementation review export test passed.");
