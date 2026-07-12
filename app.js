const storageKey = "regent-growth-prospects";
const promptStorageKey = "regent-growth-prompt-templates";
const discoveryStorageKey = "regent-growth-discovery-queue";
const ollamaEndpoint = "http://127.0.0.1:11434/api/generate";
const sourceFetchEndpoint = "/api/fetch-source";
const sourceSearchEndpoint = "/api/search-sources";
const sourceSearchStatusEndpoint = "/api/search-status";
const crmStatusEndpoint = "/api/crm-status";
const crmSyncEndpoint = "/api/crm-sync";
const teamProspectsEndpoint = "/api/team-prospects";
const teamBackupsEndpoint = "/api/team-backups";
const teamBackupEndpoint = "/api/team-backup";
const ollamaTimeoutMs = 150000;
const stageOrder = ["Research", "Email Drafted", "Sequence", "LinkedIn", "Call", "Meeting", "Assessment"];
const responseStatuses = ["Not Contacted", "Contacted", "Replied", "Interested", "Meeting Booked", "Not Interested", "No Response"];
const linkedInStatuses = ["Not Started", "Connection Sent", "Connected", "Messaged", "No Profile", "Not Relevant"];
const callStatuses = ["Not Started", "Planned", "Called", "Left Voicemail", "Connected", "No Answer", "Bad Number"];
const sourceStatuses = ["Needs Review", "Sources Opened", "Evidence Found", "Rejected"];
const meetingOutcomes = ["Not Scheduled", "Scheduled", "Completed", "No Show", "Rescheduled", "Closed Won", "Closed Lost"];
const handoffStatuses = ["Unassigned", "Assigned", "In Review", "Handed Off", "Accepted", "Blocked"];
const defaultPromptTemplates = {
  brief: `You are Regent Growth's local AI sales researcher.

Regent Growth helps businesses find qualified prospects, research accounts, write personalized outreach, track follow-up, and book more meetings. You are researching the prospect below as a potential customer for Regent Growth. Do not write from the prospect's point of view.

Write a concise company brief for outbound sales. Do not include hidden reasoning or chain-of-thought. Keep the entire answer under 180 words.

Company: {{company}}
Industry: {{industry}}
Size: {{size}}
Website: {{website}}
Decision-maker: {{decisionMaker}}
Buying trigger: {{trigger}}
Fit reason: {{fit}}
Stage: {{stage}}
Fit score: {{score}}

Return exactly these sections:
1. Why this company is qualified
2. Likely pain points
3. Best decision-maker angle
4. One personalized opening line`,
  email: `You are Regent Growth's local AI email writer.

Regent Growth is the seller. The company below is the prospect. Write from Ibrahim at Regent Growth to the decision-maker. Do not write as the prospect.

Write one concise B2B cold email. Do not include hidden reasoning or chain-of-thought.

Company: {{company}}
Industry: {{industry}}
Size: {{size}}
Decision-maker: {{decisionMaker}}
Buying trigger: {{trigger}}
Fit reason: {{fit}}
Stage: {{stage}}
Fit score: {{score}}

Rules:
- Include a subject line.
- Keep the body under 120 words.
- Make it personalized to the buying trigger.
- Offer help getting more qualified meetings.
- End with a simple question.`
};
const sampleProspects = [
  {
    company: "Northstar Dental Group",
    industry: "Healthcare services",
    size: "85 employees",
    website: "northstardental.example",
    decisionMaker: "Operations Director",
    contactEmail: "",
    contactLinkedIn: "",
    contactPhone: "",
    score: 86,
    trigger: "Expanding to two new clinics this quarter",
    fit: "Multi-location operator with appointment volume and front-desk follow-up pressure.",
    stage: "Research",
    bookingLink: "",
    responseStatus: "Not Contacted",
    lastTouch: "",
    nextTouch: "",
    responseNotes: "",
    linkedInStatus: "Not Started",
    linkedInNotes: "",
    callStatus: "Not Started",
    callNotes: "",
    meetingDate: "",
    meetingOutcome: "Not Scheduled",
    assessmentNotes: "",
    handoffOwner: "",
    handoffStatus: "Unassigned",
    handoffDue: "",
    handoffNotes: "",
    crmSyncStatus: "Not Synced",
    crmSyncedAt: "",
    crmSyncNotes: "",
    teamSyncNotes: ""
  },
  {
    company: "CivicStone Roofing",
    industry: "Commercial construction",
    size: "120 employees",
    website: "civicstone.example",
    decisionMaker: "VP Sales",
    contactEmail: "",
    contactLinkedIn: "",
    contactPhone: "",
    score: 91,
    trigger: "Hiring outbound sales representatives",
    fit: "High-ticket B2B service where faster lead qualification can create direct revenue lift.",
    stage: "Email Drafted",
    bookingLink: "",
    responseStatus: "Contacted",
    lastTouch: "",
    nextTouch: "",
    responseNotes: "",
    linkedInStatus: "Connection Sent",
    linkedInNotes: "Connection request queued for VP Sales angle.",
    callStatus: "Not Started",
    callNotes: "",
    meetingDate: "",
    meetingOutcome: "Not Scheduled",
    assessmentNotes: "",
    handoffOwner: "",
    handoffStatus: "Unassigned",
    handoffDue: "",
    handoffNotes: "",
    crmSyncStatus: "Not Synced",
    crmSyncedAt: "",
    crmSyncNotes: "",
    teamSyncNotes: ""
  },
  {
    company: "Atlas Managed IT",
    industry: "IT services",
    size: "42 employees",
    website: "atlasmanaged.example",
    decisionMaker: "Founder",
    contactEmail: "",
    contactLinkedIn: "",
    contactPhone: "",
    score: 78,
    trigger: "Publishing new cybersecurity assessment offer",
    fit: "Clear assessment-led sales motion and likely need for qualified local business leads.",
    stage: "Sequence",
    bookingLink: "",
    responseStatus: "No Response",
    lastTouch: "",
    nextTouch: "",
    responseNotes: "",
    linkedInStatus: "Connected",
    linkedInNotes: "Founder profile found; reference cybersecurity assessment offer.",
    callStatus: "Planned",
    callNotes: "Call after the next sequence touch if no reply.",
    meetingDate: "",
    meetingOutcome: "Not Scheduled",
    assessmentNotes: "",
    handoffOwner: "",
    handoffStatus: "Unassigned",
    handoffDue: "",
    handoffNotes: "",
    crmSyncStatus: "Not Synced",
    crmSyncedAt: "",
    crmSyncNotes: "",
    teamSyncNotes: ""
  }
];

let prospects = loadProspects();
let promptTemplates = loadPromptTemplates();
let discoveryQueue = loadDiscoveryQueue();
let editingIndex = null;
let selectedProspectIndex = 0;
let pendingTeamRestore = null;

const prospectList = document.querySelector("#prospectList");
const selectedDetail = document.querySelector("#selectedDetail");
const detailCompany = document.querySelector("#detailCompany");
const detailAdvanceButton = document.querySelector("#detailAdvanceButton");
const detailEditButton = document.querySelector("#detailEditButton");
const responseForm = document.querySelector("#responseForm");
const detailResponseStatus = document.querySelector("#detailResponseStatus");
const detailLastTouch = document.querySelector("#detailLastTouch");
const detailNextTouch = document.querySelector("#detailNextTouch");
const detailResponseNotes = document.querySelector("#detailResponseNotes");
const workflowForm = document.querySelector("#workflowForm");
const detailLinkedInStatus = document.querySelector("#detailLinkedInStatus");
const detailCallStatus = document.querySelector("#detailCallStatus");
const detailLinkedInNotes = document.querySelector("#detailLinkedInNotes");
const detailCallNotes = document.querySelector("#detailCallNotes");
const assessmentForm = document.querySelector("#assessmentForm");
const detailMeetingDate = document.querySelector("#detailMeetingDate");
const detailMeetingOutcome = document.querySelector("#detailMeetingOutcome");
const detailAssessmentNotes = document.querySelector("#detailAssessmentNotes");
const reminderList = document.querySelector("#reminderList");
const reminderCount = document.querySelector("#reminderCount");
const briefTemplateInput = document.querySelector("#briefTemplateInput");
const emailTemplateInput = document.querySelector("#emailTemplateInput");
const savePromptsButton = document.querySelector("#savePromptsButton");
const resetPromptsButton = document.querySelector("#resetPromptsButton");
const stageFilter = document.querySelector("#stageFilter");
const responseFilter = document.querySelector("#responseFilter");
const savedViews = document.querySelector("#savedViews");
const ownerDashboardCount = document.querySelector("#ownerDashboardCount");
const ownerWorkloadList = document.querySelector("#ownerWorkloadList");
const blockedHandoffList = document.querySelector("#blockedHandoffList");
const teamSyncStatus = document.querySelector("#teamSyncStatus");
const teamSyncHistory = document.querySelector("#teamSyncHistory");
const teamBackupList = document.querySelector("#teamBackupList");
const teamRestorePreview = document.querySelector("#teamRestorePreview");
const teamActorForm = document.querySelector("#teamActorForm");
const teamActorInput = document.querySelector("#teamActorInput");
const checkTeamSyncButton = document.querySelector("#checkTeamSyncButton");
const pullTeamProspectsButton = document.querySelector("#pullTeamProspectsButton");
const pushTeamProspectsButton = document.querySelector("#pushTeamProspectsButton");
const refreshTeamBackupsButton = document.querySelector("#refreshTeamBackupsButton");
const exportTeamBackupButton = document.querySelector("#exportTeamBackupButton");
const restoreTeamBackupInput = document.querySelector("#restoreTeamBackupInput");
const discoveryForm = document.querySelector("#discoveryForm");
const discoveryList = document.querySelector("#discoveryList");
const generateDiscoveryButton = document.querySelector("#generateDiscoveryButton");
const clearDiscoveryButton = document.querySelector("#clearDiscoveryButton");
const searchSetupStatus = document.querySelector("#searchSetupStatus");
const searchTestQuery = document.querySelector("#searchTestQuery");
const checkSearchSetupButton = document.querySelector("#checkSearchSetupButton");
const testSearchSetupButton = document.querySelector("#testSearchSetupButton");
const researchPrompt = document.querySelector("#researchPrompt");
const emailDraft = document.querySelector("#emailDraft");
const prospectForm = document.querySelector("#prospectForm");
const formTitle = document.querySelector("#formTitle");
const clearFormButton = document.querySelector("#clearFormButton");
const importInput = document.querySelector("#importInput");
const exportButton = document.querySelector("#exportButton");
const resetButton = document.querySelector("#resetButton");
const modelSelect = document.querySelector("#modelSelect");
const researchAccountButton = document.querySelector("#researchAccountButton");
const generateBriefButton = document.querySelector("#generateBriefButton");
const generateEmailButton = document.querySelector("#generateEmailButton");
const saveEmailDraftButton = document.querySelector("#saveEmailDraftButton");
const openMailClientButton = document.querySelector("#openMailClientButton");
const openGmailButton = document.querySelector("#openGmailButton");
const openOutlookButton = document.querySelector("#openOutlookButton");
const copyEmailDraftButton = document.querySelector("#copyEmailDraftButton");
const markEmailSentButton = document.querySelector("#markEmailSentButton");
const exportWarmCsvButton = document.querySelector("#exportWarmCsvButton");
const exportWarmJsonButton = document.querySelector("#exportWarmJsonButton");
const checkCrmSetupButton = document.querySelector("#checkCrmSetupButton");
const syncSelectedCrmButton = document.querySelector("#syncSelectedCrmButton");
const syncWarmCrmButton = document.querySelector("#syncWarmCrmButton");
const crmSetupStatus = document.querySelector("#crmSetupStatus");
const copyHandoffPacketButton = document.querySelector("#copyHandoffPacketButton");
const markCrmReadyButton = document.querySelector("#markCrmReadyButton");
const handoffSummary = document.querySelector("#handoffSummary");
const handoffPacket = document.querySelector("#handoffPacket");
const handoffForm = document.querySelector("#handoffForm");
const handoffOwnerInput = document.querySelector("#handoffOwnerInput");
const handoffStatusInput = document.querySelector("#handoffStatusInput");
const handoffDueInput = document.querySelector("#handoffDueInput");
const handoffNotesInput = document.querySelector("#handoffNotesInput");
const aiStatus = document.querySelector("#aiStatus");
const dataStatus = document.querySelector("#dataStatus");

function loadProspects() {
  const savedProspects = localStorage.getItem(storageKey);

  if (!savedProspects) {
    return structuredClone(sampleProspects);
  }

  try {
    const parsedProspects = JSON.parse(savedProspects);
    return Array.isArray(parsedProspects) && parsedProspects.length > 0
      ? parsedProspects.map(normalizeProspect)
      : structuredClone(sampleProspects);
  } catch {
    return structuredClone(sampleProspects);
  }
}

function loadPromptTemplates() {
  const savedTemplates = localStorage.getItem(promptStorageKey);

  if (!savedTemplates) {
    return structuredClone(defaultPromptTemplates);
  }

  try {
    const parsedTemplates = JSON.parse(savedTemplates);
    return {
      brief: parsedTemplates.brief || defaultPromptTemplates.brief,
      email: parsedTemplates.email || defaultPromptTemplates.email
    };
  } catch {
    return structuredClone(defaultPromptTemplates);
  }
}

