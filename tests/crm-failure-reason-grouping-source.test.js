const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmFailureReasonGroup(note = \"\")");
const end = app.indexOf("function getReviewedCrmReason(prospect)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failure reason group function exists", start !== -1],
  ["auth group detected", body.includes('return "Auth";')],
  ["validation group detected", body.includes('return "Validation";')],
  ["rate limit group detected", body.includes('return "Rate Limit";')],
  ["timeout group detected", body.includes('return "Timeout";')],
  ["network group detected", body.includes('return "Network";')],
  ["endpoint group detected", body.includes('return "Endpoint";')],
  ["other group fallback exists", body.includes('return "Other";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failure reason grouping test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failure reason grouping test passed.");
