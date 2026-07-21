const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["zero-state hint exists", app.includes('? "CRM checklist unavailable"')],
  ["zero-state visible text exists", app.includes('? "Checklist unavailable"')],
  ["zero-state uses has items", app.includes("const hasItems = inputs.length > 0;")],
  ["complete state guarded by has items", app.includes(": completed === inputs.length\n    ? \"CRM checklist complete\"")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist zero-state hint test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist zero-state hint test passed.");
