const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy json button", html.includes('id="copyResearchJsonButton"')],
  ["button selector", app.includes('const copyResearchJsonButton = document.querySelector("#copyResearchJsonButton");')],
  ["disabled with research controls", app.includes("copyResearchJsonButton.disabled = disabled;")],
  ["clipboard fallback helper", app.includes("async function copyTextWithFallback(text)")],
  ["clipboard write", app.includes("await navigator.clipboard.writeText(text);")],
  ["fallback textarea", app.includes('document.createElement("textarea")')],
  ["copy json function", app.includes("async function copyResearchJson()")],
  ["empty guard", app.includes("No research brief to copy as JSON for ${prospect.company}.")],
  ["json copy payload", app.includes("JSON.stringify(getProspectResearchExportRecord(prospect), null, 2)")],
  ["click listener", app.includes('copyResearchJsonButton.addEventListener("click", copyResearchJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research JSON copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research JSON copy test passed.");
