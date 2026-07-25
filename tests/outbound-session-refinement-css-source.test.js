const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["next action styled", css.includes(".outbound-session-next-action")],
  ["next action strong styled", css.includes(".outbound-session-next-action strong")],
  ["uses existing panel colors", css.includes("background: #eef8f6")],
  ["keeps rounded radius", css.includes(".outbound-session-next-action {\n  border: 1px solid var(--line);\n  border-radius: 8px;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session refinement CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session refinement CSS test passed.");
