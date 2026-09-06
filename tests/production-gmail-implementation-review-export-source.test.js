const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getGmailImplementationReviewExport } = require("../production-provider-middleware");

const reviewExport = getGmailImplementationReviewExport(fixture);

const checks = [
  ["middleware exports gmail implementation review", typeof getGmailImplementationReviewExport === "function"],
  ["middleware has gmail implementation review route", source.includes('requestUrl.pathname === "/gmail/implementation-review/export"')],
  ["review export schema exists", reviewExport.schemaVersion === "regent-growth.gmail-implementation-review-export.v1"],
  ["review export has timestamp", typeof reviewExport.generatedAt === "string" && reviewExport.generatedAt.length > 0],
  ["review export names provider", reviewExport.provider === "gmail"],
  ["review export blocks approval", reviewExport.approvedForRealSend === false],
  ["review export blocks canSend", reviewExport.canSend === false],
  ["review export keeps sent disabled", reviewExport.sentEnabled === false],
  ["review export keeps booked disabled", reviewExport.bookedEnabled === false],
  ["review export includes run packet", reviewExport.runPacket.schemaVersion === "regent-growth.gmail-provider-run-packet.v1"],
  ["review export includes decision record", reviewExport.decisionRecord.schemaVersion === "regent-growth.real-provider-decision-record.v1"],
  ["review export includes implementation guard", reviewExport.implementationGuard.schemaVersion === "regent-growth.provider-implementation-guard.v1"],
  ["review export includes readiness summary", reviewExport.readinessSummary.schemaVersion === "regent-growth.gmail-send-readiness-summary.v1"],
  ["review export includes status doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_PROVIDER_STATUS.md")],
  ["review export includes preflight doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_PREFLIGHT.md")],
  ["review export includes audit doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_AUDIT_PREVIEW.md")],
  ["review export includes retry doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_RETRY_PREVIEW.md")],
  ["review export includes response mapping doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_RESPONSE_MAPPING.md")],
  ["review export includes blocked send doc", reviewExport.requiredDocs.includes("docs/PRODUCTION_GMAIL_BLOCKED_SEND.md")],
  ["review export blocks send approval", reviewExport.blockedReasons.includes("Gmail implementation review export is not send approval.")],
  ["project plan next gmail review export exists", projectPlan.includes("- First Gmail implementation review export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail implementation review export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail implementation review export test passed.");
