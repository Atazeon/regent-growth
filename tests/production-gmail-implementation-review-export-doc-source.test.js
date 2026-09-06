const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_IMPLEMENTATION_REVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail implementation review doc title exists", doc.includes("# Production Gmail Implementation Review Export")],
  ["gmail implementation review doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/implementation-review/export")],
  ["gmail implementation review doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail implementation review doc names schema", doc.includes("regent-growth.gmail-implementation-review-export.v1")],
  ["gmail implementation review doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["gmail implementation review doc blocks canSend", doc.includes("canSend: false")],
  ["gmail implementation review doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail implementation review doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail implementation review doc includes run packet", doc.includes("runPacket")],
  ["gmail implementation review doc includes decision record", doc.includes("decisionRecord")],
  ["gmail implementation review doc includes implementation guard", doc.includes("implementationGuard")],
  ["gmail implementation review doc includes readiness summary", doc.includes("readinessSummary")],
  ["gmail implementation review doc includes required docs", doc.includes("requiredDocs")],
  ["gmail implementation review doc names status docs", doc.includes("Gmail status")],
  ["gmail implementation review doc names response mapping docs", doc.includes("response mapping")],
  ["gmail implementation review doc names blocked send docs", doc.includes("blocked send")],
  ["gmail implementation review doc blocks send approval", doc.includes("not Gmail send approval")],
  ["project plan next gmail review docs exists", projectPlan.includes("- First Gmail implementation review export docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail implementation review export doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail implementation review export doc test passed.");
