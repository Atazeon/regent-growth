const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmChecklistProgress()");
const end = app.indexOf("function formatCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);
const titleIndex = body.indexOf("resetCrmChecklistButton.title = completed === 0");
const ariaIndex = body.indexOf('resetCrmChecklistButton.setAttribute("aria-label", resetCrmChecklistButton.title);');

const checks = [
  ["progress function exists", start !== -1],
  ["reset title changes with progress", titleIndex !== -1],
  ["reset aria mirrors title", ariaIndex !== -1],
  ["reset title set before aria", titleIndex !== -1 && ariaIndex !== -1 && titleIndex < ariaIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist reset button aria test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist reset button aria test passed.");
