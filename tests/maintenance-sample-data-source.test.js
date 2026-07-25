const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const samplePath = path.join(root, "data", "sample-prospects.json");
const sample = JSON.parse(fs.readFileSync(samplePath, "utf8"));

const checks = [
  ["sample data is array", Array.isArray(sample)],
  ["sample data has at least three records", sample.length >= 3],
  ["sample records have company", sample.every((record) => record.company)],
  ["sample records have stage", sample.every((record) => record.stage)],
  ["sample records have response status", sample.every((record) => record.responseStatus)],
  ["sample records have fit reason", sample.every((record) => record.fit)]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance sample data test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance sample data test passed.");
