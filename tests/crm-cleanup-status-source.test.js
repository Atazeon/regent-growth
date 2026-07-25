const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const notesStart = app.indexOf("function cleanCrmSyncNotes()");
const notesEnd = app.indexOf("function clearResolvedCrmQueueState()", notesStart);
const clearStart = app.indexOf("function clearResolvedCrmQueueState()");
const clearEnd = app.indexOf("function markFailedCrmSyncsReviewed()", clearStart);
const notesBody = notesStart === -1 || notesEnd === -1 ? "" : app.slice(notesStart, notesEnd);
const clearBody = clearStart === -1 || clearEnd === -1 ? "" : app.slice(clearStart, clearEnd);

const checks = [
  ["clean notes function exists", notesStart !== -1],
  ["clean notes uses five note limit", notesBody.includes("appendCrmSyncNote(prospect, \"\", 5);")],
  ["clean notes reports updated count", notesBody.includes("`Cleaned CRM sync notes for ${updatedCount} prospect${updatedCount === 1 ? \"\" : \"s\"}.`")],
  ["clean notes reports no-op", notesBody.includes('"CRM sync notes are already clean."')],
  ["clear stale syncing function exists", clearStart !== -1],
  ["clear stale syncing marks not synced", clearBody.includes('prospect.crmSyncStatus = "Not Synced";')],
  ["clear stale syncing appends note", clearBody.includes("Cleared stale CRM syncing state.")],
  ["clear stale syncing reports count", clearBody.includes("`Cleared ${clearedCount} stale CRM syncing record${clearedCount === 1 ? \"\" : \"s\"}.`")],
  ["clear stale syncing reports no-op", clearBody.includes('"No stale CRM syncing records to clear."')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM cleanup status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM cleanup status test passed.");
