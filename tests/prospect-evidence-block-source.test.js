const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["helper exists", app.includes("function appendProspectEvidenceBlock(prospect, title, evidence)")],
  ["evidence text normalized", app.includes('const evidenceText = String(evidence || "").trim();')],
  ["duplicate guard", app.includes('(prospect.aiBrief || "").includes(evidenceText)')],
  ["empty duplicate return", app.includes('return "";')],
  ["timestamped heading", app.includes("`${title} (${formatDateTime(new Date().toISOString())})`")],
  ["evidence text used", app.includes("evidenceText\n  ].filter(Boolean).join(\"\\n\");")],
  ["blank lines between blocks", app.includes("`${prospect.aiBrief}\\n\\n${evidenceBlock}`")],
  ["returns block", app.includes("return evidenceBlock;")],
  ["website uses helper", app.includes('appendProspectEvidenceBlock(prospect, "Website evidence", evidenceTarget.sourceNotes);')],
  ["search uses helper", app.includes('appendProspectEvidenceBlock(prospect, "Source search evidence", formatSearchEvidence(result));')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Prospect evidence block test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Prospect evidence block test passed.");
