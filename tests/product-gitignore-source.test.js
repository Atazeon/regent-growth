const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");

const checks = [
  ["node_modules ignored", ignore.includes("node_modules/")],
  ["env ignored", ignore.includes(".env") && ignore.includes(".env.*")],
  ["shared prospects ignored", ignore.includes("data/shared-prospects.json")],
  ["backups ignored", ignore.includes("data/backups/")],
  ["editor files ignored", ignore.includes(".vscode/") && ignore.includes(".idea/")],
  ["build output ignored", ignore.includes("dist/") && ignore.includes("build/")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product gitignore test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product gitignore test passed.");