function loadDiscoveryQueue() {
  const savedQueue = localStorage.getItem(discoveryStorageKey);

  if (!savedQueue) {
    return [];
  }

  try {
    const parsedQueue = JSON.parse(savedQueue);
    return Array.isArray(parsedQueue) ? parsedQueue.map(normalizeDiscoveryCandidate).filter((candidate) => candidate.company) : [];
  } catch {
    return [];
  }
}

function normalizeProspect(prospect) {
  return {
    company: prospect.company || "",
    industry: prospect.industry || "",
    size: prospect.size || "",
    website: prospect.website || "",
    decisionMaker: prospect.decisionMaker || "",
    contactEmail: prospect.contactEmail || "",
    contactLinkedIn: prospect.contactLinkedIn || "",
    contactPhone: prospect.contactPhone || "",
    score: Number(prospect.score) || 0,
    trigger: prospect.trigger || "",
    fit: prospect.fit || "",
    stage: stageOrder.includes(prospect.stage) ? prospect.stage : "Research",
    bookingLink: prospect.bookingLink || "",
    responseStatus: responseStatuses.includes(prospect.responseStatus) ? prospect.responseStatus : "Not Contacted",
    lastTouch: prospect.lastTouch || "",
    nextTouch: prospect.nextTouch || "",
    responseNotes: prospect.responseNotes || "",
    linkedInStatus: linkedInStatuses.includes(prospect.linkedInStatus) ? prospect.linkedInStatus : "Not Started",
    linkedInNotes: prospect.linkedInNotes || "",
    callStatus: callStatuses.includes(prospect.callStatus) ? prospect.callStatus : "Not Started",
    callNotes: prospect.callNotes || "",
    meetingDate: prospect.meetingDate || "",
    meetingOutcome: meetingOutcomes.includes(prospect.meetingOutcome) ? prospect.meetingOutcome : "Not Scheduled",
    assessmentNotes: prospect.assessmentNotes || "",
    handoffOwner: prospect.handoffOwner || "",
    handoffStatus: handoffStatuses.includes(prospect.handoffStatus) ? prospect.handoffStatus : "Unassigned",
    handoffDue: prospect.handoffDue || "",
    handoffNotes: prospect.handoffNotes || "",
    crmSyncStatus: prospect.crmSyncStatus || "Not Synced",
    crmSyncedAt: prospect.crmSyncedAt || "",
    crmSyncNotes: prospect.crmSyncNotes || "",
    teamSyncNotes: prospect.teamSyncNotes || "",
    aiBrief: prospect.aiBrief || "",
    aiEmail: prospect.aiEmail || ""
  };
}

function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `discovery-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDiscoveryCandidate(candidate) {
  return {
    id: candidate.id || createId(),
    company: candidate.company || "",
    industry: candidate.industry || "",
    size: candidate.size || "",
    website: candidate.website || "",
    decisionMaker: candidate.decisionMaker || "",
    score: Number(candidate.score) || 75,
    trigger: candidate.trigger || "",
    fit: candidate.fit || "",
    sourceReason: candidate.sourceReason || candidate.source || "",
    sourceStatus: sourceStatuses.includes(candidate.sourceStatus) ? candidate.sourceStatus : "Needs Review",
    sourceNotes: candidate.sourceNotes || "",
    generatedAt: candidate.generatedAt || new Date().toISOString()
  };
}

function saveProspects() {
  localStorage.setItem(storageKey, JSON.stringify(prospects));
}

function getProspectFieldNames() {
  return Object.keys(normalizeProspect({}));
}

function isBlankValue(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function combineNoteValues(first, second) {
  const firstText = String(first || "").trim();
  const secondText = String(second || "").trim();

  if (!firstText) return secondText;
  if (!secondText || firstText.includes(secondText)) return firstText;
  if (secondText.includes(firstText)) return secondText;
  return `${firstText}\n\n${secondText}`;
}

function mergeProspectRecords(localProspect, sharedProspect) {
  const merged = normalizeProspect(localProspect);
  const shared = normalizeProspect(sharedProspect);
  const noteFields = new Set(["responseNotes", "linkedInNotes", "callNotes", "assessmentNotes", "handoffNotes", "crmSyncNotes", "teamSyncNotes"]);
  let filled = 0;
  let conflicts = 0;

  getProspectFieldNames().forEach((field) => {
    if (field === "teamSyncNotes") return;

    const localValue = merged[field];
    const sharedValue = shared[field];

    if (isBlankValue(localValue) && !isBlankValue(sharedValue)) {
      merged[field] = sharedValue;
      filled += 1;
      return;
    }

    if (noteFields.has(field)) {
      const combined = combineNoteValues(localValue, sharedValue);
      if (combined !== localValue) {
        merged[field] = combined;
        filled += 1;
      }
      return;
    }

    if (!isBlankValue(localValue) && !isBlankValue(sharedValue) && String(localValue) !== String(sharedValue)) {
      conflicts += 1;
    }
  });

  if (conflicts > 0) {
    const conflictNote = `${new Date().toISOString()}: Team sync kept local values for ${conflicts} conflicting field${conflicts === 1 ? "" : "s"} from ${shared.company || "shared record"}.`;
    merged.teamSyncNotes = combineNoteValues(merged.teamSyncNotes, conflictNote);
  }

  return {
    prospect: normalizeProspect(merged),
    filled,
    conflicts
  };
}

function mapProspectsByIdentity(records) {
  const map = new Map();

  records.forEach((record, index) => {
    const keys = getDuplicateKeys(record);
    const fallbackKey = `row:${index}:${record.company || record.website || "unknown"}`;
    const identity = keys.find((key) => map.has(key)) || keys[0] || fallbackKey;
    map.set(identity, {
      index,
      record
    });
    keys.forEach((key) => map.set(key, { index, record }));
  });

  return map;
}

function mergeProspectLists(localRecords, sharedRecords) {
  const mergedRecords = localRecords.map(normalizeProspect);
  const mergedIndex = mapProspectsByIdentity(mergedRecords);
  const stats = {
    added: 0,
    merged: 0,
    filled: 0,
    conflicts: 0
  };

  sharedRecords.map(normalizeProspect).forEach((sharedRecord) => {
    const match = getDuplicateKeys(sharedRecord).map((key) => mergedIndex.get(key)).find(Boolean);

    if (!match) {
      mergedRecords.push(sharedRecord);
      const newIndex = mergedRecords.length - 1;
      getDuplicateKeys(sharedRecord).forEach((key) => mergedIndex.set(key, { index: newIndex, record: sharedRecord }));
      stats.added += 1;
      return;
    }

    const result = mergeProspectRecords(match.record, sharedRecord);
    mergedRecords[match.index] = result.prospect;
    match.record = result.prospect;
    getDuplicateKeys(result.prospect).forEach((key) => mergedIndex.set(key, { index: match.index, record: result.prospect }));
    stats.merged += 1;
    stats.filled += result.filled;
    stats.conflicts += result.conflicts;
  });

  return {
    prospects: mergedRecords,
    stats
  };
}

function setTeamSyncStatus(message, state = "") {
  teamSyncStatus.textContent = message;
  teamSyncStatus.dataset.state = state;
}

function getTeamSyncActor() {
  return localStorage.getItem("regent-growth-team-sync-actor") || "Local browser";
}

function renderTeamSyncActor() {
  teamActorInput.value = getTeamSyncActor();
}

function saveTeamSyncActor(event) {
  event.preventDefault();
  const actor = teamActorInput.value.trim() || "Local browser";
  localStorage.setItem("regent-growth-team-sync-actor", actor);
  renderTeamSyncActor();
  setTeamSyncStatus(`Team sync name saved as ${actor}.`);
}

function renderTeamSyncHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    teamSyncHistory.innerHTML = `<p class="empty-state">No shared sync activity yet.</p>`;
    return;
  }

  teamSyncHistory.innerHTML = history.slice(0, 6).map((item) => `
    <article class="sync-history-item">
      <div>
        <strong>${escapeHtml(item.summary || "Shared store updated.")}</strong>
        <p>${escapeHtml(item.actor || "Local user")} | ${escapeHtml(formatDateTime(item.createdAt))}</p>
      </div>
      <span>${escapeHtml(item.recordCount ?? 0)} records</span>
    </article>
  `).join("");
}

function renderTeamBackupList(backups = []) {
  if (!Array.isArray(backups) || backups.length === 0) {
    teamBackupList.innerHTML = `<p class="empty-state">No automatic restore backups yet.</p>`;
    return;
  }

  teamBackupList.innerHTML = backups.slice(0, 6).map((backup) => `
    <article class="backup-item">
      <div>
        <strong>${escapeHtml(backup.filename)}</strong>
        <p>${escapeHtml(backup.recordCount ?? 0)} records | ${escapeHtml(backup.historyCount ?? 0)} history items | ${escapeHtml(formatFileSize(backup.sizeBytes))}</p>
        <p>${escapeHtml(backup.reason || "Automatic safety backup")} | ${escapeHtml(formatDateTime(backup.createdAt))}</p>
      </div>
      <div class="backup-actions">
        <button class="secondary-button" type="button" data-action="preview-backup" data-filename="${escapeHtml(backup.filename)}">Preview restore</button>
        <button class="danger-button" type="button" data-action="delete-backup" data-filename="${escapeHtml(backup.filename)}">Delete</button>
      </div>
    </article>
  `).join("");
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function refreshTeamBackups() {
  refreshTeamBackupsButton.disabled = true;

  try {
    const response = await fetch(teamBackupsEndpoint);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Team backups returned ${response.status}.`);
    }

    renderTeamBackupList(payload.backups);
    const backupCount = Array.isArray(payload.backups) ? payload.backups.length : 0;
    const retentionText = payload.retentionLimit ? ` Retention keeps the newest ${payload.retentionLimit}.` : "";
    setTeamSyncStatus(`Loaded ${backupCount} shared-store backup${backupCount === 1 ? "" : "s"}.${retentionText}`);
  } catch (error) {
    renderTeamBackupList([]);
    setTeamSyncStatus(isLocalFile()
      ? "Backup browser needs the local research server. Run local-research-server.js and open the local URL."
      : error.message,
    "error");
  } finally {
    refreshTeamBackupsButton.disabled = false;
  }
}

async function previewAutomaticTeamBackup(filename) {
  setTeamSyncStatus(`Loading backup ${filename}...`, "working");

  try {
    const response = await fetch(`${teamBackupEndpoint}?filename=${encodeURIComponent(filename)}`);
    const backup = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(backup.message || `Backup preview returned ${response.status}.`);
    }

    if (!Array.isArray(backup.records)) {
      throw new Error("Backup file does not contain a records array.");
    }

    pendingTeamRestore = {
      fileName: backup.filename || filename,
      records: backup.records.map(normalizeProspect),
      history: Array.isArray(backup.history) ? backup.history : [],
      exportedAt: backup.exportedAt || backup.createdAt || "",
      updatedAt: backup.updatedAt || ""
    };
    renderTeamRestorePreview();
    setTeamSyncStatus(`Preview loaded for ${pendingTeamRestore.fileName}. Confirm restore to replace the shared team store.`);
  } catch (error) {
    clearTeamRestorePreview();
    setTeamSyncStatus(`Backup preview failed: ${error.message}`, "error");
  }
}

