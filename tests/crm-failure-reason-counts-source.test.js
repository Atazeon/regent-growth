const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmFailureReasonCounts(failedCrmLeads = getFailedCrmSyncLeads())");
const end = app.indexOf("function renderCrmFailureReasonChips(failedCrmLeads)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failure reason counts function exists", start !== -1],
  ["counts reduce failed leads", body.includes("return failedCrmLeads.reduce((counts, prospect) => {")],
  ["counts group latest notes", body.includes("const group = getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect));")],
  ["counts increments group", body.includes("counts[group] = (counts[group] || 0) + 1;")],
  ["counts returns accumulator", body.includes("return counts;")],
  ["counts starts empty object", body.includes("}, {});")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failure reason counts test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failure reason counts test passed.");
