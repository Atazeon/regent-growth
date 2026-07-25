const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const textStart = app.indexOf("function downloadCrmChecklistSummary()");
const jsonStart = app.indexOf("function downloadCrmChecklistJson()");
const end = app.indexOf("async function copyCrmChecklistJson()", jsonStart);
const textBody = textStart === -1 || jsonStart === -1 ? "" : app.slice(textStart, jsonStart);
const jsonBody = jsonStart === -1 || end === -1 ? "" : app.slice(jsonStart, end);

const checks = [
  ["text download function exists", textStart !== -1],
  ["json download function exists", jsonStart !== -1],
  ["text download action label used", textBody.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded"));')],
  ["json download action label used", jsonBody.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded JSON"));')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist download action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist download action label test passed.");
