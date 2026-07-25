const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const stampStart = app.indexOf("function getCrmChecklistExportStamp()");
const filenameStart = app.indexOf("function getCrmChecklistExportFilename(stamp, extension)");
const actionStart = app.indexOf("function getCrmChecklistActionStatus(action)");
const stampBody = stampStart === -1 || filenameStart === -1 ? "" : app.slice(stampStart, filenameStart);
const filenameBody = filenameStart === -1 || actionStart === -1 ? "" : app.slice(filenameStart, actionStart);

const checks = [
  ["export stamp function exists", stampStart !== -1],
  ["export stamp uses ISO timestamp", stampBody.includes("new Date().toISOString()")],
  ["export stamp trims seconds precision", stampBody.includes(".slice(0, 19)")],
  ["export stamp removes filename separators", stampBody.includes(".replace(/[:T]/g, \"-\")")],
  ["filename helper uses stamp", filenameBody.includes("regent-growth-crm-checklist-${stamp}.${extension}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export timestamp filename test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export timestamp filename test passed.");
