const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["archive filter option exists", html.includes('<option value="Archived">Archived</option>')],
  ["archive button exists", html.includes('id="archiveResolvedOutboundImprovementsButton"')],
  ["restore button exists", html.includes('id="restoreArchivedOutboundImprovementsButton"')],
  ["clear archived button exists", html.includes('id="clearArchivedOutboundImprovementsButton"')],
  ["archive selector exists", app.includes('const archiveResolvedOutboundImprovementsButton = document.querySelector("#archiveResolvedOutboundImprovementsButton")')],
  ["restore selector exists", app.includes('const restoreArchivedOutboundImprovementsButton = document.querySelector("#restoreArchivedOutboundImprovementsButton")')],
  ["clear archived selector exists", app.includes('const clearArchivedOutboundImprovementsButton = document.querySelector("#clearArchivedOutboundImprovementsButton")')],
  ["archived status is derived", app.includes('archivedAt ? "Archived"')],
  ["counts include archived", app.includes('{ Open: 0, "In Progress": 0, Resolved: 0, Archived: 0 }')],
  ["summary includes archived count", app.includes("Archived: ${counts.Archived || 0}")],
  ["status accepts archived", app.includes('"Archived"].includes(status)')],
  ["status sets archivedAt", app.includes('archivedAt: status === "Archived"')],
  ["archive resolved function exists", app.includes("function archiveResolvedOutboundImprovements()")],
  ["restore archived function exists", app.includes("function restoreArchivedOutboundImprovements()")],
  ["clear archived function exists", app.includes("function clearArchivedOutboundImprovements()")],
  ["archive button disabled when empty", app.includes("archiveResolvedOutboundImprovementsButton.disabled = resolvedItems.length === 0")],
  ["restore button disabled when empty", app.includes("restoreArchivedOutboundImprovementsButton.disabled = archivedItems.length === 0")],
  ["clear archived disabled when empty", app.includes("clearArchivedOutboundImprovementsButton.disabled = archivedItems.length === 0")],
  ["archive export state exists", app.includes("archiveCloseoutExportedAt")],
  ["archive export marker exists", app.includes("function markArchiveCloseoutExported(items)")],
  ["archive cleanup requires export", app.includes("Copy or download an archived closeout before clearing archived fixes.")],
  ["archive cleanup readiness warning exists", app.includes("Export archived closeout before cleanup")],
  ["archive cleanup ready label exists", app.includes("Archive cleanup ready")],
  ["archive reset clears export guard", app.includes("outboundSessionState.archiveCloseoutExportedAt = \"\"")],
  ["clear archived confirms", app.includes("window.confirm(`Clear ${archivedItems.length} archived outcome-driven fix")],
  ["clear archived removes outcomes", app.includes("outboundSessionState.outcomes = outboundSessionState.outcomes.filter((outcome) => !archivedIds.has(outcome.id))")],
  ["archive button bound", app.includes('archiveResolvedOutboundImprovementsButton.addEventListener("click", archiveResolvedOutboundImprovements)')],
  ["restore button bound", app.includes('restoreArchivedOutboundImprovementsButton.addEventListener("click", restoreArchivedOutboundImprovements)')],
  ["clear archived bound", app.includes('clearArchivedOutboundImprovementsButton.addEventListener("click", clearArchivedOutboundImprovements)')],
  ["README mentions guarded archive cleanup", readme.includes("guarded resolved archive/restore/cleanup")],
  ["plan next snapshot clear", plan.includes("- Outbound operating closeout")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements archive test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements archive test passed.");
