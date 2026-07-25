const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncSelectedCrmLead()");
const end = app.indexOf("async function syncWarmCrmLeads()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected sync function exists", start !== -1],
  ["selected sync catches errors", body.includes("} catch (error) {")],
  ["selected sync marks failure", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["selected sync appends failure note", body.includes("appendCrmSyncNote(prospect, `${new Date().toISOString()}: ${error.message}`);")],
  ["selected sync saves failure", body.includes("saveProspects();")],
  ["selected sync renders failure", body.includes("renderProspects();")],
  ["selected sync reports error status", body.includes('setCrmSetupStatus(error.message, "error");')],
  ["selected sync clears in-progress flag", body.includes("crmSyncInProgress = false;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM selected sync failure test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM selected sync failure test passed.");
