const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["previous state loaded", app.includes("const previousState = loadCrmChecklistState();")],
  ["completed state calculated", app.includes("const completed = inputs.length > 0 && inputs.every((input) => input.checked);")],
  ["completed timestamp stored", app.includes("state.__completedAt = completed ? previousState.__completedAt || new Date().toISOString() : \"\";")],
  ["completed timestamp exported", app.includes("completedAt: loadCrmChecklistState().__completedAt || \"\",")],
  ["state still saved", app.includes("localStorage.setItem(crmChecklistStorageKey, JSON.stringify(state));")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion timestamp test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion timestamp test passed.");
