const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retrySingleFailedCrmSync(index)");
const end = app.indexOf("async function copySelectedHandoffPacket()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["single retry function exists", start !== -1],
  ["single retry guards missing failed selection", body.includes('if (!prospect || prospect.crmSyncStatus !== "Sync Failed") {')],
  ["single retry guards cold prospect", body.includes("if (!isWarmLead(prospect)) {")],
  ["single retry reports working status", body.includes("setCrmSetupStatus(`Retrying CRM sync for ${prospect.company}...`, \"working\");")],
  ["single retry syncs one record", body.includes("await syncCrmRecords([getCrmRecord(prospect)], [prospect]);")],
  ["single retry reports setup success", body.includes("setCrmSetupStatus(`${prospect.company} retried and synced to CRM.`);")],
  ["single retry reports data success", body.includes("setDataStatus(`${prospect.company} removed from CRM retry queue.`);")],
  ["single retry reports error status", body.includes("setCrmSetupStatus(`CRM retry failed for ${prospect.company}: ${error.message}`, \"error\");")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry single status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry single status test passed.");
