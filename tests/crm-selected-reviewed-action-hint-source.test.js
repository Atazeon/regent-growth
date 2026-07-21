const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["selected reviewed hint helper exists", app.includes("function updateSelectedReviewedCrmActionHint(selectedProspect, selectedIsWarm)")],
  ["selected reviewed status checked", app.includes('const selectedIsReviewed = selectedProspect?.crmSyncStatus === "Retry Reviewed";')],
  ["selected reviewed button uses action hint", app.includes("setCrmActionHint(\n    requeueSelectedReviewedCrmButton,")],
  ["missing selection hint exists", app.includes('"Select a reviewed CRM sync before requeueing one record"')],
  ["not warm hint exists", app.includes("`${selectedProspect.company} is not warm or CRM-ready`")],
  ["ready hint exists", app.includes("`Requeue reviewed CRM sync for ${selectedProspect.company}`")],
  ["not reviewed hint exists", app.includes("`${selectedProspect.company} is not marked CRM reviewed`")],
  ["handoff uses selected helper", app.includes("updateSelectedReviewedCrmActionHint(selectedProspect, selectedIsWarm);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM selected reviewed action hint test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM selected reviewed action hint test passed.");
