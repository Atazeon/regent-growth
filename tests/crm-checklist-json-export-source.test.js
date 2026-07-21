const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["json button exists", html.includes('<button id="downloadCrmChecklistJsonButton" class="secondary-button" type="button" title="Download CRM checklist JSON" aria-label="Download CRM checklist JSON">Download JSON</button>')],
  ["json button selected", app.includes('const downloadCrmChecklistJsonButton = document.querySelector("#downloadCrmChecklistJsonButton");')],
  ["summary record exists", app.includes("function getCrmChecklistSummaryRecord()")],
  ["record includes completed count", app.includes("completedCount,\n    totalCount: items.length,")],
  ["record includes exported timestamp", app.includes("exportedAt: new Date().toISOString(),")],
  ["record includes completed timestamp", app.includes('completedAt: loadCrmChecklistState().__completedAt || "",')],
  ["record includes availability", app.includes("available: items.length > 0,")],
  ["record includes items", app.includes("items\n  };")],
  ["json download exists", app.includes("function downloadCrmChecklistJson()")],
  ["json download uses record", app.includes('JSON.stringify(getCrmChecklistSummaryRecord(), null, 2)')],
  ["json listener exists", app.includes('downloadCrmChecklistJsonButton.addEventListener("click", downloadCrmChecklistJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON export test passed.");
