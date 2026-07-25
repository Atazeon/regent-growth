const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function runDailyAiWorkflow()");
const end = app.indexOf("function getDraftParts(rawDraft)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["workflow has no-work error", body.includes("No unfinished prospects or discovery candidates were available for Daily AI.")],
  ["workflow has evidence-required error", body.includes("No discovery candidates with source evidence were available.")],
  ["workflow reports timeout guidance", body.includes("Daily AI timed out. Lower the daily run limit or use qwen2.5:0.5b for a faster pass.")],
  ["workflow formats generic error", body.includes("Daily AI error: ${error.message || \"make sure Ollama is running and returning usable JSON.\"}")],
  ["workflow marks failed snapshot", body.includes('runSnapshot.status = "Failed";')],
  ["workflow stores error on snapshot", body.includes("runSnapshot.error = message;")],
  ["workflow records history on failure", body.includes("recordDailyRunHistory(runSnapshot);")],
  ["workflow resets progress in finally", body.includes("dailyRunInProgress = false;") && body.includes("dailyRunStopRequested = false;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI workflow error test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI workflow error test passed.");
