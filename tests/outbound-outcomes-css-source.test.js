const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["outcome form styled", css.includes(".outbound-outcome-form")],
  ["outcome heading styled", css.includes(".outbound-outcome-heading")],
  ["outcome list styled", css.includes(".outbound-outcome-list")],
  ["outcome item grid", css.includes(".outbound-outcome-list article")],
  ["mobile support", css.includes(".outbound-outcome-form,\n  .outbound-outcome-list article")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes CSS test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes CSS test passed.");
