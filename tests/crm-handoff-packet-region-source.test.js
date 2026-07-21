const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["handoff packet label exists", html.includes('<label class="sr-only" for="handoffPacket">CRM handoff packet</label>')],
  ["handoff packet described by summary", html.includes('<textarea id="handoffPacket" aria-describedby="handoffSummary" readonly></textarea>')],
  ["handoff summary id retained", html.includes('<p class="handoff-summary" id="handoffSummary">No warm leads ready yet.</p>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff packet region test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff packet region test passed.");
