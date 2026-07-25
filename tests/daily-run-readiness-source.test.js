const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const readinessStart = app.indexOf("function getDailyRunReadiness()");
const readinessEnd = app.indexOf("function renderDailyRunCapacitySummary()", readinessStart);
const readinessBody = readinessStart === -1 || readinessEnd === -1 ? "" : app.slice(readinessStart, readinessEnd);
const summaryStart = app.indexOf("function renderDailyRunCapacitySummary()");
const summaryEnd = app.indexOf("function requestDailyAiStop()", summaryStart);
const summaryBody = summaryStart === -1 || summaryEnd === -1 ? "" : app.slice(summaryStart, summaryEnd);

const checks = [
  ["readiness helper exists", readinessStart !== -1],
  ["readiness checks criteria", readinessBody.includes("const criteria = getDiscoveryCriteria();")],
  ["readiness checks capacity", readinessBody.includes("const capacity = getDailyRunCapacity();")],
  ["readiness allows existing unfinished work", readinessBody.includes("const hasExistingWork = capacity.existingCount > 0;")],
  ["readiness allows discovery criteria", readinessBody.includes("const hasCriteria = Boolean(criteria.industries && criteria.signals);")],
  ["readiness exposes blocked reason", readinessBody.includes("Add target industries and qualification signals, or add an unfinished prospect.")],
  ["capacity summary disables run when not ready", summaryBody.includes("runDailyAiButton.disabled = dailyRunInProgress || !readiness.ready;")],
  ["capacity summary updates stop button", summaryBody.includes("stopDailyAiButton.disabled = !dailyRunInProgress || dailyRunStopRequested;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily run readiness test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily run readiness test passed.");