async function deleteAutomaticTeamBackup(filename) {
  setTeamSyncStatus(`Deleting backup ${filename}...`, "working");

  try {
    const response = await fetch(`${teamBackupEndpoint}?filename=${encodeURIComponent(filename)}`, {
      method: "DELETE"
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Backup delete returned ${response.status}.`);
    }

    if (pendingTeamRestore?.fileName === filename) {
      clearTeamRestorePreview();
    }

    setTeamSyncStatus(`Deleted backup ${filename}.`);
    await refreshTeamBackups();
  } catch (error) {
    setTeamSyncStatus(`Backup delete failed: ${error.message}`, "error");
  }
}

async function readTeamProspects() {
  const response = await fetch(teamProspectsEndpoint);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Team sync returned ${response.status}.`);
  }

  return {
    updatedAt: payload.updatedAt || "",
    records: Array.isArray(payload.records) ? payload.records.map(normalizeProspect) : [],
    history: Array.isArray(payload.history) ? payload.history : []
  };
}

async function checkTeamSync() {
  setTeamSyncStatus("Checking shared team store...", "working");

  try {
    const payload = await readTeamProspects();
    renderTeamSyncHistory(payload.history);
    setTeamSyncStatus(payload.records.length === 0
      ? `Shared team store is ready but empty. Push local prospects as ${getTeamSyncActor()} to seed it.`
      : `Shared team store has ${payload.records.length} prospect${payload.records.length === 1 ? "" : "s"}${payload.updatedAt ? `, updated ${formatDateTime(payload.updatedAt)}` : ""}. Pushes will be logged as ${getTeamSyncActor()}.`);
  } catch (error) {
    setTeamSyncStatus(isLocalFile()
      ? "Team sync needs the local research server. Run local-research-server.js and open the local URL."
      : error.message,
    "error");
  }
}

async function pullTeamProspects() {
  pullTeamProspectsButton.disabled = true;
  setTeamSyncStatus("Pulling shared team prospects...", "working");

  try {
    const payload = await readTeamProspects();
    renderTeamSyncHistory(payload.history);

    if (payload.records.length === 0) {
      setTeamSyncStatus("Shared team store is empty. Push local prospects first.", "error");
      return;
    }

    const result = mergeProspectLists(prospects, payload.records);
    prospects = result.prospects;
    selectedProspectIndex = 0;
    saveProspects();
    resetForm();
    renderProspects();
    setTeamSyncStatus(`Merged shared store: ${result.stats.added} added, ${result.stats.merged} matched, ${result.stats.filled} fields filled, ${result.stats.conflicts} local conflicts preserved.`);
    setDataStatus("Shared team prospects merged into this browser.");
  } catch (error) {
    setTeamSyncStatus(error.message, "error");
  } finally {
    pullTeamProspectsButton.disabled = false;
  }
}

async function pushTeamProspects() {
  pushTeamProspectsButton.disabled = true;
  setTeamSyncStatus("Pushing local prospects to shared team store...", "working");

  try {
    const shared = await readTeamProspects();
    const result = mergeProspectLists(prospects, shared.records);
    const response = await fetch(teamProspectsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: result.prospects,
        activity: {
          type: "push",
          actor: getTeamSyncActor(),
          summary: `Pushed merged team store with ${result.prospects.length} prospect${result.prospects.length === 1 ? "" : "s"}.`,
          stats: result.stats
        }
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Team sync returned ${response.status}.`);
    }

    prospects = result.prospects;
    saveProspects();
    renderProspects();
    renderTeamSyncHistory(payload.history);
    setTeamSyncStatus(`Pushed merged team store: ${result.prospects.length} total, ${result.stats.added} shared-only added locally, ${result.stats.conflicts} local conflicts preserved.`);
    setDataStatus(`Shared team store updated at ${formatDateTime(payload.updatedAt)}.`);
  } catch (error) {
    setTeamSyncStatus(error.message, "error");
  } finally {
    pushTeamProspectsButton.disabled = false;
  }
}

async function exportTeamBackup() {
  exportTeamBackupButton.disabled = true;
  setTeamSyncStatus("Preparing shared team backup...", "working");

  try {
    const payload = await readTeamProspects();
    const backup = {
      source: "regent-growth-team-sync-backup",
      exportedAt: new Date().toISOString(),
      updatedAt: payload.updatedAt,
      actor: getTeamSyncActor(),
      records: payload.records,
      history: payload.history
    };
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadFile(`regent-growth-team-sync-backup-${stamp}.json`, JSON.stringify(backup, null, 2), "application/json;charset=utf-8");
    renderTeamSyncHistory(payload.history);
    setTeamSyncStatus(`Exported shared team backup with ${payload.records.length} prospect${payload.records.length === 1 ? "" : "s"}.`);
  } catch (error) {
    setTeamSyncStatus(error.message, "error");
  } finally {
    exportTeamBackupButton.disabled = false;
  }
}

function clearTeamRestorePreview() {
  pendingTeamRestore = null;
  teamRestorePreview.hidden = true;
  teamRestorePreview.innerHTML = "";
}

function renderTeamRestorePreview() {
  if (!pendingTeamRestore) {
    clearTeamRestorePreview();
    return;
  }

  const { fileName, records, history, exportedAt, updatedAt } = pendingTeamRestore;
  teamRestorePreview.hidden = false;
  teamRestorePreview.innerHTML = `
    <div>
      <p class="eyebrow">Restore Preview</p>
      <strong>${escapeHtml(fileName)}</strong>
      <p>${escapeHtml(records.length)} prospect${records.length === 1 ? "" : "s"} | ${escapeHtml(history.length)} history item${history.length === 1 ? "" : "s"}</p>
      <p>Exported ${escapeHtml(formatDateTime(exportedAt))}${updatedAt ? ` | Store updated ${escapeHtml(formatDateTime(updatedAt))}` : ""}</p>
    </div>
    <div class="restore-preview-actions">
      <button id="confirmTeamRestoreButton" type="button">Restore now</button>
      <button id="cancelTeamRestoreButton" class="secondary-button" type="button">Cancel</button>
    </div>
  `;
}

async function restoreTeamBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.records)) {
      throw new Error("Backup file does not contain a records array.");
    }

    const records = backup.records.map(normalizeProspect);
    const history = Array.isArray(backup.history) ? backup.history : [];

    pendingTeamRestore = {
      fileName: file.name,
      records,
      history,
      exportedAt: backup.exportedAt || "",
      updatedAt: backup.updatedAt || ""
    };
    renderTeamRestorePreview();
    setTeamSyncStatus(`Preview loaded for ${file.name}. Confirm restore to replace the shared team store.`);
  } catch (error) {
    clearTeamRestorePreview();
    setTeamSyncStatus(`Restore preview failed: ${error.message}`, "error");
  } finally {
    restoreTeamBackupInput.value = "";
  }
}

async function confirmTeamBackupRestore() {
  if (!pendingTeamRestore) {
    setTeamSyncStatus("Choose a backup file before restoring.", "error");
    return;
  }

  const { fileName, records, history } = pendingTeamRestore;
  setTeamSyncStatus(`Restoring shared team backup from ${fileName}...`, "working");

  try {
    const response = await fetch(teamProspectsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records,
        history,
        activity: {
          type: "restore",
          actor: getTeamSyncActor(),
          summary: `Restored shared team backup from ${fileName}.`,
          stats: {
            restored: records.length,
            history: history.length
          }
        }
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Team backup restore returned ${response.status}.`);
    }

    renderTeamSyncHistory(payload.history);
    clearTeamRestorePreview();
    const backupText = payload.backup?.filename ? ` Safety backup saved as ${payload.backup.filename}.` : "";
    const retentionText = payload.backup?.retention?.deletedCount
      ? ` Retention pruned ${payload.backup.retention.deletedCount} old backup${payload.backup.retention.deletedCount === 1 ? "" : "s"}.`
      : "";
    setTeamSyncStatus(`Restored shared team backup with ${records.length} prospect${records.length === 1 ? "" : "s"}.${backupText}${retentionText}`);
    setDataStatus("Shared team store restored from backup. Merge shared to update this browser.");
  } catch (error) {
    setTeamSyncStatus(`Restore failed: ${error.message}`, "error");
  }
}

function savePromptTemplates() {
  localStorage.setItem(promptStorageKey, JSON.stringify(promptTemplates));
}

