const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncCrmRecords(records, prospectsToUpdate)");
const end = app.indexOf("async function syncSelectedCrmLead()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM sync helper exists", start !== -1],
  ["sync marks records syncing", body.includes('prospect.crmSyncStatus = "Syncing";')],
  ["sync appends queued note", body.includes("Sync queued for CRM connector.")],
  ["sync posts to endpoint", body.includes("await fetch(crmSyncEndpoint")],
  ["sync sends JSON", body.includes('"Content-Type": "application/json"')],
  ["sync serializes records", body.includes("body: JSON.stringify({ records })")],
  ["sync handles non-ok response", body.includes("if (!response.ok)")],
  ["sync marks synced", body.includes('prospect.crmSyncStatus = "Synced";')],
  ["sync records syncedAt", body.includes("prospect.crmSyncedAt = syncedAt;")],
  ["sync completes handoff status", body.includes('prospect.handoffStatus = "Handed Off";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM sync records lifecycle test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM sync records lifecycle test passed.");
