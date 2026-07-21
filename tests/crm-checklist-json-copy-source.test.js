const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["copy json button exists", html.includes('<button id="copyCrmChecklistJsonButton" class="secondary-button" type="button" title="Copy CRM checklist JSON" aria-label="Copy CRM checklist JSON">Copy JSON</button>')],
  ["copy json button selected", app.includes('const copyCrmChecklistJsonButton = document.querySelector("#copyCrmChecklistJsonButton");')],
  ["copy json function exists", app.includes("async function copyCrmChecklistJson()")],
  ["copy json uses record", app.includes("await copyTextWithFallback(JSON.stringify(getCrmChecklistSummaryRecord(), null, 2));")],
  ["copy json listener exists", app.includes('copyCrmChecklistJsonButton.addEventListener("click", copyCrmChecklistJson);')],
  ["copy json status exists", app.includes('"CRM checklist JSON copied."')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON copy test passed.");
