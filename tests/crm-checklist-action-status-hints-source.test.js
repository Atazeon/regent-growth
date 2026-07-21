const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["progress label exists", app.includes("const progressLabel = `${completed} of ${inputs.length} CRM checklist items complete`;")],
  ["copy summary title updated", app.includes("copyCrmChecklistButton.title = `Copy CRM checklist summary (${progressLabel})`;")],
  ["copy json title updated", app.includes("copyCrmChecklistJsonButton.title = `Copy CRM checklist JSON (${progressLabel})`;")],
  ["download summary title updated", app.includes("downloadCrmChecklistButton.title = `Download CRM checklist summary (${progressLabel})`;")],
  ["download json title updated", app.includes("downloadCrmChecklistJsonButton.title = `Download CRM checklist JSON (${progressLabel})`;")],
  ["aria labels follow title", app.includes('button.setAttribute("aria-label", button.title);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action status hints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action status hints test passed.");
