const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["copy summary listener exists", app.includes('copyCrmChecklistButton.addEventListener("click", copyCrmChecklistSummary);')],
  ["download summary listener exists", app.includes('downloadCrmChecklistButton.addEventListener("click", downloadCrmChecklistSummary);')],
  ["copy json listener exists", app.includes('copyCrmChecklistJsonButton.addEventListener("click", copyCrmChecklistJson);')],
  ["download json listener exists", app.includes('downloadCrmChecklistJsonButton.addEventListener("click", downloadCrmChecklistJson);')],
  ["reset listener exists", app.includes('resetCrmChecklistButton.addEventListener("click", resetCrmChecklistState);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action listeners test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action listeners test passed.");
