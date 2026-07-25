const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function parseDiscoveryCandidates(text)");
const end = app.indexOf("function formatResearchBrief(research)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["discovery parser exists", start !== -1],
  ["parser extracts JSON from text", body.includes("const parsed = parseJsonFromText(text);")],
  ["parser handles missing candidates array", body.includes("Array.isArray(parsed.candidates) ? parsed.candidates : []")],
  ["parser normalizes each candidate", body.includes("candidates.map(normalizeDiscoveryCandidate)")],
  ["parser requires company and fit", body.includes("filter((candidate) => candidate.company && candidate.fit)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Discovery parse filter test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Discovery parse filter test passed.");
