const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const ignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");

const checks = [
  ["env files ignored", ignore.includes(".env") && ignore.includes(".env.*")],
  ["shared data ignored", ignore.includes("data/shared-prospects.json")],
  ["backup data ignored", ignore.includes("data/backups/")],
  ["README uses placeholder CRM key", readme.includes('"your_api_key"')],
  ["README does not include real private key", !/sk-[A-Za-z0-9]{20,}/.test(readme)],
  ["README describes secrets", readme.includes("Data And Secrets")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance no-secrets test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance no-secrets test passed.");
