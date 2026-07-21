const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function restoreCrmChecklistState()");
const end = app.indexOf("function bindCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["restore function exists", start !== -1],
  ["restore loads checklist state", body.includes("const state = loadCrmChecklistState();")],
  ["restore applies checked state", body.includes("input.checked = Boolean(state[input.id]);")],
  ["restore refreshes progress", body.includes("updateCrmChecklistProgress();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist restore progress refresh test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist restore progress refresh test passed.");