function saveDiscoveryQueue() {
  localStorage.setItem(discoveryStorageKey, JSON.stringify(discoveryQueue));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProspects() {
  const selectedStage = stageFilter.value;
  const selectedResponse = responseFilter.value;
  const selectedView = savedViews.dataset.activeView || "all";
  const selectedOwner = savedViews.dataset.activeOwner || "";
  const visibleProspects = prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter((item) => selectedStage === "all" || item.prospect.stage === selectedStage)
    .filter((item) => selectedResponse === "all" || item.prospect.responseStatus === selectedResponse)
    .filter((item) => matchesSavedView(item.prospect, selectedView))
    .filter((item) => !selectedOwner || getOwnerName(item.prospect) === selectedOwner);

  if (visibleProspects.length === 0) {
    prospectList.innerHTML = `<p class="empty-state">${escapeHtml(getEmptyProspectMessage(selectedStage, selectedResponse, selectedView, selectedOwner))}</p>`;
  } else {
    prospectList.innerHTML = visibleProspects.map(({ prospect, index }) => `
      <article class="prospect-card ${index === selectedProspectIndex ? "selected-card" : ""}">
        <div>
          <h3>${escapeHtml(prospect.company)}</h3>
          <p class="prospect-meta">${escapeHtml(prospect.industry)} | ${escapeHtml(prospect.size)} | ${escapeHtml(prospect.website)}</p>
          <p>${escapeHtml(prospect.fit)}</p>
          <p><strong>Decision-maker:</strong> ${escapeHtml(prospect.decisionMaker)}</p>
          <p><strong>Trigger:</strong> ${escapeHtml(prospect.trigger)}</p>
          <p><strong>Response:</strong> ${escapeHtml(prospect.responseStatus)}${prospect.nextTouch ? ` | Next ${escapeHtml(formatDate(prospect.nextTouch))}` : ""}</p>
          <p class="score">Fit score ${escapeHtml(prospect.score)}</p>
        </div>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-action="select" data-index="${index}">Use for AI</button>
          <button type="button" data-action="advance" data-index="${index}">${escapeHtml(prospect.stage)}</button>
          <button class="secondary-button" type="button" data-action="edit" data-index="${index}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-index="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  updateMetrics();
  renderSavedViews();
  const selectedVisibleProspect = visibleProspects.find((item) => item.index === selectedProspectIndex);
  const selectedProspect = selectedVisibleProspect?.prospect || visibleProspects[0]?.prospect || null;
  selectedProspectIndex = selectedProspect ? prospects.indexOf(selectedProspect) : -1;
  setDrafts(selectedProspect);
  renderSelectedDetail();
  renderReminders();
  renderHandoff();
  renderOwnerDashboard();
}

function renderDiscoveryQueue() {
  if (discoveryQueue.length === 0) {
    discoveryList.innerHTML = `<p class="empty-state">No discovery candidates yet. Generate candidates from your target industries and qualification signals.</p>`;
    return;
  }

  discoveryList.innerHTML = discoveryQueue.map((candidate) => `
    <article class="discovery-card" data-id="${escapeHtml(candidate.id)}">
      <div>
        <div class="discovery-title">
          <h3>${escapeHtml(candidate.company)}</h3>
          <span>Fit score ${escapeHtml(candidate.score)}</span>
        </div>
        <p class="prospect-meta">${escapeHtml(candidate.industry || "Industry unknown")} | ${escapeHtml(candidate.size || "Size unknown")} | ${escapeHtml(candidate.website || "Website unknown")}</p>
        <p><strong>Decision-maker:</strong> ${escapeHtml(candidate.decisionMaker || "Unknown")}</p>
        <p><strong>Trigger:</strong> ${escapeHtml(candidate.trigger || "No trigger generated.")}</p>
        <p>${escapeHtml(candidate.fit || "No fit reason generated.")}</p>
        <p class="source-reason">${escapeHtml(candidate.sourceReason || "Generated from your discovery criteria.")}</p>
        <div class="source-links">
          ${renderSourceLinks(candidate)}
        </div>
        <div class="source-controls">
          <label>
            Source status
            <select data-source-status>
              ${sourceStatuses.map((status) => `<option value="${escapeHtml(status)}" ${candidate.sourceStatus === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}
            </select>
          </label>
          <label>
            Evidence notes
            <textarea data-source-notes placeholder="Paste proof from company site, LinkedIn, jobs page, news, or directory listing.">${escapeHtml(candidate.sourceNotes)}</textarea>
          </label>
          <button class="secondary-button" type="button" data-action="search-source" data-id="${escapeHtml(candidate.id)}">Search sources</button>
          <button class="secondary-button" type="button" data-action="fetch-source" data-id="${escapeHtml(candidate.id)}" ${candidate.website ? "" : "disabled"}>Fetch website</button>
          <button class="secondary-button" type="button" data-action="save-source" data-id="${escapeHtml(candidate.id)}">Save evidence</button>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" data-action="add-discovery" data-id="${escapeHtml(candidate.id)}">Add prospect</button>
        <button class="secondary-button" type="button" data-action="dismiss-discovery" data-id="${escapeHtml(candidate.id)}">Dismiss</button>
      </div>
    </article>
  `).join("");
}

function buildSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function renderSourceLinks(candidate) {
  const company = candidate.company || "";
  const location = discoveryForm.elements.location?.value || "";
  const industry = candidate.industry || discoveryForm.elements.industries?.value || "";
  const websiteUrl = toExternalUrl(candidate.website || "");
  const links = [
    websiteUrl ? { label: "Website", url: websiteUrl } : null,
    { label: "Company search", url: buildSearchUrl(`${company} ${industry} ${location}`) },
    { label: "Hiring signal", url: buildSearchUrl(`${company} hiring expansion sales operations`) },
    { label: "LinkedIn", url: buildSearchUrl(`${company} LinkedIn company`) },
    { label: "News", url: buildSearchUrl(`${company} growth funding new location launch`) }
  ].filter(Boolean);

  return links.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("");
}

function matchesSavedView(prospect, selectedView) {
  const viewPredicates = {
    all: () => true,
    replied: (item) => item.responseStatus === "Replied",
    interested: (item) => item.responseStatus === "Interested",
    meetings: (item) => item.stage === "Meeting" || item.responseStatus === "Meeting Booked",
    assigned: (item) => isAssignedHandoff(item),
    blocked: (item) => isBlockedHandoff(item),
    "not-interested": (item) => item.responseStatus === "Not Interested",
    "no-response": (item) => item.responseStatus === "No Response",
    "follow-up-due": isFollowUpDue
  };

  return (viewPredicates[selectedView] || viewPredicates.all)(prospect);
}

function getSavedViewLabel(selectedView) {
  const labels = {
    all: "All",
    replied: "Replied",
    interested: "Interested",
    meetings: "Meetings",
    assigned: "Assigned",
    blocked: "Blocked",
    "not-interested": "Not Interested",
    "no-response": "No Response",
    "follow-up-due": "Follow-up Due"
  };

  return labels[selectedView] || labels.all;
}

function getEmptyProspectMessage(selectedStage, selectedResponse, selectedView, selectedOwner = "") {
  const hasStageFilter = selectedStage !== "all";
  const hasResponseFilter = selectedResponse !== "all";
  const hasSavedView = selectedView !== "all";

  if (selectedOwner) {
    return `No companies match the ${getSavedViewLabel(selectedView)} view for ${selectedOwner}.`;
  }

  if (hasSavedView) {
    return `No companies match the ${getSavedViewLabel(selectedView)} view with the current filters.`;
  }

  if (hasStageFilter && hasResponseFilter) {
    return `No companies match ${selectedStage} with ${selectedResponse} response.`;
  }

  if (hasResponseFilter) {
    return `No companies match ${selectedResponse} response yet.`;
  }

  return "No companies added yet.";
}

function renderSavedViews() {
  const activeView = savedViews.dataset.activeView || "all";
  const buttons = savedViews.querySelectorAll("button[data-view]");

  buttons.forEach((button) => {
    const isActive = button.dataset.view === activeView;
    button.classList.toggle("secondary-button", !isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateMetrics() {
  document.querySelector("#qualifiedMetric").textContent = prospects.length;
  document.querySelector("#emailMetric").textContent = prospects.filter((prospect) => prospect.stage !== "Research").length;
  document.querySelector("#followUpMetric").textContent = prospects.filter(isFollowUpDue).length;
  document.querySelector("#meetingMetric").textContent = prospects.filter((prospect) => prospect.stage === "Meeting" || prospect.responseStatus === "Meeting Booked").length;
  document.querySelector("#assignedMetric").textContent = prospects.filter(isAssignedHandoff).length;
  document.querySelector("#blockedMetric").textContent = prospects.filter(isBlockedHandoff).length;
}

function isWarmLead(prospect) {
  return prospect.responseStatus === "Interested"
    || prospect.responseStatus === "Meeting Booked"
    || prospect.stage === "Meeting"
    || prospect.stage === "Assessment";
}

function isAssignedHandoff(prospect) {
  return Boolean(prospect.handoffOwner) || ["Assigned", "In Review", "Handed Off", "Accepted"].includes(prospect.handoffStatus);
}

function isBlockedHandoff(prospect) {
  return prospect.handoffStatus === "Blocked";
}

function getOwnerName(prospect) {
  return prospect.handoffOwner?.trim() || "Unassigned";
}

function getOwnerWorkloads() {
  const workloads = new Map();

  prospects.filter((prospect) => isWarmLead(prospect) || isAssignedHandoff(prospect)).forEach((prospect) => {
    const owner = getOwnerName(prospect);
    const workload = workloads.get(owner) || {
      owner,
      total: 0,
      blocked: 0,
      due: 0,
      accepted: 0
    };

    workload.total += 1;
    if (isBlockedHandoff(prospect)) workload.blocked += 1;
    if (prospect.handoffDue && daysUntil(prospect.handoffDue) <= 0) workload.due += 1;
    if (prospect.handoffStatus === "Accepted") workload.accepted += 1;
    workloads.set(owner, workload);
  });

  return Array.from(workloads.values()).sort((first, second) => second.total - first.total || first.owner.localeCompare(second.owner));
}

function renderOwnerDashboard() {
  const workloads = getOwnerWorkloads();
  const blockedProspects = prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter(({ prospect }) => isBlockedHandoff(prospect));

  ownerDashboardCount.textContent = `${workloads.reduce((sum, item) => sum + item.total, 0)} active`;

  if (workloads.length === 0) {
    ownerWorkloadList.innerHTML = `<p class="empty-state">No assigned handoffs yet. Mark a warm lead CRM ready, then assign an owner.</p>`;
  } else {
    ownerWorkloadList.innerHTML = workloads.map((workload) => `
      <button class="owner-row" type="button" data-owner="${escapeHtml(workload.owner)}">
        <span>${escapeHtml(workload.owner)}</span>
        <strong>${escapeHtml(workload.total)}</strong>
        <small>${escapeHtml(workload.due)} due | ${escapeHtml(workload.blocked)} blocked | ${escapeHtml(workload.accepted)} accepted</small>
      </button>
    `).join("");
  }

  if (blockedProspects.length === 0) {
    blockedHandoffList.innerHTML = `<p class="empty-state">No blocked handoffs.</p>`;
  } else {
    blockedHandoffList.innerHTML = blockedProspects.map(({ prospect, index }) => `
      <article class="blocked-item">
        <div>
          <h4>${escapeHtml(prospect.company)}</h4>
          <p>${escapeHtml(getOwnerName(prospect))} | Due ${escapeHtml(formatDate(prospect.handoffDue))}</p>
          <p>${previewText(prospect.handoffNotes, "No blocker note recorded.")}</p>
        </div>
        <button class="secondary-button" type="button" data-action="select-blocked" data-index="${index}">Open</button>
      </article>
    `).join("");
  }
}

function getSelectedProspect() {
  return selectedProspectIndex >= 0 ? prospects[selectedProspectIndex] : null;
}

function isFollowUpDue(prospect) {
  if (!prospect.nextTouch || isClosedResponse(prospect)) {
    return false;
  }

  return daysUntil(prospect.nextTouch) <= 0;
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function isClosedResponse(prospect) {
  return ["Meeting Booked", "Not Interested"].includes(prospect.responseStatus);
}

function getTodayString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDateInputValue(today);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysUntil(dateString) {
  const today = new Date(`${getTodayString()}T00:00:00`);
  const target = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round((target - today) / 86400000);
}

function getReminderLabel(days) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function renderReminders() {
  const reminders = prospects
    .map((prospect, index) => ({ prospect, index, days: prospect.nextTouch ? daysUntil(prospect.nextTouch) : Number.POSITIVE_INFINITY }))
    .filter(({ prospect, days }) => prospect.nextTouch && !isClosedResponse(prospect) && Number.isFinite(days))
    .sort((first, second) => first.days - second.days);

  reminderCount.textContent = `${reminders.length} scheduled`;

  if (reminders.length === 0) {
    reminderList.innerHTML = `<p class="empty-state">No follow-up reminders scheduled yet. Add a next touch date on any prospect to place it here.</p>`;
    return;
  }

  reminderList.innerHTML = reminders.map(({ prospect, index, days }) => `
    <article class="reminder-item ${days <= 0 ? "reminder-due" : ""}">
      <div>
        <div class="reminder-title">
          <h3>${escapeHtml(prospect.company)}</h3>
          <span>${escapeHtml(getReminderLabel(days))}</span>
        </div>
        <p>${escapeHtml(prospect.decisionMaker || "Decision-maker not set")} | ${escapeHtml(prospect.stage)} | ${escapeHtml(prospect.responseStatus)}</p>
        <p><strong>Next:</strong> ${escapeHtml(formatDate(prospect.nextTouch))}${prospect.responseNotes ? ` | ${escapeHtml(prospect.responseNotes)}` : ""}</p>
      </div>
      <div class="reminder-actions">
        <button type="button" data-action="complete-reminder" data-index="${index}">Mark touched</button>
        <button class="secondary-button" type="button" data-action="snooze-reminder" data-days="2" data-index="${index}">Snooze 2d</button>
        <button class="secondary-button" type="button" data-action="snooze-reminder" data-days="7" data-index="${index}">Snooze 7d</button>
      </div>
    </article>
  `).join("");
}

function getNextAction(stage) {
  const actions = {
    Research: "Generate the account brief and identify the strongest decision-maker angle.",
    "Email Drafted": "Review the email draft, personalize the opener, and send the first touch.",
    Sequence: "Schedule the next follow-up and watch for replies.",
    LinkedIn: "Send or review the LinkedIn connection request.",
    Call: "Make the call and record the outcome.",
    Meeting: "Confirm the meeting details and prepare discovery notes.",
    Assessment: "Complete assessment notes and decide whether to hand off as a warm lead."
  };

  return actions[stage] || actions.Research;
}

function previewText(value, fallback) {
  const text = value?.trim() || fallback;
  return escapeHtml(text).replaceAll("\n", "<br>");
}

function toExternalUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const urlValue = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(urlValue);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderBookingLink(value) {
  const url = toExternalUrl(value);

  if (!value) {
    return "<strong>Not set</strong>";
  }

  if (!url) {
    return `<strong>${escapeHtml(value)}</strong>`;
  }

  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
}

function renderEmailLink(value) {
  if (!value) return "<strong>Not set</strong>";
  return `<a href="mailto:${escapeHtml(value)}">${escapeHtml(value)}</a>`;
}

function renderPhoneLink(value) {
  if (!value) return "<strong>Not set</strong>";
  const dialValue = value.replace(/[^\d+]/g, "");
  return dialValue ? `<a href="tel:${escapeHtml(dialValue)}">${escapeHtml(value)}</a>` : `<strong>${escapeHtml(value)}</strong>`;
}

function renderExternalLink(value) {
  const url = toExternalUrl(value);

  if (!value) {
    return "<strong>Not set</strong>";
  }

  if (!url) {
    return `<strong>${escapeHtml(value)}</strong>`;
  }

  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
}

function renderSelectedDetail() {
  const prospect = getSelectedProspect();

  if (!prospect) {
    detailCompany.textContent = "Company Detail";
    selectedDetail.innerHTML = `<p class="empty-state">Select or add a prospect to view details.</p>`;
    detailAdvanceButton.disabled = true;
    detailEditButton.disabled = true;
    responseForm.hidden = true;
    workflowForm.hidden = true;
    assessmentForm.hidden = true;
    return;
  }

  detailCompany.textContent = prospect.company;
  detailAdvanceButton.disabled = false;
  detailEditButton.disabled = false;
  responseForm.hidden = false;
  workflowForm.hidden = false;
  assessmentForm.hidden = false;
  detailResponseStatus.value = prospect.responseStatus;
  detailLastTouch.value = prospect.lastTouch;
  detailNextTouch.value = prospect.nextTouch;
  detailResponseNotes.value = prospect.responseNotes;
  detailLinkedInStatus.value = prospect.linkedInStatus;
  detailCallStatus.value = prospect.callStatus;
  detailLinkedInNotes.value = prospect.linkedInNotes;
  detailCallNotes.value = prospect.callNotes;
  detailMeetingDate.value = prospect.meetingDate;
  detailMeetingOutcome.value = prospect.meetingOutcome;
  detailAssessmentNotes.value = prospect.assessmentNotes;
  selectedDetail.innerHTML = `
    <article>
      <span>Stage</span>
      <strong>${escapeHtml(prospect.stage)}</strong>
    </article>
    <article>
      <span>Fit Score</span>
      <strong>${escapeHtml(prospect.score)}</strong>
    </article>
    <article>
      <span>Decision-Maker</span>
      <strong>${escapeHtml(prospect.decisionMaker || "Unknown")}</strong>
    </article>
    <article>
      <span>Contact Email</span>
      <p>${renderEmailLink(prospect.contactEmail)}</p>
    </article>
    <article>
      <span>LinkedIn</span>
      <p>${renderExternalLink(prospect.contactLinkedIn)}</p>
    </article>
    <article>
      <span>Phone</span>
      <p>${renderPhoneLink(prospect.contactPhone)}</p>
    </article>
    <article>
      <span>Website</span>
      <strong>${escapeHtml(prospect.website || "Unknown")}</strong>
    </article>
    <article>
      <span>Response</span>
      <strong>${escapeHtml(prospect.responseStatus)}</strong>
    </article>
    <article>
      <span>LinkedIn Task</span>
      <strong>${escapeHtml(prospect.linkedInStatus)}</strong>
    </article>
    <article>
      <span>Call Task</span>
      <strong>${escapeHtml(prospect.callStatus)}</strong>
    </article>
    <article>
      <span>Last Touch</span>
      <strong>${escapeHtml(formatDate(prospect.lastTouch))}</strong>
    </article>
    <article>
      <span>Next Touch</span>
      <strong>${escapeHtml(formatDate(prospect.nextTouch))}</strong>
    </article>
    <article>
      <span>Follow-Up Due</span>
      <strong>${isFollowUpDue(prospect) ? "Yes" : "No"}</strong>
    </article>
    <article>
      <span>Meeting Date</span>
      <strong>${escapeHtml(formatDateTime(prospect.meetingDate))}</strong>
    </article>
    <article>
      <span>Meeting Outcome</span>
      <strong>${escapeHtml(prospect.meetingOutcome)}</strong>
    </article>
    <article>
      <span>Handoff Owner</span>
      <strong>${escapeHtml(prospect.handoffOwner || "Unassigned")}</strong>
    </article>
    <article>
      <span>Handoff Status</span>
      <strong>${escapeHtml(prospect.handoffStatus)}</strong>
    </article>
    <article>
      <span>Handoff Due</span>
      <strong>${escapeHtml(formatDate(prospect.handoffDue))}</strong>
    </article>
    <article>
      <span>CRM Sync</span>
      <strong>${escapeHtml(prospect.crmSyncStatus || "Not Synced")}</strong>
    </article>
    <article>
      <span>CRM Synced At</span>
      <strong>${escapeHtml(formatDateTime(prospect.crmSyncedAt))}</strong>
    </article>
    <article class="detail-wide">
      <span>Booking Link</span>
      <p>${renderBookingLink(prospect.bookingLink)}</p>
    </article>
    <article class="detail-wide">
      <span>Buying Trigger</span>
      <p>${escapeHtml(prospect.trigger || "No trigger recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Fit Reason</span>
      <p>${escapeHtml(prospect.fit || "No fit reason recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Next Action</span>
      <p>${escapeHtml(getNextAction(prospect.stage))}</p>
    </article>
    <article class="detail-wide">
      <span>Response Notes</span>
      <p>${previewText(prospect.responseNotes, "No response notes recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>LinkedIn Notes</span>
      <p>${previewText(prospect.linkedInNotes, "No LinkedIn notes recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Call Notes</span>
      <p>${previewText(prospect.callNotes, "No call notes recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Assessment Notes</span>
      <p>${previewText(prospect.assessmentNotes, "No assessment notes recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Handoff Notes</span>
      <p>${previewText(prospect.handoffNotes, "No handoff notes recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>CRM Sync Notes</span>
      <p>${previewText(prospect.crmSyncNotes, "No CRM sync attempts recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Team Sync Notes</span>
      <p>${previewText(prospect.teamSyncNotes, "No team sync conflicts recorded yet.")}</p>
    </article>
    <article class="detail-wide">
      <span>Saved AI Brief</span>
      <p>${previewText(prospect.aiBrief, "Generate a company brief to attach research to this account.")}</p>
    </article>
    <article class="detail-wide">
      <span>Saved AI Email</span>
      <p>${previewText(prospect.aiEmail, "Generate an email draft to attach outreach copy to this account.")}</p>
    </article>
  `;
}

function setDrafts(prospect) {
  if (!prospect) {
    researchPrompt.value = "";
    emailDraft.value = "";
    return;
  }

  researchPrompt.value = prospect.aiBrief || `Research ${prospect.company} (${prospect.website}).

Find:
- what the company sells
- likely decision-makers
- recent growth signals
- sales or operations pain points
- why Regent Growth could help
- one specific opening line for an email

Known trigger: ${prospect.trigger}
Fit reason: ${prospect.fit}`;

  emailDraft.value = prospect.aiEmail || `Subject: Quick idea for ${prospect.company}

Hi {{first_name}},

I noticed ${prospect.company} is ${prospect.trigger.toLowerCase()}.

Regent Growth helps teams turn that kind of momentum into a steadier pipeline by finding qualified companies, researching the account, writing personalized outreach, and tracking follow-up through booked meetings.

Would it be worth a quick conversation to see if we can help your team add more qualified meetings this month?

Best,
Ibrahim`;
}

function setAiStatus(message, state = "idle") {
  aiStatus.textContent = message;
  aiStatus.dataset.state = state;
}

function setDataStatus(message, state = "idle") {
  dataStatus.textContent = message;
  dataStatus.dataset.state = state;
}

function setSearchSetupStatus(message, state = "idle") {
  searchSetupStatus.textContent = message;
  searchSetupStatus.dataset.state = state;
}

function renderPromptTemplates() {
  briefTemplateInput.value = promptTemplates.brief;
  emailTemplateInput.value = promptTemplates.email;
}

function savePromptTemplateEdits() {
  promptTemplates = {
    brief: briefTemplateInput.value.trim() || defaultPromptTemplates.brief,
    email: emailTemplateInput.value.trim() || defaultPromptTemplates.email
  };
  savePromptTemplates();
  setDataStatus("AI prompt templates saved.");
}

function resetPromptTemplates() {
  promptTemplates = structuredClone(defaultPromptTemplates);
  savePromptTemplates();
  renderPromptTemplates();
  setDataStatus("AI prompt templates reset.");
}

function renderTemplate(template, prospect) {
  const values = {
    company: prospect.company,
    industry: prospect.industry,
    size: prospect.size,
    website: prospect.website,
    decisionMaker: prospect.decisionMaker,
    trigger: prospect.trigger,
    fit: prospect.fit,
    stage: prospect.stage,
    score: prospect.score
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? "");
}

function buildResearchAgentPrompt(prospect) {
  return `You are Regent Growth's local AI account researcher.

Regent Growth helps businesses find qualified prospects, research accounts, write personalized outreach, track follow-up, and book more meetings.

Use only the company details below and reasonable business inference. Do not claim you browsed the web. Do not include hidden reasoning or chain-of-thought.

Company: ${prospect.company}
Industry: ${prospect.industry}
Size: ${prospect.size}
Website/domain: ${prospect.website}
Decision-maker role: ${prospect.decisionMaker}
Known buying trigger: ${prospect.trigger}
Known fit reason: ${prospect.fit}

Return one valid JSON object only. No markdown. Use these exact keys:
{
  "companySummary": "one sentence on what this company likely does",
  "likelyPainPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "decisionMakerAngle": "best angle for the listed decision-maker",
  "buyingTrigger": "best inferred buying trigger or improved version of the known trigger",
  "fitReason": "why Regent Growth is relevant for this account",
  "personalizedOpeningLine": "one concise cold email opening line"
}`;
}

function buildDiscoveryPrompt(criteria) {
  const existingCompanies = prospects.map((prospect) => prospect.company).filter(Boolean).join(", ") || "None yet";

  return `You are Regent Growth's local AI sales prospecting researcher.

Regent Growth helps businesses find qualified prospects, research accounts, write personalized outreach, track follow-up, and book more meetings.

Generate plausible B2B company candidates for outbound prospecting. Use only the criteria below and reasonable business inference. Do not claim you browsed the web. Avoid companies already in the existing pipeline.

Target industries: ${criteria.industries}
Target location: ${criteria.location}
Qualification signals: ${criteria.signals}
Number of candidates: ${criteria.count}
Existing pipeline companies: ${existingCompanies}

Return one valid JSON object only. No markdown. Use this exact shape:
{
  "candidates": [
    {
      "company": "company name",
      "industry": "industry",
      "size": "estimated employee count",
      "website": "likely domain if inferable, otherwise blank",
      "decisionMaker": "best decision-maker role",
      "score": 80,
      "trigger": "specific buying trigger",
      "fit": "why Regent Growth is relevant",
      "sourceReason": "why this candidate matched the discovery criteria"
    }
  ]
}`;
}

function parseJsonFromText(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error("AI did not return usable JSON.");
    }

    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
  }
}

function parseDiscoveryCandidates(text) {
  const parsed = parseJsonFromText(text);
  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];

  return candidates.map(normalizeDiscoveryCandidate).filter((candidate) => candidate.company && candidate.fit);
}

function formatResearchBrief(research) {
  const painPoints = Array.isArray(research.likelyPainPoints)
    ? research.likelyPainPoints
    : String(research.likelyPainPoints || "").split(/\n|;/).map((item) => item.trim()).filter(Boolean);

  return [
    "1. Company summary",
    research.companySummary || "No company summary returned.",
    "",
    "2. Likely pain points",
    painPoints.length > 0 ? painPoints.map((item) => `- ${item}`).join("\n") : "- No pain points returned.",
    "",
    "3. Best decision-maker angle",
    research.decisionMakerAngle || "No decision-maker angle returned.",
    "",
    "4. Buying trigger",
    research.buyingTrigger || "No buying trigger returned.",
    "",
    "5. Fit reason",
    research.fitReason || "No fit reason returned.",
    "",
    "6. Personalized opening line",
    research.personalizedOpeningLine || "No opening line returned."
  ].join("\n");
}

function applyResearchToProspect(prospect, research) {
  if (research.buyingTrigger) {
    prospect.trigger = String(research.buyingTrigger).trim();
  }

  if (research.fitReason) {
    prospect.fit = String(research.fitReason).trim();
  }

  if (research.decisionMakerAngle && !prospect.responseNotes) {
    prospect.responseNotes = `Decision-maker angle: ${String(research.decisionMakerAngle).trim()}`;
  }

  prospect.aiBrief = formatResearchBrief(research);
}

async function generateWithOllama(prompt, numPredict = 260) {
  const model = modelSelect.value;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ollamaTimeoutMs);
  setAiStatus(`Local AI working: ${model}. Qwen can take a minute on CPU.`, "working");

  try {
    const response = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        think: false,
        options: {
          temperature: 0.35,
          top_p: 0.9,
          num_predict: numPredict
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    setAiStatus(`Local AI ready: ${model}`, "idle");
    return data.response?.trim() || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateCompanyBrief() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  generateBriefButton.disabled = true;
  try {
    prospect.aiBrief = await generateWithOllama(renderTemplate(promptTemplates.brief, prospect), 220);
    researchPrompt.value = prospect.aiBrief;
    saveProspects();
    renderSelectedDetail();
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Local AI timed out. Try qwen2.5:0.5b for a quick draft or retry qwen3:8b."
      : "Local AI error: make sure Ollama is running and the model is installed.";
    setAiStatus(message, "error");
  } finally {
    generateBriefButton.disabled = false;
  }
}

async function researchSelectedAccount() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  researchAccountButton.disabled = true;
  generateBriefButton.disabled = true;
  try {
    const rawResearch = await generateWithOllama(buildResearchAgentPrompt(prospect), 420);
    const research = parseJsonFromText(rawResearch);
    applyResearchToProspect(prospect, research);
    researchPrompt.value = prospect.aiBrief;
    saveProspects();
    renderProspects();
    setDataStatus(`Research saved for ${prospect.company}.`);
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Local AI timed out. Try qwen2.5:0.5b for a quick research pass or retry qwen3:8b."
      : "Local AI research error: make sure Ollama is running and the model returned valid JSON.";
    setAiStatus(message, "error");
  } finally {
    researchAccountButton.disabled = false;
    generateBriefButton.disabled = false;
  }
}

async function generateDiscoveryCandidates() {
  const formData = new FormData(discoveryForm);
  const criteria = {
    industries: formData.get("industries").trim(),
    location: formData.get("location").trim(),
    count: Math.min(20, Math.max(3, Number(formData.get("count")) || 8)),
    signals: formData.get("signals").trim()
  };

  if (!criteria.industries || !criteria.signals) {
    setDataStatus("Add target industries and qualification signals before generating discovery candidates.", "error");
    return;
  }

  generateDiscoveryButton.disabled = true;
  try {
    const rawDiscovery = await generateWithOllama(buildDiscoveryPrompt(criteria), 900);
    const candidates = parseDiscoveryCandidates(rawDiscovery);

    if (candidates.length === 0) {
      throw new Error("No usable discovery candidates returned.");
    }

    const knownKeys = new Set();
    prospects.forEach((prospect) => addDuplicateKeys(knownKeys, prospect));
    discoveryQueue.forEach((candidate) => addDuplicateKeys(knownKeys, discoveryCandidateToProspect(candidate)));

    const newCandidates = [];
    let skippedDuplicates = 0;

    candidates.forEach((candidate) => {
      const prospect = discoveryCandidateToProspect(candidate);
      const keys = getDuplicateKeys(prospect);
      const isDuplicate = keys.some((key) => knownKeys.has(key));

      if (isDuplicate) {
        skippedDuplicates += 1;
        return;
      }

      newCandidates.push(candidate);
      addDuplicateKeys(knownKeys, prospect);
    });

    if (newCandidates.length === 0) {
      throw new Error(`No new discovery candidates added. Skipped ${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? "candidate" : "candidates"}.`);
    }

    discoveryQueue = [...newCandidates, ...discoveryQueue];
    saveDiscoveryQueue();
    renderDiscoveryQueue();
    const duplicateMessage = skippedDuplicates > 0 ? ` Skipped ${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? "candidate" : "candidates"}.` : "";
    setDataStatus(`Generated ${newCandidates.length} discovery candidates.${duplicateMessage}`);
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Local AI timed out. Try qwen2.5:0.5b or ask for fewer discovery candidates."
      : `Discovery error: ${error.message || "make sure Ollama is running and returned valid JSON."}`;
    setAiStatus(message, "error");
  } finally {
    generateDiscoveryButton.disabled = false;
  }
}

async function generatePersonalizedEmail() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  generateEmailButton.disabled = true;
  try {
    prospect.aiEmail = await generateWithOllama(renderTemplate(promptTemplates.email, prospect), 180);
    emailDraft.value = prospect.aiEmail;
    saveProspects();
    renderSelectedDetail();
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Local AI timed out. Try qwen2.5:0.5b for a quick draft or retry qwen3:8b."
      : "Local AI error: make sure Ollama is running and the model is installed.";
    setAiStatus(message, "error");
  } finally {
    generateEmailButton.disabled = false;
  }
}

function getDraftParts(rawDraft) {
  const draft = rawDraft.trim();
  const lines = draft.split(/\r?\n/);
  const subjectLine = lines.find((line) => /^subject:/i.test(line));
  const subject = subjectLine
    ? subjectLine.replace(/^subject:\s*/i, "").trim()
    : "Quick idea from Regent Growth";
  const body = subjectLine
    ? lines.filter((line) => line !== subjectLine).join("\n").trim()
    : draft;

  return {
    subject,
    body
  };
}

function getEmailRecipient(prospect) {
  return prospect.contactEmail || "";
}

function saveCurrentEmailDraft() {
  const prospect = getSelectedProspect();
  if (!prospect) return null;

  prospect.aiEmail = emailDraft.value.trim();
  saveProspects();
  renderSelectedDetail();
  setDataStatus(`Email draft saved for ${prospect.company}.`);
  return prospect;
}

function buildEmailHandoffUrl(provider, prospect) {
  const { subject, body } = getDraftParts(emailDraft.value);
  const to = getEmailRecipient(prospect);

  if (provider === "gmail") {
    const url = new URL("https://mail.google.com/mail/");
    url.searchParams.set("view", "cm");
    url.searchParams.set("fs", "1");
    url.searchParams.set("to", to);
    url.searchParams.set("su", subject);
    url.searchParams.set("body", body);
    return url.href;
  }

  if (provider === "outlook") {
    const url = new URL("https://outlook.office.com/mail/deeplink/compose");
    url.searchParams.set("to", to);
    url.searchParams.set("subject", subject);
    url.searchParams.set("body", body);
    return url.href;
  }

  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

function openEmailHandoff(provider) {
  const prospect = saveCurrentEmailDraft();
  if (!prospect) return;

  if (!emailDraft.value.trim()) {
    setDataStatus("Generate or write an email draft before opening a sending handoff.", "error");
    return;
  }

  window.open(buildEmailHandoffUrl(provider, prospect), "_blank", "noopener,noreferrer");
  setDataStatus(`${provider === "mailto" ? "Mail app" : provider} draft opened for ${prospect.company}.`);
}

async function copyEmailDraft() {
  const prospect = saveCurrentEmailDraft();
  if (!prospect) return;

  try {
    await navigator.clipboard.writeText(emailDraft.value.trim());
    setDataStatus(`Email draft copied for ${prospect.company}.`);
  } catch {
    emailDraft.select();
    document.execCommand("copy");
    setDataStatus(`Email draft selected for ${prospect.company}.`);
  }
}

function markEmailSent() {
  const prospect = saveCurrentEmailDraft();
  if (!prospect) return;

  prospect.lastTouch = getTodayString();
  prospect.nextTouch = addDays(prospect.lastTouch, 2);
  prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Contacted" : prospect.responseStatus;
  prospect.stage = stageOrder.indexOf(prospect.stage) < stageOrder.indexOf("Sequence") ? "Sequence" : prospect.stage;
  prospect.responseNotes = [prospect.responseNotes, "First email handoff marked sent."].filter(Boolean).join("\n");
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} marked contacted. Next touch scheduled for ${formatDate(prospect.nextTouch)}.`);
}

function getWarmLeads() {
  return prospects.filter(isWarmLead);
}

function getCrmRecord(prospect) {
  return {
    company: prospect.company,
    website: prospect.website,
    industry: prospect.industry,
    companySize: prospect.size,
    decisionMaker: prospect.decisionMaker,
    email: prospect.contactEmail,
    linkedIn: prospect.contactLinkedIn,
    phone: prospect.contactPhone,
    stage: prospect.stage,
    responseStatus: prospect.responseStatus,
    fitScore: prospect.score,
    buyingTrigger: prospect.trigger,
    fitReason: prospect.fit,
    bookingLink: prospect.bookingLink,
    meetingDate: prospect.meetingDate,
    meetingOutcome: prospect.meetingOutcome,
    assessmentNotes: prospect.assessmentNotes,
    handoffOwner: prospect.handoffOwner,
    handoffStatus: prospect.handoffStatus,
    handoffDue: prospect.handoffDue,
    handoffNotes: prospect.handoffNotes,
    crmSyncStatus: prospect.crmSyncStatus,
    crmSyncedAt: prospect.crmSyncedAt,
    crmSyncNotes: prospect.crmSyncNotes,
    teamSyncNotes: prospect.teamSyncNotes,
    lastTouch: prospect.lastTouch,
    nextTouch: prospect.nextTouch,
    linkedInStatus: prospect.linkedInStatus,
    callStatus: prospect.callStatus,
    notes: prospect.responseNotes,
    aiBrief: prospect.aiBrief,
    aiEmail: prospect.aiEmail
  };
}

function formatHandoffPacket(prospect) {
  if (!prospect) {
    return "Select a prospect to build a CRM handoff packet.";
  }

  const record = getCrmRecord(prospect);
  return [
    `CRM Handoff: ${record.company}`,
    "",
    `Stage: ${record.stage}`,
    `Response: ${record.responseStatus}`,
    `Fit score: ${record.fitScore}`,
    `Decision-maker: ${record.decisionMaker || "Not set"}`,
    `Email: ${record.email || "Not set"}`,
    `LinkedIn: ${record.linkedIn || "Not set"}`,
    `Phone: ${record.phone || "Not set"}`,
    `Website: ${record.website || "Not set"}`,
    `Booking link: ${record.bookingLink || "Not set"}`,
    `Meeting date: ${formatDateTime(record.meetingDate)}`,
    `Meeting outcome: ${record.meetingOutcome}`,
    `Handoff owner: ${record.handoffOwner || "Unassigned"}`,
    `Handoff status: ${record.handoffStatus}`,
    `Handoff due: ${formatDate(record.handoffDue)}`,
    `CRM sync: ${record.crmSyncStatus || "Not Synced"}`,
    `CRM synced at: ${formatDateTime(record.crmSyncedAt)}`,
    "",
    "Why this is warm",
    record.buyingTrigger || "No buying trigger recorded.",
    record.fitReason || "No fit reason recorded.",
    "",
    "Outreach status",
    `Last touch: ${formatDate(record.lastTouch)}`,
    `Next touch: ${formatDate(record.nextTouch)}`,
    `LinkedIn: ${record.linkedInStatus}`,
    `Call: ${record.callStatus}`,
    "",
    "Notes",
    record.notes || "No notes recorded.",
    "",
    "Assessment",
    record.assessmentNotes || "No assessment notes recorded.",
    "",
    "Handoff notes",
    record.handoffNotes || "No handoff notes recorded.",
    "",
    "CRM sync notes",
    record.crmSyncNotes || "No CRM sync attempts recorded.",
    "",
    "Team sync notes",
    record.teamSyncNotes || "No team sync conflicts recorded.",
    "",
    "AI brief",
    record.aiBrief || "No AI brief saved.",
    "",
    "Email draft",
    record.aiEmail || "No email draft saved."
  ].join("\n");
}

function renderHandoff() {
  const warmLeads = getWarmLeads();
  const selectedProspect = getSelectedProspect();
  const selectedIsWarm = selectedProspect ? isWarmLead(selectedProspect) : false;
  handoffSummary.textContent = `${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} ready for CRM export.${selectedIsWarm ? ` Selected: ${selectedProspect.company}.` : " Select or mark a warm lead to build its packet."}`;
  handoffPacket.value = formatHandoffPacket(selectedProspect);
  handoffOwnerInput.value = selectedProspect?.handoffOwner || "";
  handoffStatusInput.value = selectedProspect?.handoffStatus || "Unassigned";
  handoffDueInput.value = selectedProspect?.handoffDue || "";
  handoffNotesInput.value = selectedProspect?.handoffNotes || "";
  handoffForm.hidden = !selectedProspect;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportWarmLeadCsv() {
  const warmLeads = getWarmLeads();
  if (warmLeads.length === 0) {
    setDataStatus("No warm leads to export yet.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "companySize", "decisionMaker", "email", "linkedIn", "phone", "stage", "responseStatus", "fitScore", "buyingTrigger", "fitReason", "bookingLink", "meetingDate", "meetingOutcome", "assessmentNotes", "handoffOwner", "handoffStatus", "handoffDue", "handoffNotes", "crmSyncStatus", "crmSyncedAt", "crmSyncNotes", "teamSyncNotes", "lastTouch", "nextTouch", "linkedInStatus", "callStatus", "notes"];
  const rows = warmLeads.map((prospect) => {
    const record = getCrmRecord(prospect);
    return headers.map((header) => csvCell(record[header])).join(",");
  });
  downloadFile("regent-growth-warm-leads.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} for CRM.`);
}

function exportWarmLeadJson() {
  const warmLeads = getWarmLeads();
  if (warmLeads.length === 0) {
    setDataStatus("No warm leads to export yet.", "error");
    return;
  }

  downloadFile("regent-growth-warm-leads.json", JSON.stringify(warmLeads.map(getCrmRecord), null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} as JSON.`);
}

function setCrmSetupStatus(message, state = "") {
  crmSetupStatus.textContent = message;
  crmSetupStatus.dataset.state = state;
}

async function checkCrmSetup() {
  setCrmSetupStatus("Checking CRM connector...", "working");

  try {
    const response = await fetch(crmStatusEndpoint);

    if (!response.ok) {
      throw new Error(`CRM setup check returned ${response.status}.`);
    }

    const status = await response.json();
    setCrmSetupStatus(
      status.configured
        ? `CRM connector ready: ${status.endpoint}${status.keyConfigured ? " with API key" : " without API key"}.`
        : "CRM connector is not configured. Set REGENT_CRM_API_URL before starting the local server.",
      status.configured ? "" : "error"
    );
  } catch (error) {
    setCrmSetupStatus(isLocalFile()
      ? "CRM setup check needs the local research server. Run local-research-server.js and open the local URL."
      : error.message,
    "error");
  }
}

async function syncCrmRecords(records, prospectsToUpdate) {
  const response = await fetch(crmSyncEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ records })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `CRM sync returned ${response.status}.`);
  }

  const syncedAt = payload.syncedAt || new Date().toISOString();
  prospectsToUpdate.forEach((prospect) => {
    prospect.crmSyncStatus = "Synced";
    prospect.crmSyncedAt = syncedAt;
    prospect.crmSyncNotes = [`Synced through local CRM connector.`, prospect.crmSyncNotes].filter(Boolean).join("\n");
    if (prospect.handoffStatus === "Assigned" || prospect.handoffStatus === "In Review") {
      prospect.handoffStatus = "Handed Off";
    }
  });
  saveProspects();
  renderProspects();

  return payload;
}

async function syncSelectedCrmLead() {
  const prospect = getSelectedProspect();

  if (!prospect || !isWarmLead(prospect)) {
    setCrmSetupStatus("Select or mark a warm lead before syncing the selected account.", "error");
    return;
  }

  syncSelectedCrmButton.disabled = true;
  setCrmSetupStatus(`Syncing ${prospect.company} to CRM...`, "working");

  try {
    await syncCrmRecords([getCrmRecord(prospect)], [prospect]);
    setCrmSetupStatus(`${prospect.company} synced to CRM.`);
    setDataStatus(`${prospect.company} synced to CRM.`);
  } catch (error) {
    prospect.crmSyncStatus = "Sync Failed";
    prospect.crmSyncNotes = [`${new Date().toISOString()}: ${error.message}`, prospect.crmSyncNotes].filter(Boolean).join("\n");
    saveProspects();
    renderProspects();
    setCrmSetupStatus(error.message, "error");
  } finally {
    syncSelectedCrmButton.disabled = false;
  }
}

async function syncWarmCrmLeads() {
  const warmLeads = getWarmLeads();

  if (warmLeads.length === 0) {
    setCrmSetupStatus("No warm leads to sync yet.", "error");
    return;
  }

  syncWarmCrmButton.disabled = true;
  setCrmSetupStatus(`Syncing ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM...`, "working");

  try {
    await syncCrmRecords(warmLeads.map(getCrmRecord), warmLeads);
    setCrmSetupStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM.`);
    setDataStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM.`);
  } catch (error) {
    const failedAt = new Date().toISOString();
    warmLeads.forEach((prospect) => {
      prospect.crmSyncStatus = "Sync Failed";
      prospect.crmSyncNotes = [`${failedAt}: ${error.message}`, prospect.crmSyncNotes].filter(Boolean).join("\n");
    });
    saveProspects();
    renderProspects();
    setCrmSetupStatus(error.message, "error");
  } finally {
    syncWarmCrmButton.disabled = false;
  }
}

async function copySelectedHandoffPacket() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const packet = formatHandoffPacket(prospect);
  try {
    await navigator.clipboard.writeText(packet);
    setDataStatus(`CRM handoff packet copied for ${prospect.company}.`);
  } catch {
    handoffPacket.select();
    document.execCommand("copy");
    setDataStatus(`CRM handoff packet selected for ${prospect.company}.`);
  }
}

function markSelectedCrmReady() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  prospect.stage = "Assessment";
  prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Interested" : prospect.responseStatus;
  prospect.handoffStatus = prospect.handoffOwner ? "Assigned" : "Unassigned";
  prospect.responseNotes = [prospect.responseNotes, "Marked CRM ready for warm-lead handoff."].filter(Boolean).join("\n");
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} marked CRM ready.`);
}

function saveHandoffFromForm(event) {
  event.preventDefault();
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const formData = new FormData(handoffForm);
  const handoffStatus = formData.get("handoffStatus");
  prospect.handoffOwner = formData.get("handoffOwner").trim();
  prospect.handoffStatus = handoffStatuses.includes(handoffStatus) ? handoffStatus : "Unassigned";
  prospect.handoffDue = formData.get("handoffDue");
  prospect.handoffNotes = formData.get("handoffNotes").trim();

  if (prospect.handoffStatus === "Handed Off" || prospect.handoffStatus === "Accepted") {
    prospect.stage = "Assessment";
    prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Interested" : prospect.responseStatus;
  }

  saveProspects();
  renderProspects();
  setDataStatus(`Handoff saved for ${prospect.company}.`);
}

function advanceStage(index) {
  const prospect = prospects[index];
  const currentStage = stageOrder.indexOf(prospect.stage);
  prospect.stage = stageOrder[(currentStage + 1) % stageOrder.length];
  saveProspects();
  renderProspects();
}

function editProspect(index) {
  const prospect = prospects[index];
  editingIndex = index;
  formTitle.textContent = "Edit Company";
  prospectForm.company.value = prospect.company;
  prospectForm.industry.value = prospect.industry;
  prospectForm.size.value = prospect.size;
  prospectForm.website.value = prospect.website;
  prospectForm.decisionMaker.value = prospect.decisionMaker;
  prospectForm.contactEmail.value = prospect.contactEmail;
  prospectForm.contactLinkedIn.value = prospect.contactLinkedIn;
  prospectForm.contactPhone.value = prospect.contactPhone;
  prospectForm.score.value = prospect.score;
  prospectForm.stage.value = prospect.stage;
  prospectForm.bookingLink.value = prospect.bookingLink;
  prospectForm.responseStatus.value = prospect.responseStatus;
  prospectForm.lastTouch.value = prospect.lastTouch;
  prospectForm.nextTouch.value = prospect.nextTouch;
  prospectForm.trigger.value = prospect.trigger;
  prospectForm.fit.value = prospect.fit;
  prospectForm.responseNotes.value = prospect.responseNotes;
  document.querySelector("#prospectFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteProspect(index) {
  prospects.splice(index, 1);
  selectedProspectIndex = Math.min(selectedProspectIndex, prospects.length - 1);
  saveProspects();
  resetForm();
  renderProspects();
}

function selectProspect(index) {
  selectedProspectIndex = index;
  setDrafts(prospects[index]);
  renderProspects();
}

function resetForm() {
  editingIndex = null;
  formTitle.textContent = "Add Company";
  prospectForm.reset();
  prospectForm.score.value = 75;
  prospectForm.stage.value = "Research";
  prospectForm.responseStatus.value = "Not Contacted";
}

function saveResponseFromForm(event) {
  event.preventDefault();
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const formData = new FormData(responseForm);
  prospect.responseStatus = formData.get("responseStatus");
  prospect.lastTouch = formData.get("lastTouch");
  prospect.nextTouch = formData.get("nextTouch");
  prospect.responseNotes = formData.get("responseNotes").trim();
  saveProspects();
  renderProspects();
  setDataStatus(`Response tracking saved for ${prospect.company}.`);
}

function saveWorkflowFromForm(event) {
  event.preventDefault();
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const formData = new FormData(workflowForm);
  const linkedInStatus = formData.get("linkedInStatus");
  const callStatus = formData.get("callStatus");

  prospect.linkedInStatus = linkedInStatuses.includes(linkedInStatus) ? linkedInStatus : "Not Started";
  prospect.callStatus = callStatuses.includes(callStatus) ? callStatus : "Not Started";
  prospect.linkedInNotes = formData.get("linkedInNotes").trim();
  prospect.callNotes = formData.get("callNotes").trim();
  saveProspects();
  renderProspects();
  setDataStatus(`LinkedIn and call tasks saved for ${prospect.company}.`);
}

function saveAssessmentFromForm(event) {
  event.preventDefault();
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const formData = new FormData(assessmentForm);
  const meetingOutcome = formData.get("meetingOutcome");
  prospect.meetingDate = formData.get("meetingDate");
  prospect.meetingOutcome = meetingOutcomes.includes(meetingOutcome) ? meetingOutcome : "Not Scheduled";
  prospect.assessmentNotes = formData.get("assessmentNotes").trim();

  if (prospect.meetingOutcome === "Scheduled") {
    prospect.stage = "Meeting";
    prospect.responseStatus = "Meeting Booked";
  }

  if (["Completed", "Closed Won", "Closed Lost"].includes(prospect.meetingOutcome)) {
    prospect.stage = "Assessment";
    prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Interested" : prospect.responseStatus;
  }

  if (prospect.meetingOutcome === "Closed Lost") {
    prospect.responseStatus = "Not Interested";
  }

  saveProspects();
  renderProspects();
  setDataStatus(`Meeting and assessment tracking saved for ${prospect.company}.`);
}

function markReminderTouched(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  prospect.lastTouch = getTodayString();
  prospect.nextTouch = addDays(prospect.lastTouch, 2);
  if (prospect.responseStatus === "Not Contacted") {
    prospect.responseStatus = "Contacted";
  }

  selectedProspectIndex = index;
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} marked touched. Next touch scheduled for ${formatDate(prospect.nextTouch)}.`);
}

function snoozeReminder(index, days) {
  const prospect = prospects[index];
  if (!prospect) return;

  prospect.nextTouch = addDays(getTodayString(), days);
  selectedProspectIndex = index;
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} snoozed until ${formatDate(prospect.nextTouch)}.`);
}

function normalizeCompanyName(value) {
  return value
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/\b(inc|llc|ltd|co|corp|corporation|company|group)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeWebsite(value) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim();
  }
}

function getDuplicateKeys(prospect) {
  const keys = [];
  const websiteKey = normalizeWebsite(prospect.website || "");
  const companyKey = normalizeCompanyName(prospect.company || "");

  if (websiteKey) {
    keys.push(`website:${websiteKey}`);
  }

  if (companyKey) {
    keys.push(`company:${companyKey}`);
  }

  return keys;
}

function findDuplicateProspect(prospect, ignoredIndex = null) {
  const prospectKeys = new Set(getDuplicateKeys(prospect));
  if (prospectKeys.size === 0) return null;

  return prospects.find((existingProspect, index) => {
    if (index === ignoredIndex) return false;
    return getDuplicateKeys(existingProspect).some((key) => prospectKeys.has(key));
  }) || null;
}

function addDuplicateKeys(keySet, prospect) {
  getDuplicateKeys(prospect).forEach((key) => keySet.add(key));
}

function discoveryCandidateToProspect(candidate) {
  const sourceDetails = [
    candidate.sourceReason ? `Discovery source: ${candidate.sourceReason}` : "",
    candidate.sourceStatus ? `Source status: ${candidate.sourceStatus}` : "",
    candidate.sourceNotes ? `Evidence: ${candidate.sourceNotes}` : ""
  ].filter(Boolean).join("\n");

  return normalizeProspect({
    company: candidate.company,
    industry: candidate.industry,
    size: candidate.size,
    website: candidate.website,
    decisionMaker: candidate.decisionMaker,
    score: candidate.score,
    trigger: candidate.trigger,
    fit: candidate.fit,
    stage: "Research",
    responseStatus: "Not Contacted",
    responseNotes: sourceDetails,
    aiBrief: sourceDetails ? `Discovery evidence\n${sourceDetails}` : ""
  });
}

function saveDiscoveryEvidence(id) {
  const card = Array.from(discoveryList.querySelectorAll("[data-id]")).find((item) => item.dataset.id === id);
  const candidate = discoveryQueue.find((item) => item.id === id);
  if (!card || !candidate) return;

  const sourceStatus = card.querySelector("[data-source-status]")?.value || "Needs Review";
  candidate.sourceStatus = sourceStatuses.includes(sourceStatus) ? sourceStatus : "Needs Review";
  candidate.sourceNotes = card.querySelector("[data-source-notes]")?.value.trim() || "";
  saveDiscoveryQueue();
  renderDiscoveryQueue();
  setDataStatus(`Source evidence saved for ${candidate.company}.`);
}

function formatFetchedEvidence(result) {
  return [
    `Fetched source: ${result.finalUrl || result.url}`,
    result.title ? `Title: ${result.title}` : "",
    result.description ? `Description: ${result.description}` : "",
    result.snippet ? `Snippet: ${result.snippet}` : ""
  ].filter(Boolean).join("\n");
}

function buildCandidateSearchQuery(candidate) {
  const location = discoveryForm.elements.location?.value || "";
  const parts = [
    candidate.company,
    candidate.industry,
    location,
    candidate.trigger,
    "company website hiring expansion"
  ].filter(Boolean);

  return parts.join(" ");
}

function formatSearchEvidence(result) {
  const lines = [
    `Search query: ${result.query}`,
    ...result.results.map((item, index) => [
      `${index + 1}. ${item.title || "Untitled result"}`,
      item.url ? `URL: ${item.url}` : "",
      item.snippet ? `Snippet: ${item.snippet}` : ""
    ].filter(Boolean).join("\n"))
  ];

  return lines.join("\n\n");
}

async function searchDiscoverySources(id) {
  const candidate = discoveryQueue.find((item) => item.id === id);
  if (!candidate) return;

  setDataStatus(`Searching sources for ${candidate.company}...`, "working");

  try {
    const response = await fetch(sourceSearchEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: buildCandidateSearchQuery(candidate),
        count: 5
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Source search returned ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result.results) || result.results.length === 0) {
      throw new Error("Search API returned no source results.");
    }

    const firstUrl = result.results.find((item) => item.url)?.url || "";
    if (!candidate.website && firstUrl) {
      try {
        candidate.website = new URL(firstUrl).hostname.replace(/^www\./, "");
      } catch {
        candidate.website = firstUrl;
      }
    }

    const searchEvidence = formatSearchEvidence(result);
    candidate.sourceStatus = "Sources Opened";
    candidate.sourceNotes = candidate.sourceNotes
      ? `${candidate.sourceNotes}\n\n${searchEvidence}`
      : searchEvidence;
    saveDiscoveryQueue();
    renderDiscoveryQueue();
    setDataStatus(`Search sources saved for ${candidate.company}.`);
  } catch (error) {
    const message = location.protocol === "file:"
      ? "Source search needs the local research server. Run local-research-server.js and open the local URL."
      : `Source search error: ${error.message}`;
    setDataStatus(message, "error");
  }
}

