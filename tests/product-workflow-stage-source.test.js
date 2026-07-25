const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const stages = ["Research", "Email Drafted", "Sequence", "LinkedIn", "Call", "Meeting", "Assessment"];
const checks = stages.map((stage) => [`${stage} stage present`, app.includes(`"${stage}"`) && html.includes(stage)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product workflow stage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product workflow stage test passed.");
