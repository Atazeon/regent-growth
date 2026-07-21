const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["storage key exists", app.includes('const crmChecklistStorageKey = "regent-growth-crm-checklist";')],
  ["input helper exists", app.includes("function getCrmChecklistInputs()")],
  ["state loader exists", app.includes("function loadCrmChecklistState()")],
  ["state saver exists", app.includes("function saveCrmChecklistState()")],
  ["state restore exists", app.includes("function restoreCrmChecklistState()")],
  ["state binder exists", app.includes("function bindCrmChecklistState()")],
  ["changes saved", app.includes('input.addEventListener("change", saveCrmChecklistState)')],
  ["binder initialized", app.includes("bindCrmChecklistState();\nrenderPromptTemplates();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist saved state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist saved state test passed.");
