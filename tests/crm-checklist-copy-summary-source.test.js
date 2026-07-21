const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["copy button exists", html.includes('<button id="copyCrmChecklistButton" class="secondary-button" type="button" title="Copy CRM checklist summary" aria-label="Copy CRM checklist summary">Copy</button>')],
  ["copy button selected", app.includes('const copyCrmChecklistButton = document.querySelector("#copyCrmChecklistButton");')],
  ["summary formatter exists", app.includes("function formatCrmChecklistSummary()")],
  ["summary includes checked markers", app.includes('${input.checked ? "[x]" : "[ ]"} ${input.parentElement.textContent.trim()}')],
  ["copy helper used", app.includes("await copyTextWithFallback(formatCrmChecklistSummary());")],
  ["copy listener exists", app.includes('copyCrmChecklistButton.addEventListener("click", copyCrmChecklistSummary);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist copy summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist copy summary test passed.");
