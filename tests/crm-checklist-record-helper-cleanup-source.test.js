const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["completed count variable exists", app.includes("const completedCount = items.filter((item) => item.completed).length;")],
  ["complete variable exists", app.includes("const complete = items.length > 0 && completedCount === items.length;")],
  ["record uses completed count variable", app.includes("completedCount,\n    totalCount: items.length,")],
  ["percent reuses completed count", app.includes("completionPercent: items.length ? Math.round((completedCount / items.length) * 100) : 0,")],
  ["record uses complete variable", app.includes("complete,\n    items")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist record helper cleanup test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist record helper cleanup test passed.");
