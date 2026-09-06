const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_SEND_READINESS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail readiness doc title exists", doc.includes("# Production Gmail Send Readiness Summary")],
  ["gmail readiness doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/send-readiness")],
  ["gmail readiness doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail readiness doc names schema", doc.includes("regent-growth.gmail-send-readiness-summary.v1")],
  ["gmail readiness doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["gmail readiness doc blocks canSend", doc.includes("canSend: false")],
  ["gmail readiness doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail readiness doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail readiness doc includes reviewed packet check", doc.includes("reviewed-packet")],
  ["gmail readiness doc includes env check", doc.includes("gmail-env")],
  ["gmail readiness doc includes implementation check", doc.includes("implementation-controls")],
  ["gmail readiness doc includes suppression check", doc.includes("suppression")],
  ["gmail readiness doc includes unsubscribe check", doc.includes("unsubscribe")],
  ["gmail readiness doc includes audit check", doc.includes("audit-preview")],
  ["gmail readiness doc names missing checks", doc.includes("missingChecks")],
  ["gmail readiness doc names implementation review field", doc.includes("readyForImplementationReview")],
  ["gmail readiness doc blocks send approval", doc.includes("still does not approve Gmail sending")],
  ["project plan next gmail readiness docs exists", projectPlan.includes("- First Gmail send readiness summary docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail send readiness summary doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail send readiness summary doc test passed.");
