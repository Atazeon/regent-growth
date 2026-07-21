const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmChecklistProgress()");
const end = app.indexOf("function formatCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["progress function exists", start !== -1],
  ["export buttons are grouped for aria refresh", body.includes("[copyCrmChecklistButton, copyCrmChecklistJsonButton, downloadCrmChecklistButton, downloadCrmChecklistJsonButton].forEach((button) => {\n    button.setAttribute(\"aria-label\", button.title);")],
  ["copy title refreshed before aria", body.indexOf("copyCrmChecklistButton.title =") !== -1 && body.indexOf("copyCrmChecklistButton.title =") < body.indexOf('button.setAttribute("aria-label", button.title);')],
  ["download title refreshed before aria", body.indexOf("downloadCrmChecklistButton.title =") !== -1 && body.indexOf("downloadCrmChecklistButton.title =") < body.indexOf('button.setAttribute("aria-label", button.title);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export button aria test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export button aria test passed.");
