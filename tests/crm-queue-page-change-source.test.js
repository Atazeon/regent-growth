const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function changeCrmQueuePage(queue, direction)");
const end = app.indexOf("function resetCrmQueuePages(queue = \"all\")", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["page change function exists", start !== -1],
  ["page change parses direction", body.includes("const delta = Number(direction);")],
  ["page change ignores invalid direction", body.includes("if (!Number.isFinite(delta)) return;")],
  ["failed queue page changes", body.includes('if (queue === "failed") {')],
  ["reviewed queue page changes", body.includes('if (queue === "reviewed") {')],
  ["page change rerenders prospects", body.includes("renderProspects();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM queue page change test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM queue page change test passed.");
