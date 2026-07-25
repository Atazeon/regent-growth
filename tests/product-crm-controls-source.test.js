const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const ids = [
  "checkCrmSetupButton",
  "syncSelectedCrmButton",
  "syncWarmCrmButton",
  "retryFailedCrmButton",
  "markReviewedCrmButton",
  "requeueSelectedReviewedCrmButton",
  "requeueReviewedCrmButton",
  "clearResolvedCrmButton",
  "clearCrmNotesButton"
];

const checks = ids.map((id) => [`${id} CRM control exists`, html.includes(`id="${id}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product CRM controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product CRM controls test passed.");
