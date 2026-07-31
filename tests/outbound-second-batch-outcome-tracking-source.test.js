const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outcome batch select exists", html.includes('id="outboundOutcomeBatch"')],
  ["outcome first run option exists", html.includes('<option value="First Run">First Run</option>')],
  ["outcome second batch option exists", html.includes('<option value="Second Batch">Second Batch</option>')],
  ["outcome batch selector exists", app.includes('const outboundOutcomeBatch = document.querySelector("#outboundOutcomeBatch")')],
  ["outcome batch normalization exists", app.includes('batch: ["First Run", "Second Batch"].includes(outcome.batch) ? outcome.batch : "First Run"')],
  ["outcome batch add exists", app.includes('const batch = ["First Run", "Second Batch"].includes(outboundOutcomeBatch.value) ? outboundOutcomeBatch.value : "First Run"')],
  ["outcome batch saved exists", app.includes("normalizeOutboundOutcome({ type, batch, company, note")],
  ["outcome batch rendered exists", app.includes('escapeHtml(outcome.batch || "First Run")')],
  ["outcome batch exported exists", app.includes('${formatDateTime(outcome.createdAt)} - ${outcome.batch || "First Run"} - ${outcome.type}')],
  ["README mentions second-batch outcome tracking", readme.includes("second-batch outcome tracking")],
  ["plan next second batch report", plan.includes("- Production email and calendar integrations")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound second batch outcome tracking test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound second batch outcome tracking test passed.");
