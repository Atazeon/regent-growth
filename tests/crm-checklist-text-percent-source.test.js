const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["text percent calculated", app.includes("const completionPercent = inputs.length ? Math.round((completed / inputs.length) * 100) : 0;")],
  ["text percent displayed", app.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`,")],
  ["completed timestamp retained", app.includes('completedAt ? `Completed at: ${formatDateTime(completedAt)}` : "Completed at: Not complete"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist text percent test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist text percent test passed.");
