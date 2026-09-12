const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_REAL_PROVIDER_READINESS_REVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["production readiness review doc title exists", doc.includes("# Real-Provider Production Readiness Review")],
  ["production readiness review doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/real-provider/production-readiness-review")],
  ["production readiness review doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["production readiness review doc names schema", doc.includes("regent-growth.real-provider-production-readiness-review.v1")],
  ["production readiness review doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["production readiness review doc blocks canSend", doc.includes("canSend: false")],
  ["production readiness review doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["production readiness review doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["production readiness review doc names gmail", doc.includes("gmail")],
  ["production readiness review doc names outlook", doc.includes("outlook")],
  ["production readiness review doc names implementation schema", doc.includes("implementationReviewSchema")],
  ["production readiness review doc names run packet schema", doc.includes("runPacketSchema")],
  ["production readiness review doc names readiness schema", doc.includes("readinessSummarySchema")],
  ["production readiness review doc names missing checks", doc.includes("missingChecks")],
  ["production readiness review doc names gmail endpoint", doc.includes("/gmail/implementation-review/export")],
  ["production readiness review doc names outlook endpoint", doc.includes("/outlook/implementation-review/export")],
  ["production readiness review doc names gmail doc", doc.includes("docs/PRODUCTION_GMAIL_IMPLEMENTATION_REVIEW.md")],
  ["production readiness review doc names outlook doc", doc.includes("docs/PRODUCTION_OUTLOOK_IMPLEMENTATION_REVIEW.md")],
  ["production readiness review doc blocks send approval", doc.includes("not send approval")],
  ["project plan next production review docs exists", projectPlan.includes("- Real-provider production readiness review docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider readiness review doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider readiness review doc test passed.");
