const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function bindCrmChecklistState()");
const end = app.indexOf("function resetCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);
const restoreIndex = body.indexOf("restoreCrmChecklistState();");
const listenerIndex = body.indexOf('getCrmChecklistInputs().forEach((input) => input.addEventListener("change", saveCrmChecklistState));');

const checks = [
  ["bind function exists", start !== -1],
  ["bind restores saved state", restoreIndex !== -1],
  ["bind attaches change listeners", listenerIndex !== -1],
  ["bind restores before listeners", restoreIndex !== -1 && listenerIndex !== -1 && restoreIndex < listenerIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist bind initialization order test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist bind initialization order test passed.");
