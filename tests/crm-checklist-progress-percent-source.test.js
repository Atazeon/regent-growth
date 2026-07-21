const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const updateStart = app.indexOf("function updateCrmChecklistProgress()");
const updateEnd = app.indexOf("function formatCrmChecklistSummary()", updateStart);
const updateBody = updateStart === -1 || updateEnd === -1 ? "" : app.slice(updateStart, updateEnd);

const checks = [
  ["progress helper exists", updateStart !== -1],
  ["progress percent calculated", updateBody.includes("const completionPercent = inputs.length ? Math.round((completed / inputs.length) * 100) : 0;")],
  ["visible progress shows percent", updateBody.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`;")],
  ["complete message retained", updateBody.includes('? "Checklist complete"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist progress percent test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist progress percent test passed.");
