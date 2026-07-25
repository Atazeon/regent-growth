const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function buildDiscoveryPrompt(criteria)");
const end = app.indexOf("function parseJsonFromText(text)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["discovery prompt helper exists", start !== -1],
  ["prompt names local prospecting researcher", body.includes("local AI sales prospecting researcher")],
  ["prompt forbids fake browsing", body.includes("Do not claim you browsed the web.")],
  ["prompt avoids existing pipeline", body.includes("Avoid companies already in the existing pipeline.")],
  ["prompt includes target industries", body.includes("Target industries: ${criteria.industries}")],
  ["prompt includes location", body.includes("Target location: ${criteria.location}")],
  ["prompt includes qualification signals", body.includes("Qualification signals: ${criteria.signals}")],
  ["prompt requires JSON only", body.includes("Return one valid JSON object only. No markdown.")],
  ["prompt defines candidate shape", body.includes('"sourceReason": "why this candidate matched the discovery criteria"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Discovery prompt guardrails test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Discovery prompt guardrails test passed.");
