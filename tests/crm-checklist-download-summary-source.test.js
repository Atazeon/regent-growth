const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["download button exists", html.includes('<button id="downloadCrmChecklistButton" class="secondary-button" type="button" title="Download CRM checklist summary" aria-label="Download CRM checklist summary">Download checklist</button>')],
  ["download button selected", app.includes('const downloadCrmChecklistButton = document.querySelector("#downloadCrmChecklistButton");')],
  ["download function exists", app.includes("function downloadCrmChecklistSummary()")],
  ["download filename exists", app.includes("`regent-growth-crm-checklist-${stamp}.txt`")],
  ["download uses formatter", app.includes('downloadFile(`regent-growth-crm-checklist-${stamp}.txt`, formatCrmChecklistSummary(), "text/plain;charset=utf-8");')],
  ["download listener exists", app.includes('downloadCrmChecklistButton.addEventListener("click", downloadCrmChecklistSummary);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist download summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist download summary test passed.");
