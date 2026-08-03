const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["runbook has outbound sequence", runbook.includes("## Outbound Operating Sequence")],
  ["runbook mentions live dry-run packet", runbook.includes("live dry-run packet")],
  ["runbook mentions manual launch log", runbook.includes("manual launch log")],
  ["runbook mentions batch tags", runbook.includes("First Run") && runbook.includes("Second Batch")],
  ["runbook mentions post-launch review", runbook.includes("post-launch review")],
  ["runbook mentions follow-up batch plan", runbook.includes("follow-up batch plan")],
  ["runbook mentions second-batch readiness", runbook.includes("second-batch readiness")],
  ["runbook mentions filtered text and CSV", runbook.includes("filtered text and CSV")],
  ["runbook mentions scale decision", runbook.includes("scale decision")],
  ["runbook mentions launch hardening", runbook.includes("launch hardening checklist")],
  ["plan next production integrations", plan.includes("- Production integration provider setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance outbound runbook test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Maintenance outbound runbook test passed.");
