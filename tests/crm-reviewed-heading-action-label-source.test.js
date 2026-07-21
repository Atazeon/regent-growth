const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["show reviewed title exists", app.includes('data-action="show-crm-reviewed" title="Show all reviewed CRM syncs"')],
  ["show reviewed aria exists", app.includes('aria-label="Show all reviewed CRM syncs">Show reviewed</button>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed heading action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed heading action label test passed.");
