const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["sync group has priority class", html.includes('class="setup-action-group setup-action-group-primary" role="group" aria-labelledby="crmSyncActionsLabel"')],
  ["cleanup group has maintenance class", html.includes('class="setup-action-group setup-action-group-maintenance" role="group" aria-labelledby="crmCleanupActionsLabel"')],
  ["priority group styled", styles.includes(".setup-action-group-primary {\n  border-color: #2f6f94;")],
  ["priority group has distinct background", styles.includes("background: #f4fbfd;")],
  ["maintenance group styled", styles.includes(".setup-action-group-maintenance {\n  border-color: #d7b98b;")],
  ["maintenance group has distinct background", styles.includes("background: #fffaf2;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup action priority test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup action priority test passed.");
