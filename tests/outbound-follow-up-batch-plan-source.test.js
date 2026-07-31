const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["follow-up plan copy button exists", html.includes('id="copyOutboundFollowUpBatchPlanButton"')],
  ["follow-up plan download button exists", html.includes('id="downloadOutboundFollowUpBatchPlanButton"')],
  ["follow-up plan copy selector exists", app.includes('const copyOutboundFollowUpBatchPlanButton = document.querySelector("#copyOutboundFollowUpBatchPlanButton")')],
  ["follow-up plan download selector exists", app.includes('const downloadOutboundFollowUpBatchPlanButton = document.querySelector("#downloadOutboundFollowUpBatchPlanButton")')],
  ["follow-up plan formatter exists", app.includes("function formatOutboundFollowUpBatchPlan()")],
  ["follow-up plan title exists", app.includes("First Real Outbound Follow-Up Batch Plan")],
  ["follow-up plan recommended batch size exists", app.includes("Recommended batch size")],
  ["follow-up plan uses outcome counts", app.includes("const counts = getOutboundOutcomeCounts()")],
  ["follow-up plan uses post-launch review", app.includes("normalizeOutboundPostLaunchReview(outboundSessionState.postLaunchReview || {})")],
  ["follow-up plan has next batch rules", app.includes("Next Batch Rules")],
  ["follow-up plan copy handler exists", app.includes("async function copyOutboundFollowUpBatchPlan()")],
  ["follow-up plan download handler exists", app.includes("function downloadOutboundFollowUpBatchPlan()")],
  ["follow-up plan filename exists", app.includes("regent-growth-first-run-follow-up-batch-plan-")],
  ["follow-up plan copy bound", app.includes('copyOutboundFollowUpBatchPlanButton.addEventListener("click", copyOutboundFollowUpBatchPlan)')],
  ["follow-up plan download bound", app.includes('downloadOutboundFollowUpBatchPlanButton.addEventListener("click", downloadOutboundFollowUpBatchPlan)')],
  ["README mentions follow-up plan", readme.includes("follow-up batch plan")],
  ["plan next second batch readiness", plan.includes("- Production email and calendar integrations")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound follow-up batch plan test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound follow-up batch plan test passed.");
