const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy json button", html.includes('id="copyCrmStatusJsonButton"')],
  ["button selector", app.includes('const copyCrmStatusJsonButton = document.querySelector("#copyCrmStatusJsonButton");')],
  ["copy function", app.includes("async function copyCrmStatusJson()")],
  ["json payload", app.includes("JSON.stringify(getCrmStatusSummaryRecord(), null, 2)")],
  ["clipboard helper", app.includes("await copyTextWithFallback(JSON.stringify(getCrmStatusSummaryRecord(), null, 2));")],
  ["direct status", app.includes("CRM sync summary JSON copied.")],
  ["fallback status", app.includes("CRM sync summary JSON selected and copied.")],
  ["click listener", app.includes('copyCrmStatusJsonButton.addEventListener("click", copyCrmStatusJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status JSON copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status JSON copy test passed.");
