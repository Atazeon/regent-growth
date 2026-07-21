const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["export stamp helper exists", app.includes("function getCrmChecklistExportStamp()")],
  ["export filename helper exists", app.includes("function getCrmChecklistExportFilename(stamp, extension)")],
  ["filename base consistent", app.includes("return `regent-growth-crm-checklist-${stamp}.${extension}`;")],
  ["text download uses helper", app.includes('downloadFile(getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "txt"), formatCrmChecklistSummary(), "text/plain;charset=utf-8");')],
  ["json download uses helper", app.includes('downloadFile(getCrmChecklistExportFilename(getCrmChecklistExportStamp(), "json"), JSON.stringify(getCrmChecklistSummaryRecord(), null, 2), "application/json;charset=utf-8");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export filename test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export filename test passed.");
