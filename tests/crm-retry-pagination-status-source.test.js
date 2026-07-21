const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["first item calculated", app.includes("const firstItem = page * crmQueuePageSize + 1;")],
  ["last item calculated", app.includes("const lastItem = Math.min(totalItems, firstItem + crmQueuePageSize - 1);")],
  ["pagination shows range", app.includes("Showing ${escapeHtml(firstItem)}-${escapeHtml(lastItem)} of ${escapeHtml(totalItems)}")],
  ["pagination keeps page count", app.includes("Page ${escapeHtml(page + 1)} of ${escapeHtml(totalPages)}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry pagination status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry pagination status test passed.");
