const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["check setup label", html.includes('title="Check CRM API connection settings" aria-label="Check CRM API connection settings"')],
  ["sync selected label", html.includes('title="Sync the selected warm lead to CRM" aria-label="Sync the selected warm lead to CRM"')],
  ["sync warm label", html.includes('title="Sync all CRM-ready warm leads" aria-label="Sync all CRM-ready warm leads"')],
  ["retry failed label", html.includes('title="Retry failed CRM syncs" aria-label="Retry failed CRM syncs"')],
  ["mark reviewed label", html.includes('title="Mark failed CRM syncs reviewed" aria-label="Mark failed CRM syncs reviewed"')],
  ["requeue selected label", html.includes('title="Requeue the selected reviewed CRM sync" aria-label="Requeue the selected reviewed CRM sync"')],
  ["requeue reviewed label", html.includes('title="Requeue reviewed CRM syncs" aria-label="Requeue reviewed CRM syncs"')],
  ["export failed json label", html.includes('title="Export failed CRM syncs as JSON" aria-label="Export failed CRM syncs as JSON"')],
  ["export failed csv label", html.includes('title="Export failed CRM syncs as CSV" aria-label="Export failed CRM syncs as CSV"')],
  ["export reviewed json label", html.includes('title="Export reviewed CRM syncs as JSON" aria-label="Export reviewed CRM syncs as JSON"')],
  ["export reviewed csv label", html.includes('title="Export reviewed CRM syncs as CSV" aria-label="Export reviewed CRM syncs as CSV"')],
  ["copy summary label", html.includes('title="Copy the CRM sync status summary" aria-label="Copy the CRM sync status summary"')],
  ["download text label", html.includes('title="Download the CRM sync status summary as text" aria-label="Download the CRM sync status summary as text"')],
  ["download json label", html.includes('title="Download the CRM sync status summary as JSON" aria-label="Download the CRM sync status summary as JSON"')],
  ["copy json label", html.includes('title="Copy the CRM sync status summary as JSON" aria-label="Copy the CRM sync status summary as JSON"')],
  ["clear resolved label", html.includes('title="Clear resolved CRM retry queue items" aria-label="Clear resolved CRM retry queue items"')],
  ["clean notes label", html.includes('title="Clean CRM sync notes" aria-label="Clean CRM sync notes"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup action labels test passed.");
