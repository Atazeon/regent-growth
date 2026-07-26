const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["heading styled", css.includes(".outbound-improvement-heading")],
  ["queue styled", css.includes(".outbound-improvement-queue")],
  ["resolved state styled", css.includes('.outbound-improvement-queue article[data-state="Resolved"]')],
  ["in progress state styled", css.includes('.outbound-improvement-queue article[data-state="In Progress"]')],
  ["mobile support", css.includes(".outbound-improvement-queue article")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements CSS test passed.");
