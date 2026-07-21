const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["complete message exists", app.includes('? "Checklist complete"')],
  ["partial message retained", app.includes(': `${completed} of ${inputs.length} complete (${completionPercent}%)`;')],
  ["completion compares count", app.includes("completed === inputs.length")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist complete message test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist complete message test passed.");
