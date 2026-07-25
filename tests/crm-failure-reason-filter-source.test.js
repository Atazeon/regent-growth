const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const filterStart = app.indexOf("function filterCrmLeadsByReason(failedCrmLeads)");
const filterEnd = app.indexOf("function setCrmFailureReasonFilter(reason)", filterStart);
const setStart = filterEnd;
const setEnd = app.indexOf("function getLatestCrmSyncNote(prospect)", setStart);
const filterBody = filterStart === -1 || filterEnd === -1 ? "" : app.slice(filterStart, filterEnd);
const setBody = setStart === -1 || setEnd === -1 ? "" : app.slice(setStart, setEnd);

const checks = [
  ["failure filter function exists", filterStart !== -1],
  ["all filter returns original leads", filterBody.includes('if (crmFailureReasonFilter === "all") return failedCrmLeads;')],
  ["specific filter compares reason group", filterBody.includes("getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect)) === crmFailureReasonFilter")],
  ["set filter function exists", setStart !== -1],
  ["set filter validates reason against counts", setBody.includes('crmFailureReasonFilter = reason === "all" || counts[reason] ? reason : "all";')],
  ["set filter resets failed page", setBody.includes('resetCrmQueuePages("failed");')],
  ["set filter rerenders prospects", setBody.includes("renderProspects();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failure reason filter test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failure reason filter test passed.");
