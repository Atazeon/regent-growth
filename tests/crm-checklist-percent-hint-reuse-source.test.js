const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["progress label includes percent", app.includes("const progressLabel = `${completed} of ${inputs.length} CRM checklist items complete (${completionPercent}%)`;")],
  ["copy title reuses progress label", app.includes("copyCrmChecklistButton.title = `Copy CRM checklist summary (${progressLabel})`;")],
  ["download title reuses progress label", app.includes("downloadCrmChecklistButton.title = `Download CRM checklist summary (${progressLabel})`;")],
  ["aria follows updated title", app.includes('button.setAttribute("aria-label", button.title);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist percent hint reuse test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist percent hint reuse test passed.");
