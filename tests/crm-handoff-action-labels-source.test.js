const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy packet label exists", html.includes('title="Copy the selected CRM handoff packet" aria-label="Copy the selected CRM handoff packet"')],
  ["copy mapping label exists", html.includes('title="Copy the selected CRM field mapping JSON" aria-label="Copy the selected CRM field mapping JSON"')],
  ["mark ready label exists", html.includes('title="Mark the selected account CRM ready" aria-label="Mark the selected account CRM ready"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff action labels test passed.");
