const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const actionOrder = [
  "crmChecklistProgress",
  "copyCrmChecklistButton",
  "copyCrmChecklistJsonButton",
  "downloadCrmChecklistButton",
  "downloadCrmChecklistJsonButton",
  "resetCrmChecklistButton"
].map((id) => html.indexOf(id));

const checks = [
  ["all checklist actions exist", actionOrder.every((index) => index !== -1)],
  ["copy actions before downloads", actionOrder[1] < actionOrder[2] && actionOrder[2] < actionOrder[3]],
  ["downloads before reset", actionOrder[3] < actionOrder[4] && actionOrder[4] < actionOrder[5]]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action order test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action order test passed.");
