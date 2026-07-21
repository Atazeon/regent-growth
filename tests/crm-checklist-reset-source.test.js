const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reset button exists", html.includes('<button id="resetCrmChecklistButton" class="secondary-button" type="button" title="Clear saved CRM checklist progress" aria-label="Clear saved CRM checklist progress">Reset checklist</button>')],
  ["checklist heading wrapper exists", html.includes('<div class="checklist-heading">')],
  ["heading style exists", styles.includes(".checklist-heading {\n  align-items: center;")],
  ["reset button selected", app.includes('const resetCrmChecklistButton = document.querySelector("#resetCrmChecklistButton");')],
  ["reset function exists", app.includes("function resetCrmChecklistState()")],
  ["reset removes storage", app.includes("localStorage.removeItem(crmChecklistStorageKey);")],
  ["reset clears boxes", app.includes("input.checked = false;")],
  ["reset listener exists", app.includes('resetCrmChecklistButton.addEventListener("click", resetCrmChecklistState);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist reset test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist reset test passed.");
