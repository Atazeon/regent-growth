const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function downloadCrmChecklistSummary()");
const end = app.indexOf("function downloadCrmChecklistJson()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary download function exists", start !== -1],
  ["summary download writes text file", body.includes('downloadFile(getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "txt"), formatCrmChecklistSummary(), "text/plain;charset=utf-8");')],
  ["summary download reports status", body.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded"));')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist summary download status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist summary download status test passed.");
