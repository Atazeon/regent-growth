const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const expected = 'title="Save CRM handoff owner, status, due date, and notes" aria-label="Save CRM handoff owner, status, due date, and notes"';

const checks = [
  ["save handoff label exists", html.includes(expected)],
  ["save handoff text retained", html.includes(`${expected}>Save handoff</button>`)]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff save action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff save action label test passed.");
