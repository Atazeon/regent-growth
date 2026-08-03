const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_BOUNDARY.md"), "utf8");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["boundary title exists", doc.includes("# Production Provider Implementation Boundary")],
  ["boundary lists implemented setup", doc.includes("Local production provider setup form")],
  ["boundary lists reviewed send packet", doc.includes("Reviewed send packet JSON export")],
  ["boundary lists dry-run endpoint", doc.includes("/api/production-send-dry-run")],
  ["boundary says gmail not implemented", doc.includes("Real Gmail API sending")],
  ["boundary says outlook not implemented", doc.includes("Real Microsoft Graph or Outlook sending")],
  ["boundary says automatic booking not implemented", doc.includes("Automatic calendar booking")],
  ["boundary requires unsubscribe handling", doc.includes("unsubscribe and suppression-list handling")],
  ["boundary keeps reviewed handoff", doc.includes("preserve reviewed handoff as the default state")],
  ["runbook links boundary", runbook.includes("docs/PRODUCTION_PROVIDER_BOUNDARY.md")],
  ["plan next boundary exists", plan.includes("- Production provider implementation boundary docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider boundary doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider boundary doc test passed.");
