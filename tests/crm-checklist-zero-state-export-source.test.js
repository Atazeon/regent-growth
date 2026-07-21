const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["text export has availability line", app.includes('inputs.length > 0 ? "Status: Available" : "Status: Checklist unavailable",')],
  ["json export has availability field", app.includes("available: items.length > 0,")],
  ["json complete remains guarded", app.includes("const complete = items.length > 0 && completedCount === items.length;")],
  ["text progress remains", app.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist zero-state export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist zero-state export test passed.");
