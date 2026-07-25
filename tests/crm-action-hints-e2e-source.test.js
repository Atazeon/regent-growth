const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmSyncActionHints()");
const end = app.indexOf("function updateCrmRetryActionHints", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM action hint helper exists", start !== -1],
  ["hint reads selected prospect", body.includes("const selectedProspect = getSelectedProspect();")],
  ["hint checks warm selection", body.includes("const selectedIsWarm = selectedProspect ? isWarmLead(selectedProspect) : false;")],
  ["hint reads warm leads", body.includes("const warmLeads = getWarmLeads();")],
  ["hint disables while syncing", body.includes("CRM sync is already running")],
  ["hint labels selected sync", body.includes("Sync the selected warm lead to CRM")],
  ["hint blocks non-warm selected sync", body.includes("Select or mark a warm lead before syncing the selected account")],
  ["hint labels bulk sync", body.includes("Sync all CRM-ready warm leads")],
  ["hint blocks empty bulk sync", body.includes("Mark at least one warm lead CRM ready before syncing all warm leads")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM action hints e2e test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM action hints e2e test passed.");
