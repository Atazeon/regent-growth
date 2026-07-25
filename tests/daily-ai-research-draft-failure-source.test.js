const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function researchAndDraftDailyProspects(prospectsToProcess)");
const end = app.indexOf("async function runDailyAiWorkflow()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["loop catches per-prospect errors", body.includes("} catch (error) {")],
  ["loop increments failed count", body.includes("results.failed += 1;")],
  ["loop preserves existing notes", body.includes("[prospect.responseNotes, `${new Date().toISOString()}: Daily AI failed: ${error.message}`]")],
  ["loop saves failure note", body.includes("saveProspects();")],
  ["loop re-renders failure", body.includes("renderProspects();")],
  ["loop logs failure", body.includes("addDailyRunLog(`Failed ${prospect.company}: ${error.message}`, \"error\");")],
  ["loop returns aggregate results", body.includes("return results;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI research/draft failure test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI research/draft failure test passed.");
