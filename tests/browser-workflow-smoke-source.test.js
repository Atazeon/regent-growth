const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["app title is branded", html.includes("<title>Regent Growth</title>")],
  ["company discovery section exists", html.includes("<h2>Find Qualified Companies</h2>")],
  ["daily AI action exists", html.includes('id="runDailyAiButton"')],
  ["candidate generation action exists", html.includes('id="generateDiscoveryButton"')],
  ["team sync action exists", html.includes('id="pushTeamProspectsButton"')],
  ["CRM setup action exists", html.includes('id="checkCrmSetupButton"')],
  ["email review queue exists", html.includes('id="dailyRunReviewQueue"')],
  ["local server serves html files", server.includes('".html": "text/html; charset=utf-8"')],
  ["local server default port is stable", server.includes("process.env.PORT || 5193")],
  ["app guidance points to local server URL", app.includes("http://127.0.0.1:5193/index.html")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Browser workflow smoke source test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Browser workflow smoke source test passed.");
