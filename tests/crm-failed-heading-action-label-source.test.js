const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["show failed title exists", app.includes('data-action="show-crm-failed" title="Show all failed CRM syncs"')],
  ["show failed aria exists", app.includes('aria-label="Show all failed CRM syncs">Show failed</button>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failed heading action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failed heading action label test passed.");
