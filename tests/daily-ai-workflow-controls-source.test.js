const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function runDailyAiWorkflow()");
const end = app.indexOf("function getDraftParts(rawDraft)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["workflow blocks when not ready", body.includes('setDataStatus(readiness.reason, "error");')],
  ["workflow marks progress true", body.includes("dailyRunInProgress = true;")],
  ["workflow clears prior stop request", body.includes("dailyRunStopRequested = false;")],
  ["workflow disables run button", body.includes("runDailyAiButton.disabled = true;")],
  ["workflow enables stop button", body.includes("stopDailyAiButton.disabled = false;")],
  ["workflow disables generation", body.includes("generateDiscoveryButton.disabled = true;")],
  ["workflow disables research controls", body.includes("setResearchControlsDisabled(true);")],
  ["workflow restores controls in finally", body.includes("setResearchControlsDisabled(false);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI workflow controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI workflow controls test passed.");
