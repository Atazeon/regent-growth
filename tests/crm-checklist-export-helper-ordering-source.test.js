const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const stampIndex = app.indexOf("function getCrmChecklistExportStamp()");
const filenameIndex = app.indexOf("function getCrmChecklistExportFilename(stamp, extension)");
const statusIndex = app.indexOf("function getCrmChecklistActionStatus(action)");
const textDownloadIndex = app.indexOf("function downloadCrmChecklistSummary()");
const jsonDownloadIndex = app.indexOf("function downloadCrmChecklistJson()");

const checks = [
  ["export stamp helper exists", stampIndex !== -1],
  ["export filename helper exists", filenameIndex !== -1],
  ["action status helper exists", statusIndex !== -1],
  ["text download action exists", textDownloadIndex !== -1],
  ["json download action exists", jsonDownloadIndex !== -1],
  ["stamp helper defined before filename helper", stampIndex !== -1 && filenameIndex !== -1 && stampIndex < filenameIndex],
  ["filename helper defined before download actions", filenameIndex !== -1 && textDownloadIndex !== -1 && jsonDownloadIndex !== -1 && filenameIndex < textDownloadIndex && filenameIndex < jsonDownloadIndex],
  ["status helper defined before download actions", statusIndex !== -1 && textDownloadIndex !== -1 && jsonDownloadIndex !== -1 && statusIndex < textDownloadIndex && statusIndex < jsonDownloadIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export helper ordering test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export helper ordering test passed.");
