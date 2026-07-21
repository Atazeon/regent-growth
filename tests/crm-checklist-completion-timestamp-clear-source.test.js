const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function saveCrmChecklistState()");
const end = app.indexOf("function restoreCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["save function exists", start !== -1],
  ["save detects incomplete checklist", body.includes("const completed = inputs.length > 0 && inputs.every((input) => input.checked);")],
  ["save clears completed timestamp when incomplete", body.includes('state.__completedAt = completed ? previousState.__completedAt || new Date().toISOString() : "";')],
  ["save persists cleared timestamp", body.includes("localStorage.setItem(crmChecklistStorageKey, JSON.stringify(state));")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion timestamp clear test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion timestamp clear test passed.");
