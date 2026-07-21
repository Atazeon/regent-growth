const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reset disabled when empty", app.includes("resetCrmChecklistButton.disabled = completed === 0;")],
  ["empty reset hint exists", app.includes('"No CRM checklist progress to clear"')],
  ["active reset hint exists", app.includes('"Clear saved CRM checklist progress"')],
  ["reset aria updated", app.includes('resetCrmChecklistButton.setAttribute("aria-label", resetCrmChecklistButton.title);')],
  ["progress helper owns reset state", app.includes("function updateCrmChecklistProgress()")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist reset state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist reset state test passed.");
