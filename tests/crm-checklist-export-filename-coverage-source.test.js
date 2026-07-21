const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const textDownloadTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-download-summary-source.test.js"), "utf8");
const jsonDownloadTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-json-export-source.test.js"), "utf8");
const filenameTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-export-filename-source.test.js"), "utf8");

const checks = [
  ["text download test covers filename helper", textDownloadTest.includes("getCrmChecklistExportFilename(getCrmChecklistExportStamp(), \"txt\")")],
  ["json download test covers filename helper", jsonDownloadTest.includes("getCrmChecklistExportFilename(getCrmChecklistExportStamp(), \"json\")")],
  ["filename test covers shared base", filenameTest.includes("regent-growth-crm-checklist-${stamp}.${extension}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export filename coverage test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export filename coverage test passed.");
