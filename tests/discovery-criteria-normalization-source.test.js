const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getDiscoveryCriteria()");
const end = app.indexOf("function getDailyRunLimit()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["criteria helper exists", start !== -1],
  ["criteria reads form data", body.includes("const formData = new FormData(discoveryForm);")],
  ["criteria trims industries", body.includes('industries: formData.get("industries").trim()')],
  ["criteria trims location", body.includes('location: formData.get("location").trim()')],
  ["criteria clamps candidate count", body.includes('count: Math.min(20, Math.max(3, Number(formData.get("count")) || 8))')],
  ["criteria trims signals", body.includes('signals: formData.get("signals").trim()')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Discovery criteria normalization test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Discovery criteria normalization test passed.");
