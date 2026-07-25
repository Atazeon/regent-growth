const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function markEmailSent()");
const end = app.indexOf("function getWarmLeads()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["mark sent helper exists", start !== -1],
  ["mark sent saves draft first", body.includes("const prospect = saveCurrentEmailDraft();")],
  ["mark sent checks readiness", body.includes("const readiness = getEmailSendReadiness(prospect);")],
  ["mark sent blocks unreadiness", body.includes("Cannot mark sent yet: ${readiness.issues.join(\" \")}")],
  ["mark sent sets last touch", body.includes("prospect.lastTouch = getTodayString();")],
  ["mark sent schedules next touch", body.includes("prospect.nextTouch = addDays(prospect.lastTouch, 2);")],
  ["mark sent marks contacted", body.includes('prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Contacted" : prospect.responseStatus;')],
  ["mark sent advances to sequence", body.includes('stageOrder.indexOf("Sequence")')],
  ["mark sent records audit note", body.includes("Email marked sent to ${readiness.recipient}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email mark sent test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email mark sent test passed.");
