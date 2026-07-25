const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["README documents CRM env URL", readme.includes("REGENT_CRM_API_URL")],
  ["README documents CRM env key", readme.includes("REGENT_CRM_API_KEY")],
  ["README documents CRM sync flow", readme.includes("forwards them to your configured CRM endpoint")],
  ["app has CRM status endpoint", app.includes('const crmStatusEndpoint = "/api/crm-status";')],
  ["app has CRM sync endpoint", app.includes('const crmSyncEndpoint = "/api/crm-sync";')],
  ["app has CRM setup guidance", html.includes("CRM API Setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product CRM README test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product CRM README test passed.");
