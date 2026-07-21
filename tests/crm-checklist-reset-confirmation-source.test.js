const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["cleared count calculated", app.includes("const clearedCount = getCrmChecklistInputs().filter((input) => input.checked).length;")],
  ["reset status includes count", app.includes("`CRM checklist reset. Cleared ${clearedCount} completed item${clearedCount === 1 ? \"\" : \"s\"}.`")],
  ["reset still removes storage", app.includes("localStorage.removeItem(crmChecklistStorageKey);")],
  ["reset still updates progress", app.includes("updateCrmChecklistProgress();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist reset confirmation test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist reset confirmation test passed.");
