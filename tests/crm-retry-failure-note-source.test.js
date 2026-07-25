const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const bulkStart = app.indexOf("async function retryFailedCrmSyncs()");
const bulkEnd = app.indexOf("function showFailedCrmSyncs()", bulkStart);
const singleStart = app.indexOf("async function retrySingleFailedCrmSync(index)");
const singleEnd = app.indexOf("async function copySelectedHandoffPacket()", singleStart);
const bulkBody = bulkStart === -1 || bulkEnd === -1 ? "" : app.slice(bulkStart, bulkEnd);
const singleBody = singleStart === -1 || singleEnd === -1 ? "" : app.slice(singleStart, singleEnd);

const checks = [
  ["bulk retry function exists", bulkStart !== -1],
  ["single retry function exists", singleStart !== -1],
  ["bulk retry records failure timestamp", bulkBody.includes("const failedAt = new Date().toISOString();")],
  ["bulk retry appends failure note", bulkBody.includes("appendCrmSyncNote(prospect, `${failedAt}: Retry failed: ${error.message}`);")],
  ["single retry appends failure note", singleBody.includes("appendCrmSyncNote(prospect, `${new Date().toISOString()}: Single retry failed: ${error.message}`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry failure note test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry failure note test passed.");
