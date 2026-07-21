const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["clipboard helper exists", app.includes("async function copyTextWithFallback(text)")],
  ["email copy uses helper", app.includes("await copyTextWithFallback(draft);")],
  ["brief copy uses helper", app.includes("await copyTextWithFallback(prospect.aiBrief);")],
  ["json copy uses helper", app.includes("await copyTextWithFallback(JSON.stringify(getProspectResearchExportRecord(prospect), null, 2));")],
  ["email json copy uses helper", app.includes("await copyTextWithFallback(JSON.stringify(getEmailDraftExportRecord(prospect, draft), null, 2));")],
  ["crm summary copy uses helper", app.includes("await copyTextWithFallback(summary);")],
  ["email fallback status", app.includes("Email draft selected and copied for ${prospect.company}.")],
  ["brief fallback status", app.includes("Research brief selected and copied for ${prospect.company}.")],
  ["json fallback status", app.includes("Research JSON selected and copied for ${prospect.company}.")],
  ["email json fallback status", app.includes("Email draft JSON selected and copied for ${prospect.company}.")],
  ["crm summary fallback status", app.includes("CRM sync summary selected and copied.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Clipboard helper reuse test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Clipboard helper reuse test passed.");
