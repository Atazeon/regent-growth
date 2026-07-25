const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const downloadStart = app.indexOf("function downloadCrmChecklistJson()");
const copyStart = app.indexOf("async function copyCrmChecklistJson()");
const copyEnd = app.indexOf("function getProspectFieldNames()", copyStart);
const downloadBody = downloadStart === -1 || copyStart === -1 ? "" : app.slice(downloadStart, copyStart);
const copyBody = copyStart === -1 || copyEnd === -1 ? "" : app.slice(copyStart, copyEnd);
const serialization = "JSON.stringify(getCrmChecklistSummaryRecord(), null, 2)";

const checks = [
  ["json download function exists", downloadStart !== -1],
  ["json copy function exists", copyStart !== -1],
  ["json download pretty-prints record", downloadBody.includes(serialization)],
  ["json copy pretty-prints record", copyBody.includes(serialization)],
  ["json download content type set", downloadBody.includes('"application/json;charset=utf-8"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export serialization test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export serialization test passed.");
