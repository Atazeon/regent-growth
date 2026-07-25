const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const summaryStart = app.indexOf("async function copyCrmChecklistSummary()");
const summaryEnd = app.indexOf("function getCrmChecklistExportStamp()", summaryStart);
const jsonStart = app.indexOf("async function copyCrmChecklistJson()");
const jsonEnd = app.indexOf("function getProspectFieldNames()", jsonStart);
const summaryBody = summaryStart === -1 || summaryEnd === -1 ? "" : app.slice(summaryStart, summaryEnd);
const jsonBody = jsonStart === -1 || jsonEnd === -1 ? "" : app.slice(jsonStart, jsonEnd);

const checks = [
  ["summary copy function exists", summaryStart !== -1],
  ["json copy function exists", jsonStart !== -1],
  ["summary copy stores helper result", summaryBody.includes("const copiedDirectly = await copyTextWithFallback(formatCrmChecklistSummary());")],
  ["summary copy branches on helper result", summaryBody.includes("setDataStatus(copiedDirectly ? getCrmChecklistActionStatus(\"Copied\") : getCrmChecklistActionStatus(\"Selected and copied\"));")],
  ["json copy stores helper result", jsonBody.includes("const copiedDirectly = await copyTextWithFallback(JSON.stringify(getCrmChecklistSummaryRecord(), null, 2));")],
  ["json copy branches on helper result", jsonBody.includes("setDataStatus(copiedDirectly ? getCrmChecklistActionStatus(\"Copied JSON\") : getCrmChecklistActionStatus(\"Selected and copied JSON\"));")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist copy fallback branch test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist copy fallback branch test passed.");
