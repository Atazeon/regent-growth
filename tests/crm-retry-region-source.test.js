const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["retry queue is labelled region", html.includes('<div id="crmRetryQueue" class="crm-retry-queue" role="region" aria-label="CRM retry queue">')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry region test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry region test passed.");