async function checkSearchSetup() {
  checkSearchSetupButton.disabled = true;
  try {
    const response = await fetch(sourceSearchStatusEndpoint);
    if (!response.ok) {
      throw new Error(`Search status returned ${response.status}`);
    }

    const status = await response.json();
    if (status.configured) {
      const keyText = status.hasApiKey ? ` API key configured with ${status.keyHeader}.` : " No API key configured.";
      setSearchSetupStatus(`Search connector ready for ${status.providerHost}.${keyText}`);
    } else {
      setSearchSetupStatus("Search connector is not configured. Set REGENT_SEARCH_API_URL before starting the local research server.", "error");
    }
  } catch (error) {
    const message = location.protocol === "file:"
      ? "Search setup check needs the local research server. Run local-research-server.js and open the local URL."
      : `Search setup check failed: ${error.message}`;
    setSearchSetupStatus(message, "error");
  } finally {
    checkSearchSetupButton.disabled = false;
  }
}

async function testSearchSetup() {
  const query = searchTestQuery.value.trim();
  if (!query) {
    setSearchSetupStatus("Enter a test query before running a search test.", "error");
    return;
  }

  testSearchSetupButton.disabled = true;
  try {
    const response = await fetch(sourceSearchEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, count: 3 })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Search test returned ${response.status}`);
    }

    const result = await response.json();
    const count = Array.isArray(result.results) ? result.results.length : 0;
    setSearchSetupStatus(`Search test returned ${count} result${count === 1 ? "" : "s"} for "${query}".`);
  } catch (error) {
    const message = location.protocol === "file:"
      ? "Search test needs the local research server. Run local-research-server.js and open the local URL."
      : `Search test failed: ${error.message}`;
    setSearchSetupStatus(message, "error");
  } finally {
    testSearchSetupButton.disabled = false;
  }
}

async function fetchDiscoverySource(id) {
  const candidate = discoveryQueue.find((item) => item.id === id);
  if (!candidate) return;

  const url = toExternalUrl(candidate.website || "");
  if (!url) {
    setDataStatus(`Add a valid website before fetching source evidence for ${candidate.company}.`, "error");
    return;
  }

  setDataStatus(`Fetching website evidence for ${candidate.company}...`, "working");

  try {
    const response = await fetch(sourceFetchEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Source fetch returned ${response.status}`);
    }

    const result = await response.json();
    const fetchedEvidence = formatFetchedEvidence(result);
    candidate.sourceStatus = "Evidence Found";
    candidate.sourceNotes = candidate.sourceNotes
      ? `${candidate.sourceNotes}\n\n${fetchedEvidence}`
      : fetchedEvidence;
    saveDiscoveryQueue();
    renderDiscoveryQueue();
    setDataStatus(`Fetched website evidence for ${candidate.company}.`);
  } catch (error) {
    const message = location.protocol === "file:"
      ? "Source fetch needs the local research server. Run local-research-server.js and open the local URL."
      : `Source fetch error: ${error.message}`;
    setDataStatus(message, "error");
  }
}

