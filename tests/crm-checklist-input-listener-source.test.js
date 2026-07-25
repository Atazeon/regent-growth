const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function bindCrmChecklistState()");
const end = app.indexOf("function resetCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["bind function exists", start !== -1],
  ["bind restores checklist state first", body.includes("restoreCrmChecklistState();")],
  ["bind iterates checklist inputs", body.includes("getCrmChecklistInputs().forEach((input) =>")],
  ["bind saves on input changes", body.includes('input.addEventListener("change", saveCrmChecklistState)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist input listener test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist input listener test passed.");
