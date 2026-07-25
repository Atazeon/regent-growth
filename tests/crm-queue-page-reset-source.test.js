const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function resetCrmQueuePages(queue = \"all\")");
const end = app.indexOf("function renderCrmSyncStatusChips", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["page reset function exists", start !== -1],
  ["page reset supports all queues", body.includes('function resetCrmQueuePages(queue = "all")')],
  ["page reset clears failed page", body.includes('if (queue === "all" || queue === "failed")')],
  ["failed page reset to zero", body.includes("crmFailedQueuePage = 0;")],
  ["page reset clears reviewed page", body.includes('if (queue === "all" || queue === "reviewed")')],
  ["reviewed page reset to zero", body.includes("crmReviewedQueuePage = 0;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM queue page reset test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM queue page reset test passed.");
