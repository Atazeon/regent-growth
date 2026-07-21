const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["queue label exists", app.includes('const queueLabel = queue === "reviewed" ? "reviewed CRM syncs" : "failed CRM syncs";')],
  ["previous label exists", app.includes("const previousLabel = `Previous page of ${queueLabel}`;")],
  ["next label exists", app.includes("const nextLabel = `Next page of ${queueLabel}`;")],
  ["previous title exists", app.includes('title="${escapeHtml(previousLabel)}" aria-label="${escapeHtml(previousLabel)}"')],
  ["next title exists", app.includes('title="${escapeHtml(nextLabel)}" aria-label="${escapeHtml(nextLabel)}"')],
  ["previous action preserved", app.includes('data-action="crm-page" data-queue="${escapeHtml(queue)}" data-direction="-1" title="${escapeHtml(previousLabel)}"')],
  ["next action preserved", app.includes('data-action="crm-page" data-queue="${escapeHtml(queue)}" data-direction="1" title="${escapeHtml(nextLabel)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry pagination labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry pagination labels test passed.");
