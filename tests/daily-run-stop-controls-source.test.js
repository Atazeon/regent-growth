const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const stopStart = app.indexOf("function requestDailyAiStop()");
const stopEnd = app.indexOf("function renderDailyRunStats()", stopStart);
const stopBody = stopStart === -1 || stopEnd === -1 ? "" : app.slice(stopStart, stopEnd);

const checks = [
  ["stop button starts disabled", html.includes('id="stopDailyAiButton" class="secondary-button" type="button" disabled')],
  ["stop helper exists", stopStart !== -1],
  ["stop helper ignores idle runs", stopBody.includes("if (!dailyRunInProgress) return;")],
  ["stop helper records stop request", stopBody.includes("dailyRunStopRequested = true;")],
  ["stop helper disables button after request", stopBody.includes("stopDailyAiButton.disabled = true;")],
  ["stop helper logs stop request", stopBody.includes("Stop requested. Daily AI will stop after the current step finishes.")],
  ["stop helper sets working status", stopBody.includes("Daily AI stop requested. Waiting for the current local AI step to finish.")],
  ["stop listener exists", app.includes('stopDailyAiButton.addEventListener("click", requestDailyAiStop);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily run stop controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily run stop controls test passed.");
