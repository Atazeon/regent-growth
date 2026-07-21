const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["handoff row exists", styles.includes(".email-handoff {\n  display: flex;")],
  ["handoff row aligned", styles.includes(".email-handoff {\n  display: flex;\n  align-items: center;")],
  ["handoff row wraps", styles.includes("flex-wrap: wrap;")],
  ["handoff button stable height", styles.includes(".email-handoff button {\n  min-height: 38px;")],
  ["handoff button nowrap", styles.includes(".email-handoff button {\n  min-height: 38px;\n  padding: 0 12px;\n  white-space: nowrap;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email handoff CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email handoff CSS test passed.");
