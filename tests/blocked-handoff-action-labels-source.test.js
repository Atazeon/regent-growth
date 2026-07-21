const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["blocked open action", app.includes('data-action="select-blocked"')],
  ["blocked open title", app.includes('title="Open blocked handoff"')],
  ["blocked open aria", app.includes('aria-label="Open blocked handoff"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Blocked handoff action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Blocked handoff action labels test passed.");
