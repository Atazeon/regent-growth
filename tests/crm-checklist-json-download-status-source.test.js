const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function downloadCrmChecklistJson()");
const end = app.indexOf("async function copyCrmChecklistJson()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["json download function exists", start !== -1],
  ["json download writes file", body.includes('downloadFile(getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "json"), JSON.stringify(getCrmChecklistSummaryRecord(), null, 2), "application/json;charset=utf-8");')],
  ["json download reports status", body.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded JSON"));')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON download status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON download status test passed.");
