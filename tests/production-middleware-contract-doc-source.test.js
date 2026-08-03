const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contract = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_CONTRACT.md"), "utf8");
const boundary = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_BOUNDARY.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["contract title exists", contract.includes("# Production Provider Middleware Contract")],
  ["contract defines reviewed-send endpoint", contract.includes("POST /reviewed-send")],
  ["contract keeps schema version", contract.includes("regent-growth.reviewed-send.v1")],
  ["contract keeps automation false", contract.includes('"automationAllowed": false')],
  ["contract requires human review", contract.includes('"humanReviewRequired": true')],
  ["contract requires compliance review", contract.includes('"complianceReviewRequired": true')],
  ["contract rejects automation", contract.includes("Reject any packet where `automationAllowed` is not `false`")],
  ["contract requires release gate", contract.includes("Reject any packet when local release gate evidence is missing")],
  ["contract requires suppression list", contract.includes("suppression-list checks")],
  ["contract never books calendar", contract.includes("Never create calendar bookings from the email send endpoint")],
  ["contract response has provider message id", contract.includes("providerMessageId")],
  ["contract error response keeps sent false", contract.includes('"sent": false')],
  ["boundary links contract", boundary.includes("docs/PRODUCTION_MIDDLEWARE_CONTRACT.md")],
  ["plan next middleware contract exists", plan.includes("- Production provider middleware contract")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware contract doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware contract doc test passed.");
