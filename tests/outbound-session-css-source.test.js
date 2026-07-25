const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["stats styled", css.includes(".outbound-session-stats")],
  ["list styled", css.includes(".outbound-session-list")],
  ["item styled", css.includes(".outbound-session-item")],
  ["notes form styled", css.includes(".outbound-session-notes-form")],
  ["mobile grid support", css.includes(".outbound-session-stats,\n  .outbound-session-list,\n  .outbound-session-notes-form")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session CSS test passed.");