function addDiscoveryCandidate(id) {
  const candidate = discoveryQueue.find((item) => item.id === id);
  if (!candidate) return;

  const prospect = discoveryCandidateToProspect(candidate);
  const duplicateProspect = findDuplicateProspect(prospect);
  if (duplicateProspect) {
    setDataStatus(`Discovery candidate not added: ${candidate.company} matches ${duplicateProspect.company}.`, "error");
    return;
  }

  prospects.unshift(prospect);
  discoveryQueue = discoveryQueue.filter((item) => item.id !== id);
  selectedProspectIndex = 0;
  saveProspects();
  saveDiscoveryQueue();
  renderProspects();
  renderDiscoveryQueue();
  setDataStatus(`${candidate.company} added to the prospect pipeline.`);
}

function dismissDiscoveryCandidate(id) {
  discoveryQueue = discoveryQueue.filter((item) => item.id !== id);
  saveDiscoveryQueue();
  renderDiscoveryQueue();
  setDataStatus("Discovery candidate dismissed.");
}

function clearDiscoveryQueue() {
  discoveryQueue = [];
  saveDiscoveryQueue();
  renderDiscoveryQueue();
  setDataStatus("Discovery queue cleared.");
}

function saveProspectFromForm(event) {
  event.preventDefault();

  const formData = new FormData(prospectForm);
  const prospect = normalizeProspect({
    company: formData.get("company").trim(),
    industry: formData.get("industry").trim(),
    size: formData.get("size").trim(),
    website: formData.get("website").trim(),
    decisionMaker: formData.get("decisionMaker").trim(),
    contactEmail: formData.get("contactEmail").trim(),
    contactLinkedIn: formData.get("contactLinkedIn").trim(),
    contactPhone: formData.get("contactPhone").trim(),
    score: formData.get("score"),
    stage: formData.get("stage"),
    bookingLink: formData.get("bookingLink").trim(),
    responseStatus: formData.get("responseStatus"),
    lastTouch: formData.get("lastTouch"),
    nextTouch: formData.get("nextTouch"),
    trigger: formData.get("trigger").trim(),
    fit: formData.get("fit").trim(),
    responseNotes: formData.get("responseNotes").trim(),
    linkedInStatus: editingIndex === null ? "Not Started" : prospects[editingIndex]?.linkedInStatus,
    linkedInNotes: editingIndex === null ? "" : prospects[editingIndex]?.linkedInNotes,
    callStatus: editingIndex === null ? "Not Started" : prospects[editingIndex]?.callStatus,
    callNotes: editingIndex === null ? "" : prospects[editingIndex]?.callNotes,
    meetingDate: editingIndex === null ? "" : prospects[editingIndex]?.meetingDate,
    meetingOutcome: editingIndex === null ? "Not Scheduled" : prospects[editingIndex]?.meetingOutcome,
    assessmentNotes: editingIndex === null ? "" : prospects[editingIndex]?.assessmentNotes,
    handoffOwner: editingIndex === null ? "" : prospects[editingIndex]?.handoffOwner,
    handoffStatus: editingIndex === null ? "Unassigned" : prospects[editingIndex]?.handoffStatus,
    handoffDue: editingIndex === null ? "" : prospects[editingIndex]?.handoffDue,
    handoffNotes: editingIndex === null ? "" : prospects[editingIndex]?.handoffNotes,
    aiBrief: editingIndex === null ? "" : prospects[editingIndex]?.aiBrief,
    aiEmail: editingIndex === null ? "" : prospects[editingIndex]?.aiEmail
  });

  const duplicateProspect = findDuplicateProspect(prospect, editingIndex);
  if (duplicateProspect) {
    setDataStatus(`Duplicate not saved: ${prospect.company} matches ${duplicateProspect.company}.`, "error");
    return;
  }

  if (editingIndex === null) {
    prospects.unshift(prospect);
    selectedProspectIndex = 0;
  } else {
    prospects[editingIndex] = prospect;
    selectedProspectIndex = editingIndex;
  }

  saveProspects();
  resetForm();
  renderProspects();
  setDataStatus(`${prospect.company} saved.`);
}

