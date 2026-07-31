const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["post-launch review form exists", html.includes('id="outboundPostLaunchReviewForm"')],
  ["post-launch summary exists", html.includes('id="outboundPostLaunchSummary"')],
  ["post-launch wins exists", html.includes('id="outboundPostLaunchWins"')],
  ["post-launch issues exists", html.includes('id="outboundPostLaunchIssues"')],
  ["post-launch next steps exists", html.includes('id="outboundPostLaunchNextSteps"')],
  ["post-launch status exists", html.includes('id="outboundPostLaunchReviewStatus"')],
  ["post-launch copy button exists", html.includes('id="copyOutboundPostLaunchReviewButton"')],
  ["post-launch download button exists", html.includes('id="downloadOutboundPostLaunchReviewButton"')],
  ["post-launch reset button exists", html.includes('id="resetOutboundPostLaunchReviewButton"')],
  ["post-launch form selector exists", app.includes('const outboundPostLaunchReviewForm = document.querySelector("#outboundPostLaunchReviewForm")')],
  ["post-launch storage exists", app.includes("postLaunchReview: {}")],
  ["post-launch load normalization exists", app.includes("normalizeOutboundPostLaunchReview(parsedState.postLaunchReview || {})")],
  ["post-launch normalizer exists", app.includes("function normalizeOutboundPostLaunchReview(review)")],
  ["post-launch has helper exists", app.includes("function hasOutboundPostLaunchReview(")],
  ["post-launch render exists", app.includes("function renderOutboundPostLaunchReview()")],
  ["post-launch render is called", app.includes("renderOutboundPostLaunchReview();")],
  ["post-launch session export exists", app.includes("postLaunchReview: normalizeOutboundPostLaunchReview(outboundSessionState.postLaunchReview || {})")],
  ["post-launch summary formatter exists", app.includes("function formatOutboundPostLaunchReview(")],
  ["post-launch copy handler exists", app.includes("async function copyOutboundPostLaunchReview()")],
  ["post-launch download handler exists", app.includes("function downloadOutboundPostLaunchReview()")],
  ["post-launch reset handler exists", app.includes("function resetOutboundPostLaunchReview()")],
  ["post-launch filename exists", app.includes("regent-growth-first-run-post-launch-review-")],
  ["post-launch snapshot import exists", app.includes("normalizeOutboundPostLaunchReview(snapshot.postLaunchReview || snapshot.session?.postLaunchReview || {})")],
  ["post-launch form bound", app.includes('outboundPostLaunchReviewForm.addEventListener("submit", saveOutboundPostLaunchReview)')],
  ["post-launch copy bound", app.includes('copyOutboundPostLaunchReviewButton.addEventListener("click", copyOutboundPostLaunchReview)')],
  ["post-launch download bound", app.includes('downloadOutboundPostLaunchReviewButton.addEventListener("click", downloadOutboundPostLaunchReview)')],
  ["post-launch reset bound", app.includes('resetOutboundPostLaunchReviewButton.addEventListener("click", resetOutboundPostLaunchReview)')],
  ["README mentions post-launch review", readme.includes("post-launch review")],
  ["plan next launch report", plan.includes("- First real outbound run launch report")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound post-launch review test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound post-launch review test passed.");
