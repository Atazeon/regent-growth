const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateSelectedReviewedCrmActionHint(selectedProspect, selectedIsWarm)");
const end = app.indexOf("function formatCrmRetryEmptyState", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected reviewed hint function exists", start !== -1],
  ["selected reviewed state calculated", body.includes('const selectedIsReviewed = selectedProspect?.crmSyncStatus === "Retry Reviewed";')],
  ["selected reviewed button disabled unless reviewed and warm", body.includes("!(selectedIsReviewed && selectedIsWarm),")],
  ["missing selection hint exists", body.includes('"Select a reviewed CRM sync before requeueing one record"')],
  ["cold selection hint exists", body.includes("? `${selectedProspect.company} is not warm or CRM-ready`")],
  ["reviewed selection hint exists", body.includes("? `Requeue reviewed CRM sync for ${selectedProspect.company}`")],
  ["non-reviewed selection hint exists", body.includes(": `${selectedProspect.company} is not marked CRM reviewed`")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM selected reviewed action hint branches test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM selected reviewed action hint branches test passed.");
