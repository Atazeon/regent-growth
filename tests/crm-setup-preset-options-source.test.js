const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const presetIds = ["webhook", "hubspot", "pipedrive", "airtable", "custom"];

const checks = [
  ["preset select exists", html.includes('<select id="crmPresetSelect">')],
  ...presetIds.map((id) => [`${id} option exists`, html.includes(`<option value="${id}">`)]),
  ...presetIds.map((id) => [`${id} preset exists`, app.includes(`${id}: {`)])
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup preset options test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup preset options test passed.");
