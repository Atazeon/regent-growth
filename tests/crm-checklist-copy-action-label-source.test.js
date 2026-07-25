const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const textStart = app.indexOf("async function copyCrmChecklistSummary()");
const textEnd = app.indexOf("function getCrmChecklistExportStamp()", textStart);
const jsonStart = app.indexOf("async function copyCrmChecklistJson()");
const jsonEnd = app.indexOf("function getProspectFieldNames()", jsonStart);
const textBody = textStart === -1 || textEnd === -1 ? "" : app.slice(textStart, textEnd);
const jsonBody = jsonStart === -1 || jsonEnd === -1 ? "" : app.slice(jsonStart, jsonEnd);

const checks = [
  ["summary copy function exists", textStart !== -1],
  ["json copy function exists", jsonStart !== -1],
  ["summary direct copy label used", textBody.includes('getCrmChecklistActionStatus("Copied")')],
  ["summary fallback copy label used", textBody.includes('getCrmChecklistActionStatus("Selected and copied")')],
  ["json direct copy label used", jsonBody.includes('getCrmChecklistActionStatus("Copied JSON")')],
  ["json fallback copy label used", jsonBody.includes('getCrmChecklistActionStatus("Selected and copied JSON")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist copy action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist copy action label test passed.");
