const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["handoff form labelled", html.includes('<form id="handoffForm" class="handoff-form" aria-label="CRM handoff owner and status">')],
  ["owner input retained", html.includes('<input id="handoffOwnerInput" name="handoffOwner"')],
  ["status select retained", html.includes('<select id="handoffStatusInput" name="handoffStatus" aria-describedby="handoffStatusHelp">')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff form semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff form semantics test passed.");
