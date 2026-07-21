const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function resetCrmChecklistState()");
const end = app.indexOf("function updateCrmChecklistProgress()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reset function exists", start !== -1],
  ["reset clears saved checklist state", body.includes("localStorage.removeItem(crmChecklistStorageKey);")],
  ["reset clears checked inputs", body.includes("input.checked = false;")],
  ["reset refreshes progress", body.includes("updateCrmChecklistProgress();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist reset progress refresh test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist reset progress refresh test passed.");
