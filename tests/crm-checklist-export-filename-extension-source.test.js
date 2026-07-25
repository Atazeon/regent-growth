const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const filenameStart = app.indexOf("function getCrmChecklistExportFilename(stamp, extension)");
const downloadTextStart = app.indexOf("function downloadCrmChecklistSummary()");
const downloadJsonStart = app.indexOf("function downloadCrmChecklistJson()");
const downloadJsonEnd = app.indexOf("async function copyCrmChecklistJson()", downloadJsonStart);
const textBody = downloadTextStart === -1 || downloadJsonStart === -1 ? "" : app.slice(downloadTextStart, downloadJsonStart);
const jsonBody = downloadJsonStart === -1 || downloadJsonEnd === -1 ? "" : app.slice(downloadJsonStart, downloadJsonEnd);

const checks = [
  ["filename helper exists", filenameStart !== -1],
  ["filename helper uses passed extension", app.includes("return `regent-growth-crm-checklist-${stamp}.${extension}`;")],
  ["text download uses txt extension", textBody.includes('getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "txt")')],
  ["json download uses json extension", jsonBody.includes('getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "json")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export filename extension test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export filename extension test passed.");
