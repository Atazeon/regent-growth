const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function saveCrmChecklistState()");
const end = app.indexOf("function restoreCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["save function exists", start !== -1],
  ["save reads checklist inputs", body.includes("const inputs = getCrmChecklistInputs();")],
  ["save persists checklist state", body.includes("localStorage.setItem(crmChecklistStorageKey, JSON.stringify(state));")],
  ["save refreshes progress", body.includes("updateCrmChecklistProgress();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist save progress refresh test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist save progress refresh test passed.");
