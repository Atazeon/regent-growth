const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["status helper exists", app.includes("function getCrmChecklistActionStatus(action)")],
  ["status helper uses record counts", app.includes("const { completedCount, totalCount, completionPercent } = getCrmChecklistSummaryRecord();")],
  ["status includes percent", app.includes("return `${action} CRM checklist (${completedCount}/${totalCount}, ${completionPercent}%).`;")],
  ["copy summary uses status", app.includes('copiedDirectly ? getCrmChecklistActionStatus("Copied") : getCrmChecklistActionStatus("Selected and copied")')],
  ["download summary uses status", app.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded"));')],
  ["copy json uses status", app.includes('copiedDirectly ? getCrmChecklistActionStatus("Copied JSON") : getCrmChecklistActionStatus("Selected and copied JSON")')],
  ["download json uses status", app.includes('setDataStatus(getCrmChecklistActionStatus("Downloaded JSON"));')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action status message test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action status message test passed.");
