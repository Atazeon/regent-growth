const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["progress state set", app.includes('crmChecklistProgress.dataset.state = completed === inputs.length ? "complete" : "active";')],
  ["complete style exists", styles.includes('.checklist-progress[data-state="complete"] {\n  color: #247247;')],
  ["base progress style retained", styles.includes(".checklist-progress {\n  color: var(--muted);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion style test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion style test passed.");
