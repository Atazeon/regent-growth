const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function saveCrmChecklistState()");
const end = app.indexOf("function restoreCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["save function exists", start !== -1],
  ["save loads previous checklist state", body.includes("const previousState = loadCrmChecklistState();")],
  ["save detects completed checklist", body.includes("const completed = inputs.length > 0 && inputs.every((input) => input.checked);")],
  ["save preserves existing completed timestamp", body.includes('state.__completedAt = completed ? previousState.__completedAt || new Date().toISOString() : "";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion timestamp preservation test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion timestamp preservation test passed.");
