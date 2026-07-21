const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const labelIds = [
  "crmConnectionActionsLabel",
  "crmSyncActionsLabel",
  "crmRetryActionsLabel",
  "crmExportActionsLabel",
  "crmSummaryActionsLabel",
  "crmCleanupActionsLabel"
];

const checks = [
  ["sr-only helper exists", styles.includes(".sr-only {\n  position: absolute;")],
  ["sr-only stays accessible", styles.includes("clip: rect(0, 0, 0, 0);")],
  ...labelIds.map((id) => [`${id} referenced`, html.includes(`aria-labelledby="${id}"`)]),
  ...labelIds.map((id) => [`${id} hidden`, html.includes(`id="${id}" class="sr-only"`)])
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup group labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup group labels test passed.");
