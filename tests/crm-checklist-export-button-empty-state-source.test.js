const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmChecklistProgress()");
const end = app.indexOf("function formatCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["progress function exists", start !== -1],
  ["empty checklist label exists", body.includes('? "CRM checklist unavailable"')],
  ["copy title uses empty-state label", body.includes("copyCrmChecklistButton.title = `Copy CRM checklist summary (${progressLabel})`;")],
  ["copy json title uses empty-state label", body.includes("copyCrmChecklistJsonButton.title = `Copy CRM checklist JSON (${progressLabel})`;")],
  ["download title uses empty-state label", body.includes("downloadCrmChecklistButton.title = `Download CRM checklist summary (${progressLabel})`;")],
  ["download json title uses empty-state label", body.includes("downloadCrmChecklistJsonButton.title = `Download CRM checklist JSON (${progressLabel})`;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export button empty-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export button empty-state test passed.");
