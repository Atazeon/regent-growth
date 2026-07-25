const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const statuses = ["Not Contacted", "Contacted", "Replied", "Interested", "Meeting Booked", "Not Interested", "No Response"];
const checks = statuses.map((status) => [`${status} response status present`, app.includes(`"${status}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product response status test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product response status test passed.");
