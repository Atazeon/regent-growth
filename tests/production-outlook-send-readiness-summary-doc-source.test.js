const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_SEND_READINESS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook readiness doc title exists", doc.includes("# Production Outlook Send Readiness Summary")],
  ["outlook readiness doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/send-readiness")],
  ["outlook readiness doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook readiness doc names schema", doc.includes("regent-growth.outlook-send-readiness-summary.v1")],
  ["outlook readiness doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["outlook readiness doc blocks canSend", doc.includes("canSend: false")],
  ["outlook readiness doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook readiness doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook readiness doc includes reviewed packet check", doc.includes("reviewed-packet")],
  ["outlook readiness doc includes env check", doc.includes("outlook-env")],
  ["outlook readiness doc includes implementation check", doc.includes("implementation-controls")],
  ["outlook readiness doc includes suppression check", doc.includes("suppression")],
  ["outlook readiness doc includes unsubscribe check", doc.includes("unsubscribe")],
  ["outlook readiness doc includes audit check", doc.includes("audit-preview")],
  ["outlook readiness doc names missing checks", doc.includes("missingChecks")],
  ["outlook readiness doc names implementation review field", doc.includes("readyForImplementationReview")],
  ["outlook readiness doc blocks send approval", doc.includes("still does not approve Outlook sending")],
  ["project plan next outlook readiness docs exists", projectPlan.includes("- First Outlook send readiness summary docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook send readiness summary doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook send readiness summary doc test passed.");
