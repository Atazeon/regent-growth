const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["notes help exists", html.includes('<span id="handoffNotesHelp" class="sr-only">Context, blockers, acceptance notes, or next steps for the CRM handoff.</span>')],
  ["notes textarea described", html.includes('<textarea id="handoffNotesInput" name="handoffNotes" aria-describedby="handoffNotesHelp"')],
  ["notes placeholder retained", html.includes('placeholder="Who owns next steps, context for teammate, blockers, or acceptance notes"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM handoff notes field help test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM handoff notes field help test passed.");
