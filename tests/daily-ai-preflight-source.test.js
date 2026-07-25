const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function preflightDailyAiModel()");
const end = app.indexOf("async function generateCompanyBrief()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["preflight helper exists", start !== -1],
  ["preflight uses selected model", body.includes("const model = modelSelect.value;")],
  ["preflight uses abort controller", body.includes("const controller = new AbortController();")],
  ["preflight has twelve second timeout", body.includes("setTimeout(() => controller.abort(), 12000)")],
  ["preflight calls ollama endpoint", body.includes("await fetch(ollamaEndpoint")],
  ["preflight sends non-stream request", body.includes("stream: false")],
  ["preflight disables thinking", body.includes("think: false")],
  ["preflight keeps response short", body.includes("num_predict: 4")],
  ["preflight checks non-ok response", body.includes("if (!response.ok)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI preflight test passed.");
