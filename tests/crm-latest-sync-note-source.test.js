const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const latestStart = app.indexOf("function getLatestCrmSyncNote(prospect)");
const latestEnd = app.indexOf("function appendCrmSyncNote(prospect, note, limit = 8)", latestStart);
const latestBody = latestStart === -1 || latestEnd === -1 ? "" : app.slice(latestStart, latestEnd);

const appendStart = app.indexOf("function appendCrmSyncNote(prospect, note, limit = 8)");
const appendEnd = app.indexOf("function cleanCrmSyncNotes()", appendStart);
const appendBody = appendStart === -1 || appendEnd === -1 ? "" : app.slice(appendStart, appendEnd);

const formatStart = app.indexOf("function formatReviewedCrmSyncNote(prospect)");
const formatEnd = app.indexOf("function getCrmFailureReasonCounts(", formatStart);
const formatBody = formatStart === -1 || formatEnd === -1 ? "" : app.slice(formatStart, formatEnd);

const checks = [
  ["latest sync note helper exists", latestStart !== -1],
  ["latest helper reads crm sync notes safely", latestBody.includes("prospect.crmSyncNotes?.split(\"\\n\")")],
  ["latest helper returns first non-empty note", latestBody.includes(".find((note) => note.trim())")],
  ["latest helper falls back to empty string", latestBody.includes("|| \"\"")],
  ["append helper exists", appendStart !== -1],
  ["append helper prepends newest note", appendBody.includes("const notes = [note, ...(prospect.crmSyncNotes || \"\").split(\"\\n\")]")],
  ["append helper trims note history", appendBody.includes(".map((item) => item.trim())")],
  ["append helper removes blank note history", appendBody.includes(".filter(Boolean)")],
  ["append helper dedupes repeated notes", appendBody.includes("const seen = new Set()") && appendBody.includes("if (seen.has(item)) return;")],
  ["append helper limits retained notes", appendBody.includes("uniqueNotes.slice(0, limit).join(\"\\n\")")],
  ["reviewed note formatter exists", formatStart !== -1],
  ["reviewed note formatter uses reviewed reason", formatBody.includes("const reason = getReviewedCrmReason(prospect);")],
  ["reviewed note formatter uses latest sync note", formatBody.includes("const note = getLatestCrmSyncNote(prospect);")],
  ["reviewed note formatter has missing note fallback", formatBody.includes("No review note recorded.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM latest sync note source test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM latest sync note source test passed.");
