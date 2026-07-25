const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const downloadStart = app.indexOf("function downloadCrmStatusJson()");
const copyStart = app.indexOf("async function copyCrmStatusJson()");
const end = app.indexOf("function setCrmSetupStatus", copyStart);
const downloadBody = downloadStart === -1 || copyStart === -1 ? "" : app.slice(downloadStart, copyStart);
const copyBody = copyStart === -1 || end === -1 ? "" : app.slice(copyStart, end);

const checks = [
  ["download CRM status JSON function exists", downloadStart !== -1],
  ["copy CRM status JSON function exists", copyStart !== -1],
  ["download JSON creates safe stamp", downloadBody.includes('const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");')],
  ["download JSON writes pretty record", downloadBody.includes("JSON.stringify(getCrmStatusSummaryRecord(), null, 2)")],
  ["download JSON content type set", downloadBody.includes('"application/json;charset=utf-8"')],
  ["download JSON reports status", downloadBody.includes('"Downloaded CRM sync summary JSON."')],
  ["copy JSON uses fallback helper", copyBody.includes("copyTextWithFallback(JSON.stringify(getCrmStatusSummaryRecord(), null, 2))")],
  ["copy JSON reports copied status", copyBody.includes('"CRM sync summary JSON copied."')],
  ["copy JSON reports fallback status", copyBody.includes('"CRM sync summary JSON selected and copied."')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status JSON download copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status JSON download copy test passed.");
