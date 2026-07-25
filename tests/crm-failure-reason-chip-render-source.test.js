const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmFailureReasonChips(failedCrmLeads)");
const end = app.indexOf("function filterCrmLeadsByReason(failedCrmLeads)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failure reason chips function exists", start !== -1],
  ["chips read reason counts", body.includes("const counts = getCrmFailureReasonCounts(failedCrmLeads);")],
  ["chips sort groups by count then label", body.includes("second[1] - first[1] || first[0].localeCompare(second[0])")],
  ["chips hide empty groups", body.includes("if (groups.length === 0) return \"\";")],
  ["chips render all filter", body.includes('data-reason="all"')],
  ["chips render group filters", body.includes('data-action="set-crm-reason-filter"')],
  ["chips expose filter group label", body.includes('aria-label="CRM failure reason filters"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failure reason chip render test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failure reason chip render test passed.");
