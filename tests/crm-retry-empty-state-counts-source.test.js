const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["empty state helper exists", app.includes("function formatCrmRetryEmptyState(reviewedCount, syncingCount)")],
  ["reviewed count included", app.includes('details.push(`${reviewedCount} reviewed sync${reviewedCount === 1 ? "" : "s"} parked`);')],
  ["syncing count included", app.includes('details.push(`${syncingCount} sync${syncingCount === 1 ? "" : "s"} in progress`);')],
  ["empty state uses helper", app.includes('<p class="empty-state">${escapeHtml(formatCrmRetryEmptyState(reviewedCount, syncingCount))}</p>')],
  ["plain fallback retained", app.includes('"No failed CRM syncs queued for retry.";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry empty-state counts test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry empty-state counts test passed.");
