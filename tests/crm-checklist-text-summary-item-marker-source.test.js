const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function formatCrmChecklistSummary()");
const end = app.indexOf("function getCrmChecklistSummaryRecord()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary formatter exists", start !== -1],
  ["summary maps checklist rows", body.includes("const lines = inputs.map((input) =>")],
  ["summary marks completed items", body.includes('${input.checked ? "[x]" : "[ ]"} ${input.parentElement.textContent.trim()}')],
  ["summary includes item lines", body.includes("...lines")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist text summary item marker test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist text summary item marker test passed.");
