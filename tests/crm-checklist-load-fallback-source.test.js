const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function loadCrmChecklistState()");
const end = app.indexOf("function saveCrmChecklistState()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["load function exists", start !== -1],
  ["load reads stored state", body.includes("localStorage.getItem(crmChecklistStorageKey)")],
  ["load parses stored JSON", body.includes("return JSON.parse(localStorage.getItem(crmChecklistStorageKey)) || {};")],
  ["load guards malformed JSON", body.includes("} catch {\n    return {};")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist load fallback test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist load fallback test passed.");
