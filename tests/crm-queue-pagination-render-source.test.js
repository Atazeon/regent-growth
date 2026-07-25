const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmQueuePagination(queue, totalItems, page)");
const end = app.indexOf("function changeCrmQueuePage(queue, direction)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["pagination renderer exists", start !== -1],
  ["pagination calculates total pages", body.includes("const totalPages = Math.ceil(totalItems / crmQueuePageSize);")],
  ["pagination hides single page", body.includes("if (totalPages <= 1) return \"\";")],
  ["pagination labels reviewed queue", body.includes('queue === "reviewed" ? "reviewed CRM syncs" : "failed CRM syncs"')],
  ["pagination renders previous button", body.includes('data-direction="-1"')],
  ["pagination renders next button", body.includes('data-direction="1"')],
  ["pagination displays item range", body.includes("Showing ${escapeHtml(firstItem)}-${escapeHtml(lastItem)} of ${escapeHtml(totalItems)}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM queue pagination render test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM queue pagination render test passed.");
