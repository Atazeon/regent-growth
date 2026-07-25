const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const copyStart = app.indexOf("async function copyCrmChecklistSummary()");
const downloadStart = app.indexOf("function downloadCrmChecklistSummary()");
const downloadEnd = app.indexOf("function downloadCrmChecklistJson()", downloadStart);
const copyBody = copyStart === -1 || downloadStart === -1 ? "" : app.slice(copyStart, downloadStart);
const downloadBody = downloadStart === -1 || downloadEnd === -1 ? "" : app.slice(downloadStart, downloadEnd);

const checks = [
  ["summary copy function exists", copyStart !== -1],
  ["summary download function exists", downloadStart !== -1],
  ["summary copy uses text formatter", copyBody.includes("copyTextWithFallback(formatCrmChecklistSummary())")],
  ["summary download uses text formatter", downloadBody.includes("formatCrmChecklistSummary()")],
  ["summary download content type set", downloadBody.includes('"text/plain;charset=utf-8"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist text export serialization test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist text export serialization test passed.");
