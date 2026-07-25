const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function showReviewedCrmSyncs()");
const end = app.indexOf("function openReviewedCrmSync(index)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["show reviewed function exists", start !== -1],
  ["show reviewed resets reviewed page", body.includes('resetCrmQueuePages("reviewed");')],
  ["show reviewed activates view", body.includes('savedViews.dataset.activeView = "crm-reviewed";')],
  ["show reviewed clears stage filter", body.includes('stageFilter.value = "all";')],
  ["show reviewed clears response filter", body.includes('responseFilter.value = "all";')],
  ["show reviewed renders prospects", body.includes("renderProspects();")],
  ["show reviewed reports data status", body.includes('setDataStatus("Showing warm leads with reviewed CRM sync failures.");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed show view test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed show view test passed.");