function exportCsv() {
  const headers = ["company", "industry", "size", "website", "decisionMaker", "contactEmail", "contactLinkedIn", "contactPhone", "score", "trigger", "fit", "stage", "bookingLink", "responseStatus", "lastTouch", "nextTouch", "responseNotes", "linkedInStatus", "linkedInNotes", "callStatus", "callNotes", "meetingDate", "meetingOutcome", "assessmentNotes", "handoffOwner", "handoffStatus", "handoffDue", "handoffNotes", "crmSyncStatus", "crmSyncedAt", "crmSyncNotes", "teamSyncNotes"];
  const rows = prospects.map((prospect) => headers.map((header) => csvCell(prospect[header])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "regent-growth-prospects.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function prospectFromCsvRow(headers, row) {
  const values = {};

  headers.forEach((header, index) => {
    values[normalizeHeader(header)] = row[index]?.trim() || "";
  });

  return normalizeProspect({
    company: values.company || values.name,
    industry: values.industry,
    size: values.size || values.employees || values.companysize,
    website: values.website || values.url || values.domain,
    decisionMaker: values.decisionmaker || values.decisionmakerrole || values.title || values.contact,
    contactEmail: values.contactemail || values.email || values.emailaddress,
    contactLinkedIn: values.contactlinkedin || values.linkedin || values.linkedinurl || values.linkedinprofile,
    contactPhone: values.contactphone || values.phone || values.phonenumber || values.mobile,
    score: values.score || values.fitscore,
    trigger: values.trigger || values.buyingtrigger,
    fit: values.fit || values.fitreason || values.qualificationreason || values.notes,
    stage: values.stage || values.status,
    bookingLink: values.bookinglink || values.calendarlink || values.schedulinglink || values.meetinglink,
    responseStatus: values.responsestatus || values.response || values.replystatus,
    lastTouch: values.lasttouch || values.lastcontact || values.lasttouchdate,
    nextTouch: values.nexttouch || values.nextfollowup || values.nexttouchdate,
    responseNotes: values.responsenotes || values.replynotes || values.outreachnotes,
    linkedInStatus: values.linkedinstatus || values.linkedinworkflowstatus || values.connectionstatus,
    linkedInNotes: values.linkedinnotes || values.linkedinworkflownotes || values.connectionnotes,
    callStatus: values.callstatus || values.phonestatus || values.dialstatus,
    callNotes: values.callnotes || values.phonenotes || values.dialnotes,
    meetingDate: values.meetingdate || values.meetingdatetime || values.meetingtime,
    meetingOutcome: values.meetingoutcome || values.outcome,
    assessmentNotes: values.assessmentnotes || values.assessment || values.meetingnotes,
    handoffOwner: values.handoffowner || values.owner || values.assignedto,
    handoffStatus: values.handoffstatus || values.handoffstate || values.ownerstatus,
    handoffDue: values.handoffdue || values.duedate || values.ownerduedate,
    handoffNotes: values.handoffnotes || values.handoffnote || values.ownernotes,
    crmSyncStatus: values.crmsyncstatus || values.crmstatus,
    crmSyncedAt: values.crmsyncedat || values.crmsyncdate,
    crmSyncNotes: values.crmsyncnotes || values.crmnotes,
    teamSyncNotes: values.teamsyncnotes || values.teamnotes
  });
}

async function importCsv(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length < 2) {
      throw new Error("CSV needs headers and at least one prospect row.");
    }

    const headers = rows[0];
    const usableProspects = rows
      .slice(1)
      .map((row) => prospectFromCsvRow(headers, row))
      .filter((prospect) => prospect.company && prospect.fit);

    if (usableProspects.length === 0) {
      throw new Error("No usable prospects found. Include company and fit fields.");
    }

    const knownKeys = new Set();
    prospects.forEach((prospect) => addDuplicateKeys(knownKeys, prospect));

    const importedProspects = [];
    let skippedDuplicates = 0;

    usableProspects.forEach((prospect) => {
      const keys = getDuplicateKeys(prospect);
      const isDuplicate = keys.some((key) => knownKeys.has(key));

      if (isDuplicate) {
        skippedDuplicates += 1;
        return;
      }

      importedProspects.push(prospect);
      addDuplicateKeys(knownKeys, prospect);
    });

    if (importedProspects.length === 0) {
      throw new Error(`No new prospects imported. Skipped ${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? "row" : "rows"}.`);
    }

    prospects = [...importedProspects, ...prospects];
    selectedProspectIndex = 0;
    saveProspects();
    resetForm();
    renderProspects();
    const duplicateMessage = skippedDuplicates > 0 ? ` Skipped ${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? "row" : "rows"}.` : "";
    setDataStatus(`Imported ${importedProspects.length} prospects from ${file.name}.${duplicateMessage}`);
  } catch (error) {
    setDataStatus(error.message, "error");
  } finally {
    importInput.value = "";
  }
}

