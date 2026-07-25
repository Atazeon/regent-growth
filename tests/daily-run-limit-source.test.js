const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getDailyRunLimit()");
const end = app.indexOf("function shouldDailyRunRequireEvidence()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["daily run limit helper exists", start !== -1],
  ["daily run limit reads form element safely", body.includes("discoveryForm.elements.dailyRunLimit?.value")],
  ["daily run limit clamps one to ten", body.includes("Math.min(10, Math.max(1")],
  ["daily run limit defaults to three", body.includes("Number.isFinite(value) ? value : 3")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily run limit test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily run limit test passed.");
