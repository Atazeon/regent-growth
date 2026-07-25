const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmSyncStatusChips(failedCount, syncingCount, syncedCount, reviewedCount, notSyncedCount)");
const end = app.indexOf("function getCrmFailureReasonGroup", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["status chip renderer exists", start !== -1],
  ["failed chip exists", body.includes('{ label: `${failedCount} failed`, state: "failed" }')],
  ["syncing chip exists", body.includes('{ label: `${syncingCount} syncing`, state: "syncing" }')],
  ["synced chip exists", body.includes('{ label: `${syncedCount} synced`, state: "synced" }')],
  ["reviewed chip exists", body.includes('{ label: `${reviewedCount} reviewed`, state: "reviewed" }')],
  ["not synced chip exists", body.includes('{ label: `${notSyncedCount} not synced`, state: "idle" }')],
  ["status chips expose list semantics", body.includes('role="list" aria-label="CRM sync status counts"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM sync status chip render test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM sync status chip render test passed.");
