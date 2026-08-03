const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const status = fs.readFileSync(path.join(root, "docs", "PRODUCTION_INTEGRATION_STATUS.md"), "utf8");
const boundary = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_BOUNDARY.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["status title exists", status.includes("# Production Integration Status")],
  ["status says not real sending", status.includes("not real sending")],
  ["status lists provider setup", status.includes("Provider setup can be saved")],
  ["status lists dry run", status.includes("Reviewed send packet JSON can be copied, downloaded, validated, and dry-run")],
  ["status lists closeout", status.includes("closeout packets are available")],
  ["status blocks gmail", status.includes("Real Gmail sending")],
  ["status blocks oauth", status.includes("OAuth token handling")],
  ["status names middleware contract", status.includes("docs/PRODUCTION_MIDDLEWARE_CONTRACT.md")],
  ["status names provider stub", status.includes("production-provider-stub.js")],
  ["boundary links status", boundary.includes("docs/PRODUCTION_INTEGRATION_STATUS.md")],
  ["plan next final polish exists", plan.includes("- Production integration final polish")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production integration status doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production integration status doc test passed.");
