const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["complete hint exists", app.includes('? "CRM checklist complete"')],
  ["partial hint retained", app.includes(': `${completed} of ${inputs.length} CRM checklist items complete (${completionPercent}%)`;')],
  ["copy title uses complete hint", app.includes("copyCrmChecklistButton.title = `Copy CRM checklist summary (${progressLabel})`;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist complete hint test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist complete hint test passed.");
