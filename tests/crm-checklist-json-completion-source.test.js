const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["json completion percent exists", app.includes("completionPercent: items.length ? Math.round((completedCount / items.length) * 100) : 0,")],
  ["json complete boolean exists", app.includes("complete,\n    items")],
  ["json completed count retained", app.includes("completedCount,\n    totalCount: items.length,")],
  ["json total count retained", app.includes("totalCount: items.length,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON completion test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON completion test passed.");
