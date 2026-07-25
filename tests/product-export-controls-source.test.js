const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const ids = [
  "exportButton",
  "exportEmailDraftButton",
  "exportEmailJsonButton",
  "exportFailedCrmButton",
  "exportFailedCrmCsvButton",
  "exportReviewedCrmButton",
  "exportReviewedCrmCsvButton",
  "downloadCrmStatusSummaryButton",
  "downloadCrmStatusJsonButton"
];

const checks = ids.map((id) => [`${id} export control exists`, html.includes(`id="${id}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product export controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product export controls test passed.");
