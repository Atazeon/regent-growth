const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["summary loads completed timestamp", app.includes('const completedAt = loadCrmChecklistState().__completedAt || "";')],
  ["summary displays completed date", app.includes('completedAt ? `Completed at: ${formatDateTime(completedAt)}` : "Completed at: Not complete"')],
  ["summary still includes checklist title", app.includes('"CRM Checklist",')],
  ["summary still includes progress line", app.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion display test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion display test passed.");
