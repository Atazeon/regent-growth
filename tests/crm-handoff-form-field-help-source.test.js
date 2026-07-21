const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["owner help exists", html.includes('<span id="handoffOwnerHelp" class="sr-only">Person responsible for the CRM handoff follow-up.</span>')],
  ["owner input described", html.includes('<input id="handoffOwnerInput" name="handoffOwner" aria-describedby="handoffOwnerHelp"')],
  ["status help exists", html.includes('<span id="handoffStatusHelp" class="sr-only">Current handoff stage for the selected warm lead.</span>')],
  ["status select described", html.includes('<select id="handoffStatusInput" name="handoffStatus" aria-describedby="handoffStatusHelp">')],
  ["due help exists", html.includes('<span id="handoffDueHelp" class="sr-only">Date the next CRM handoff action is due.</span>')],
  ["due input described", html.includes('<input id="handoffDueInput" name="handoffDue" type="date" aria-describedby="handoffDueHelp">')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff form field help test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff form field help test passed.");