function resetSamples() {
  prospects = structuredClone(sampleProspects);
  selectedProspectIndex = 0;
  saveProspects();
  resetForm();
  renderProspects();
  setDataStatus("Sample prospects restored.");
}

prospectList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const actions = {
    select: selectProspect,
    advance: advanceStage,
    edit: editProspect,
    delete: deleteProspect
  };

  actions[button.dataset.action]?.(index);
});

reminderList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);

  if (button.dataset.action === "complete-reminder") {
    markReminderTouched(index);
  }

  if (button.dataset.action === "snooze-reminder") {
    snoozeReminder(index, Number(button.dataset.days));
  }
});

stageFilter.addEventListener("change", renderProspects);
responseFilter.addEventListener("change", renderProspects);
savedViews.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (!button) return;

  savedViews.dataset.activeView = button.dataset.view;
  delete savedViews.dataset.activeOwner;
  renderProspects();
});
ownerWorkloadList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-owner]");
  if (!button) return;

  savedViews.dataset.activeView = "assigned";
  savedViews.dataset.activeOwner = button.dataset.owner;
  renderProspects();
  setDataStatus(`Showing assigned handoffs for ${button.dataset.owner}.`);
});
blockedHandoffList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='select-blocked']");
  if (!button) return;

  selectedProspectIndex = Number(button.dataset.index);
  savedViews.dataset.activeView = "blocked";
  delete savedViews.dataset.activeOwner;
  renderProspects();
});
discoveryList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "add-discovery") {
    addDiscoveryCandidate(button.dataset.id);
  }

  if (button.dataset.action === "dismiss-discovery") {
    dismissDiscoveryCandidate(button.dataset.id);
  }

  if (button.dataset.action === "save-source") {
    saveDiscoveryEvidence(button.dataset.id);
  }

  if (button.dataset.action === "fetch-source") {
    fetchDiscoverySource(button.dataset.id);
  }

  if (button.dataset.action === "search-source") {
    searchDiscoverySources(button.dataset.id);
  }
});
prospectForm.addEventListener("submit", saveProspectFromForm);
responseForm.addEventListener("submit", saveResponseFromForm);
workflowForm.addEventListener("submit", saveWorkflowFromForm);
assessmentForm.addEventListener("submit", saveAssessmentFromForm);
handoffForm.addEventListener("submit", saveHandoffFromForm);
clearFormButton.addEventListener("click", resetForm);
importInput.addEventListener("change", importCsv);
exportButton.addEventListener("click", exportCsv);
resetButton.addEventListener("click", resetSamples);
teamActorForm.addEventListener("submit", saveTeamSyncActor);
checkTeamSyncButton.addEventListener("click", checkTeamSync);
pullTeamProspectsButton.addEventListener("click", pullTeamProspects);
pushTeamProspectsButton.addEventListener("click", pushTeamProspects);
refreshTeamBackupsButton.addEventListener("click", refreshTeamBackups);
teamBackupList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "preview-backup") {
    previewAutomaticTeamBackup(button.dataset.filename);
  }

  if (button.dataset.action === "delete-backup") {
    deleteAutomaticTeamBackup(button.dataset.filename);
  }
});
exportTeamBackupButton.addEventListener("click", exportTeamBackup);
restoreTeamBackupInput.addEventListener("change", restoreTeamBackup);
teamRestorePreview.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.id === "confirmTeamRestoreButton") {
    confirmTeamBackupRestore();
  }

  if (button.id === "cancelTeamRestoreButton") {
    clearTeamRestorePreview();
    setTeamSyncStatus("Team restore canceled.");
  }
});
generateDiscoveryButton.addEventListener("click", generateDiscoveryCandidates);
clearDiscoveryButton.addEventListener("click", clearDiscoveryQueue);
checkSearchSetupButton.addEventListener("click", checkSearchSetup);
testSearchSetupButton.addEventListener("click", testSearchSetup);
detailAdvanceButton.addEventListener("click", () => advanceStage(selectedProspectIndex));
detailEditButton.addEventListener("click", () => editProspect(selectedProspectIndex));
savePromptsButton.addEventListener("click", savePromptTemplateEdits);
resetPromptsButton.addEventListener("click", resetPromptTemplates);
modelSelect.addEventListener("change", () => setAiStatus(`Local AI ready: ${modelSelect.value}`));
researchAccountButton.addEventListener("click", researchSelectedAccount);
generateBriefButton.addEventListener("click", generateCompanyBrief);
generateEmailButton.addEventListener("click", generatePersonalizedEmail);
saveEmailDraftButton.addEventListener("click", saveCurrentEmailDraft);
openMailClientButton.addEventListener("click", () => openEmailHandoff("mailto"));
openGmailButton.addEventListener("click", () => openEmailHandoff("gmail"));
openOutlookButton.addEventListener("click", () => openEmailHandoff("outlook"));
copyEmailDraftButton.addEventListener("click", copyEmailDraft);
markEmailSentButton.addEventListener("click", markEmailSent);
exportWarmCsvButton.addEventListener("click", exportWarmLeadCsv);
exportWarmJsonButton.addEventListener("click", exportWarmLeadJson);
checkCrmSetupButton.addEventListener("click", checkCrmSetup);
syncSelectedCrmButton.addEventListener("click", syncSelectedCrmLead);
syncWarmCrmButton.addEventListener("click", syncWarmCrmLeads);
copyHandoffPacketButton.addEventListener("click", copySelectedHandoffPacket);
markCrmReadyButton.addEventListener("click", markSelectedCrmReady);

renderPromptTemplates();
renderDiscoveryQueue();
renderTeamSyncActor();
renderProspects();
checkSearchSetup();
checkCrmSetup();
checkTeamSync();
refreshTeamBackups();
