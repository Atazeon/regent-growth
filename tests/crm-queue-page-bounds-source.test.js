const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getBoundedPage(page, totalItems)");
const end = app.indexOf("function renderCrmQueuePagination(queue, totalItems, page)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["bounded page function exists", start !== -1],
  ["bounded page calculates max page", body.includes("const maxPage = Math.max(0, Math.ceil(totalItems / crmQueuePageSize) - 1);")],
  ["bounded page clamps minimum", body.includes("Math.max(page, 0)")],
  ["bounded page clamps maximum", body.includes("Math.min(Math.max(page, 0), maxPage)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM queue page bounds test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM queue page bounds test passed.");
