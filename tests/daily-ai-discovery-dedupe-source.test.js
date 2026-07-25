const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function discoverCandidatesForDailyRun(criteria)");
const end = app.indexOf("async function fetchEvidenceForCandidate(candidate)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["discover candidates helper exists", start !== -1],
  ["discover candidates calls local AI", body.includes("await generateWithOllama(buildDiscoveryPrompt(criteria), 900);")],
  ["discover candidates parses results", body.includes("const candidates = parseDiscoveryCandidates(rawDiscovery);")],
  ["discover candidates rejects empty results", body.includes('throw new Error("No usable discovery candidates returned.");')],
  ["discover candidates includes existing prospects in duplicate set", body.includes("prospects.forEach((prospect) => addDuplicateKeys(knownKeys, prospect));")],
  ["discover candidates includes queued candidates in duplicate set", body.includes("discoveryQueue.forEach((candidate) => addDuplicateKeys(knownKeys, discoveryCandidateToProspect(candidate)));")],
  ["discover candidates skips duplicates", body.includes("if (isDuplicate) return;")],
  ["discover candidates prepends new candidates", body.includes("discoveryQueue = [...newCandidates, ...discoveryQueue];")],
  ["discover candidates returns count", body.includes("return newCandidates.length;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI discovery dedupe test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI discovery dedupe test passed.");
