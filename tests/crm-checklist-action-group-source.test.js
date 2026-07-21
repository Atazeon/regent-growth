const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["checklist actions grouped", html.includes('<div class="checklist-heading-actions" role="group" aria-label="CRM checklist actions">')],
  ["copy action retained", html.includes('id="copyCrmChecklistButton"')],
  ["download action retained", html.includes('id="downloadCrmChecklistButton"')],
  ["json actions retained", html.includes('id="copyCrmChecklistJsonButton"') && html.includes('id="downloadCrmChecklistJsonButton"')],
  ["reset action retained", html.includes('id="resetCrmChecklistButton"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action group test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action group test passed.");
