const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function requeueReviewedCrmSyncs()");
const end = app.indexOf("function requeueSelectedReviewedCrmSync()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["requeue reviewed function exists", start !== -1],
  ["requeue reviewed reads reviewed leads", body.includes("const reviewedCrmLeads = getReviewedCrmSyncLeads();")],
  ["requeue reviewed guards empty queue", body.includes("if (reviewedCrmLeads.length === 0) {")],
  ["requeue reviewed reports empty queue", body.includes('"No reviewed CRM syncs to requeue."')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed requeue guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed requeue guard test passed.");
