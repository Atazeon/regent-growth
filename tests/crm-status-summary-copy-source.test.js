const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function copyCrmStatusSummary()");
const end = app.indexOf("function downloadCrmStatusSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["copy CRM status summary function exists", start !== -1],
  ["copy summary formats text", body.includes("const summary = formatCrmStatusSummary();")],
  ["copy summary uses fallback helper", body.includes("const copiedDirectly = await copyTextWithFallback(summary);")],
  ["copy summary reports copied status", body.includes('"CRM sync summary copied."')],
  ["copy summary reports selected fallback status", body.includes('"CRM sync summary selected and copied."')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status summary copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status summary copy test passed.");
