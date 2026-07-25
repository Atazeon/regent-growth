const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function downloadCrmStatusSummary()");
const end = app.indexOf("function downloadCrmStatusJson()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["download CRM status summary function exists", start !== -1],
  ["download summary creates exported timestamp", body.includes("const exportedAt = new Date().toISOString();")],
  ["download summary creates safe stamp", body.includes('const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");')],
  ["download summary writes text file", body.includes("downloadFile(`regent-growth-crm-summary-${stamp}.txt`, formatCrmStatusSummary(), \"text/plain;charset=utf-8\");")],
  ["download summary reports status", body.includes('setCrmSetupStatus("Downloaded CRM sync summary.");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status summary download test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status summary download test passed.");
