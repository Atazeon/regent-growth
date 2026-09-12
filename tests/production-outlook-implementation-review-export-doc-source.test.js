const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_IMPLEMENTATION_REVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook implementation review doc title exists", doc.includes("# Production Outlook Implementation Review Export")],
  ["outlook implementation review doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/implementation-review/export")],
  ["outlook implementation review doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook implementation review doc names schema", doc.includes("regent-growth.outlook-implementation-review-export.v1")],
  ["outlook implementation review doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["outlook implementation review doc blocks canSend", doc.includes("canSend: false")],
  ["outlook implementation review doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook implementation review doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook implementation review doc includes run packet", doc.includes("runPacket")],
  ["outlook implementation review doc includes decision record", doc.includes("decisionRecord")],
  ["outlook implementation review doc includes implementation guard", doc.includes("implementationGuard")],
  ["outlook implementation review doc includes readiness summary", doc.includes("readinessSummary")],
  ["outlook implementation review doc includes required docs", doc.includes("requiredDocs")],
  ["outlook implementation review doc names status docs", doc.includes("Outlook status")],
  ["outlook implementation review doc names response mapping docs", doc.includes("response mapping")],
  ["outlook implementation review doc names blocked send docs", doc.includes("blocked send")],
  ["outlook implementation review doc blocks send approval", doc.includes("not Outlook send approval")],
  ["project plan next outlook review docs exists", projectPlan.includes("- First Outlook implementation review export docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook implementation review export doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook implementation review export doc test passed.");
