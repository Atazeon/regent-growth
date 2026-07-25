const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncCrmRecords(records, prospectsToUpdate)");
const end = app.indexOf("async function syncSelectedCrmLead()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["sync records function exists", start !== -1],
  ["sync records captures queue timestamp", body.includes("const startedAt = new Date().toISOString();")],
  ["sync records marks prospects syncing", body.includes('prospect.crmSyncStatus = "Syncing";')],
  ["sync records appends queued note", body.includes("Sync queued for CRM connector.")],
  ["sync records saves queued state", body.includes("saveProspects();")],
  ["sync records renders queued state", body.includes("renderProspects();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup sync queue status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup sync queue status test passed.");
