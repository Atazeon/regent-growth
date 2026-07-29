const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["run packet button exists", html.includes('id="copyOutboundRunPacketButton"')],
  ["run packet download button exists", html.includes('id="downloadOutboundRunPacketButton"')],
  ["run packet JSON button exists", html.includes('id="downloadOutboundRunPacketJsonButton"')],
  ["run snapshot button exists", html.includes('id="saveOutboundRunSnapshotButton"')],
  ["run snapshots download button exists", html.includes('id="downloadOutboundRunSnapshotsButton"')],
  ["run snapshots clear button exists", html.includes('id="clearOutboundRunSnapshotsButton"')],
  ["run readiness region exists", html.includes('id="outboundRunReadiness"')],
  ["run snapshot list exists", html.includes('id="outboundRunSnapshotList"')],
  ["run readiness selector exists", app.includes('const outboundRunReadiness = document.querySelector("#outboundRunReadiness")')],
  ["run packet button selector exists", app.includes('const copyOutboundRunPacketButton = document.querySelector("#copyOutboundRunPacketButton")')],
  ["run packet download selector exists", app.includes('const downloadOutboundRunPacketButton = document.querySelector("#downloadOutboundRunPacketButton")')],
  ["run packet JSON selector exists", app.includes('const downloadOutboundRunPacketJsonButton = document.querySelector("#downloadOutboundRunPacketJsonButton")')],
  ["run snapshot selector exists", app.includes('const saveOutboundRunSnapshotButton = document.querySelector("#saveOutboundRunSnapshotButton")')],
  ["run snapshots download selector exists", app.includes('const downloadOutboundRunSnapshotsButton = document.querySelector("#downloadOutboundRunSnapshotsButton")')],
  ["run snapshots clear selector exists", app.includes('const clearOutboundRunSnapshotsButton = document.querySelector("#clearOutboundRunSnapshotsButton")')],
  ["run snapshot list selector exists", app.includes('const outboundRunSnapshotList = document.querySelector("#outboundRunSnapshotList")')],
  ["run readiness summary exists", app.includes("function getOutboundRunReadinessSummary()")],
  ["run packet formatter exists", app.includes("function formatOutboundRunPacket()")],
  ["run packet title exists", app.includes("First Real Outbound Run Packet")],
  ["run packet includes archive closeout", app.includes("Archive closeout: ${readiness.archiveCloseoutExported ? \"Exported\" : \"Not exported\"}")],
  ["run packet copy handler exists", app.includes("async function copyOutboundRunPacket()")],
  ["run packet download handler exists", app.includes("function downloadOutboundRunPacket()")],
  ["run packet JSON record exists", app.includes("function getOutboundRunPacketRecord()")],
  ["run packet JSON handler exists", app.includes("function downloadOutboundRunPacketJson()")],
  ["run packet download filename exists", app.includes("regent-growth-first-run-packet-")],
  ["run packet JSON payload includes closeout fixes", app.includes("closeoutFixes: fixes.filter((item) => [\"Resolved\", \"Archived\"].includes(item.status))")],
  ["run snapshot state exists", app.includes("runSnapshots: []")],
  ["run snapshot render exists", app.includes("function renderOutboundRunSnapshots()")],
  ["run snapshot save exists", app.includes("function saveOutboundRunSnapshot()")],
  ["run snapshots download exists", app.includes("function downloadOutboundRunSnapshots()")],
  ["run snapshots clear exists", app.includes("function clearOutboundRunSnapshots()")],
  ["run snapshots download filename exists", app.includes("regent-growth-first-run-snapshots-")],
  ["run snapshots download disabled", app.includes("downloadOutboundRunSnapshotsButton.disabled = !(outboundSessionState.runSnapshots || []).length")],
  ["run snapshots clear disabled", app.includes("clearOutboundRunSnapshotsButton.disabled = !(outboundSessionState.runSnapshots || []).length")],
  ["run snapshots clear confirm exists", app.includes("Clear ${snapshots.length} saved first real outbound run snapshot")],
  ["run snapshots clear resets state", app.includes("outboundSessionState.runSnapshots = []")],
  ["run snapshot limit exists", app.includes(".slice(0, 10)")],
  ["run packet button bound", app.includes('copyOutboundRunPacketButton.addEventListener("click", copyOutboundRunPacket)')],
  ["run packet download bound", app.includes('downloadOutboundRunPacketButton.addEventListener("click", downloadOutboundRunPacket)')],
  ["run packet JSON bound", app.includes('downloadOutboundRunPacketJsonButton.addEventListener("click", downloadOutboundRunPacketJson)')],
  ["run snapshot bound", app.includes('saveOutboundRunSnapshotButton.addEventListener("click", saveOutboundRunSnapshot)')],
  ["run snapshots download bound", app.includes('downloadOutboundRunSnapshotsButton.addEventListener("click", downloadOutboundRunSnapshots)')],
  ["run snapshots clear bound", app.includes('clearOutboundRunSnapshotsButton.addEventListener("click", clearOutboundRunSnapshots)')],
  ["run readiness CSS exists", css.includes(".outbound-run-readiness")],
  ["snapshot CSS exists", css.includes(".outbound-run-snapshot-list")],
  ["README mentions snapshot clear", readme.includes("first-run snapshot history/export/clear")],
  ["plan next snapshot compare", plan.includes("- First run snapshot compare")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound run packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound run packet test passed.");
