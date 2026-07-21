const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["action row wraps", styles.includes(".action-row {\n  flex-wrap: wrap;")],
  ["action row right aligned", styles.includes("justify-content: flex-end;")],
  ["compact action gap", styles.includes("gap: 10px;")],
  ["button height stable", styles.includes(".action-row button {\n  min-height: 38px;")],
  ["button text stays intact", styles.includes("white-space: nowrap;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research toolbar CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research toolbar CSS test passed.");
