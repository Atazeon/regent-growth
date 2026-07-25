const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmChecklistSummaryRecord()");
const end = app.indexOf("async function copyCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary record function exists", start !== -1],
  ["record maps checklist inputs", body.includes("const items = getCrmChecklistInputs().map((input) => ({")],
  ["item includes id", body.includes("id: input.id,")],
  ["item includes label text", body.includes("label: input.parentElement.textContent.trim(),")],
  ["item includes completed state", body.includes("completed: input.checked")],
  ["record returns items", body.includes("items\n  };")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export payload item shape test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export payload item shape test passed.");
