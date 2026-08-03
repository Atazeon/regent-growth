const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_READINESS_REPORT.md"), "utf8");
const planDoc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["readiness report title exists", doc.includes("# Production Readiness Report")],
  ["readiness report documents endpoint", doc.includes("GET http://127.0.0.1:5195/adapter-readiness")],
  ["readiness report explains sent disabled", doc.includes("sentEnabled: false")],
  ["readiness report explains booking disabled", doc.includes("bookedEnabled: false")],
  ["readiness report explains ready providers", doc.includes("readyProviders")],
  ["readiness report explains blocked providers", doc.includes("blockedProviders")],
  ["readiness report explains missing env", doc.includes("missingEnv")],
  ["readiness report keeps stub blocked", doc.includes("stub") && doc.includes("contract validation only")],
  ["readiness report keeps gmail blocked", doc.includes("gmail") && doc.includes("test-account evidence")],
  ["readiness report keeps outlook blocked", doc.includes("outlook") && doc.includes("test-account evidence")],
  ["readiness report keeps custom blocked", doc.includes("custom reviewed-send endpoint")],
  ["readiness report has release blocker rule", doc.includes("release blocker")],
  ["plan doc links readiness report", planDoc.includes("docs/PRODUCTION_READINESS_REPORT.md")],
  ["project plan next readiness docs exists", projectPlan.includes("- Production middleware readiness report docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production readiness report doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production readiness report doc test passed.");
