const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checklistIds = [
  "crmChecklistDecisionMaker",
  "crmChecklistResearch",
  "crmChecklistEmail",
  "crmChecklistFollowUp",
  "crmChecklistLinkedIn",
  "crmChecklistPhone",
  "crmChecklistMeeting",
  "crmChecklistAssessment"
];

const checks = checklistIds.flatMap((id) => [
  [`${id} label`, html.includes(`for="${id}"`)],
  [`${id} input`, html.includes(`id="${id}" name="${id}" type="checkbox"`)]
]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist item labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist item labels test passed.");
