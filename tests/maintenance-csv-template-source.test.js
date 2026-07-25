const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const csv = fs.readFileSync(path.join(root, "data", "prospect-import-template.csv"), "utf8");
const header = csv.split(/\r?\n/)[0];

const requiredHeaders = ["company", "industry", "website", "decisionMaker", "contactEmail", "score", "trigger", "fit", "stage"];
const checks = requiredHeaders.map((field) => [`CSV template has ${field}`, header.split(",").includes(field)]);
checks.push(["CSV template has sample row", csv.split(/\r?\n/).filter(Boolean).length > 1]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance CSV template test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance CSV template test passed.");
