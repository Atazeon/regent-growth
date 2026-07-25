const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncWarmCrmLeads()");
const end = app.indexOf("async function retryFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["warm sync function exists", start !== -1],
  ["warm sync catches errors", body.includes("} catch (error) {")],
  ["warm sync records failure timestamp", body.includes("const failedAt = new Date().toISOString();")],
  ["warm sync marks each failure", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["warm sync appends failure note", body.includes("appendCrmSyncNote(prospect, `${failedAt}: ${error.message}`);")],
  ["warm sync saves failures", body.includes("saveProspects();")],
  ["warm sync renders failures", body.includes("renderProspects();")],
  ["warm sync reports error status", body.includes('setCrmSetupStatus(error.message, "error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM warm sync failure test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM warm sync failure test passed.");
