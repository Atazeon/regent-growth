const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["progress element exists", html.includes('<span id="crmChecklistProgress" class="checklist-progress" aria-live="polite">0 of 8 complete</span>')],
  ["heading actions wrapper exists", html.includes('<div class="checklist-heading-actions">')],
  ["progress style exists", styles.includes(".checklist-progress {\n  color: var(--muted);")],
  ["progress selected", app.includes('const crmChecklistProgress = document.querySelector("#crmChecklistProgress");')],
  ["progress helper exists", app.includes("function updateCrmChecklistProgress()")],
  ["progress counts checked inputs", app.includes("const completed = inputs.filter((input) => input.checked).length;")],
  ["save updates progress", app.includes("localStorage.setItem(crmChecklistStorageKey, JSON.stringify(state));\n  updateCrmChecklistProgress();")],
  ["restore updates progress", app.includes("input.checked = Boolean(state[input.id]);\n  });\n  updateCrmChecklistProgress();")],
  ["reset updates progress", app.includes('setDataStatus("CRM checklist progress reset.");\n  updateCrmChecklistProgress();')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist progress test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist progress test passed.");
