const storageKey = "regent-growth-prospects";
const promptStorageKey = "regent-growth-prompt-templates";
const discoveryStorageKey = "regent-growth-discovery-queue";
const dailyRunHistoryStorageKey = "regent-growth-daily-run-history";
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
const weeklyQualifiedTarget = 100;
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
Lead score: {{leadScore}} ({{leadTier}})

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
Lead score: {{leadScore}} ({{leadTier}})

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
let dailyRunHistory = loadDailyRunHistory();
let editingIndex = null;
let selectedProspectIndex = 0;
let crmFailedQueuePage = 0;
let crmReviewedQueuePage = 0;
let crmFailureReasonFilter = "all";
let dailyRunHistoryStatusFilter = "all";
let showAllDailyReviewItems = false;
let showDailyReviewFailures = true;
let compactDailyRunHistory = false;
let showAllDailyRunHistory = false;
let dailyRunInProgress = false;
let dailyRunStopRequested = false;
let pendingTeamRestore = null;
let teamBackupsCache = [];

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
const teamBackupSearchInput = document.querySelector("#teamBackupSearchInput");
const teamBackupIntegrityFilter = document.querySelector("#teamBackupIntegrityFilter");
const teamBackupProtectionFilter = document.querySelector("#teamBackupProtectionFilter");
const teamBackupSortSelect = document.querySelector("#teamBackupSortSelect");
const teamRestorePreview = document.querySelector("#teamRestorePreview");
const teamActorForm = document.querySelector("#teamActorForm");
const teamActorInput = document.querySelector("#teamActorInput");
const checkTeamSyncButton = document.querySelector("#checkTeamSyncButton");
const pullTeamProspectsButton = document.querySelector("#pullTeamProspectsButton");
const pushTeamProspectsButton = document.querySelector("#pushTeamProspectsButton");
const refreshTeamBackupsButton = document.querySelector("#refreshTeamBackupsButton");
const deleteFilteredBackupsButton = document.querySelector("#deleteFilteredBackupsButton");
const exportTeamBackupButton = document.querySelector("#exportTeamBackupButton");
const restoreTeamBackupInput = document.querySelector("#restoreTeamBackupInput");
const discoveryForm = document.querySelector("#discoveryForm");
const discoveryList = document.querySelector("#discoveryList");
const dailyRunLog = document.querySelector("#dailyRunLog");
const dailyRunHistoryList = document.querySelector("#dailyRunHistoryList");
const dailyRunReviewQueue = document.querySelector("#dailyRunReviewQueue");
const dailyRunCapacitySummary = document.querySelector("#dailyRunCapacitySummary");
const dailyRunStats = document.querySelector("#dailyRunStats");
const dailyReviewSearch = document.querySelector("#dailyReviewSearch");
const dailyReviewReadinessFilter = document.querySelector("#dailyReviewReadinessFilter");
const dailyFailureCountBadge = document.querySelector("#dailyFailureCountBadge");
const clearDailyReviewFiltersButton = document.querySelector("#clearDailyReviewFiltersButton");
const runDailyAiButton = document.querySelector("#runDailyAiButton");
const stopDailyAiButton = document.querySelector("#stopDailyAiButton");
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
const emailSendSummary = document.querySelector("#emailSendSummary");
const exportWarmCsvButton = document.querySelector("#exportWarmCsvButton");
const exportWarmJsonButton = document.querySelector("#exportWarmJsonButton");
const checkCrmSetupButton = document.querySelector("#checkCrmSetupButton");
const syncSelectedCrmButton = document.querySelector("#syncSelectedCrmButton");
const syncWarmCrmButton = document.querySelector("#syncWarmCrmButton");
const retryFailedCrmButton = document.querySelector("#retryFailedCrmButton");
const markReviewedCrmButton = document.querySelector("#markReviewedCrmButton");
const requeueSelectedReviewedCrmButton = document.querySelector("#requeueSelectedReviewedCrmButton");
const requeueReviewedCrmButton = document.querySelector("#requeueReviewedCrmButton");
const exportFailedCrmButton = document.querySelector("#exportFailedCrmButton");
const exportFailedCrmCsvButton = document.querySelector("#exportFailedCrmCsvButton");
const exportReviewedCrmButton = document.querySelector("#exportReviewedCrmButton");
const exportReviewedCrmCsvButton = document.querySelector("#exportReviewedCrmCsvButton");
const copyCrmStatusSummaryButton = document.querySelector("#copyCrmStatusSummaryButton");
const downloadCrmStatusSummaryButton = document.querySelector("#downloadCrmStatusSummaryButton");
const clearResolvedCrmButton = document.querySelector("#clearResolvedCrmButton");
const clearCrmNotesButton = document.querySelector("#clearCrmNotesButton");
const crmSetupStatus = document.querySelector("#crmSetupStatus");
const crmPresetSelect = document.querySelector("#crmPresetSelect");
const crmPresetSnippet = document.querySelector("#crmPresetSnippet");
const copyHandoffPacketButton = document.querySelector("#copyHandoffPacketButton");
const copyCrmMappingButton = document.querySelector("#copyCrmMappingButton");
const markCrmReadyButton = document.querySelector("#markCrmReadyButton");
const handoffSummary = document.querySelector("#handoffSummary");
const crmRetryQueue = document.querySelector("#crmRetryQueue");
const handoffPacket = document.querySelector("#handoffPacket");
const crmFieldPreview = document.querySelector("#crmFieldPreview");
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

function loadDailyRunHistory() {
  const savedHistory = localStorage.getItem(dailyRunHistoryStorageKey);

  if (!savedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory.map(normalizeDailyRunSnapshot).filter((snapshot) => snapshot.startedAt) : [];
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
    crmReviewedReason: prospect.crmReviewedReason || "",
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

function normalizeDailyRunSnapshot(snapshot) {
  return {
    id: snapshot.id || createId(),
    startedAt: snapshot.startedAt || "",
    finishedAt: snapshot.finishedAt || "",
    status: snapshot.status || "Completed",
    model: snapshot.model || "",
    limit: Number(snapshot.limit) || 0,
    generatedCount: Number(snapshot.generatedCount) || 0,
    fetchedCount: Number(snapshot.fetchedCount) || 0,
    addedCount: Number(snapshot.addedCount) || 0,
    existingFilledCount: Number(snapshot.existingFilledCount) || 0,
    researched: Number(snapshot.researched) || 0,
    drafted: Number(snapshot.drafted) || 0,
    skipped: Number(snapshot.skipped) || 0,
    failed: Number(snapshot.failed) || 0,
    error: snapshot.error || "",
    companies: Array.isArray(snapshot.companies) ? snapshot.companies.filter(Boolean).slice(0, 12) : []
  };
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function calculateLeadScore(prospect) {
  const fitScore = clampScore(prospect.score);
  const stagePoints = {
    Research: 0,
    "Email Drafted": 8,
    Sequence: 12,
    LinkedIn: 14,
    Call: 16,
    Meeting: 24,
    Assessment: 26
  };
  const responsePoints = {
    "Not Contacted": 0,
    Contacted: 6,
    Replied: 16,
    Interested: 24,
    "Meeting Booked": 30,
    "Not Interested": -35,
    "No Response": -12
  };
  const contactPoints = [
    prospect.decisionMaker ? 3 : 0,
    prospect.contactEmail ? 4 : 0,
    prospect.contactLinkedIn ? 3 : 0,
    prospect.contactPhone ? 3 : 0
  ].reduce((total, points) => total + points, 0);
  const signalPoints = [
    prospect.website ? 2 : 0,
    prospect.trigger?.trim().length >= 12 ? 5 : 0,
    prospect.fit?.trim().length >= 30 ? 4 : 0,
    prospect.bookingLink ? 4 : 0,
    prospect.aiBrief ? 3 : 0,
    prospect.aiEmail ? 3 : 0
  ].reduce((total, points) => total + points, 0);
  const daysToNextTouch = prospect.nextTouch ? daysUntil(prospect.nextTouch) : Number.POSITIVE_INFINITY;
  const taskAdjustment = [
    prospect.responseStatus === "No Response" && !prospect.nextTouch ? -6 : 0,
    Number.isFinite(daysToNextTouch) && daysToNextTouch < 0 && !isClosedResponse(prospect) ? -8 : 0,
    Number.isFinite(daysToNextTouch) && daysToNextTouch <= 1 && daysToNextTouch >= 0 && !isClosedResponse(prospect) ? 3 : 0,
    prospect.handoffStatus === "Blocked" ? -18 : 0,
    prospect.meetingOutcome === "No Show" ? -10 : 0,
    prospect.meetingOutcome === "Closed Lost" ? -35 : 0,
    prospect.meetingOutcome === "Closed Won" ? 20 : 0
  ].reduce((total, points) => total + points, 0);

  return clampScore((fitScore * 0.55) + (stagePoints[prospect.stage] ?? 0) + (responsePoints[prospect.responseStatus] ?? 0) + contactPoints + signalPoints + taskAdjustment);
}

function getLeadScoreTier(score) {
  if (score >= 85) return { label: "Priority", state: "priority" };
  if (score >= 70) return { label: "Strong", state: "strong" };
  if (score >= 50) return { label: "Developing", state: "developing" };
  return { label: "Low", state: "low" };
}

function getLeadScoreSummary(prospect) {
  const score = calculateLeadScore(prospect);
  const tier = getLeadScoreTier(score);
  const reasons = [];

  if (clampScore(prospect.score) >= 80) reasons.push("high fit score");
  if (["Interested", "Meeting Booked"].includes(prospect.responseStatus)) reasons.push("positive response");
  if (["Meeting", "Assessment"].includes(prospect.stage)) reasons.push("late-stage pipeline");
  if (prospect.trigger) reasons.push("buying trigger");
  if (prospect.contactEmail || prospect.contactLinkedIn || prospect.contactPhone) reasons.push("contact path available");
  if (isFollowUpDue(prospect)) reasons.push("follow-up due");
  if (prospect.handoffStatus === "Blocked") reasons.push("handoff blocked");
  if (prospect.responseStatus === "Not Interested") reasons.push("not interested");

  return {
    score,
    tier: tier.label,
    state: tier.state,
    reasons: reasons.slice(0, 3)
  };
}

function renderLeadScoreBadge(prospect) {
  const summary = getLeadScoreSummary(prospect);
  return `<p class="lead-score" data-state="${escapeHtml(summary.state)}"><strong>Lead score ${escapeHtml(summary.score)}</strong><span>${escapeHtml(summary.tier)}</span></p>`;
}

function renderLeadScoreReasonText(prospect) {
  const summary = getLeadScoreSummary(prospect);
  return summary.reasons.length > 0 ? summary.reasons.join(", ") : "Needs more qualification signals.";
}

function saveProspects() {
  localStorage.setItem(storageKey, JSON.stringify(prospects));
}

function saveDailyRunHistory() {
  localStorage.setItem(dailyRunHistoryStorageKey, JSON.stringify(dailyRunHistory));
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

function recordsHaveRestoreDifference(currentRecord, restoreRecord) {
  const current = normalizeProspect(currentRecord);
  const restore = normalizeProspect(restoreRecord);

  return getProspectFieldNames().some((field) => String(current[field] || "") !== String(restore[field] || ""));
}

function getDryRunLabel(record) {
  return record.company || record.website || record.decisionMaker || "Unnamed record";
}

function buildTeamRestoreDryRunReport(currentRecords = [], restoreRecords = [], currentHistory = [], restoreHistory = []) {
  const current = currentRecords.map(normalizeProspect);
  const restore = restoreRecords.map(normalizeProspect);
  const currentIndex = mapProspectsByIdentity(current);
  const restoreIndex = mapProspectsByIdentity(restore);
  const seenCurrentIndexes = new Set();
  const report = {
    status: "ready",
    currentCount: current.length,
    restoreCount: restore.length,
    historyCurrentCount: Array.isArray(currentHistory) ? currentHistory.length : 0,
    historyRestoreCount: Array.isArray(restoreHistory) ? restoreHistory.length : 0,
    added: [],
    removed: [],
    changed: [],
    unchanged: []
  };

  restore.forEach((restoreRecord) => {
    const match = getDuplicateKeys(restoreRecord).map((key) => currentIndex.get(key)).find(Boolean);

    if (!match) {
      report.added.push(getDryRunLabel(restoreRecord));
      return;
    }

    seenCurrentIndexes.add(match.index);
    if (recordsHaveRestoreDifference(match.record, restoreRecord)) {
      report.changed.push(getDryRunLabel(restoreRecord));
    } else {
      report.unchanged.push(getDryRunLabel(restoreRecord));
    }
  });

  current.forEach((currentRecord, index) => {
    if (seenCurrentIndexes.has(index)) return;
    const match = getDuplicateKeys(currentRecord).map((key) => restoreIndex.get(key)).find(Boolean);

    if (!match) {
      report.removed.push(getDryRunLabel(currentRecord));
    }
  });

  return report;
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

function getTeamBackupSearchText(backup) {
  return [
    backup.filename,
    backup.label,
    backup.reason,
    backup.protected ? "protected favorite" : "standard backup",
    backup.integrity?.status,
    backup.audit?.createdBy,
    backup.audit?.triggerType,
    backup.audit?.latestActivity?.actor,
    backup.audit?.latestActivity?.summary
  ].filter(Boolean).join(" ").toLowerCase();
}

function getTeamBackupDisplayName(backup) {
  return backup.label || backup.reason || backup.filename || "";
}

function sortTeamBackups(backups) {
  const sorted = [...backups];

  switch (teamBackupSortSelect.value) {
    case "oldest":
      return sorted.sort((first, second) => String(first.createdAt || "").localeCompare(String(second.createdAt || "")));
    case "label":
      return sorted.sort((first, second) => getTeamBackupDisplayName(first).localeCompare(getTeamBackupDisplayName(second)) || String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
    case "records":
      return sorted.sort((first, second) => (Number(second.recordCount) || 0) - (Number(first.recordCount) || 0) || String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
    case "size":
      return sorted.sort((first, second) => (Number(second.sizeBytes) || 0) - (Number(first.sizeBytes) || 0) || String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
    case "newest":
    default:
      return sorted.sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
  }
}

function getVisibleTeamBackups(backups = teamBackupsCache) {
  const query = teamBackupSearchInput.value.trim().toLowerCase();
  const integrity = teamBackupIntegrityFilter.value;
  const protection = teamBackupProtectionFilter.value;

  const filtered = backups.filter((backup) => {
    const matchesQuery = !query || getTeamBackupSearchText(backup).includes(query);
    const status = backup.integrity?.status || "warning";
    const matchesIntegrity = integrity === "all" || status === integrity;
    const matchesProtection = protection === "all"
      || (protection === "protected" && backup.protected)
      || (protection === "unprotected" && !backup.protected);

    return matchesQuery && matchesIntegrity && matchesProtection;
  });

  return sortTeamBackups(filtered);
}

function applyTeamBackupFilters() {
  renderTeamBackupList(getVisibleTeamBackups());
}

function updateBackupBulkActions(visibleBackups = getVisibleTeamBackups()) {
  const deletableCount = visibleBackups.filter((backup) => !backup.protected).length;
  deleteFilteredBackupsButton.disabled = deletableCount === 0;
  deleteFilteredBackupsButton.textContent = deletableCount > 0
    ? `Delete filtered (${deletableCount})`
    : "Delete filtered";
}

function renderTeamBackupList(backups = []) {
  updateBackupBulkActions(backups);

  if (!Array.isArray(backups) || backups.length === 0) {
    const hasFilters = teamBackupSearchInput.value.trim() || teamBackupIntegrityFilter.value !== "all" || teamBackupProtectionFilter.value !== "all";
    teamBackupList.innerHTML = renderTeamBackupEmptyState(hasFilters);
    return;
  }

  teamBackupList.innerHTML = backups.slice(0, 6).map((backup) => `
    <article class="backup-item">
      <div>
        <strong>${escapeHtml(getTeamBackupDisplayName(backup))}</strong>
        <p>${escapeHtml(backup.filename)}</p>
        ${renderBackupMetadataChips(backup)}
        <p>${escapeHtml(backup.reason || "Automatic safety backup")} | ${escapeHtml(formatDateTime(backup.createdAt))}</p>
        ${renderTeamBackupIntegritySummary(backup.integrity)}
        ${renderTeamBackupAuditSummary(backup.audit)}
      </div>
      <div class="backup-actions">
        <button class="secondary-button" type="button" data-action="download-backup" data-filename="${escapeHtml(backup.filename)}">Download</button>
        <button class="secondary-button" type="button" data-action="toggle-protected-backup" data-filename="${escapeHtml(backup.filename)}" data-protected="${backup.protected ? "true" : "false"}">${backup.protected ? "Unprotect" : "Protect"}</button>
        <button class="secondary-button" type="button" data-action="rename-backup" data-filename="${escapeHtml(backup.filename)}" data-label="${escapeHtml(backup.label || backup.reason || "")}">Rename</button>
        <button class="secondary-button" type="button" data-action="preview-backup" data-filename="${escapeHtml(backup.filename)}" ${backup.integrity?.status === "invalid" ? "disabled" : ""}>Preview restore</button>
        <button class="danger-button" type="button" data-action="delete-backup" data-filename="${escapeHtml(backup.filename)}" ${backup.protected ? "disabled" : ""}>Delete</button>
      </div>
    </article>
  `).join("");
}

function renderTeamBackupEmptyState(hasFilters) {
  if (hasFilters) {
    return `
      <article class="backup-empty-card">
        <div>
          <strong>No backups match these filters.</strong>
          <p>Clear the search, integrity, or protection filters to see saved restore points again.</p>
        </div>
        <button class="secondary-button" type="button" data-action="clear-backup-filters">Clear filters</button>
      </article>
    `;
  }

  return `
    <article class="backup-empty-card">
      <div>
        <strong>No automatic restore backups yet.</strong>
        <p>Backups appear after a shared-store restore creates a safety copy. You can also export a manual team backup before changing shared data.</p>
      </div>
      <div class="backup-empty-actions">
        <button class="secondary-button" type="button" data-action="refresh-backups">Refresh backups</button>
        <button class="secondary-button" type="button" data-action="export-team-backup">Export manual backup</button>
      </div>
    </article>
  `;
}

function clearTeamBackupFilters() {
  teamBackupSearchInput.value = "";
  teamBackupIntegrityFilter.value = "all";
  teamBackupProtectionFilter.value = "all";
  teamBackupSortSelect.value = "newest";
  applyTeamBackupFilters();
  setTeamSyncStatus("Backup filters cleared.");
}

function renderBackupMetadataChips(backup) {
  const integrityStatus = backup.integrity?.status || "warning";
  const trigger = backup.audit?.triggerType || "manual";
  const chips = [
    {
      label: backup.protected ? "Protected" : "Standard",
      state: backup.protected ? "protected" : "standard"
    },
    {
      label: `Integrity: ${integrityStatus === "warning" ? "Warnings" : integrityStatus}`,
      state: integrityStatus
    },
    {
      label: `${backup.recordCount ?? 0} records`
    },
    {
      label: `${backup.historyCount ?? 0} history`
    },
    {
      label: formatFileSize(backup.sizeBytes)
    },
    {
      label: `Trigger: ${trigger}`
    }
  ];

  return `
    <div class="backup-chip-row">
      ${chips.map((chip) => `<span class="backup-chip" ${chip.state ? `data-state="${escapeHtml(chip.state)}"` : ""}>${escapeHtml(chip.label)}</span>`).join("")}
    </div>
  `;
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

function countBackupValues(records, fieldName, fallback) {
  return records.reduce((counts, record) => {
    const value = record?.[fieldName]?.trim?.() || fallback;
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function buildTeamBackupAudit(records, history, reason, createdAt, sourceUpdatedAt = "") {
  const latestActivity = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return {
    reason: reason || "Manual team backup export",
    triggerType: "manual-export",
    createdBy: getTeamSyncActor(),
    createdAt,
    sourceUpdatedAt,
    recordCount: records.length,
    historyCount: history.length,
    latestActivity: latestActivity ? {
      actor: latestActivity.actor || "Local user",
      summary: latestActivity.summary || "Shared store updated.",
      createdAt: latestActivity.createdAt || ""
    } : null,
    stageCounts: countBackupValues(records, "stage", "Research"),
    responseCounts: countBackupValues(records, "responseStatus", "Not Contacted"),
    ownerCounts: countBackupValues(records, "handoffOwner", "Unassigned"),
    blockedCount: records.filter(isBlockedHandoff).length,
    meetingCount: records.filter((record) => record.stage === "Meeting" || record.responseStatus === "Meeting Booked").length
  };
}

function validateTeamBackupPayload(payload) {
  const issues = [];
  const warnings = [];
  const records = Array.isArray(payload?.records) ? payload.records : [];
  const history = Array.isArray(payload?.history) ? payload.history : [];

  if (!payload || typeof payload !== "object") {
    issues.push("Backup file must contain a JSON object.");
  }

  if (!Array.isArray(payload?.records)) {
    issues.push("Backup file must contain a records array.");
  } else {
    const invalidRecords = records.filter((record) => !record || typeof record !== "object").length;
    const unnamedRecords = records.filter((record) => !record?.company?.trim?.()).length;

    if (invalidRecords > 0) {
      issues.push(`${invalidRecords} record${invalidRecords === 1 ? "" : "s"} are not valid objects.`);
    }

    if (unnamedRecords > 0) {
      warnings.push(`${unnamedRecords} record${unnamedRecords === 1 ? "" : "s"} have no company name.`);
    }
  }

  if (payload?.history !== undefined && !Array.isArray(payload.history)) {
    warnings.push("History is not an array and will be ignored during restore.");
  }

  return {
    status: issues.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
    issues,
    warnings,
    recordCount: records.length,
    historyCount: history.length
  };
}

function formatAuditCounts(counts, limit = 3) {
  const entries = Object.entries(counts || {})
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, limit);

  return entries.length > 0
    ? entries.map(([label, count]) => `${label}: ${count}`).join(", ")
    : "None";
}

function renderTeamBackupIntegritySummary(integrity) {
  if (!integrity || typeof integrity !== "object") {
    return `<p class="backup-integrity" data-state="warning">Integrity: not checked yet.</p>`;
  }

  const detail = [
    ...(Array.isArray(integrity.issues) ? integrity.issues : []),
    ...(Array.isArray(integrity.warnings) ? integrity.warnings : [])
  ].join(" ");
  const status = integrity.status || "warning";
  const label = status === "valid" ? "valid" : status === "warning" ? "valid with warnings" : "invalid";

  return `<p class="backup-integrity" data-state="${escapeHtml(status)}">Integrity: ${escapeHtml(label)}${detail ? ` | ${escapeHtml(detail)}` : ""}</p>`;
}

function formatDryRunNames(names) {
  return names.slice(0, 4).map(escapeHtml).join(", ") || "None";
}

function renderTeamRestoreDryRunReport(report) {
  if (!report) {
    return `<div class="restore-dry-run" data-state="warning"><strong>Dry run unavailable</strong><p>Shared store comparison has not run yet.</p></div>`;
  }

  if (report.status === "unavailable") {
    return `<div class="restore-dry-run" data-state="warning"><strong>Dry run unavailable</strong><p>${escapeHtml(report.message || "Could not compare against the current shared store.")}</p></div>`;
  }

  return `
    <div class="restore-dry-run">
      <strong>Dry Run Report</strong>
      <p>Shared store: ${escapeHtml(report.currentCount)} records now -> ${escapeHtml(report.restoreCount)} after restore.</p>
      <p>${escapeHtml(report.added.length)} added | ${escapeHtml(report.changed.length)} changed | ${escapeHtml(report.removed.length)} removed | ${escapeHtml(report.unchanged.length)} unchanged</p>
      <p>History: ${escapeHtml(report.historyCurrentCount)} items now -> ${escapeHtml(report.historyRestoreCount)} from backup.</p>
      <p><strong>Added:</strong> ${formatDryRunNames(report.added)} | <strong>Changed:</strong> ${formatDryRunNames(report.changed)}</p>
      <p><strong>Removed:</strong> ${formatDryRunNames(report.removed)}</p>
    </div>
  `;
}

function renderTeamRestoreConfirmationSummary(summary) {
  const dryRun = summary.dryRun?.status === "ready" ? summary.dryRun : null;
  const safetyBackup = summary.safetyBackup?.filename || "";
  const retentionDeleted = summary.safetyBackup?.retention?.deletedCount || 0;

  teamRestorePreview.hidden = false;
  teamRestorePreview.innerHTML = `
    <div>
      <p class="eyebrow">Restore Complete</p>
      <strong>${escapeHtml(summary.fileName)}</strong>
      <p>${escapeHtml(summary.recordCount)} prospect${summary.recordCount === 1 ? "" : "s"} restored | ${escapeHtml(summary.historyCount)} history item${summary.historyCount === 1 ? "" : "s"} carried over.</p>
      ${dryRun ? `
        <p>Applied dry run: ${escapeHtml(dryRun.added.length)} added | ${escapeHtml(dryRun.changed.length)} changed | ${escapeHtml(dryRun.removed.length)} removed | ${escapeHtml(dryRun.unchanged.length)} unchanged.</p>
      ` : `<p>Dry-run comparison was unavailable when this restore was confirmed.</p>`}
      <p>${safetyBackup ? `Safety backup saved as ${escapeHtml(safetyBackup)}.` : "No safety backup filename was returned."}</p>
      ${retentionDeleted ? `<p>Retention pruned ${escapeHtml(retentionDeleted)} old backup${retentionDeleted === 1 ? "" : "s"}.</p>` : ""}
      <p>Completed ${escapeHtml(formatDateTime(summary.completedAt))} by ${escapeHtml(summary.actor)}.</p>
    </div>
    <div class="restore-preview-actions">
      <button id="dismissTeamRestoreSummaryButton" class="secondary-button" type="button">Dismiss</button>
    </div>
  `;
}

function renderTeamBackupAuditSummary(audit) {
  if (!audit || typeof audit !== "object") {
    return `<p>Audit details unavailable for this backup.</p>`;
  }

  const latest = audit.latestActivity?.summary
    ? ` | Latest: ${audit.latestActivity.summary}`
    : "";

  return `
    <p>By ${escapeHtml(audit.createdBy || "Local user")} | Trigger: ${escapeHtml(audit.triggerType || "manual")}${escapeHtml(latest)}</p>
    <p>Stages: ${escapeHtml(formatAuditCounts(audit.stageCounts))} | Responses: ${escapeHtml(formatAuditCounts(audit.responseCounts))}</p>
    <p>${escapeHtml(audit.blockedCount ?? 0)} blocked | ${escapeHtml(audit.meetingCount ?? 0)} meetings | Owners: ${escapeHtml(formatAuditCounts(audit.ownerCounts, 2))}</p>
  `;
}

async function refreshTeamBackups() {
  refreshTeamBackupsButton.disabled = true;

  try {
    const response = await fetch(teamBackupsEndpoint);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Team backups returned ${response.status}.`);
    }

    teamBackupsCache = Array.isArray(payload.backups) ? payload.backups : [];
    renderTeamBackupList(getVisibleTeamBackups());
    const backupCount = Array.isArray(payload.backups) ? payload.backups.length : 0;
    const filteredCount = getVisibleTeamBackups().length;
    const retentionText = payload.retentionLimit ? ` Retention keeps the newest ${payload.retentionLimit}.` : "";
    const filterText = filteredCount === backupCount ? "" : ` Showing ${filteredCount} after filters.`;
    setTeamSyncStatus(`Loaded ${backupCount} shared-store backup${backupCount === 1 ? "" : "s"}.${filterText}${retentionText}`);
  } catch (error) {
    teamBackupsCache = [];
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

    const integrity = backup.integrity || validateTeamBackupPayload(backup);
    if (integrity.status === "invalid") {
      throw new Error(`Backup integrity check failed: ${(integrity.issues || []).join(" ")}`);
    }

    const records = backup.records.map(normalizeProspect);
    const history = Array.isArray(backup.history) ? backup.history : [];
    let dryRun = null;

    try {
      const shared = await readTeamProspects();
      dryRun = buildTeamRestoreDryRunReport(shared.records, records, shared.history, history);
    } catch (error) {
      dryRun = {
        status: "unavailable",
        message: error.message
      };
    }

    pendingTeamRestore = {
      fileName: backup.filename || filename,
      records,
      history,
      exportedAt: backup.exportedAt || backup.createdAt || "",
      updatedAt: backup.updatedAt || "",
      audit: backup.audit || null,
      integrity,
      dryRun
    };
    renderTeamRestorePreview();
    setTeamSyncStatus(`Preview loaded for ${pendingTeamRestore.fileName}. Confirm restore to replace the shared team store.`);
  } catch (error) {
    clearTeamRestorePreview();
    setTeamSyncStatus(`Backup preview failed: ${error.message}`, "error");
  }
}

async function downloadAutomaticTeamBackup(filename) {
  setTeamSyncStatus(`Downloading backup ${filename}...`, "working");

  try {
    const response = await fetch(`${teamBackupEndpoint}?filename=${encodeURIComponent(filename)}`);
    const backup = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(backup.message || `Backup download returned ${response.status}.`);
    }

    if (!Array.isArray(backup.records)) {
      throw new Error("Backup file does not contain a records array.");
    }

    const downloadName = backup.filename || filename;
    downloadFile(downloadName, `${JSON.stringify(backup, null, 2)}\n`, "application/json;charset=utf-8");
    setTeamSyncStatus(`Downloaded backup ${downloadName}.`);
  } catch (error) {
    setTeamSyncStatus(`Backup download failed: ${error.message}`, "error");
  }
}

async function renameAutomaticTeamBackup(filename, currentLabel = "") {
  const label = window.prompt("Backup label", currentLabel || "");

  if (label === null) {
    setTeamSyncStatus("Backup rename canceled.");
    return;
  }

  setTeamSyncStatus(`Renaming backup ${filename}...`, "working");

  try {
    const response = await fetch(`${teamBackupEndpoint}?filename=${encodeURIComponent(filename)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ label })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Backup rename returned ${response.status}.`);
    }

    setTeamSyncStatus(label.trim()
      ? `Renamed backup ${filename} to "${label.trim()}".`
      : `Cleared label for backup ${filename}.`);
    await refreshTeamBackups();
  } catch (error) {
    setTeamSyncStatus(`Backup rename failed: ${error.message}`, "error");
  }
}

async function toggleProtectedTeamBackup(filename, currentProtected) {
  const nextProtected = !currentProtected;
  setTeamSyncStatus(`${nextProtected ? "Protecting" : "Unprotecting"} backup ${filename}...`, "working");

  try {
    const response = await fetch(`${teamBackupEndpoint}?filename=${encodeURIComponent(filename)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ protected: nextProtected })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Backup protection update returned ${response.status}.`);
    }

    setTeamSyncStatus(`${nextProtected ? "Protected" : "Unprotected"} backup ${filename}.`);
    await refreshTeamBackups();
  } catch (error) {
    setTeamSyncStatus(`Backup protection update failed: ${error.message}`, "error");
  }
}

async function deleteFilteredTeamBackups() {
  const visibleBackups = getVisibleTeamBackups();
  const protectedCount = visibleBackups.filter((backup) => backup.protected).length;
  const filenames = visibleBackups
    .filter((backup) => !backup.protected)
    .map((backup) => backup.filename)
    .filter(Boolean);

  if (filenames.length === 0) {
    setTeamSyncStatus(protectedCount > 0 ? "All filtered backups are protected. Unprotect backups before bulk cleanup." : "No filtered backups to delete.", "error");
    return;
  }

  const protectedText = protectedCount ? ` ${protectedCount} protected backup${protectedCount === 1 ? "" : "s"} will be skipped.` : "";
  const confirmed = window.confirm(`Delete ${filenames.length} unprotected filtered backup${filenames.length === 1 ? "" : "s"}?${protectedText} This cannot be undone.`);
  if (!confirmed) {
    setTeamSyncStatus("Filtered backup cleanup canceled.");
    return;
  }

  deleteFilteredBackupsButton.disabled = true;
  setTeamSyncStatus(`Deleting ${filenames.length} filtered backup${filenames.length === 1 ? "" : "s"}...`, "working");

  try {
    const response = await fetch(teamBackupsEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ filenames })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || `Bulk backup delete returned ${response.status}.`);
    }

    if (pendingTeamRestore && filenames.includes(pendingTeamRestore.fileName)) {
      clearTeamRestorePreview();
    }

    setTeamSyncStatus(`Deleted ${payload.deletedCount || 0} filtered backup${payload.deletedCount === 1 ? "" : "s"}${payload.protectedCount ? `; ${payload.protectedCount} protected skipped` : ""}${payload.missingCount ? `; ${payload.missingCount} already missing` : ""}.`);
    await refreshTeamBackups();
  } catch (error) {
    setTeamSyncStatus(`Filtered backup cleanup failed: ${error.message}`, "error");
    updateBackupBulkActions();
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
    const exportedAt = new Date().toISOString();
    const backup = {
      source: "regent-growth-team-sync-backup",
      exportedAt,
      updatedAt: payload.updatedAt,
      actor: getTeamSyncActor(),
      records: payload.records,
      history: payload.history,
      audit: buildTeamBackupAudit(payload.records, payload.history, "Manual team backup export", exportedAt, payload.updatedAt)
    };
    const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
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

  const { fileName, records, history, exportedAt, updatedAt, audit, integrity, dryRun } = pendingTeamRestore;
  const restoreDisabled = integrity?.status === "invalid";
  teamRestorePreview.hidden = false;
  teamRestorePreview.innerHTML = `
    <div>
      <p class="eyebrow">Restore Preview</p>
      <strong>${escapeHtml(fileName)}</strong>
      <p>${escapeHtml(records.length)} prospect${records.length === 1 ? "" : "s"} | ${escapeHtml(history.length)} history item${history.length === 1 ? "" : "s"}</p>
      <p>Exported ${escapeHtml(formatDateTime(exportedAt))}${updatedAt ? ` | Store updated ${escapeHtml(formatDateTime(updatedAt))}` : ""}</p>
      ${renderTeamBackupIntegritySummary(integrity)}
      ${renderTeamBackupAuditSummary(audit)}
      ${renderTeamRestoreDryRunReport(dryRun)}
    </div>
    <div class="restore-preview-actions">
      <button id="confirmTeamRestoreButton" type="button" ${restoreDisabled ? "disabled" : ""}>Restore now</button>
      <button id="cancelTeamRestoreButton" class="secondary-button" type="button">Cancel</button>
    </div>
  `;
}

async function restoreTeamBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const backup = JSON.parse(await file.text());
    const integrity = validateTeamBackupPayload(backup);

    if (integrity.status === "invalid") {
      throw new Error(`Backup integrity check failed: ${integrity.issues.join(" ")}`);
    }

    const records = backup.records.map(normalizeProspect);
    const history = Array.isArray(backup.history) ? backup.history : [];
    let dryRun = null;

    try {
      const shared = await readTeamProspects();
      dryRun = buildTeamRestoreDryRunReport(shared.records, records, shared.history, history);
    } catch (error) {
      dryRun = {
        status: "unavailable",
        message: error.message
      };
    }

    pendingTeamRestore = {
      fileName: file.name,
      records,
      history,
      exportedAt: backup.exportedAt || "",
      updatedAt: backup.updatedAt || "",
      audit: backup.audit || buildTeamBackupAudit(records, history, `Imported ${file.name}`, backup.exportedAt || "", backup.updatedAt || ""),
      integrity,
      dryRun
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

  if (pendingTeamRestore.integrity?.status === "invalid") {
    setTeamSyncStatus("Restore blocked because the backup failed integrity checks.", "error");
    return;
  }

  const { fileName, records, history, dryRun } = pendingTeamRestore;
  const restoreSummary = {
    fileName,
    recordCount: records.length,
    historyCount: history.length,
    dryRun,
    actor: getTeamSyncActor(),
    completedAt: new Date().toISOString(),
    safetyBackup: null
  };
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
    restoreSummary.safetyBackup = payload.backup || null;
    pendingTeamRestore = null;
    renderTeamRestoreConfirmationSummary(restoreSummary);
    const backupText = payload.backup?.filename ? ` Safety backup saved as ${payload.backup.filename}.` : "";
    const retentionText = payload.backup?.retention?.deletedCount
      ? ` Retention pruned ${payload.backup.retention.deletedCount} old backup${payload.backup.retention.deletedCount === 1 ? "" : "s"}.`
      : "";
    const dryRunText = dryRun?.status === "ready"
      ? ` Applied dry run: ${dryRun.added.length} added, ${dryRun.changed.length} changed, ${dryRun.removed.length} removed, ${dryRun.unchanged.length} unchanged.`
      : "";
    setTeamSyncStatus(`Restored shared team backup with ${records.length} prospect${records.length === 1 ? "" : "s"}.${dryRunText}${backupText}${retentionText}`);
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
          <div class="score-row">
            <p class="score">Fit score ${escapeHtml(prospect.score)}</p>
            ${renderLeadScoreBadge(prospect)}
          </div>
          <p class="lead-reasons">Signals: ${escapeHtml(renderLeadScoreReasonText(prospect))}</p>
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
  renderDailyRunReviewQueue();
  renderDailyRunCapacitySummary();
}

function getDailyRunReviewProspects() {
  if (dailyReviewReadinessFilter.value === "failures") return [];

  return filterDailyReviewReadinessItems(filterDailyReviewItems(getDailyRunReviewItems()));
}

function getDailyRunReviewItems() {
  return prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter(({ prospect }) => prospect.stage === "Email Drafted" && Boolean(prospect.aiEmail));
}

function getDailyAiFailedProspects() {
  if (["ready", "blocked"].includes(dailyReviewReadinessFilter.value)) return [];

  return filterDailyReviewItems(getDailyAiFailedItems());
}

function getDailyAiFailedItems() {
  return prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter(({ prospect }) => !prospect.aiEmail && (prospect.responseNotes || "").includes("Daily AI failed:"));
}

function filterDailyReviewItems(items) {
  const query = dailyReviewSearch.value.trim().toLowerCase();
  if (!query) return items;

  return items.filter(({ prospect }) => [
    prospect.company,
    prospect.contactEmail,
    prospect.decisionMaker,
    prospect.trigger,
    prospect.fit,
    prospect.aiBrief,
    prospect.aiEmail,
    prospect.responseNotes
  ].some((value) => String(value || "").toLowerCase().includes(query)));
}

function filterDailyReviewReadinessItems(items) {
  const filter = dailyReviewReadinessFilter.value;
  if (filter === "ready") {
    return items.filter(({ prospect }) => getDailyReviewSendReadiness(prospect).ready);
  }

  if (filter === "blocked") {
    return items.filter(({ prospect }) => !getDailyReviewSendReadiness(prospect).ready);
  }

  return items;
}

function clearDailyReviewFilters() {
  dailyReviewSearch.value = "";
  dailyReviewReadinessFilter.value = "all";
  renderDailyRunReviewQueue();
  setDataStatus("Cleared Daily AI review filters.");
}

function renderDailyRunReviewQueue() {
  const draftedProspects = getDailyRunReviewProspects();
  const failedProspects = getDailyAiFailedProspects();
  const reviewCountLabel = renderDailyReviewCountLabel(draftedProspects, failedProspects);
  renderDailyFailureCountBadge(failedProspects.length);

  if (draftedProspects.length === 0 && failedProspects.length === 0) {
    dailyRunReviewQueue.innerHTML = `
      ${reviewCountLabel}
      <p class="empty-state">No drafted AI emails or failed Daily AI prospects are waiting for review.</p>
    `;
    return;
  }

  dailyRunReviewQueue.innerHTML = `
    ${reviewCountLabel}
    ${renderDailyDraftReviewList(draftedProspects)}
    ${renderDailyFailedReviewSection(failedProspects)}
  `;
}

function renderDailyFailureCountBadge(visibleFailureCount = getDailyAiFailedProspects().length) {
  const totalFailureCount = filterDailyReviewItems(getDailyAiFailedItems()).length;
  dailyFailureCountBadge.textContent = `${visibleFailureCount} visible / ${totalFailureCount} failure${totalFailureCount === 1 ? "" : "s"}`;
  dailyFailureCountBadge.dataset.state = totalFailureCount > 0 ? "warning" : "clear";
}

function renderDailyReviewCountLabel(draftedProspects, failedProspects) {
  const totalDrafts = getDailyRunReviewItems().length;
  const totalFailures = filterDailyReviewItems(getDailyAiFailedItems()).length;
  const filteredText = dailyReviewSearch.value.trim() || dailyReviewReadinessFilter.value !== "all"
    ? `Filtered view: ${draftedProspects.length} draft${draftedProspects.length === 1 ? "" : "s"} and ${failedProspects.length} failure${failedProspects.length === 1 ? "" : "s"}.`
    : `Review queue: ${draftedProspects.length} draft${draftedProspects.length === 1 ? "" : "s"} and ${failedProspects.length} failure${failedProspects.length === 1 ? "" : "s"}.`;

  return `
    <p class="daily-review-count">
      ${escapeHtml(filteredText)} Total saved: ${escapeHtml(totalDrafts)} draft${totalDrafts === 1 ? "" : "s"} and ${escapeHtml(totalFailures)} searchable failure${totalFailures === 1 ? "" : "s"}.
    </p>
  `;
}

function renderDailyDraftReviewList(draftedProspects) {
  if (draftedProspects.length === 0) return "";

  return `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">Daily AI Review</p>
        <h3>${escapeHtml(draftedProspects.length)} drafted email${draftedProspects.length === 1 ? "" : "s"} ready</h3>
      </div>
      <div class="daily-review-actions">
        <button class="secondary-button" type="button" data-action="copy-daily-review">Copy packet</button>
        <button class="secondary-button" type="button" data-action="copy-blocked-daily-review">Copy blocked</button>
        <button class="secondary-button" type="button" data-action="toggle-daily-review-visible">${showAllDailyReviewItems ? "Show first 6" : "Show all"}</button>
        <button class="secondary-button" type="button" data-action="export-daily-review">Export JSON</button>
        <button class="secondary-button" type="button" data-action="export-daily-review-csv">Export CSV</button>
        <button class="secondary-button" type="button" data-action="export-blocked-daily-review">Export blocked JSON</button>
        <button class="secondary-button" type="button" data-action="export-blocked-daily-review-csv">Export blocked CSV</button>
        <button class="secondary-button" type="button" data-action="export-ready-daily-review">Export ready JSON</button>
        <button class="secondary-button" type="button" data-action="export-ready-daily-review-csv">Export ready CSV</button>
        <button class="secondary-button" type="button" data-action="sequence-ready-daily-review">Sequence ready</button>
        <button class="secondary-button" type="button" data-action="sequence-all-daily-review">Sequence all</button>
      </div>
    </div>
    ${renderDailyReviewBlockedSummary(draftedProspects)}
    ${renderDailyReviewVisibleLimitSummary(draftedProspects, "draft")}
    <div class="daily-review-list">
      ${getVisibleDailyReviewItems(draftedProspects).map(({ prospect, index }) => `
        <article>
          <div>
            <strong>${escapeHtml(prospect.company)}</strong>
            <p>${previewText(prospect.aiEmail, "No draft saved.")}</p>
            ${renderDailyReviewSendChecklist(prospect)}
          </div>
          <div class="daily-review-actions">
            <button class="secondary-button" type="button" data-action="open-daily-review" data-index="${escapeHtml(index)}">Open</button>
            ${getDailyReviewSendReadiness(prospect).ready ? "" : `<button class="secondary-button" type="button" data-action="fix-daily-review" data-index="${escapeHtml(index)}">Fix missing</button>`}
            <button class="secondary-button" type="button" data-action="send-daily-review" data-index="${escapeHtml(index)}" ${getDailyReviewSendReadiness(prospect).ready ? "" : "disabled"}>Send</button>
            <button class="secondary-button" type="button" data-action="sent-daily-review" data-index="${escapeHtml(index)}" ${getDailyReviewSendReadiness(prospect).ready ? "" : "disabled"}>Sent</button>
            <button type="button" data-action="sequence-daily-review" data-index="${escapeHtml(index)}">Sequence</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDailyReviewVisibleLimitSummary(items, label) {
  const hiddenCount = showAllDailyReviewItems ? 0 : Math.max(0, items.length - 6);
  if (hiddenCount === 0) return "";

  return `<p class="daily-review-limit">Showing first 6 ${escapeHtml(label)}${label.endsWith("s") ? "" : "s"}; ${escapeHtml(hiddenCount)} more match the current filters.</p>`;
}

function getVisibleDailyReviewItems(items) {
  return showAllDailyReviewItems ? items : items.slice(0, 6);
}

function getDailyReviewBlockedSummary(draftedProspects = getDailyRunReviewProspects()) {
  return draftedProspects.reduce((summary, { prospect }) => {
    const readiness = getDailyReviewSendReadiness(prospect);
    if (readiness.ready) {
      summary.ready += 1;
    } else {
      summary.blocked += 1;
      readiness.checks
        .filter((check) => check.required && !check.ready)
        .forEach((check) => {
          summary.missing[check.label] = (summary.missing[check.label] || 0) + 1;
        });
    }
    return summary;
  }, { ready: 0, blocked: 0, missing: {} });
}

function renderDailyReviewBlockedSummary(draftedProspects) {
  const summary = getDailyReviewBlockedSummary(draftedProspects);
  const missingItems = Object.entries(summary.missing);

  return `
    <div class="daily-review-summary">
      <span>${escapeHtml(summary.ready)} ready</span>
      <span>${escapeHtml(summary.blocked)} blocked</span>
      ${missingItems.length === 0
        ? `<span>No required fields missing</span>`
        : missingItems.map(([label, count]) => `<span>${escapeHtml(count)} missing ${escapeHtml(label.toLowerCase())}</span>`).join("")}
    </div>
  `;
}

function getDailyReviewSendReadiness(prospect) {
  const draft = (prospect.aiEmail || "").trim();
  const { subject, body } = getDraftParts(draft);
  const recipient = getEmailRecipient(prospect).trim();
  const checks = [
    { label: "Contact email", ready: Boolean(recipient) && isValidEmailAddress(recipient), required: true },
    { label: "Subject", ready: Boolean(subject), required: true },
    { label: "Body", ready: Boolean(body), required: true },
    { label: "Decision-maker", ready: Boolean(prospect.decisionMaker?.trim()), required: false },
    { label: "Booking link", ready: Boolean(prospect.bookingLink?.trim()), required: false }
  ];

  return {
    ready: checks.filter((check) => check.required).every((check) => check.ready),
    checks
  };
}

function renderDailyReviewSendChecklist(prospect) {
  const readiness = getDailyReviewSendReadiness(prospect);

  return `
    <div class="daily-send-checklist" aria-label="Send readiness checklist">
      ${readiness.checks.map((check) => `
        <span data-state="${check.ready ? "ready" : "missing"}">${escapeHtml(check.ready ? check.label : `Missing ${check.label.toLowerCase()}`)}</span>
      `).join("")}
    </div>
  `;
}

function renderDailyFailedReviewSection(failedProspects) {
  if (failedProspects.length === 0) return "";

  return `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">Daily AI Failures</p>
        <h3>${escapeHtml(failedProspects.length)} prospect${failedProspects.length === 1 ? "" : "s"} need retry</h3>
      </div>
      <div class="daily-review-actions">
        <button class="secondary-button" type="button" data-action="retry-visible-daily-failures">Retry visible</button>
        <button class="secondary-button" type="button" data-action="copy-visible-daily-failures">Copy visible</button>
        <button class="secondary-button" type="button" data-action="export-visible-daily-failures">Export JSON</button>
        <button class="secondary-button" type="button" data-action="export-visible-daily-failures-csv">Export CSV</button>
        <button class="secondary-button" type="button" data-action="clear-visible-daily-failures">Clear visible</button>
        <button class="secondary-button" type="button" data-action="toggle-daily-review-failures">${showDailyReviewFailures ? "Hide failures" : "Show failures"}</button>
      </div>
    </div>
    ${showDailyReviewFailures ? renderDailyFailedReviewList(failedProspects) : `<p class="daily-review-limit">Daily AI failures hidden.</p>`}
  `;
}

function renderDailyFailedReviewList(failedProspects) {
  if (failedProspects.length === 0) return "";

  return `
    ${renderDailyReviewVisibleLimitSummary(failedProspects, "failure")}
    <div class="daily-review-list">
      ${getVisibleDailyReviewItems(failedProspects).map(({ prospect, index }) => `
        <article>
          <div>
            <strong>${escapeHtml(prospect.company)}</strong>
            <p>${previewText(getLatestDailyAiFailureNote(prospect), "No failure note saved.")}</p>
          </div>
          <div class="daily-review-actions">
            <button class="secondary-button" type="button" data-action="open-daily-review" data-index="${escapeHtml(index)}">Open</button>
            <button class="secondary-button" type="button" data-action="clear-daily-ai-failure" data-index="${escapeHtml(index)}">Clear</button>
            <button type="button" data-action="retry-daily-ai" data-index="${escapeHtml(index)}">Retry</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function getLatestDailyAiFailureNote(prospect) {
  return (prospect.responseNotes || "").split("\n").find((note) => note.includes("Daily AI failed:")) || "";
}

function clearDailyAiFailure(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  clearDailyAiFailureNotes(prospect);
  saveProspects();
  renderProspects();
  renderDailyRunHistory();
  setDataStatus(`Cleared Daily AI failure for ${prospect.company}.`);
}

function clearDailyAiFailureNotes(prospect) {
  const notes = (prospect.responseNotes || "")
    .split("\n")
    .filter((note) => !note.includes("Daily AI failed:"));
  prospect.responseNotes = notes.join("\n");
}

function clearVisibleDailyAiFailures() {
  const failedProspects = getDailyAiFailedProspects();

  if (failedProspects.length === 0) {
    setDataStatus("No visible Daily AI failures to clear.", "error");
    return;
  }

  failedProspects.forEach(({ prospect }) => clearDailyAiFailureNotes(prospect));
  saveProspects();
  renderProspects();
  renderDailyRunHistory();
  setDataStatus(`Cleared ${failedProspects.length} visible Daily AI failure${failedProspects.length === 1 ? "" : "s"}.`);
}

function formatDailyAiFailurePacket(items = getDailyAiFailedProspects()) {
  if (items.length === 0) return "No visible Daily AI failures.";

  return items.map(({ prospect }, index) => [
    `Daily AI Failure ${index + 1}: ${prospect.company}`,
    `Website: ${prospect.website || "Not set"}`,
    `Industry: ${prospect.industry || "Not set"}`,
    `Decision-maker: ${prospect.decisionMaker || "Not set"}`,
    `Failure: ${getLatestDailyAiFailureNote(prospect) || "No failure note saved."}`,
    `Trigger: ${prospect.trigger || "Not set"}`,
    `Fit: ${prospect.fit || "Not set"}`
  ].join("\n")).join("\n\n---\n\n");
}

async function copyVisibleDailyAiFailures() {
  const failedProspects = getDailyAiFailedProspects();
  if (failedProspects.length === 0) {
    setDataStatus("No visible Daily AI failures to copy.", "error");
    return;
  }

  const packet = formatDailyAiFailurePacket(failedProspects);
  try {
    await navigator.clipboard.writeText(packet);
    setDataStatus(`Copied ${failedProspects.length} visible Daily AI failure${failedProspects.length === 1 ? "" : "s"}.`);
  } catch {
    setDataStatus(packet);
  }
}

function getDailyAiFailureExportRecords(items = getDailyAiFailedProspects()) {
  return items.map(({ prospect }) => ({
    company: prospect.company,
    website: prospect.website,
    industry: prospect.industry,
    decisionMaker: prospect.decisionMaker,
    contactEmail: prospect.contactEmail,
    stage: prospect.stage,
    failure: getLatestDailyAiFailureNote(prospect),
    trigger: prospect.trigger,
    fit: prospect.fit,
    responseNotes: prospect.responseNotes
  }));
}

function exportVisibleDailyAiFailuresJson() {
  const records = getDailyAiFailureExportRecords();
  if (records.length === 0) {
    setDataStatus("No visible Daily AI failures to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-failures-${stamp}.json`, JSON.stringify({ exportedAt, records }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${records.length} visible Daily AI failure${records.length === 1 ? "" : "s"} as JSON.`);
}

function exportVisibleDailyAiFailuresCsv() {
  const records = getDailyAiFailureExportRecords();
  if (records.length === 0) {
    setDataStatus("No visible Daily AI failures to export.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "decisionMaker", "contactEmail", "stage", "failure", "trigger", "fit", "responseNotes"];
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  downloadFile("regent-growth-daily-ai-failures.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${records.length} visible Daily AI failure${records.length === 1 ? "" : "s"} as CSV.`);
}

function openDailyReviewProspect(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "all";
  stageFilter.value = "all";
  responseFilter.value = "all";
  renderProspects();
  setDataStatus(`Opened AI email draft for ${prospect.company}.`);
}

function sequenceDailyReviewProspect(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  prospect.stage = "Sequence";
  prospect.responseNotes = [prospect.responseNotes, `${new Date().toISOString()}: AI email draft reviewed and moved to sequence.`].filter(Boolean).join("\n");
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} moved to Sequence.`);
}

function sequenceAllDailyReviewProspects() {
  const draftedProspects = getDailyRunReviewProspects();

  if (draftedProspects.length === 0) {
    setDataStatus("No Daily AI drafts are ready to sequence.", "error");
    return;
  }

  const sequencedAt = new Date().toISOString();
  draftedProspects.forEach(({ prospect }) => {
    prospect.stage = "Sequence";
    prospect.responseNotes = [prospect.responseNotes, `${sequencedAt}: AI email draft reviewed and moved to sequence in bulk.`].filter(Boolean).join("\n");
  });

  saveProspects();
  renderProspects();
  setDataStatus(`Moved ${draftedProspects.length} Daily AI draft${draftedProspects.length === 1 ? "" : "s"} to Sequence.`);
}

function sequenceReadyDailyReviewProspects() {
  const readyProspects = getReadyDailyReviewProspects();

  if (readyProspects.length === 0) {
    setDataStatus("No send-ready Daily AI drafts are ready to sequence.", "error");
    return;
  }

  const sequencedAt = new Date().toISOString();
  readyProspects.forEach(({ prospect }) => {
    prospect.stage = "Sequence";
    prospect.responseNotes = [prospect.responseNotes, `${sequencedAt}: Send-ready AI email draft reviewed and moved to sequence in bulk.`].filter(Boolean).join("\n");
  });

  saveProspects();
  renderProspects();
  setDataStatus(`Moved ${readyProspects.length} send-ready Daily AI draft${readyProspects.length === 1 ? "" : "s"} to Sequence.`);
}

function getReadyDailyReviewProspects() {
  return getDailyRunReviewProspects()
    .filter(({ prospect }) => getDailyReviewSendReadiness(prospect).ready);
}

function getBlockedDailyReviewProspects() {
  return getDailyRunReviewProspects()
    .filter(({ prospect }) => !getDailyReviewSendReadiness(prospect).ready);
}

function getDailyReviewExportRecords(items = getDailyRunReviewProspects()) {
  return items.map(({ prospect }) => ({
    company: prospect.company,
    website: prospect.website,
    industry: prospect.industry,
    decisionMaker: prospect.decisionMaker,
    contactEmail: prospect.contactEmail,
    stage: prospect.stage,
    leadScore: getLeadScoreSummary(prospect).score,
    leadTier: getLeadScoreSummary(prospect).tier,
    trigger: prospect.trigger,
    fit: prospect.fit,
    aiBrief: prospect.aiBrief,
    aiEmail: prospect.aiEmail
  }));
}

function exportDailyReviewJson() {
  const records = getDailyReviewExportRecords();
  if (records.length === 0) {
    setDataStatus("No Daily AI drafts to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-review-${stamp}.json`, JSON.stringify({ exportedAt, records }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${records.length} Daily AI review draft${records.length === 1 ? "" : "s"} as JSON.`);
}

function exportDailyReviewCsv() {
  const records = getDailyReviewExportRecords();
  if (records.length === 0) {
    setDataStatus("No Daily AI drafts to export.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "decisionMaker", "contactEmail", "stage", "leadScore", "leadTier", "trigger", "fit", "aiBrief", "aiEmail"];
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  downloadFile("regent-growth-daily-ai-review.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${records.length} Daily AI review draft${records.length === 1 ? "" : "s"} as CSV.`);
}

function exportReadyDailyReviewJson() {
  const records = getDailyReviewExportRecords(getReadyDailyReviewProspects());
  if (records.length === 0) {
    setDataStatus("No send-ready Daily AI drafts to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-ready-review-${stamp}.json`, JSON.stringify({ exportedAt, records }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${records.length} send-ready Daily AI review draft${records.length === 1 ? "" : "s"} as JSON.`);
}

function exportReadyDailyReviewCsv() {
  const records = getDailyReviewExportRecords(getReadyDailyReviewProspects());
  if (records.length === 0) {
    setDataStatus("No send-ready Daily AI drafts to export.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "decisionMaker", "contactEmail", "stage", "leadScore", "leadTier", "trigger", "fit", "aiBrief", "aiEmail"];
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  downloadFile("regent-growth-daily-ai-ready-review.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${records.length} send-ready Daily AI review draft${records.length === 1 ? "" : "s"} as CSV.`);
}

function formatDailyReviewPacket(records = getDailyReviewExportRecords()) {
  if (records.length === 0) return "No Daily AI drafts are ready for review.";

  return records.map((record, index) => [
    `Daily AI Draft ${index + 1}: ${record.company}`,
    `Website: ${record.website || "Not set"}`,
    `Decision-maker: ${record.decisionMaker || "Not set"}`,
    `Email: ${record.contactEmail || "Not set"}`,
    `Lead: ${record.leadScore} (${record.leadTier})`,
    `Trigger: ${record.trigger || "Not set"}`,
    `Fit: ${record.fit || "Not set"}`,
    "",
    "Brief:",
    record.aiBrief || "No brief saved.",
    "",
    "Draft:",
    record.aiEmail || "No draft saved."
  ].join("\n")).join("\n\n---\n\n");
}

async function copyDailyReviewPacket() {
  const records = getDailyReviewExportRecords();
  if (records.length === 0) {
    setDataStatus("No Daily AI drafts to copy.", "error");
    return;
  }

  const packet = formatDailyReviewPacket(records);
  try {
    await navigator.clipboard.writeText(packet);
    setDataStatus(`Copied ${records.length} Daily AI review draft${records.length === 1 ? "" : "s"}.`);
  } catch {
    setDataStatus(packet);
  }
}

function formatBlockedDailyReviewPacket(items = getBlockedDailyReviewProspects()) {
  if (items.length === 0) return "No Daily AI drafts are blocked.";

  return items.map(({ prospect }, index) => {
    const readiness = getDailyReviewSendReadiness(prospect);
    const missing = readiness.checks
      .filter((check) => check.required && !check.ready)
      .map((check) => check.label)
      .join(", ");

    return [
      `Blocked Daily AI Draft ${index + 1}: ${prospect.company}`,
      `Missing: ${missing || "None"}`,
      `Contact email: ${prospect.contactEmail || "Not set"}`,
      `Decision-maker: ${prospect.decisionMaker || "Not set"}`,
      `Draft preview: ${previewText(prospect.aiEmail, "No draft saved.")}`
    ].join("\n");
  }).join("\n\n---\n\n");
}

function getBlockedDailyReviewExportRecords(items = getBlockedDailyReviewProspects()) {
  return items.map(({ prospect }) => {
    const readiness = getDailyReviewSendReadiness(prospect);
    return {
      company: prospect.company,
      website: prospect.website,
      industry: prospect.industry,
      decisionMaker: prospect.decisionMaker,
      contactEmail: prospect.contactEmail,
      stage: prospect.stage,
      missingRequired: readiness.checks
        .filter((check) => check.required && !check.ready)
        .map((check) => check.label)
        .join("; "),
      aiEmail: prospect.aiEmail
    };
  });
}

function exportBlockedDailyReviewJson() {
  const records = getBlockedDailyReviewExportRecords();
  if (records.length === 0) {
    setDataStatus("No blocked Daily AI drafts to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-blocked-review-${stamp}.json`, JSON.stringify({ exportedAt, records }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${records.length} blocked Daily AI draft${records.length === 1 ? "" : "s"} as JSON.`);
}

function exportBlockedDailyReviewCsv() {
  const records = getBlockedDailyReviewExportRecords();
  if (records.length === 0) {
    setDataStatus("No blocked Daily AI drafts to export.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "decisionMaker", "contactEmail", "stage", "missingRequired", "aiEmail"];
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  downloadFile("regent-growth-daily-ai-blocked-review.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${records.length} blocked Daily AI draft${records.length === 1 ? "" : "s"} as CSV.`);
}

async function copyBlockedDailyReviewPacket() {
  const blockedProspects = getBlockedDailyReviewProspects();
  if (blockedProspects.length === 0) {
    setDataStatus("No blocked Daily AI drafts to copy.", "error");
    return;
  }

  const packet = formatBlockedDailyReviewPacket(blockedProspects);
  try {
    await navigator.clipboard.writeText(packet);
    setDataStatus(`Copied ${blockedProspects.length} blocked Daily AI draft${blockedProspects.length === 1 ? "" : "s"}.`);
  } catch {
    setDataStatus(packet);
  }
}

function sendDailyReviewProspect(index) {
  const prospect = prospects[index];
  if (!prospect) return;
  const readiness = getDailyReviewSendReadiness(prospect);

  if (!readiness.ready) {
    setDataStatus(`Cannot send ${prospect.company} yet: complete the required send checklist.`, "error");
    return;
  }

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "all";
  stageFilter.value = "all";
  responseFilter.value = "all";
  setDrafts(prospect);
  openEmailHandoff("mailto");
  renderProspects();
}

function openDailyReviewMissingFields(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  const readiness = getDailyReviewSendReadiness(prospect);
  const missingRequired = readiness.checks.find((check) => check.required && !check.ready);

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "all";
  stageFilter.value = "all";
  responseFilter.value = "all";

  if (missingRequired?.label === "Contact email") {
    editProspect(index);
    setTimeout(() => prospectForm.contactEmail.focus(), 0);
    setDataStatus(`Add or fix the contact email for ${prospect.company}.`, "error");
    return;
  }

  setDrafts(prospect);
  renderProspects();
  setTimeout(() => emailDraft.focus(), 0);
  setDataStatus(`Fix the email draft for ${prospect.company}.`, "error");
}

function markDailyReviewProspectSent(index) {
  const prospect = prospects[index];
  if (!prospect) return;
  const readiness = getDailyReviewSendReadiness(prospect);

  if (!readiness.ready) {
    setDataStatus(`Cannot mark ${prospect.company} sent yet: complete the required send checklist.`, "error");
    return;
  }

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "all";
  stageFilter.value = "all";
  responseFilter.value = "all";
  setDrafts(prospect);
  markEmailSent();
}

async function retryDailyAiProspect(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  runDailyAiButton.disabled = true;
  addDailyRunLog(`Retrying Daily AI for ${prospect.company}.`);
  await researchAndDraftDailyProspects([prospect]);
  renderProspects();
  renderDailyRunCapacitySummary();
}

async function retryVisibleDailyAiFailures() {
  const failedProspects = getDailyAiFailedProspects().map(({ prospect }) => prospect);

  if (failedProspects.length === 0) {
    setDataStatus("No visible Daily AI failures to retry.", "error");
    return;
  }

  runDailyAiButton.disabled = true;
  resetDailyRunLog();
  addDailyRunLog(`Retrying ${failedProspects.length} visible Daily AI failure${failedProspects.length === 1 ? "" : "s"}.`);
  const results = await researchAndDraftDailyProspects(failedProspects);
  renderProspects();
  renderDailyRunCapacitySummary();
  setDataStatus(`Retried ${failedProspects.length} visible Daily AI failure${failedProspects.length === 1 ? "" : "s"}: ${results.drafted} drafted, ${results.failed} failed.`);
  addDailyRunLog(`Visible failure retry complete: ${results.researched} researched, ${results.drafted} drafted, ${results.failed} failed.`, results.failed ? "error" : "done");
}

function renderDiscoveryQueue() {
  if (discoveryQueue.length === 0) {
    discoveryList.innerHTML = `<p class="empty-state">No discovery candidates yet. Generate candidates from your target industries and qualification signals.</p>`;
    renderDailyRunCapacitySummary();
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
  renderDailyRunCapacitySummary();
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
    "follow-up-due": isFollowUpDue,
    "crm-failed": (item) => item.crmSyncStatus === "Sync Failed",
    "crm-reviewed": (item) => item.crmSyncStatus === "Retry Reviewed",
    "crm-syncing": (item) => item.crmSyncStatus === "Syncing",
    "crm-synced": (item) => item.crmSyncStatus === "Synced",
    "crm-not-synced": (item) => !item.crmSyncStatus || item.crmSyncStatus === "Not Synced"
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
    "follow-up-due": "Follow-up Due",
    "crm-failed": "CRM Failed",
    "crm-reviewed": "CRM Reviewed",
    "crm-syncing": "CRM Syncing",
    "crm-synced": "CRM Synced",
    "crm-not-synced": "CRM Not Synced"
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
  const total = prospects.length;
  const emailDraftedCount = prospects.filter((prospect) => prospect.stage !== "Research").length;
  const followUpDueCount = prospects.filter(isFollowUpDue).length;
  const overdueCount = prospects.filter((prospect) => prospect.nextTouch && daysUntil(prospect.nextTouch) < 0 && !isClosedResponse(prospect)).length;
  const meetingCount = prospects.filter((prospect) => prospect.stage === "Meeting" || prospect.responseStatus === "Meeting Booked").length;
  const assignedCount = prospects.filter(isAssignedHandoff).length;
  const blockedCount = prospects.filter(isBlockedHandoff).length;
  const priorityLeadCount = prospects.filter((prospect) => getLeadScoreSummary(prospect).score >= 85).length;
  const warmLeadCount = prospects.filter(isWarmLead).length;
  const averageLeadScore = total
    ? Math.round(prospects.reduce((sum, prospect) => sum + getLeadScoreSummary(prospect).score, 0) / total)
    : 0;
  const targetProgress = Math.min(100, Math.round((total / weeklyQualifiedTarget) * 100));

  document.querySelector("#qualifiedMetric").textContent = total;
  document.querySelector("#qualifiedSubMetric").textContent = `${targetProgress}% of weekly target`;
  document.querySelector("#emailMetric").textContent = emailDraftedCount;
  document.querySelector("#emailSubMetric").textContent = `${formatPercent(emailDraftedCount, total)} of pipeline`;
  document.querySelector("#followUpMetric").textContent = followUpDueCount;
  document.querySelector("#followUpSubMetric").textContent = overdueCount > 0 ? `${overdueCount} overdue` : "No overdue touches";
  document.querySelector("#meetingMetric").textContent = meetingCount;
  document.querySelector("#meetingSubMetric").textContent = `${formatPercent(meetingCount, total)} meeting rate`;
  document.querySelector("#priorityLeadMetric").textContent = priorityLeadCount;
  document.querySelector("#priorityLeadSubMetric").textContent = `${formatPercent(priorityLeadCount, total)} of pipeline`;
  document.querySelector("#warmLeadMetric").textContent = warmLeadCount;
  document.querySelector("#warmLeadSubMetric").textContent = `${formatPercent(warmLeadCount, total)} ready for handoff`;
  document.querySelector("#avgLeadScoreMetric").textContent = averageLeadScore;
  document.querySelector("#avgLeadScoreSubMetric").textContent = getLeadScoreTier(averageLeadScore).label;
  document.querySelector("#targetProgressMetric").textContent = `${targetProgress}%`;
  document.querySelector("#targetProgressSubMetric").textContent = `${total} of ${weeklyQualifiedTarget} companies`;
  document.querySelector("#assignedMetric").textContent = assignedCount;
  document.querySelector("#assignedSubMetric").textContent = `${formatPercent(assignedCount, warmLeadCount)} of warm leads`;
  document.querySelector("#blockedMetric").textContent = blockedCount;
  document.querySelector("#blockedSubMetric").textContent = blockedCount > 0 ? "Needs unblock" : "No blockers";
  renderStageBreakdown(total);
  renderDashboardFocus({ total, followUpDueCount, overdueCount, priorityLeadCount, warmLeadCount, blockedCount, meetingCount, targetProgress });
}

function formatPercent(count, total) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function renderStageBreakdown(total = prospects.length) {
  const stageBreakdown = document.querySelector("#stageBreakdown");

  stageBreakdown.innerHTML = stageOrder.map((stage) => {
    const count = prospects.filter((prospect) => prospect.stage === stage).length;
    const percent = total ? Math.round((count / total) * 100) : 0;

    return `
      <div class="stage-breakdown-row">
        <span>${escapeHtml(stage)}</span>
        <div class="stage-meter" aria-label="${escapeHtml(stage)} ${escapeHtml(percent)}%">
          <span style="width: ${escapeHtml(percent)}%"></span>
        </div>
        <strong>${escapeHtml(count)}</strong>
      </div>
    `;
  }).join("");
}

function renderDashboardFocus(summary) {
  const title = document.querySelector("#dashboardFocusTitle");
  const text = document.querySelector("#dashboardFocusText");

  if (summary.blockedCount > 0) {
    title.textContent = "Unblock handoffs";
    text.textContent = `${summary.blockedCount} handoff${summary.blockedCount === 1 ? "" : "s"} need attention before they can move forward.`;
    return;
  }

  if (summary.overdueCount > 0) {
    title.textContent = "Catch up follow-ups";
    text.textContent = `${summary.overdueCount} prospect${summary.overdueCount === 1 ? "" : "s"} have overdue touches. Clear those before adding more volume.`;
    return;
  }

  if (summary.priorityLeadCount > 0) {
    title.textContent = "Work priority leads";
    text.textContent = `${summary.priorityLeadCount} account${summary.priorityLeadCount === 1 ? "" : "s"} have lead score 85+. Push them toward meetings or handoff.`;
    return;
  }

  if (summary.warmLeadCount > 0) {
    title.textContent = "Prepare handoffs";
    text.textContent = `${summary.warmLeadCount} warm lead${summary.warmLeadCount === 1 ? "" : "s"} can be packaged for CRM or owner review.`;
    return;
  }

  if (summary.targetProgress < 100) {
    title.textContent = "Build pipeline";
    text.textContent = `${summary.total} of ${weeklyQualifiedTarget} weekly target companies are loaded. Add more qualified prospects or generate discovery candidates.`;
    return;
  }

  title.textContent = "Target reached";
  text.textContent = `Weekly target is loaded. Focus on follow-up, meetings, and handoff quality.`;
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
      <span>Lead Score</span>
      ${renderLeadScoreBadge(prospect)}
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
      <span>Lead Score Signals</span>
      <p>${escapeHtml(renderLeadScoreReasonText(prospect))}</p>
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
    renderEmailSendStatus(null);
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
  renderEmailSendStatus(prospect);
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
  const leadSummary = getLeadScoreSummary(prospect);
  const values = {
    company: prospect.company,
    industry: prospect.industry,
    size: prospect.size,
    website: prospect.website,
    decisionMaker: prospect.decisionMaker,
    trigger: prospect.trigger,
    fit: prospect.fit,
    stage: prospect.stage,
    score: prospect.score,
    leadScore: leadSummary.score,
    leadTier: leadSummary.tier
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

async function preflightDailyAiModel() {
  const model = modelSelect.value;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  addDailyRunLog(`Checking local AI model ${model}.`);

  try {
    const response = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt: "Reply with OK only.",
        stream: false,
        think: false,
        options: {
          temperature: 0,
          num_predict: 4
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    addDailyRunLog(`Local AI model ready: ${model}.`, "done");
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
    renderEmailSendStatus(prospect);
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Local AI timed out. Try qwen2.5:0.5b for a quick draft or retry qwen3:8b."
      : "Local AI error: make sure Ollama is running and the model is installed.";
    setAiStatus(message, "error");
  } finally {
    generateEmailButton.disabled = false;
  }
}

function getDiscoveryCriteria() {
  const formData = new FormData(discoveryForm);
  return {
    industries: formData.get("industries").trim(),
    location: formData.get("location").trim(),
    count: Math.min(20, Math.max(3, Number(formData.get("count")) || 8)),
    signals: formData.get("signals").trim()
  };
}

function getDailyRunLimit() {
  const value = Number(discoveryForm.elements.dailyRunLimit?.value);
  return Math.min(10, Math.max(1, Number.isFinite(value) ? value : 3));
}

function shouldDailyRunRequireEvidence() {
  return Boolean(discoveryForm.elements.dailyRequireEvidence?.checked);
}

function shouldDailyRunAutoFetchEvidence() {
  return Boolean(discoveryForm.elements.dailyAutoFetchEvidence?.checked);
}

function isEvidenceReadyCandidate(candidate) {
  return candidate.sourceStatus === "Evidence Found" || Boolean(candidate.sourceNotes?.trim());
}

function getDailyRunEligibleCandidates(requireEvidence = shouldDailyRunRequireEvidence()) {
  return discoveryQueue.filter((candidate) => (
    candidate.sourceStatus !== "Rejected"
    && (!requireEvidence || isEvidenceReadyCandidate(candidate))
  ));
}

function resetDailyRunLog() {
  dailyRunLog.innerHTML = "";
}

function addDailyRunLog(message, state = "working") {
  const entry = document.createElement("p");
  entry.dataset.state = state;
  entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  dailyRunLog.prepend(entry);
}

function recordDailyRunHistory(snapshot) {
  const normalizedSnapshot = normalizeDailyRunSnapshot({
    ...snapshot,
    finishedAt: snapshot.finishedAt || new Date().toISOString()
  });
  dailyRunHistory = [normalizedSnapshot, ...dailyRunHistory].slice(0, 10);
  saveDailyRunHistory();
  renderDailyRunHistory();
}

function renderDailyRunHistory() {
  const visibleHistory = getVisibleDailyRunHistory();
  const visibleHistoryHasFailures = visibleHistory.some((snapshot) => getDailyHistoryFailedProspects(snapshot).length > 0);

  if (dailyRunHistory.length === 0) {
    dailyRunHistoryList.innerHTML = `<p class="empty-state">Completed Daily AI runs will appear here.</p>`;
    return;
  }

  dailyRunHistoryList.innerHTML = `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">Daily AI History</p>
        <h3>${escapeHtml(visibleHistory.length)} of ${escapeHtml(dailyRunHistory.length)} saved run${dailyRunHistory.length === 1 ? "" : "s"}</h3>
        ${renderDailyRunHistoryCountBadge(visibleHistory)}
        ${renderDailyRunHistoryStatusCounts()}
        ${renderDailyRunHistorySourceChips(visibleHistory)}
        ${renderDailyRunHistoryFailureRetryBadge(visibleHistory)}
      </div>
      <div class="daily-history-actions">
        <div>
          <select data-action="filter-daily-history" aria-label="Filter Daily AI history">
            <option value="all" ${dailyRunHistoryStatusFilter === "all" ? "selected" : ""}>All runs</option>
            <option value="Completed" ${dailyRunHistoryStatusFilter === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Completed with failures" ${dailyRunHistoryStatusFilter === "Completed with failures" ? "selected" : ""}>With failures</option>
            <option value="Stopped" ${dailyRunHistoryStatusFilter === "Stopped" ? "selected" : ""}>Stopped</option>
            <option value="skipped" ${dailyRunHistoryStatusFilter === "skipped" ? "selected" : ""}>With skipped</option>
            <option value="Failed" ${dailyRunHistoryStatusFilter === "Failed" ? "selected" : ""}>Failed</option>
          </select>
          <button class="secondary-button" type="button" data-action="clear-daily-history-filter">Clear filter</button>
          <button class="secondary-button" type="button" data-action="reset-daily-history-view">Reset view</button>
          <button class="secondary-button" type="button" data-action="copy-daily-history-summary">Copy summary</button>
          <button class="secondary-button" type="button" data-action="copy-daily-history-status-counts">Copy counts</button>
          <button class="secondary-button" type="button" data-action="copy-daily-history-source-summary">Copy sources</button>
          ${getDailyRunHistoryStatusCount("Failed") > 0 ? `<button class="secondary-button" type="button" data-action="show-failed-daily-history">View failed</button>` : ""}
          <button class="secondary-button" type="button" data-action="toggle-compact-daily-history">${compactDailyRunHistory ? "Full history" : "Compact history"}</button>
          <button class="secondary-button" type="button" data-action="toggle-all-daily-history">${showAllDailyRunHistory ? "Show first 5" : "Show all"}</button>
          <button class="secondary-button" type="button" data-action="export-daily-history">Export visible JSON</button>
          <button class="secondary-button" type="button" data-action="export-daily-history-csv">Export visible CSV</button>
        </div>
        ${visibleHistoryHasFailures ? `
          <div data-action-group="daily-history-failures">
            <span class="daily-history-action-label">${escapeHtml(getVisibleDailyHistoryFailedItems(visibleHistory).length)} retryable</span>
            <button class="secondary-button" type="button" data-action="retry-visible-daily-history-failures" title="Retry visible Daily AI history failures" aria-label="Retry visible Daily AI history failures" ${dailyRunInProgress ? "disabled" : ""}>Retry</button>
            <button class="secondary-button" type="button" data-action="copy-visible-daily-history-failures" title="Copy visible Daily AI history failures" aria-label="Copy visible Daily AI history failures">Copy</button>
            <button class="secondary-button" type="button" data-action="export-visible-daily-history-failures" title="Export visible Daily AI history failures as JSON" aria-label="Export visible Daily AI history failures as JSON">JSON</button>
            <button class="secondary-button" type="button" data-action="export-visible-daily-history-failures-csv" title="Export visible Daily AI history failures as CSV" aria-label="Export visible Daily AI history failures as CSV">CSV</button>
            <button class="danger-button" type="button" data-action="clear-visible-daily-history-failures" title="Clear visible Daily AI history failure notes" aria-label="Clear visible Daily AI history failure notes" ${dailyRunInProgress ? "disabled" : ""}>Clear</button>
            ${dailyRunInProgress ? `<span class="daily-history-action-label">Run active</span>` : ""}
          </div>
        ` : ""}
        <div>
          <button class="secondary-button" type="button" data-action="copy-skipped-daily-history">Copy skipped</button>
          <button class="secondary-button" type="button" data-action="export-skipped-daily-history">Export skipped JSON</button>
          <button class="secondary-button" type="button" data-action="export-skipped-daily-history-csv">Export skipped CSV</button>
        </div>
        <div>
          <button class="secondary-button" type="button" data-action="copy-stopped-daily-history">Copy stopped</button>
          <button class="secondary-button" type="button" data-action="export-stopped-daily-history">Export stopped JSON</button>
          <button class="secondary-button" type="button" data-action="export-stopped-daily-history-csv">Export stopped CSV</button>
        </div>
        <div>
          <button class="danger-button" type="button" data-action="clear-daily-history">Clear</button>
        </div>
      </div>
    </div>
    ${visibleHistory.length === 0
      ? `<p class="empty-state">No Daily AI runs match this status filter.</p>`
      : `
        ${renderDailyRunHistoryFailureRetryGuidance(visibleHistory)}
        ${renderDailyRunHistoryVisibleLimitSummary(visibleHistory)}
        <div class="daily-run-history-items">${getVisibleDailyRunHistoryItems(visibleHistory).map(renderDailyRunHistoryItem).join("")}</div>
      `}
  `;
}

function renderDailyRunHistoryCountBadge(visibleHistory) {
  const filterLabel = dailyRunHistoryStatusFilter === "all" ? "all runs" : dailyRunHistoryStatusFilter;

  return `
    <p class="daily-history-count">
      ${escapeHtml(visibleHistory.length)} visible / ${escapeHtml(dailyRunHistory.length)} total | ${escapeHtml(filterLabel)}
    </p>
  `;
}

function renderDailyRunHistoryStatusCounts() {
  const statusCounts = getDailyRunHistoryStatusCounts();

  return `
    <div class="daily-history-status-counts" aria-label="Daily AI history status counts">
      ${statusCounts.map(({ value, label, count }) => `
        <button
          type="button"
          data-action="set-daily-history-filter"
          data-value="${escapeHtml(value)}"
          data-active="${dailyRunHistoryStatusFilter === value}"
        >
          ${escapeHtml(label)} <strong>${escapeHtml(count)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderDailyRunHistorySourceChips(visibleHistory) {
  const entries = Object.entries(getDailyRunHistorySourceSummary(visibleHistory))
    .sort(([sourceA, countA], [sourceB, countB]) => countB - countA || sourceA.localeCompare(sourceB));
  if (entries.length === 0) return "";

  return `
    <div class="daily-history-source-chips" aria-label="Daily AI history source summary">
      ${entries.map(([source, count]) => `<span title="${escapeHtml(source)}" aria-label="${escapeHtml(source)}: ${escapeHtml(count)} run${count === 1 ? "" : "s"}">${escapeHtml(source)} <strong>${escapeHtml(count)}</strong></span>`).join("")}
    </div>
  `;
}

function renderDailyRunHistoryFailureRetryBadge(visibleHistory) {
  const retryableFailureCount = getVisibleDailyHistoryFailedItems(visibleHistory).length;
  return `
    <p class="daily-history-failure-count" data-state="${retryableFailureCount > 0 ? "warning" : "clear"}">
      ${escapeHtml(retryableFailureCount)} visible retryable Daily AI failure${retryableFailureCount === 1 ? "" : "s"}
    </p>
  `;
}

function renderDailyRunHistoryFailureRetryGuidance(visibleHistory) {
  const hasFailedRun = visibleHistory.some((snapshot) => ["Failed", "Completed with failures"].includes(snapshot.status));
  if (!hasFailedRun || getVisibleDailyHistoryFailedItems(visibleHistory).length > 0) return "";

  return `
    <p class="daily-review-limit">
      Failed run records are visible, but no matching prospects still have retryable Daily AI failure notes.
    </p>
  `;
}

function getDailyRunHistoryStatusCounts() {
  const rawCounts = dailyRunHistory.reduce((counts, snapshot) => {
    counts[snapshot.status] = (counts[snapshot.status] || 0) + 1;
    if (snapshot.skipped > 0) counts.skipped = (counts.skipped || 0) + 1;
    return counts;
  }, { all: dailyRunHistory.length });
  const countItems = [
    ["all", "All"],
    ["Completed", "Completed"],
    ["Completed with failures", "With failures"],
    ["Stopped", "Stopped"],
    ["Failed", "Failed"],
    ["skipped", "With skipped"]
  ];

  return countItems.map(([value, label]) => ({
    value,
    label,
    count: rawCounts[value] || 0
  }));
}

function getDailyRunHistoryStatusCount(status) {
  const match = getDailyRunHistoryStatusCounts().find((item) => item.value === status);
  return match ? match.count : 0;
}

function clearDailyRunHistoryFilter() {
  dailyRunHistoryStatusFilter = "all";
  renderDailyRunHistory();
  setDataStatus("Cleared Daily AI history filter.");
}

function showFailedDailyRunHistory() {
  dailyRunHistoryStatusFilter = "Failed";
  compactDailyRunHistory = false;
  showAllDailyRunHistory = true;
  renderDailyRunHistory();
  setDataStatus(`Showing ${getDailyRunHistoryStatusCount("Failed")} failed Daily AI run${getDailyRunHistoryStatusCount("Failed") === 1 ? "" : "s"}.`);
}

function resetDailyRunHistoryView() {
  dailyRunHistoryStatusFilter = "all";
  compactDailyRunHistory = false;
  showAllDailyRunHistory = false;
  renderDailyRunHistory();
  setDataStatus("Reset Daily AI history view.");
}

function getVisibleDailyRunHistoryItems(items) {
  return showAllDailyRunHistory ? items : items.slice(0, 5);
}

function renderDailyRunHistoryVisibleLimitSummary(items) {
  const hiddenCount = showAllDailyRunHistory ? 0 : Math.max(0, items.length - 5);
  if (hiddenCount === 0) return "";

  return `<p class="daily-review-limit">Showing first 5 history records; ${escapeHtml(hiddenCount)} more match the current filter.</p>`;
}

function getVisibleDailyRunHistory() {
  if (dailyRunHistoryStatusFilter === "all") return dailyRunHistory;
  if (dailyRunHistoryStatusFilter === "skipped") {
    return dailyRunHistory.filter((snapshot) => snapshot.skipped > 0);
  }

  return dailyRunHistory.filter((snapshot) => snapshot.status === dailyRunHistoryStatusFilter);
}

function renderDailyRunHistoryItem(snapshot) {
  const counts = [
    `${snapshot.generatedCount} generated`,
    `${snapshot.fetchedCount} fetched`,
    `${snapshot.addedCount} added`,
    `${snapshot.existingFilledCount} existing`,
    `${snapshot.researched} researched`,
    `${snapshot.drafted} drafted`,
    `${snapshot.skipped} skipped`,
    `${snapshot.failed} failed`
  ].join(" | ");
  const companyText = snapshot.companies.length > 0 ? snapshot.companies.join(", ") : "No companies processed";
  const canRetry = snapshot.companies.length > 0 && (snapshot.status !== "Completed" || snapshot.failed > 0);
  const canRequeueStopped = snapshot.status === "Stopped" && snapshot.companies.length > 0;
  const stoppedUnfinishedCount = canRequeueStopped ? getDailyHistoryUnfinishedProspects(snapshot).length : 0;

  return `
    <article ${compactDailyRunHistory ? `data-view="compact"` : ""}>
      <div>
        <strong>${escapeHtml(snapshot.status)}</strong>
        <p>${escapeHtml(formatDateTime(snapshot.finishedAt || snapshot.startedAt))} | ${escapeHtml(snapshot.model || "No model")} | limit ${escapeHtml(snapshot.limit)}</p>
        ${snapshot.source ? `<p>Source: ${escapeHtml(snapshot.source)}</p>` : ""}
        ${compactDailyRunHistory
          ? `<p>${escapeHtml(snapshot.drafted)} drafted | ${escapeHtml(snapshot.failed)} failed | ${escapeHtml(snapshot.skipped)} skipped | ${escapeHtml(snapshot.companies.length)} companies</p>`
          : `
            <p>${escapeHtml(counts)}</p>
            <p>${escapeHtml(companyText)}</p>
            ${canRequeueStopped ? `<p>${escapeHtml(stoppedUnfinishedCount)} unfinished prospect${stoppedUnfinishedCount === 1 ? "" : "s"} still available to requeue.</p>` : ""}
            ${snapshot.error ? `<p class="history-error">${escapeHtml(snapshot.error)}</p>` : ""}
          `}
      </div>
      ${canRetry ? `
        <div class="daily-review-actions">
          <button type="button" data-action="retry-daily-history-failures" data-id="${escapeHtml(snapshot.id)}">Retry failures</button>
          ${canRequeueStopped ? `<button class="secondary-button" type="button" data-action="requeue-stopped-daily-history" data-id="${escapeHtml(snapshot.id)}">Requeue stopped</button>` : ""}
        </div>
      ` : ""}
    </article>
  `;
}

function getDailyHistoryFailedProspects(snapshot) {
  const companyKeys = new Set(snapshot.companies.map(getCompanyMatchKey).filter(Boolean));
  return prospects.filter((prospect) => (
    companyKeys.has(getCompanyMatchKey(prospect.company))
    && !prospect.aiEmail
    && (prospect.responseNotes || "").includes("Daily AI failed:")
  ));
}

function getVisibleDailyHistoryFailedProspects() {
  return getVisibleDailyHistoryFailedItems().map(({ prospect }) => prospect);
}

function getVisibleDailyHistoryFailedItems(historyItems = getVisibleDailyRunHistory()) {
  const failedProspects = [];
  const seenProspects = new Set();
  historyItems.forEach((snapshot) => {
    getDailyHistoryFailedProspects(snapshot).forEach((prospect) => {
      const key = prospect.id || getCompanyMatchKey(prospect.company);
      if (!key || seenProspects.has(key)) return;
      seenProspects.add(key);
      failedProspects.push({ prospect, index: prospects.indexOf(prospect) });
    });
  });
  return failedProspects;
}

function getDailyHistoryUnfinishedProspects(snapshot) {
  const companyKeys = new Set(snapshot.companies.map(getCompanyMatchKey).filter(Boolean));
  return prospects.filter((prospect) => (
    companyKeys.has(getCompanyMatchKey(prospect.company))
    && ["Research", "Email Drafted"].includes(prospect.stage)
    && (!prospect.aiBrief || !prospect.aiEmail)
  ));
}

function getCompanyMatchKey(company) {
  return String(company || "").trim().toLowerCase();
}

async function requeueStoppedDailyRun(id) {
  const snapshot = dailyRunHistory.find((historyItem) => historyItem.id === id);
  if (!snapshot) return;

  const unfinishedProspects = getDailyHistoryUnfinishedProspects(snapshot);
  if (unfinishedProspects.length === 0) {
    setDataStatus("No unfinished prospects from that stopped run are still available.", "error");
    return;
  }

  const requeueSnapshot = {
    id: createId(),
    startedAt: new Date().toISOString(),
    status: "Running",
    model: modelSelect.value,
    limit: unfinishedProspects.length,
    generatedCount: 0,
    fetchedCount: 0,
    addedCount: 0,
    existingFilledCount: unfinishedProspects.length,
    researched: 0,
    drafted: 0,
    skipped: 0,
    failed: 0,
    error: "",
    companies: unfinishedProspects.map((prospect) => prospect.company).filter(Boolean)
  };

  resetDailyRunLog();
  addDailyRunLog(`Requeueing ${unfinishedProspects.length} unfinished prospect${unfinishedProspects.length === 1 ? "" : "s"} from stopped Daily AI run.`);
  try {
    const results = await researchAndDraftDailyProspects(unfinishedProspects);
    requeueSnapshot.researched = results.researched;
    requeueSnapshot.drafted = results.drafted;
    requeueSnapshot.skipped = results.skipped;
    requeueSnapshot.failed = results.failed;
    requeueSnapshot.status = results.failed ? "Completed with failures" : "Completed";
    saveProspects();
    renderProspects();
    renderDailyRunCapacitySummary();
    recordDailyRunHistory(requeueSnapshot);
    setDataStatus(`Stopped run requeue complete: ${results.researched} researched, ${results.drafted} drafted, ${results.failed} failed.`);
    addDailyRunLog(`Stopped requeue complete: ${results.researched} researched, ${results.drafted} drafted, ${results.failed} failed.`, results.failed ? "error" : "done");
  } catch (error) {
    requeueSnapshot.status = "Failed";
    requeueSnapshot.error = error.message || "Stopped run requeue failed.";
    recordDailyRunHistory(requeueSnapshot);
    setDataStatus(`Stopped run requeue failed: ${requeueSnapshot.error}`, "error");
    addDailyRunLog(`Stopped requeue failed: ${requeueSnapshot.error}`, "error");
  }
}

async function retryDailyRunHistoryFailures(id) {
  const snapshot = dailyRunHistory.find((historyItem) => historyItem.id === id);
  if (!snapshot) return;

  const failedProspects = getDailyHistoryFailedProspects(snapshot);
  if (failedProspects.length === 0) {
    setDataStatus("No matching failed Daily AI prospects are still waiting for retry.", "error");
    return;
  }

  await retryDailyRunHistoryProspects(failedProspects, "Daily AI history");
}

async function retryVisibleDailyRunHistoryFailures() {
  if (dailyRunInProgress) {
    setDataStatus("Wait for the current Daily AI run to finish before retrying history failures.", "error");
    return;
  }

  const failedProspects = getVisibleDailyHistoryFailedProspects();
  if (failedProspects.length === 0) {
    setDataStatus("No visible failed Daily AI prospects are still waiting for retry.", "error");
    return;
  }

  await retryDailyRunHistoryProspects(failedProspects, "visible Daily AI history");
}

async function copyVisibleDailyRunHistoryFailurePacket() {
  const failedItems = getVisibleDailyHistoryFailedItems();
  if (failedItems.length === 0) {
    setDataStatus("No visible Daily AI history failures to copy.", "error");
    return;
  }

  const packet = formatDailyAiFailurePacket(failedItems);
  await navigator.clipboard.writeText(packet);
  setDataStatus(`Copied ${failedItems.length} visible Daily AI history failure${failedItems.length === 1 ? "" : "s"}.`);
}

function exportVisibleDailyRunHistoryFailuresJson() {
  const records = getDailyAiFailureExportRecords(getVisibleDailyHistoryFailedItems());
  if (records.length === 0) {
    setDataStatus("No visible Daily AI history failures to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-history-failures-${stamp}.json`, JSON.stringify({ exportedAt, statusFilter: dailyRunHistoryStatusFilter, records }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${records.length} visible Daily AI history failure${records.length === 1 ? "" : "s"} as JSON.`);
}

function exportVisibleDailyRunHistoryFailuresCsv() {
  const records = getDailyAiFailureExportRecords(getVisibleDailyHistoryFailedItems());
  if (records.length === 0) {
    setDataStatus("No visible Daily AI history failures to export.", "error");
    return;
  }

  const headers = ["company", "website", "industry", "decisionMaker", "contactEmail", "stage", "failure", "trigger", "fit", "responseNotes"];
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  downloadFile("regent-growth-daily-ai-history-failures.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${records.length} visible Daily AI history failure${records.length === 1 ? "" : "s"} as CSV.`);
}

function clearVisibleDailyRunHistoryFailures() {
  if (dailyRunInProgress) {
    setDataStatus("Wait for the current Daily AI run to finish before clearing history failures.", "error");
    return;
  }

  const failedItems = getVisibleDailyHistoryFailedItems();
  if (failedItems.length === 0) {
    setDataStatus("No visible Daily AI history failures to clear.", "error");
    return;
  }

  const confirmed = window.confirm(`Clear ${failedItems.length} visible Daily AI history failure${failedItems.length === 1 ? "" : "s"}? This removes the saved failure notes from matching prospects.`);
  if (!confirmed) {
    setDataStatus("Daily AI history failure clear canceled.");
    return;
  }

  failedItems.forEach(({ prospect }) => clearDailyAiFailureNotes(prospect));
  saveProspects();
  renderProspects();
  renderDailyRunHistory();
  setDataStatus(`Cleared ${failedItems.length} visible Daily AI history failure${failedItems.length === 1 ? "" : "s"}.`);
}

async function retryDailyRunHistoryProspects(failedProspects, sourceLabel) {
  const retrySnapshot = {
    id: createId(),
    startedAt: new Date().toISOString(),
    status: "Running",
    model: modelSelect.value,
    limit: failedProspects.length,
    generatedCount: 0,
    fetchedCount: 0,
    addedCount: 0,
    existingFilledCount: failedProspects.length,
    researched: 0,
    drafted: 0,
    skipped: 0,
    failed: 0,
    error: "",
    source: sourceLabel,
    companies: failedProspects.map((prospect) => prospect.company).filter(Boolean)
  };

  runDailyAiButton.disabled = true;
  resetDailyRunLog();
  addDailyRunLog(`Retrying ${failedProspects.length} failed prospect${failedProspects.length === 1 ? "" : "s"} from ${sourceLabel}.`);

  try {
    const results = await researchAndDraftDailyProspects(failedProspects);
    retrySnapshot.researched = results.researched;
    retrySnapshot.drafted = results.drafted;
    retrySnapshot.skipped = results.skipped;
    retrySnapshot.failed = results.failed;
    retrySnapshot.status = results.failed ? "Completed with failures" : "Completed";
    recordDailyRunHistory(retrySnapshot);
    setDataStatus(`${sourceLabel} retry complete: ${failedProspects.length} attempted, ${results.researched} researched, ${results.drafted} drafted, ${results.failed} failed.`);
    addDailyRunLog(`History retry complete: ${failedProspects.length} attempted, ${results.researched} researched, ${results.drafted} drafted, ${results.failed} failed.`, results.failed ? "error" : "done");
  } catch (error) {
    retrySnapshot.status = "Failed";
    retrySnapshot.error = error.message || `${sourceLabel} retry failed.`;
    recordDailyRunHistory(retrySnapshot);
    setDataStatus(`${sourceLabel} retry failed: ${retrySnapshot.error}`, "error");
    addDailyRunLog(`History retry failed: ${retrySnapshot.error}`, "error");
  } finally {
    renderProspects();
    renderDailyRunHistory();
    renderDailyRunCapacitySummary();
  }
}

function exportDailyRunHistoryJson() {
  const visibleHistory = getVisibleDailyRunHistory();
  if (visibleHistory.length === 0) {
    setDataStatus("No Daily AI run history to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-history-${stamp}.json`, JSON.stringify({ exportedAt, statusFilter: dailyRunHistoryStatusFilter, sources: getDailyRunHistorySourceSummary(visibleHistory), runs: visibleHistory }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${visibleHistory.length} Daily AI run history snapshot${visibleHistory.length === 1 ? "" : "s"} as JSON.`);
}

function getDailyRunHistorySourceSummary(historyItems) {
  return historyItems.reduce((summary, snapshot) => {
    const source = snapshot.source || "Daily AI run";
    summary[source] = (summary[source] || 0) + 1;
    return summary;
  }, {});
}

function formatDailyRunHistorySummary(historyItems = getVisibleDailyRunHistory()) {
  if (historyItems.length === 0) return "No Daily AI run history matches the current filter.";

  return [
    `Daily AI Run History (${dailyRunHistoryStatusFilter === "all" ? "all runs" : dailyRunHistoryStatusFilter})`,
    ...historyItems.slice(0, 10).map((snapshot, index) => {
      const counts = [
        `${snapshot.generatedCount} generated`,
        `${snapshot.fetchedCount} fetched`,
        `${snapshot.addedCount} added`,
        `${snapshot.existingFilledCount} existing`,
        `${snapshot.researched} researched`,
        `${snapshot.drafted} drafted`,
        `${snapshot.skipped} skipped`,
        `${snapshot.failed} failed`
      ].join(", ");
      return [
        `${index + 1}. ${snapshot.status} - ${formatDateTime(snapshot.finishedAt || snapshot.startedAt)}`,
        `Model: ${snapshot.model || "Not set"} | Limit: ${snapshot.limit}`,
        `Counts: ${counts}`,
        `Companies: ${snapshot.companies.length > 0 ? snapshot.companies.join(", ") : "None"}`,
        snapshot.source ? `Source: ${snapshot.source}` : "",
        snapshot.error ? `Error: ${snapshot.error}` : ""
      ].filter(Boolean).join("\n");
    })
  ].join("\n\n");
}

async function copyDailyRunHistorySummary() {
  const summary = formatDailyRunHistorySummary();
  await navigator.clipboard.writeText(summary);
  setDataStatus("Copied Daily AI run history summary.");
}

async function copyDailyRunHistoryStatusCounts() {
  const lines = getDailyRunHistoryStatusCounts().map(({ label, count }) => `${label}: ${count}`);
  await navigator.clipboard.writeText(`Daily AI history status counts\n${lines.join("\n")}`);
  setDataStatus("Copied Daily AI history status counts.");
}

async function copyDailyRunHistorySourceSummary() {
  const visibleHistory = getVisibleDailyRunHistory();
  if (visibleHistory.length === 0) {
    setDataStatus("No Daily AI history sources to copy.", "error");
    return;
  }

  const summary = getDailyRunHistorySourceSummary(visibleHistory);
  const lines = Object.entries(summary).map(([source, count]) => `${source}: ${count}`);
  await navigator.clipboard.writeText(`Daily AI history source summary\n${lines.join("\n")}`);
  setDataStatus("Copied Daily AI history source summary.");
}

async function copyStoppedDailyRunHistorySummary() {
  const stoppedRuns = dailyRunHistory.filter((snapshot) => snapshot.status === "Stopped");
  if (stoppedRuns.length === 0) {
    setDataStatus("No stopped Daily AI runs to copy.", "error");
    return;
  }

  const currentFilter = dailyRunHistoryStatusFilter;
  dailyRunHistoryStatusFilter = "Stopped";
  const summary = formatDailyRunHistorySummary(stoppedRuns);
  dailyRunHistoryStatusFilter = currentFilter;
  await navigator.clipboard.writeText(summary);
  setDataStatus(`Copied ${stoppedRuns.length} stopped Daily AI run summar${stoppedRuns.length === 1 ? "y" : "ies"}.`);
}

async function copySkippedDailyRunHistorySummary() {
  const skippedRuns = dailyRunHistory.filter((snapshot) => snapshot.skipped > 0);
  if (skippedRuns.length === 0) {
    setDataStatus("No skipped Daily AI runs to copy.", "error");
    return;
  }

  const currentFilter = dailyRunHistoryStatusFilter;
  dailyRunHistoryStatusFilter = "skipped";
  const summary = formatDailyRunHistorySummary(skippedRuns);
  dailyRunHistoryStatusFilter = currentFilter;
  await navigator.clipboard.writeText(summary);
  setDataStatus(`Copied ${skippedRuns.length} skipped Daily AI run summar${skippedRuns.length === 1 ? "y" : "ies"}.`);
}

function getSkippedDailyRunHistory() {
  return dailyRunHistory.filter((snapshot) => snapshot.skipped > 0);
}

function exportSkippedDailyRunHistoryJson() {
  const skippedRuns = getSkippedDailyRunHistory();
  if (skippedRuns.length === 0) {
    setDataStatus("No skipped Daily AI runs to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-skipped-history-${stamp}.json`, JSON.stringify({ exportedAt, runs: skippedRuns }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${skippedRuns.length} skipped Daily AI run${skippedRuns.length === 1 ? "" : "s"} as JSON.`);
}

function exportSkippedDailyRunHistoryCsv() {
  const skippedRuns = getSkippedDailyRunHistory();
  if (skippedRuns.length === 0) {
    setDataStatus("No skipped Daily AI runs to export.", "error");
    return;
  }

  const headers = ["startedAt", "finishedAt", "status", "source", "model", "limit", "generatedCount", "fetchedCount", "addedCount", "existingFilledCount", "researched", "drafted", "skipped", "failed", "error", "companies"];
  const rows = skippedRuns.map((snapshot) => headers.map((header) => (
    csvCell(header === "companies" ? snapshot.companies.join("; ") : snapshot[header])
  )).join(","));
  downloadFile("regent-growth-daily-ai-skipped-history.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${skippedRuns.length} skipped Daily AI run${skippedRuns.length === 1 ? "" : "s"} as CSV.`);
}

function getStoppedDailyRunHistory() {
  return dailyRunHistory.filter((snapshot) => snapshot.status === "Stopped");
}

function exportStoppedDailyRunHistoryJson() {
  const stoppedRuns = getStoppedDailyRunHistory();
  if (stoppedRuns.length === 0) {
    setDataStatus("No stopped Daily AI runs to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-daily-ai-stopped-history-${stamp}.json`, JSON.stringify({ exportedAt, runs: stoppedRuns }, null, 2), "application/json;charset=utf-8");
  setDataStatus(`Exported ${stoppedRuns.length} stopped Daily AI run${stoppedRuns.length === 1 ? "" : "s"} as JSON.`);
}

function exportStoppedDailyRunHistoryCsv() {
  const stoppedRuns = getStoppedDailyRunHistory();
  if (stoppedRuns.length === 0) {
    setDataStatus("No stopped Daily AI runs to export.", "error");
    return;
  }

  const headers = ["startedAt", "finishedAt", "status", "source", "model", "limit", "generatedCount", "fetchedCount", "addedCount", "existingFilledCount", "researched", "drafted", "skipped", "failed", "error", "companies"];
  const rows = stoppedRuns.map((snapshot) => headers.map((header) => (
    csvCell(header === "companies" ? snapshot.companies.join("; ") : snapshot[header])
  )).join(","));
  downloadFile("regent-growth-daily-ai-stopped-history.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${stoppedRuns.length} stopped Daily AI run${stoppedRuns.length === 1 ? "" : "s"} as CSV.`);
}

function exportDailyRunHistoryCsv() {
  const visibleHistory = getVisibleDailyRunHistory();
  if (visibleHistory.length === 0) {
    setDataStatus("No Daily AI run history to export.", "error");
    return;
  }

  const headers = ["startedAt", "finishedAt", "status", "source", "model", "limit", "generatedCount", "fetchedCount", "addedCount", "existingFilledCount", "researched", "drafted", "skipped", "failed", "error", "companies"];
  const rows = visibleHistory.map((snapshot) => headers.map((header) => (
    csvCell(header === "companies" ? snapshot.companies.join("; ") : snapshot[header])
  )).join(","));
  downloadFile("regent-growth-daily-ai-history.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setDataStatus(`Exported ${visibleHistory.length} Daily AI run history snapshot${visibleHistory.length === 1 ? "" : "s"} as CSV.`);
}

function clearDailyRunHistory() {
  if (dailyRunHistory.length === 0) {
    setDataStatus("No Daily AI run history to clear.", "error");
    return;
  }

  const clearedCount = dailyRunHistory.length;
  dailyRunHistory = [];
  saveDailyRunHistory();
  renderDailyRunHistory();
  setDataStatus(`Cleared ${clearedCount} Daily AI run history snapshot${clearedCount === 1 ? "" : "s"}.`);
}

async function discoverCandidatesForDailyRun(criteria) {
  addDailyRunLog("Generating discovery candidates with local AI.");
  const rawDiscovery = await generateWithOllama(buildDiscoveryPrompt(criteria), 900);
  const candidates = parseDiscoveryCandidates(rawDiscovery);

  if (candidates.length === 0) {
    throw new Error("No usable discovery candidates returned.");
  }

  const knownKeys = new Set();
  prospects.forEach((prospect) => addDuplicateKeys(knownKeys, prospect));
  discoveryQueue.forEach((candidate) => addDuplicateKeys(knownKeys, discoveryCandidateToProspect(candidate)));

  const newCandidates = [];
  candidates.forEach((candidate) => {
    const prospect = discoveryCandidateToProspect(candidate);
    const isDuplicate = getDuplicateKeys(prospect).some((key) => knownKeys.has(key));
    if (isDuplicate) return;

    newCandidates.push(candidate);
    addDuplicateKeys(knownKeys, prospect);
  });

  discoveryQueue = [...newCandidates, ...discoveryQueue];
  saveDiscoveryQueue();
  renderDiscoveryQueue();
  addDailyRunLog(`Added ${newCandidates.length} new discovery candidate${newCandidates.length === 1 ? "" : "s"} to the queue.`, "done");
  return newCandidates.length;
}

async function fetchEvidenceForCandidate(candidate) {
  const url = toExternalUrl(candidate.website || "");
  if (!url) {
    throw new Error(`Add a valid website before fetching source evidence for ${candidate.company}.`);
  }

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
  return candidate;
}

async function autoFetchDailyRunEvidence(limit) {
  if (!shouldDailyRunAutoFetchEvidence()) return 0;

  const candidatesToFetch = discoveryQueue
    .filter((candidate) => candidate.sourceStatus !== "Rejected" && !isEvidenceReadyCandidate(candidate))
    .slice(0, limit);
  let fetchedCount = 0;

  for (const candidate of candidatesToFetch) {
    try {
      addDailyRunLog(`Fetching source evidence for ${candidate.company}.`);
      await fetchEvidenceForCandidate(candidate);
      fetchedCount += 1;
      addDailyRunLog(`Fetched source evidence for ${candidate.company}.`, "done");
    } catch (error) {
      candidate.sourceNotes = candidate.sourceNotes
        ? `${candidate.sourceNotes}\n\nSource auto-fetch failed: ${error.message}`
        : `Source auto-fetch failed: ${error.message}`;
      addDailyRunLog(`Source fetch skipped for ${candidate.company}: ${error.message}`, "error");
    }
  }

  if (candidatesToFetch.length > 0) {
    saveDiscoveryQueue();
    renderDiscoveryQueue();
  }

  return fetchedCount;
}

function addDailyRunProspects(limit) {
  const requireEvidence = shouldDailyRunRequireEvidence();
  const candidates = getDailyRunEligibleCandidates(requireEvidence);
  const knownKeys = new Set();
  const addedProspects = [];
  const promotedCandidates = [];
  let skippedDuplicates = 0;

  prospects.forEach((prospect) => addDuplicateKeys(knownKeys, prospect));

  candidates.forEach((candidate) => {
    if (addedProspects.length >= limit) return;

    const prospect = discoveryCandidateToProspect(candidate);
    const isDuplicate = getDuplicateKeys(prospect).some((key) => knownKeys.has(key));
    if (isDuplicate) {
      skippedDuplicates += 1;
      addDailyRunLog(`Skipped duplicate discovery candidate ${candidate.company}.`, "error");
      return;
    }

    prospects.unshift(prospect);
    addedProspects.push(prospect);
    promotedCandidates.push(candidate);
    addDuplicateKeys(knownKeys, prospect);
  });

  discoveryQueue = discoveryQueue.filter((candidate) => !promotedCandidates.includes(candidate));
  saveDiscoveryQueue();
  saveProspects();
  renderDiscoveryQueue();
  addDailyRunLog(`Moved ${addedProspects.length} candidate${addedProspects.length === 1 ? "" : "s"} into the prospect pipeline${skippedDuplicates ? ` and skipped ${skippedDuplicates} duplicate${skippedDuplicates === 1 ? "" : "s"}` : ""}.`, "done");
  return addedProspects;
}

function getExistingDailyRunProspects(limit) {
  return prospects
    .filter((prospect) => ["Research", "Email Drafted"].includes(prospect.stage))
    .filter((prospect) => !prospect.aiBrief || !prospect.aiEmail)
    .slice(0, limit);
}

function getDailyRunCapacity(limit = getDailyRunLimit()) {
  const existingCount = getExistingDailyRunProspects(limit).length;
  const remainingCapacity = Math.max(0, limit - existingCount);
  const eligibleCandidateCount = getDailyRunEligibleCandidates().length;
  return {
    limit,
    existingCount,
    remainingCapacity,
    eligibleCandidateCount,
    plannedCandidateCount: Math.min(remainingCapacity, eligibleCandidateCount)
  };
}

function getDailyRunReadiness() {
  const criteria = getDiscoveryCriteria();
  const capacity = getDailyRunCapacity();
  const hasExistingWork = capacity.existingCount > 0;
  const hasCriteria = Boolean(criteria.industries && criteria.signals);

  return {
    ready: hasExistingWork || hasCriteria,
    reason: hasExistingWork || hasCriteria
      ? ""
      : "Add target industries and qualification signals, or add an unfinished prospect."
  };
}

function renderDailyRunCapacitySummary() {
  const capacity = getDailyRunCapacity();
  const readiness = getDailyRunReadiness();
  const evidenceText = shouldDailyRunRequireEvidence() ? " Source evidence required." : "";
  dailyRunCapacitySummary.textContent = readiness.ready
    ? `Daily AI capacity: ${capacity.existingCount} existing unfinished, ${capacity.eligibleCandidateCount} eligible candidate${capacity.eligibleCandidateCount === 1 ? "" : "s"}, ${capacity.plannedCandidateCount} candidate promotion slot${capacity.plannedCandidateCount === 1 ? "" : "s"} for a ${capacity.limit}-prospect run.${evidenceText}`
    : `Daily AI not ready: ${readiness.reason}`;
  runDailyAiButton.disabled = dailyRunInProgress || !readiness.ready;
  stopDailyAiButton.disabled = !dailyRunInProgress || dailyRunStopRequested;
  renderDailyRunStats();
}

function requestDailyAiStop() {
  if (!dailyRunInProgress) return;

  dailyRunStopRequested = true;
  stopDailyAiButton.disabled = true;
  addDailyRunLog("Stop requested. Daily AI will stop after the current step finishes.", "error");
  setDataStatus("Daily AI stop requested. Waiting for the current local AI step to finish.", "working");
}

function renderDailyRunStats() {
  const limit = getDailyRunLimit();
  const stats = [
    { label: "Drafts ready", value: getDailyRunReviewItems().length },
    { label: "AI failures", value: getDailyAiFailedItems().length },
    { label: "Unfinished", value: getExistingDailyRunProspects(limit).length },
    { label: "Eligible candidates", value: getDailyRunEligibleCandidates().length }
  ];

  dailyRunStats.innerHTML = stats.map((stat) => `
    <article>
      <strong>${escapeHtml(stat.value)}</strong>
      <span>${escapeHtml(stat.label)}</span>
    </article>
  `).join("");
}

async function researchAndDraftDailyProspects(prospectsToProcess) {
  const results = {
    researched: 0,
    drafted: 0,
    skipped: 0,
    failed: 0
  };

  for (const prospect of prospectsToProcess) {
    if (dailyRunStopRequested) {
      addDailyRunLog("Daily AI stop requested. Stopping before the next prospect.", "error");
      break;
    }

    try {
      if (prospect.aiBrief && prospect.aiEmail) {
        results.skipped += 1;
        addDailyRunLog(`Skipped ${prospect.company}: brief and email draft already exist.`, "done");
        continue;
      }

      selectedProspectIndex = prospects.indexOf(prospect);

      if (!prospect.aiBrief) {
        setDataStatus(`Daily AI researching ${prospect.company}...`, "working");
        addDailyRunLog(`Researching ${prospect.company}.`);

        const rawResearch = await generateWithOllama(buildResearchAgentPrompt(prospect), 420);
        const research = parseJsonFromText(rawResearch);
        applyResearchToProspect(prospect, research);
        results.researched += 1;
      }

      if (!prospect.aiEmail) {
        setDataStatus(`Daily AI drafting outreach for ${prospect.company}...`, "working");
        addDailyRunLog(`Drafting email for ${prospect.company}.`);
        prospect.aiEmail = await generateWithOllama(renderTemplate(promptTemplates.email, prospect), 180);
        prospect.stage = "Email Drafted";
        results.drafted += 1;
      }

      saveProspects();
      renderProspects();
      addDailyRunLog(`Finished ${prospect.company}: ${prospect.aiBrief ? "brief ready" : "brief missing"} and ${prospect.aiEmail ? "email draft ready" : "email draft missing"}.`, "done");
    } catch (error) {
      results.failed += 1;
      prospect.responseNotes = [prospect.responseNotes, `${new Date().toISOString()}: Daily AI failed: ${error.message}`].filter(Boolean).join("\n");
      saveProspects();
      renderProspects();
      addDailyRunLog(`Failed ${prospect.company}: ${error.message}`, "error");
    }
  }

  return results;
}

async function runDailyAiWorkflow() {
  const criteria = getDiscoveryCriteria();
  const limit = getDailyRunLimit();
  const readiness = getDailyRunReadiness();
  const hasDiscoveryCriteria = Boolean(criteria.industries && criteria.signals);
  const runSnapshot = {
    id: createId(),
    startedAt: new Date().toISOString(),
    finishedAt: "",
    status: "Running",
    model: modelSelect.value,
    limit,
    generatedCount: 0,
    fetchedCount: 0,
    addedCount: 0,
    existingFilledCount: 0,
    researched: 0,
    drafted: 0,
    skipped: 0,
    failed: 0,
    error: "",
    companies: []
  };

  if (!readiness.ready) {
    setDataStatus(readiness.reason, "error");
    return;
  }

  dailyRunInProgress = true;
  dailyRunStopRequested = false;
  runDailyAiButton.disabled = true;
  stopDailyAiButton.disabled = false;
  generateDiscoveryButton.disabled = true;
  researchAccountButton.disabled = true;
  generateEmailButton.disabled = true;

  try {
    resetDailyRunLog();
    addDailyRunLog(`Starting Daily AI run for up to ${limit} prospect${limit === 1 ? "" : "s"}.`);
    await preflightDailyAiModel();
    let generatedCount = 0;

    if (hasDiscoveryCriteria && getDailyRunEligibleCandidates().length < limit) {
      setDataStatus("Daily AI generating discovery candidates...", "working");
      generatedCount = await discoverCandidatesForDailyRun({ ...criteria, count: Math.max(criteria.count, limit) });
      runSnapshot.generatedCount = generatedCount;
    }

    const fetchedCount = await autoFetchDailyRunEvidence(limit);
    runSnapshot.fetchedCount = fetchedCount;
    const existingProspects = getExistingDailyRunProspects(limit);
    runSnapshot.existingFilledCount = existingProspects.length;
    if (existingProspects.length > 0) {
      addDailyRunLog(`Found ${existingProspects.length} existing unfinished prospect${existingProspects.length === 1 ? "" : "s"} to process first.`, "done");
    }

    const remainingCapacity = Math.max(0, limit - existingProspects.length);
    const addedProspects = remainingCapacity > 0 ? addDailyRunProspects(remainingCapacity) : [];
    runSnapshot.addedCount = addedProspects.length;
    const prospectsToProcess = [...existingProspects, ...addedProspects];
    runSnapshot.companies = prospectsToProcess.map((prospect) => prospect.company).filter(Boolean);

    if (prospectsToProcess.length === 0) {
      throw new Error(shouldDailyRunRequireEvidence()
        ? "No discovery candidates with source evidence were available. Fetch or save evidence first, or turn off Require source evidence."
        : "No unfinished prospects or discovery candidates were available for Daily AI.");
    }

    const results = await researchAndDraftDailyProspects(prospectsToProcess);
    runSnapshot.researched = results.researched;
    runSnapshot.drafted = results.drafted;
    runSnapshot.skipped = results.skipped;
    runSnapshot.failed = results.failed;
    runSnapshot.status = dailyRunStopRequested ? "Stopped" : (results.failed ? "Completed with failures" : "Completed");
    saveProspects();
    renderProspects();
    const completionLabel = dailyRunStopRequested ? "Daily AI run stopped" : "Daily AI run complete";
    setDataStatus(`${completionLabel}: ${generatedCount} candidates generated, ${fetchedCount} sources fetched, ${addedProspects.length} prospects added, ${existingProspects.length} existing filled, ${results.researched} researched, ${results.drafted} emails drafted, ${results.skipped} skipped, ${results.failed} failed.`);
    addDailyRunLog(`${dailyRunStopRequested ? "Stopped" : "Complete"}: ${generatedCount} generated, ${fetchedCount} sources fetched, ${addedProspects.length} added, ${existingProspects.length} existing filled, ${results.researched} researched, ${results.drafted} drafted, ${results.skipped} skipped, ${results.failed} failed.`, results.failed || dailyRunStopRequested ? "error" : "done");
    recordDailyRunHistory(runSnapshot);
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Daily AI timed out. Lower the daily run limit or use qwen2.5:0.5b for a faster pass."
      : `Daily AI error: ${error.message || "make sure Ollama is running and returning usable JSON."}`;
    runSnapshot.status = "Failed";
    runSnapshot.error = message;
    setAiStatus(message, "error");
    setDataStatus(message, "error");
    addDailyRunLog(message, "error");
    recordDailyRunHistory(runSnapshot);
  } finally {
    dailyRunInProgress = false;
    dailyRunStopRequested = false;
    renderDailyRunCapacitySummary();
    generateDiscoveryButton.disabled = false;
    researchAccountButton.disabled = false;
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

function getEmailProviderLabel(provider) {
  const labels = {
    gmail: "Gmail",
    outlook: "Outlook",
    mailto: "Mail app"
  };

  return labels[provider] || "Email";
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getEmailSendReadiness(prospect = getSelectedProspect()) {
  const draft = emailDraft.value.trim();
  const { subject, body } = getDraftParts(draft);
  const recipient = prospect ? getEmailRecipient(prospect).trim() : "";
  const issues = [];

  if (!prospect) issues.push("Select a prospect.");
  if (!recipient) issues.push("Add a contact email.");
  if (recipient && !isValidEmailAddress(recipient)) issues.push("Fix the contact email format.");
  if (!draft) issues.push("Write or generate an email draft.");
  if (!subject) issues.push("Add a subject line.");
  if (!body) issues.push("Add an email body.");

  return {
    ready: issues.length === 0,
    issues,
    recipient,
    subject,
    body
  };
}

function renderEmailSendStatus(prospect = getSelectedProspect()) {
  const readiness = getEmailSendReadiness(prospect);

  emailSendSummary.dataset.state = readiness.ready ? "ready" : "warning";
  emailSendSummary.innerHTML = readiness.ready
    ? `
      <strong>Ready to send</strong>
      <p>To ${escapeHtml(readiness.recipient)} | Subject: ${escapeHtml(readiness.subject)}</p>
    `
    : `
      <strong>Sending needs setup</strong>
      <p>${escapeHtml(readiness.issues.join(" "))}</p>
    `;
}

function saveCurrentEmailDraft() {
  const prospect = getSelectedProspect();
  if (!prospect) return null;

  prospect.aiEmail = emailDraft.value.trim();
  saveProspects();
  renderSelectedDetail();
  renderEmailSendStatus(prospect);
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
  const readiness = getEmailSendReadiness(prospect);

  if (!readiness.ready) {
    renderEmailSendStatus(prospect);
    setDataStatus(`Cannot open ${getEmailProviderLabel(provider)} yet: ${readiness.issues.join(" ")}`, "error");
    return;
  }

  window.open(buildEmailHandoffUrl(provider, prospect), "_blank", "noopener,noreferrer");
  setDataStatus(`${getEmailProviderLabel(provider)} compose opened for ${prospect.company}. Review and send there, then mark sent here.`);
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
  const readiness = getEmailSendReadiness(prospect);

  if (!readiness.ready) {
    renderEmailSendStatus(prospect);
    setDataStatus(`Cannot mark sent yet: ${readiness.issues.join(" ")}`, "error");
    return;
  }

  prospect.lastTouch = getTodayString();
  prospect.nextTouch = addDays(prospect.lastTouch, 2);
  prospect.responseStatus = prospect.responseStatus === "Not Contacted" ? "Contacted" : prospect.responseStatus;
  prospect.stage = stageOrder.indexOf(prospect.stage) < stageOrder.indexOf("Sequence") ? "Sequence" : prospect.stage;
  prospect.responseNotes = [prospect.responseNotes, `${new Date().toISOString()}: Email marked sent to ${readiness.recipient} with subject "${readiness.subject}".`].filter(Boolean).join("\n");
  saveProspects();
  renderProspects();
  setDataStatus(`${prospect.company} marked contacted. Next touch scheduled for ${formatDate(prospect.nextTouch)}.`);
}

function getWarmLeads() {
  return prospects.filter(isWarmLead);
}

function getFailedCrmSyncLeads() {
  return getWarmLeads().filter((prospect) => prospect.crmSyncStatus === "Sync Failed");
}

function getReviewedCrmSyncLeads() {
  return getWarmLeads().filter((prospect) => prospect.crmSyncStatus === "Retry Reviewed");
}

function getCrmRecord(prospect) {
  const leadSummary = getLeadScoreSummary(prospect);
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
    leadScore: leadSummary.score,
    leadTier: leadSummary.tier,
    leadScoreReasons: leadSummary.reasons.join("; "),
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
    crmReviewedReason: prospect.crmReviewedReason,
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
    `Lead score: ${record.leadScore} (${record.leadTier})`,
    `Lead score signals: ${record.leadScoreReasons || "Needs more qualification signals."}`,
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

function getCrmFieldGroups(record) {
  return [
    {
      label: "Company",
      fields: ["company", "website", "industry", "companySize", "decisionMaker", "email", "linkedIn", "phone"]
    },
    {
      label: "Pipeline",
      fields: ["stage", "responseStatus", "fitScore", "leadScore", "leadTier", "leadScoreReasons", "buyingTrigger", "fitReason"]
    },
    {
      label: "Meeting and Handoff",
      fields: ["bookingLink", "meetingDate", "meetingOutcome", "assessmentNotes", "handoffOwner", "handoffStatus", "handoffDue", "handoffNotes"]
    },
    {
      label: "Sync and Activity",
      fields: ["crmSyncStatus", "crmSyncedAt", "crmSyncNotes", "teamSyncNotes", "lastTouch", "nextTouch", "linkedInStatus", "callStatus", "notes"]
    },
    {
      label: "AI Attachments",
      fields: ["aiBrief", "aiEmail"]
    }
  ].map((group) => ({
    ...group,
    fields: group.fields.map((field) => ({ field, value: record[field] ?? "" }))
  }));
}

function renderCrmFieldMappingPreview(prospect) {
  if (!prospect) {
    crmFieldPreview.innerHTML = `<p class="empty-state">Select a prospect to preview the CRM sync field mapping.</p>`;
    copyCrmMappingButton.disabled = true;
    return;
  }

  const record = getCrmRecord(prospect);
  const groups = getCrmFieldGroups(record);
  const warmLeadWarning = isWarmLead(prospect)
    ? ""
    : `<p class="crm-preview-warning">This account is not a warm lead yet. Mark it CRM ready before syncing.</p>`;

  copyCrmMappingButton.disabled = false;
  crmFieldPreview.innerHTML = `
    <div class="crm-preview-heading">
      <div>
        <p class="eyebrow">CRM Sync Preview</p>
        <h3>${escapeHtml(record.company || "Selected account")}</h3>
      </div>
      <span>${escapeHtml(Object.keys(record).length)} fields</span>
    </div>
    ${warmLeadWarning}
    <div class="crm-field-groups">
      ${groups.map((group) => `
        <section>
          <h4>${escapeHtml(group.label)}</h4>
          ${group.fields.map(({ field, value }) => `
            <div class="crm-field-row">
              <code>${escapeHtml(field)}</code>
              <span>${escapeHtml(formatCrmPreviewValue(value))}</span>
            </div>
          `).join("")}
        </section>
      `).join("")}
    </div>
  `;
}

function formatCrmPreviewValue(value) {
  if (value === undefined || value === null || value === "") return "Not set";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function renderHandoff() {
  const warmLeads = getWarmLeads();
  const selectedProspect = getSelectedProspect();
  const selectedIsWarm = selectedProspect ? isWarmLead(selectedProspect) : false;
  const failedCrmLeads = getFailedCrmSyncLeads();
  handoffSummary.textContent = `${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} ready for CRM export.${selectedIsWarm ? ` Selected: ${selectedProspect.company}.` : " Select or mark a warm lead to build its packet."}`;
  requeueSelectedReviewedCrmButton.disabled = !(selectedProspect?.crmSyncStatus === "Retry Reviewed" && selectedIsWarm);
  handoffPacket.value = formatHandoffPacket(selectedProspect);
  renderCrmFieldMappingPreview(selectedProspect);
  renderCrmRetryQueue(failedCrmLeads);
  handoffOwnerInput.value = selectedProspect?.handoffOwner || "";
  handoffStatusInput.value = selectedProspect?.handoffStatus || "Unassigned";
  handoffDueInput.value = selectedProspect?.handoffDue || "";
  handoffNotesInput.value = selectedProspect?.handoffNotes || "";
  handoffForm.hidden = !selectedProspect;
}

function renderCrmRetryQueue(failedCrmLeads = getFailedCrmSyncLeads()) {
  const reviewedCrmLeads = getReviewedCrmSyncLeads();
  const filteredFailedCrmLeads = filterCrmLeadsByReason(failedCrmLeads);
  const failedPage = getBoundedPage(crmFailedQueuePage, filteredFailedCrmLeads.length);
  const failedStart = failedPage * crmQueuePageSize;
  const failedPageLeads = filteredFailedCrmLeads.slice(failedStart, failedStart + crmQueuePageSize);
  crmFailedQueuePage = failedPage;
  retryFailedCrmButton.disabled = filteredFailedCrmLeads.length === 0;
  markReviewedCrmButton.disabled = filteredFailedCrmLeads.length === 0;
  requeueReviewedCrmButton.disabled = reviewedCrmLeads.length === 0;
  exportFailedCrmButton.disabled = failedCrmLeads.length === 0;
  exportFailedCrmCsvButton.disabled = failedCrmLeads.length === 0;
  exportReviewedCrmButton.disabled = reviewedCrmLeads.length === 0;
  exportReviewedCrmCsvButton.disabled = reviewedCrmLeads.length === 0;
  const syncedCount = prospects.filter((prospect) => prospect.crmSyncStatus === "Synced").length;
  const syncingCount = prospects.filter((prospect) => prospect.crmSyncStatus === "Syncing").length;
  const reviewedCount = reviewedCrmLeads.length;
  const notSyncedCount = prospects.filter((prospect) => !prospect.crmSyncStatus || prospect.crmSyncStatus === "Not Synced").length;

  if (failedCrmLeads.length === 0) {
    crmRetryQueue.innerHTML = `
      <div class="crm-retry-heading">
        <div>
          <p class="eyebrow">CRM Retry Queue</p>
          <h3>No failed syncs</h3>
        </div>
        ${renderCrmSyncStatusChips(failedCrmLeads.length, syncingCount, syncedCount, reviewedCount, notSyncedCount)}
        ${renderCrmFailureReasonChips(failedCrmLeads)}
      </div>
      <p class="empty-state">No failed CRM syncs queued for retry.</p>
      ${renderReviewedCrmQueue(reviewedCrmLeads)}
    `;
    return;
  }

  crmRetryQueue.innerHTML = `
    <div class="crm-retry-heading">
      <div>
        <p class="eyebrow">CRM Retry Queue</p>
          <h3>${escapeHtml(filteredFailedCrmLeads.length)} of ${escapeHtml(failedCrmLeads.length)} failed sync${failedCrmLeads.length === 1 ? "" : "s"}</h3>
      </div>
      <div class="crm-retry-actions">
        ${renderCrmSyncStatusChips(failedCrmLeads.length, syncingCount, syncedCount, reviewedCount, notSyncedCount)}
        ${renderCrmFailureReasonChips(failedCrmLeads)}
        <button class="secondary-button" type="button" data-action="show-crm-failed">Show failed</button>
      </div>
    </div>
    ${failedPageLeads.length === 0 ? `<p class="empty-state">No failed CRM syncs match this reason filter.</p>` : `
      <div class="crm-retry-list">
        ${failedPageLeads.map((prospect) => {
        const index = prospects.indexOf(prospect);
        return `
        <article>
          <div>
            <strong>${escapeHtml(prospect.company)}</strong>
            <p>${previewText(getLatestCrmSyncNote(prospect), "No failure note recorded.")}</p>
          </div>
          <div class="crm-retry-item-actions">
            <button class="secondary-button" type="button" data-action="open-crm-failed" data-index="${escapeHtml(index)}">Open</button>
            <button class="secondary-button" type="button" data-action="retry-crm-one" data-index="${escapeHtml(index)}">Retry</button>
          </div>
        </article>
        `;
        }).join("")}
      </div>
      ${renderCrmQueuePagination("failed", filteredFailedCrmLeads.length, failedPage)}
    `}
    ${renderReviewedCrmQueue(reviewedCrmLeads)}
  `;
}

function renderReviewedCrmQueue(reviewedCrmLeads) {
  if (reviewedCrmLeads.length === 0) return "";
  const reviewedPage = getBoundedPage(crmReviewedQueuePage, reviewedCrmLeads.length);
  const reviewedStart = reviewedPage * crmQueuePageSize;
  const reviewedPageLeads = reviewedCrmLeads.slice(reviewedStart, reviewedStart + crmQueuePageSize);
  crmReviewedQueuePage = reviewedPage;

  return `
    <div class="crm-reviewed-queue">
      <div class="crm-retry-heading">
        <div>
          <p class="eyebrow">Reviewed CRM Syncs</p>
          <h3>${escapeHtml(reviewedCrmLeads.length)} reviewed sync${reviewedCrmLeads.length === 1 ? "" : "s"}</h3>
        </div>
        <button class="secondary-button" type="button" data-action="show-crm-reviewed">Show reviewed</button>
      </div>
      <div class="crm-retry-list">
        ${reviewedPageLeads.map((prospect) => {
          const index = prospects.indexOf(prospect);
          return `
          <article>
            <div>
              <strong>${escapeHtml(prospect.company)}</strong>
              <p>${previewText(formatReviewedCrmSyncNote(prospect), "No review note recorded.")}</p>
            </div>
            <div class="crm-retry-item-actions">
              <button class="secondary-button" type="button" data-action="open-crm-reviewed" data-index="${escapeHtml(index)}">Open</button>
              <button class="secondary-button" type="button" data-action="requeue-crm-reviewed-one" data-index="${escapeHtml(index)}">Requeue</button>
            </div>
          </article>
          `;
        }).join("")}
      </div>
      ${renderCrmQueuePagination("reviewed", reviewedCrmLeads.length, reviewedPage)}
    </div>
  `;
}

const crmQueuePageSize = 5;

function getBoundedPage(page, totalItems) {
  const maxPage = Math.max(0, Math.ceil(totalItems / crmQueuePageSize) - 1);
  return Math.min(Math.max(page, 0), maxPage);
}

function renderCrmQueuePagination(queue, totalItems, page) {
  const totalPages = Math.ceil(totalItems / crmQueuePageSize);
  if (totalPages <= 1) return "";

  return `
    <div class="crm-queue-pagination">
      <button class="secondary-button" type="button" data-action="crm-page" data-queue="${escapeHtml(queue)}" data-direction="-1" ${page === 0 ? "disabled" : ""}>Previous</button>
      <span>Page ${escapeHtml(page + 1)} of ${escapeHtml(totalPages)}</span>
      <button class="secondary-button" type="button" data-action="crm-page" data-queue="${escapeHtml(queue)}" data-direction="1" ${page >= totalPages - 1 ? "disabled" : ""}>Next</button>
    </div>
  `;
}

function changeCrmQueuePage(queue, direction) {
  const delta = Number(direction);
  if (!Number.isFinite(delta)) return;

  if (queue === "failed") {
    crmFailedQueuePage = getBoundedPage(crmFailedQueuePage + delta, getFailedCrmSyncLeads().length);
  }

  if (queue === "reviewed") {
    crmReviewedQueuePage = getBoundedPage(crmReviewedQueuePage + delta, getReviewedCrmSyncLeads().length);
  }

  renderProspects();
}

function resetCrmQueuePages(queue = "all") {
  if (queue === "all" || queue === "failed") {
    crmFailedQueuePage = 0;
  }

  if (queue === "all" || queue === "reviewed") {
    crmReviewedQueuePage = 0;
  }
}

function renderCrmSyncStatusChips(failedCount, syncingCount, syncedCount, reviewedCount, notSyncedCount) {
  const chips = [
    { label: `${failedCount} failed`, state: "failed" },
    { label: `${syncingCount} syncing`, state: "syncing" },
    { label: `${syncedCount} synced`, state: "synced" },
    { label: `${reviewedCount} reviewed`, state: "reviewed" },
    { label: `${notSyncedCount} not synced`, state: "idle" }
  ];

  return `<div class="crm-sync-chips">${chips.map((chip) => `<span data-state="${escapeHtml(chip.state)}">${escapeHtml(chip.label)}</span>`).join("")}</div>`;
}

function getCrmFailureReasonGroup(note = "") {
  const text = String(note).toLowerCase();

  if (/(401|403|unauthorized|forbidden|auth|api key|token)/.test(text)) return "Auth";
  if (/(400|422|validation|required|invalid|field|schema)/.test(text)) return "Validation";
  if (/(429|rate limit|too many requests|quota)/.test(text)) return "Rate Limit";
  if (/(timeout|timed out|abort)/.test(text)) return "Timeout";
  if (/(network|fetch failed|connection|dns|econn|socket)/.test(text)) return "Network";
  if (/(404|endpoint|url|not found|configured)/.test(text)) return "Endpoint";
  return "Other";
}

function getReviewedCrmReason(prospect) {
  return prospect.crmReviewedReason || getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect));
}

function formatReviewedCrmSyncNote(prospect) {
  const reason = getReviewedCrmReason(prospect);
  const note = getLatestCrmSyncNote(prospect);
  return `${reason}: ${note || "No review note recorded."}`;
}

function getCrmFailureReasonCounts(failedCrmLeads = getFailedCrmSyncLeads()) {
  return failedCrmLeads.reduce((counts, prospect) => {
    const group = getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect));
    counts[group] = (counts[group] || 0) + 1;
    return counts;
  }, {});
}

function renderCrmFailureReasonChips(failedCrmLeads) {
  const counts = getCrmFailureReasonCounts(failedCrmLeads);
  const groups = Object.entries(counts).sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]));
  if (groups.length === 0) return "";

  const allButton = `<button type="button" data-action="set-crm-reason-filter" data-reason="all" data-active="${crmFailureReasonFilter === "all"}">All: ${escapeHtml(failedCrmLeads.length)}</button>`;
  const groupButtons = groups.map(([group, count]) => (
    `<button type="button" data-action="set-crm-reason-filter" data-reason="${escapeHtml(group)}" data-active="${crmFailureReasonFilter === group}">${escapeHtml(group)}: ${escapeHtml(count)}</button>`
  )).join("");
  return `<div class="crm-reason-chips">${allButton}${groupButtons}</div>`;
}

function filterCrmLeadsByReason(failedCrmLeads) {
  if (crmFailureReasonFilter === "all") return failedCrmLeads;
  return failedCrmLeads.filter((prospect) => getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect)) === crmFailureReasonFilter);
}

function setCrmFailureReasonFilter(reason) {
  const counts = getCrmFailureReasonCounts();
  crmFailureReasonFilter = reason === "all" || counts[reason] ? reason : "all";
  resetCrmQueuePages("failed");
  renderProspects();
}

function getLatestCrmSyncNote(prospect) {
  return prospect.crmSyncNotes?.split("\n").find((note) => note.trim()) || "";
}

function appendCrmSyncNote(prospect, note, limit = 8) {
  const notes = [note, ...(prospect.crmSyncNotes || "").split("\n")]
    .map((item) => item.trim())
    .filter(Boolean);
  const uniqueNotes = [];
  const seen = new Set();

  notes.forEach((item) => {
    if (seen.has(item)) return;
    seen.add(item);
    uniqueNotes.push(item);
  });

  prospect.crmSyncNotes = uniqueNotes.slice(0, limit).join("\n");
}

function cleanCrmSyncNotes() {
  let updatedCount = 0;

  prospects.forEach((prospect) => {
    const before = prospect.crmSyncNotes || "";
    appendCrmSyncNote(prospect, "", 5);

    if ((prospect.crmSyncNotes || "") !== before) {
      updatedCount += 1;
    }
  });

  saveProspects();
  renderProspects();
  setCrmSetupStatus(updatedCount > 0
    ? `Cleaned CRM sync notes for ${updatedCount} prospect${updatedCount === 1 ? "" : "s"}.`
    : "CRM sync notes are already clean.");
}

function clearResolvedCrmQueueState() {
  let clearedCount = 0;
  const clearedAt = new Date().toISOString();

  prospects.forEach((prospect) => {
    if (prospect.crmSyncStatus !== "Syncing") return;

    prospect.crmSyncStatus = "Not Synced";
    appendCrmSyncNote(prospect, `${clearedAt}: Cleared stale CRM syncing state.`);
    clearedCount += 1;
  });

  saveProspects();
  renderProspects();
  setCrmSetupStatus(clearedCount > 0
    ? `Cleared ${clearedCount} stale CRM syncing record${clearedCount === 1 ? "" : "s"}.`
    : "No stale CRM syncing records to clear.");
}

function markFailedCrmSyncsReviewed() {
  const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());
  const filterLabel = crmFailureReasonFilter === "all" ? "" : ` (${crmFailureReasonFilter})`;

  if (failedCrmLeads.length === 0) {
    setCrmSetupStatus(crmFailureReasonFilter === "all"
      ? "No failed CRM syncs to mark reviewed."
      : `No ${crmFailureReasonFilter} CRM sync failures to mark reviewed.`);
    return;
  }

  const reviewedAt = new Date().toISOString();

  failedCrmLeads.forEach((prospect) => {
    const reason = getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect));
    prospect.crmSyncStatus = "Retry Reviewed";
    prospect.crmReviewedReason = reason;
    appendCrmSyncNote(prospect, `${reviewedAt}: CRM retry failure reviewed as ${reason}; no automatic retry queued.`);
  });

  resetCrmQueuePages("all");
  saveProspects();
  renderProspects();
  setCrmSetupStatus(`Marked ${failedCrmLeads.length}${filterLabel} failed CRM sync${failedCrmLeads.length === 1 ? "" : "s"} reviewed.`);
  setDataStatus("Reviewed CRM failures are preserved in the CRM Reviewed view.");
}

function requeueReviewedCrmSyncs() {
  const reviewedCrmLeads = getReviewedCrmSyncLeads();

  if (reviewedCrmLeads.length === 0) {
    setCrmSetupStatus("No reviewed CRM syncs to requeue.");
    return;
  }

  const requeuedAt = new Date().toISOString();

  reviewedCrmLeads.forEach((prospect) => {
    prospect.crmSyncStatus = "Sync Failed";
    prospect.crmReviewedReason = "";
    appendCrmSyncNote(prospect, `${requeuedAt}: Reviewed CRM retry requeued for automatic retry.`);
  });

  resetCrmQueuePages("all");
  saveProspects();
  renderProspects();
  setCrmSetupStatus(`Requeued ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? "" : "s"}.`);
  setDataStatus("Reviewed CRM syncs moved back to the failed retry queue.");
}

function requeueSelectedReviewedCrmSync() {
  const prospect = getSelectedProspect();

  if (!prospect) {
    setCrmSetupStatus("Select a reviewed CRM sync before requeueing one record.", "error");
    return;
  }

  if (prospect.crmSyncStatus !== "Retry Reviewed") {
    setCrmSetupStatus(`${prospect.company} is not marked CRM reviewed.`, "error");
    return;
  }

  if (!isWarmLead(prospect)) {
    setCrmSetupStatus(`${prospect.company} is not warm/CRM-ready. Mark it CRM ready before requeueing.`, "error");
    return;
  }

  prospect.crmSyncStatus = "Sync Failed";
  prospect.crmReviewedReason = "";
  appendCrmSyncNote(prospect, `${new Date().toISOString()}: Selected reviewed CRM retry requeued.`);
  resetCrmQueuePages("all");
  saveProspects();
  renderProspects();
  setCrmSetupStatus(`${prospect.company} moved back to the CRM retry queue.`);
  setDataStatus(`${prospect.company} is ready for CRM retry.`);
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

  const headers = ["company", "website", "industry", "companySize", "decisionMaker", "email", "linkedIn", "phone", "stage", "responseStatus", "fitScore", "leadScore", "leadTier", "leadScoreReasons", "buyingTrigger", "fitReason", "bookingLink", "meetingDate", "meetingOutcome", "assessmentNotes", "handoffOwner", "handoffStatus", "handoffDue", "handoffNotes", "crmSyncStatus", "crmSyncedAt", "crmSyncNotes", "teamSyncNotes", "lastTouch", "nextTouch", "linkedInStatus", "callStatus", "notes"];
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

function exportFailedCrmSyncs() {
  const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());
  const filterSuffix = getCrmFailureReasonFileSuffix();

  if (failedCrmLeads.length === 0) {
    setCrmSetupStatus(crmFailureReasonFilter === "all"
      ? "No failed CRM syncs to export."
      : `No ${crmFailureReasonFilter} CRM sync failures to export.`,
    "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    source: "regent-growth-crm-retry-queue",
    exportedAt,
    failureReasonFilter: crmFailureReasonFilter,
    failedCount: failedCrmLeads.length,
    records: failedCrmLeads.map((prospect) => ({
      ...getCrmRecord(prospect),
      failureReasonGroup: getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect)),
      latestCrmSyncNote: getLatestCrmSyncNote(prospect)
    }))
  };
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-crm-failed-syncs${filterSuffix}-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  setCrmSetupStatus(`Exported ${failedCrmLeads.length}${crmFailureReasonFilter === "all" ? "" : ` ${crmFailureReasonFilter}`} failed CRM sync${failedCrmLeads.length === 1 ? "" : "s"}.`);
}

function exportFailedCrmSyncCsv() {
  const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());
  const filterSuffix = getCrmFailureReasonFileSuffix();

  if (failedCrmLeads.length === 0) {
    setCrmSetupStatus(crmFailureReasonFilter === "all"
      ? "No failed CRM syncs to export."
      : `No ${crmFailureReasonFilter} CRM sync failures to export.`,
    "error");
    return;
  }

  const headers = ["company", "email", "stage", "responseStatus", "leadScore", "leadTier", "crmSyncStatus", "crmSyncedAt", "failureReasonGroup", "latestCrmSyncNote", "handoffOwner", "handoffStatus", "nextTouch"];
  const rows = failedCrmLeads.map((prospect) => {
    const record = getCrmRecord(prospect);
    const exportRecord = {
      ...record,
      failureReasonGroup: getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect)),
      latestCrmSyncNote: getLatestCrmSyncNote(prospect)
    };
    return headers.map((header) => csvCell(exportRecord[header])).join(",");
  });
  downloadFile(`regent-growth-crm-failed-syncs${filterSuffix}.csv`, [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setCrmSetupStatus(`Exported ${failedCrmLeads.length}${crmFailureReasonFilter === "all" ? "" : ` ${crmFailureReasonFilter}`} failed CRM sync${failedCrmLeads.length === 1 ? "" : "s"} as CSV.`);
}

function getCrmFailureReasonFileSuffix() {
  if (crmFailureReasonFilter === "all") return "";
  return `-${crmFailureReasonFilter.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function exportReviewedCrmSyncs() {
  const reviewedCrmLeads = getReviewedCrmSyncLeads();

  if (reviewedCrmLeads.length === 0) {
    setCrmSetupStatus("No reviewed CRM syncs to export.", "error");
    return;
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    source: "regent-growth-crm-reviewed-queue",
    exportedAt,
    reviewedCount: reviewedCrmLeads.length,
    records: reviewedCrmLeads.map((prospect) => ({
      ...getCrmRecord(prospect),
      failureReasonGroup: getReviewedCrmReason(prospect),
      latestCrmSyncNote: getLatestCrmSyncNote(prospect)
    }))
  };
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-crm-reviewed-syncs-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  setCrmSetupStatus(`Exported ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? "" : "s"}.`);
}

function exportReviewedCrmSyncCsv() {
  const reviewedCrmLeads = getReviewedCrmSyncLeads();

  if (reviewedCrmLeads.length === 0) {
    setCrmSetupStatus("No reviewed CRM syncs to export.", "error");
    return;
  }

  const headers = ["company", "email", "stage", "responseStatus", "leadScore", "leadTier", "crmSyncStatus", "crmSyncedAt", "failureReasonGroup", "latestCrmSyncNote", "handoffOwner", "handoffStatus", "nextTouch"];
  const rows = reviewedCrmLeads.map((prospect) => {
    const record = getCrmRecord(prospect);
    const exportRecord = {
      ...record,
      failureReasonGroup: getReviewedCrmReason(prospect),
      latestCrmSyncNote: getLatestCrmSyncNote(prospect)
    };
    return headers.map((header) => csvCell(exportRecord[header])).join(",");
  });
  downloadFile("regent-growth-crm-reviewed-syncs.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  setCrmSetupStatus(`Exported ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? "" : "s"} as CSV.`);
}

function formatCrmStatusSummary() {
  const failedCrmLeads = getFailedCrmSyncLeads();
  const reviewedCrmLeads = getReviewedCrmSyncLeads();
  const syncedCount = prospects.filter((prospect) => prospect.crmSyncStatus === "Synced").length;
  const syncingCount = prospects.filter((prospect) => prospect.crmSyncStatus === "Syncing").length;
  const notSyncedCount = prospects.filter((prospect) => !prospect.crmSyncStatus || prospect.crmSyncStatus === "Not Synced").length;
  const failedLines = failedCrmLeads.slice(0, 5).map((prospect) => `- ${prospect.company}: ${getLatestCrmSyncNote(prospect) || "No failure note recorded."}`);
  const reviewedLines = reviewedCrmLeads.slice(0, 5).map((prospect) => `- ${prospect.company}: ${formatReviewedCrmSyncNote(prospect)}`);

  return [
    "Regent Growth CRM Sync Summary",
    `Generated: ${new Date().toISOString()}`,
    `Failed: ${failedCrmLeads.length}`,
    `Reviewed: ${reviewedCrmLeads.length}`,
    `Syncing: ${syncingCount}`,
    `Synced: ${syncedCount}`,
    `Not Synced: ${notSyncedCount}`,
    `Failure Reasons: ${Object.entries(getCrmFailureReasonCounts(failedCrmLeads)).map(([group, count]) => `${group} ${count}`).join(", ") || "None"}`,
    "",
    "Failed queue:",
    failedLines.length ? failedLines.join("\n") : "- None",
    "",
    "Reviewed queue:",
    reviewedLines.length ? reviewedLines.join("\n") : "- None"
  ].join("\n");
}

async function copyCrmStatusSummary() {
  const summary = formatCrmStatusSummary();

  try {
    await navigator.clipboard.writeText(summary);
    setCrmSetupStatus("CRM sync summary copied.");
  } catch {
    setCrmSetupStatus(summary);
  }
}

function downloadCrmStatusSummary() {
  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadFile(`regent-growth-crm-summary-${stamp}.txt`, formatCrmStatusSummary(), "text/plain;charset=utf-8");
  setCrmSetupStatus("Downloaded CRM sync summary.");
}

function setCrmSetupStatus(message, state = "") {
  crmSetupStatus.textContent = message;
  crmSetupStatus.dataset.state = state;
}

const crmProviderPresets = {
  webhook: {
    label: "Webhook / Zapier / Make",
    description: "Use this for Zapier, Make, n8n, or any automation webhook that accepts JSON leads.",
    snippet: `$env:REGENT_CRM_API_URL="https://hooks.zapier.com/hooks/catch/your-hook"
$env:REGENT_CRM_API_KEY=""
& "C:\\Users\\ibrah\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" local-research-server.js`
  },
  hubspot: {
    label: "HubSpot private app",
    description: "Point this at a middleware endpoint that maps Regent Growth records into HubSpot contacts or companies.",
    snippet: `$env:REGENT_CRM_API_URL="https://your-middleware.example/hubspot/leads"
$env:REGENT_CRM_API_KEY="hubspot_private_app_token_or_middleware_key"
$env:REGENT_CRM_API_KEY_HEADER="Authorization"
& "C:\\Users\\ibrah\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" local-research-server.js`
  },
  pipedrive: {
    label: "Pipedrive API token",
    description: "Use a middleware endpoint that converts Regent Growth records into Pipedrive organizations, people, and deals.",
    snippet: `$env:REGENT_CRM_API_URL="https://your-middleware.example/pipedrive/leads"
$env:REGENT_CRM_API_KEY="pipedrive_api_token_or_middleware_key"
$env:REGENT_CRM_API_KEY_HEADER="X-API-Key"
& "C:\\Users\\ibrah\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" local-research-server.js`
  },
  airtable: {
    label: "Airtable automation",
    description: "Use an Airtable automation webhook or middleware that writes each lead into your base.",
    snippet: `$env:REGENT_CRM_API_URL="https://hooks.airtable.com/workflows/v1/genericWebhook/your-webhook"
$env:REGENT_CRM_API_KEY="optional_webhook_secret"
$env:REGENT_CRM_API_KEY_HEADER="X-API-Key"
& "C:\\Users\\ibrah\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" local-research-server.js`
  },
  custom: {
    label: "Custom CRM endpoint",
    description: "Use any internal endpoint that accepts the Regent Growth JSON payload from the local server.",
    snippet: `$env:REGENT_CRM_API_URL="https://your-crm-or-api.example/leads"
$env:REGENT_CRM_API_KEY="your_api_key"
$env:REGENT_CRM_API_KEY_HEADER="Authorization"
& "C:\\Users\\ibrah\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" local-research-server.js`
  }
};

function renderCrmProviderPreset() {
  const preset = crmProviderPresets[crmPresetSelect.value] || crmProviderPresets.webhook;
  crmPresetSnippet.textContent = preset.snippet;
  setCrmSetupStatus(`${preset.label}: ${preset.description}`);
}

async function checkCrmSetup() {
  setCrmSetupStatus("Checking CRM connector...", "working");

  try {
    const response = await fetch(crmStatusEndpoint);

    if (!response.ok) {
      throw new Error(`CRM setup check returned ${response.status}.`);
    }

    const status = await response.json();
    const ready = status.configured && status.valid !== false;
    setCrmSetupStatus(
      ready
        ? `CRM connector ready: ${status.endpoint}${status.keyConfigured ? " with API key" : " without API key"}.`
        : status.message || "CRM connector is not configured. Set REGENT_CRM_API_URL before starting the local server.",
      ready ? "" : "error"
    );
  } catch (error) {
    setCrmSetupStatus(isLocalFile()
      ? "CRM setup check needs the local research server. Run local-research-server.js and open the local URL."
      : error.message,
    "error");
  }
}

async function syncCrmRecords(records, prospectsToUpdate) {
  const startedAt = new Date().toISOString();
  prospectsToUpdate.forEach((prospect) => {
    prospect.crmSyncStatus = "Syncing";
    appendCrmSyncNote(prospect, `${startedAt}: Sync queued for CRM connector.`);
  });
  saveProspects();
  renderProspects();

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
  const acceptedCount = payload.acceptedCount ?? records.length;
  prospectsToUpdate.forEach((prospect) => {
    prospect.crmSyncStatus = "Synced";
    prospect.crmSyncedAt = syncedAt;
    appendCrmSyncNote(prospect, `${syncedAt}: Synced through local CRM connector (${acceptedCount} record${acceptedCount === 1 ? "" : "s"} accepted).`);
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
  syncWarmCrmButton.disabled = true;
  setCrmSetupStatus(`Syncing ${prospect.company} to CRM...`, "working");

  try {
    await syncCrmRecords([getCrmRecord(prospect)], [prospect]);
    setCrmSetupStatus(`${prospect.company} synced to CRM.`);
    setDataStatus(`${prospect.company} synced to CRM.`);
  } catch (error) {
    prospect.crmSyncStatus = "Sync Failed";
    appendCrmSyncNote(prospect, `${new Date().toISOString()}: ${error.message}`);
    saveProspects();
    renderProspects();
    setCrmSetupStatus(error.message, "error");
  } finally {
    syncSelectedCrmButton.disabled = false;
    syncWarmCrmButton.disabled = false;
  }
}

async function syncWarmCrmLeads() {
  const warmLeads = getWarmLeads();

  if (warmLeads.length === 0) {
    setCrmSetupStatus("No warm leads to sync yet.", "error");
    return;
  }

  syncWarmCrmButton.disabled = true;
  syncSelectedCrmButton.disabled = true;
  setCrmSetupStatus(`Syncing ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM...`, "working");

  try {
    await syncCrmRecords(warmLeads.map(getCrmRecord), warmLeads);
    setCrmSetupStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM.`);
    setDataStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"} to CRM.`);
  } catch (error) {
    const failedAt = new Date().toISOString();
    warmLeads.forEach((prospect) => {
      prospect.crmSyncStatus = "Sync Failed";
      appendCrmSyncNote(prospect, `${failedAt}: ${error.message}`);
    });
    saveProspects();
    renderProspects();
    setCrmSetupStatus(error.message, "error");
  } finally {
    syncWarmCrmButton.disabled = false;
    syncSelectedCrmButton.disabled = false;
  }
}

async function retryFailedCrmSyncs() {
  const allFailedCrmLeads = getFailedCrmSyncLeads();
  const failedCrmLeads = filterCrmLeadsByReason(allFailedCrmLeads);
  const filterLabel = crmFailureReasonFilter === "all" ? "" : ` (${crmFailureReasonFilter})`;

  if (failedCrmLeads.length === 0) {
    setCrmSetupStatus(crmFailureReasonFilter === "all"
      ? "No failed CRM syncs to retry."
      : `No ${crmFailureReasonFilter} CRM sync failures to retry.`,
    "error");
    return;
  }

  retryFailedCrmButton.disabled = true;
  syncWarmCrmButton.disabled = true;
  syncSelectedCrmButton.disabled = true;
  setCrmSetupStatus(`Retrying ${failedCrmLeads.length}${filterLabel} failed CRM sync${failedCrmLeads.length === 1 ? "" : "s"}...`, "working");

  try {
    await syncCrmRecords(failedCrmLeads.map(getCrmRecord), failedCrmLeads);
    setCrmSetupStatus(`Retried and synced ${failedCrmLeads.length}${filterLabel} failed CRM record${failedCrmLeads.length === 1 ? "" : "s"}.`);
    setDataStatus(`CRM retry queue cleared for ${failedCrmLeads.length}${filterLabel} warm lead${failedCrmLeads.length === 1 ? "" : "s"}.`);
  } catch (error) {
    const failedAt = new Date().toISOString();
    failedCrmLeads.forEach((prospect) => {
      prospect.crmSyncStatus = "Sync Failed";
      appendCrmSyncNote(prospect, `${failedAt}: Retry failed: ${error.message}`);
    });
    saveProspects();
    renderProspects();
    setCrmSetupStatus(`CRM retry failed: ${error.message}`, "error");
  } finally {
    retryFailedCrmButton.disabled = filterCrmLeadsByReason(getFailedCrmSyncLeads()).length === 0;
    syncWarmCrmButton.disabled = false;
    syncSelectedCrmButton.disabled = false;
  }
}

function showFailedCrmSyncs() {
  resetCrmQueuePages("failed");
  savedViews.dataset.activeView = "crm-failed";
  stageFilter.value = "all";
  responseFilter.value = "all";
  renderProspects();
  setDataStatus("Showing warm leads with failed CRM syncs.");
}

function openFailedCrmSync(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "crm-failed";
  stageFilter.value = "all";
  responseFilter.value = "all";
  renderProspects();
  setDataStatus(`Opened failed CRM sync for ${prospect.company}.`);
}

function showReviewedCrmSyncs() {
  resetCrmQueuePages("reviewed");
  savedViews.dataset.activeView = "crm-reviewed";
  stageFilter.value = "all";
  responseFilter.value = "all";
  renderProspects();
  setDataStatus("Showing warm leads with reviewed CRM sync failures.");
}

function openReviewedCrmSync(index) {
  const prospect = prospects[index];
  if (!prospect) return;

  selectedProspectIndex = index;
  savedViews.dataset.activeView = "crm-reviewed";
  stageFilter.value = "all";
  responseFilter.value = "all";
  renderProspects();
  setDataStatus(`Opened reviewed CRM sync for ${prospect.company}.`);
}

function requeueSingleReviewedCrmSync(index) {
  const prospect = prospects[index];

  if (!prospect || prospect.crmSyncStatus !== "Retry Reviewed") {
    setCrmSetupStatus("Select a reviewed CRM sync before requeueing one record.", "error");
    return;
  }

  if (!isWarmLead(prospect)) {
    setCrmSetupStatus(`${prospect.company} is not warm/CRM-ready. Mark it CRM ready before requeueing.`, "error");
    return;
  }

  prospect.crmSyncStatus = "Sync Failed";
  prospect.crmReviewedReason = "";
  appendCrmSyncNote(prospect, `${new Date().toISOString()}: Reviewed CRM retry requeued from the retry panel.`);
  resetCrmQueuePages("all");
  saveProspects();
  renderProspects();
  setCrmSetupStatus(`${prospect.company} moved back to the CRM retry queue.`);
  setDataStatus(`${prospect.company} is ready for CRM retry.`);
}

async function retrySingleFailedCrmSync(index) {
  const prospect = prospects[index];

  if (!prospect || prospect.crmSyncStatus !== "Sync Failed") {
    setCrmSetupStatus("Select a failed CRM sync before retrying one record.", "error");
    return;
  }

  if (!isWarmLead(prospect)) {
    setCrmSetupStatus(`${prospect.company} is not warm/CRM-ready. Mark it CRM ready before retrying.`, "error");
    return;
  }

  retryFailedCrmButton.disabled = true;
  syncWarmCrmButton.disabled = true;
  syncSelectedCrmButton.disabled = true;
  setCrmSetupStatus(`Retrying CRM sync for ${prospect.company}...`, "working");

  try {
    await syncCrmRecords([getCrmRecord(prospect)], [prospect]);
    setCrmSetupStatus(`${prospect.company} retried and synced to CRM.`);
    setDataStatus(`${prospect.company} removed from CRM retry queue.`);
  } catch (error) {
    prospect.crmSyncStatus = "Sync Failed";
    appendCrmSyncNote(prospect, `${new Date().toISOString()}: Single retry failed: ${error.message}`);
    saveProspects();
    renderProspects();
    setCrmSetupStatus(`CRM retry failed for ${prospect.company}: ${error.message}`, "error");
  } finally {
    retryFailedCrmButton.disabled = getFailedCrmSyncLeads().length === 0;
    syncWarmCrmButton.disabled = false;
    syncSelectedCrmButton.disabled = false;
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

async function copySelectedCrmMapping() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const mapping = JSON.stringify(getCrmRecord(prospect), null, 2);
  try {
    await navigator.clipboard.writeText(mapping);
    setDataStatus(`CRM JSON mapping copied for ${prospect.company}.`);
  } catch {
    handoffPacket.value = mapping;
    handoffPacket.select();
    setDataStatus(`CRM JSON mapping selected for ${prospect.company}.`);
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
    await fetchEvidenceForCandidate(candidate);
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
  const headers = ["company", "industry", "size", "website", "decisionMaker", "contactEmail", "contactLinkedIn", "contactPhone", "score", "leadScore", "leadTier", "leadScoreReasons", "trigger", "fit", "stage", "bookingLink", "responseStatus", "lastTouch", "nextTouch", "responseNotes", "linkedInStatus", "linkedInNotes", "callStatus", "callNotes", "meetingDate", "meetingOutcome", "assessmentNotes", "handoffOwner", "handoffStatus", "handoffDue", "handoffNotes", "crmSyncStatus", "crmSyncedAt", "crmSyncNotes", "teamSyncNotes"];
  const rows = prospects.map((prospect) => headers.map((header) => csvCell(getProspectExportValue(prospect, header))).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "regent-growth-prospects.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function getProspectExportValue(prospect, header) {
  if (header === "leadScore") return getLeadScoreSummary(prospect).score;
  if (header === "leadTier") return getLeadScoreSummary(prospect).tier;
  if (header === "leadScoreReasons") return getLeadScoreSummary(prospect).reasons.join("; ");
  return prospect[header];
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
dailyRunReviewQueue.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "open-daily-review") {
    openDailyReviewProspect(Number(button.dataset.index));
  }

  if (button.dataset.action === "sequence-daily-review") {
    sequenceDailyReviewProspect(Number(button.dataset.index));
  }

  if (button.dataset.action === "sequence-all-daily-review") {
    sequenceAllDailyReviewProspects();
  }

  if (button.dataset.action === "toggle-daily-review-visible") {
    showAllDailyReviewItems = !showAllDailyReviewItems;
    renderDailyRunReviewQueue();
  }

  if (button.dataset.action === "toggle-daily-review-failures") {
    showDailyReviewFailures = !showDailyReviewFailures;
    renderDailyRunReviewQueue();
  }

  if (button.dataset.action === "sequence-ready-daily-review") {
    sequenceReadyDailyReviewProspects();
  }

  if (button.dataset.action === "export-daily-review") {
    exportDailyReviewJson();
  }

  if (button.dataset.action === "export-daily-review-csv") {
    exportDailyReviewCsv();
  }

  if (button.dataset.action === "export-ready-daily-review") {
    exportReadyDailyReviewJson();
  }

  if (button.dataset.action === "export-ready-daily-review-csv") {
    exportReadyDailyReviewCsv();
  }

  if (button.dataset.action === "export-blocked-daily-review") {
    exportBlockedDailyReviewJson();
  }

  if (button.dataset.action === "export-blocked-daily-review-csv") {
    exportBlockedDailyReviewCsv();
  }

  if (button.dataset.action === "copy-daily-review") {
    copyDailyReviewPacket();
  }

  if (button.dataset.action === "copy-blocked-daily-review") {
    copyBlockedDailyReviewPacket();
  }

  if (button.dataset.action === "send-daily-review") {
    sendDailyReviewProspect(Number(button.dataset.index));
  }

  if (button.dataset.action === "fix-daily-review") {
    openDailyReviewMissingFields(Number(button.dataset.index));
  }

  if (button.dataset.action === "sent-daily-review") {
    markDailyReviewProspectSent(Number(button.dataset.index));
  }

  if (button.dataset.action === "retry-daily-ai") {
    retryDailyAiProspect(Number(button.dataset.index));
  }

  if (button.dataset.action === "retry-visible-daily-failures") {
    retryVisibleDailyAiFailures();
  }

  if (button.dataset.action === "clear-visible-daily-failures") {
    clearVisibleDailyAiFailures();
  }

  if (button.dataset.action === "copy-visible-daily-failures") {
    copyVisibleDailyAiFailures();
  }

  if (button.dataset.action === "export-visible-daily-failures") {
    exportVisibleDailyAiFailuresJson();
  }

  if (button.dataset.action === "export-visible-daily-failures-csv") {
    exportVisibleDailyAiFailuresCsv();
  }

  if (button.dataset.action === "clear-daily-ai-failure") {
    clearDailyAiFailure(Number(button.dataset.index));
  }
});
prospectForm.addEventListener("submit", saveProspectFromForm);
responseForm.addEventListener("submit", saveResponseFromForm);
workflowForm.addEventListener("submit", saveWorkflowFromForm);
assessmentForm.addEventListener("submit", saveAssessmentFromForm);
handoffForm.addEventListener("submit", saveHandoffFromForm);
crmRetryQueue.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "show-crm-failed") {
    showFailedCrmSyncs();
  }

  if (button.dataset.action === "crm-page") {
    changeCrmQueuePage(button.dataset.queue, button.dataset.direction);
  }

  if (button.dataset.action === "set-crm-reason-filter") {
    setCrmFailureReasonFilter(button.dataset.reason);
  }

  if (button.dataset.action === "show-crm-reviewed") {
    showReviewedCrmSyncs();
  }

  if (button.dataset.action === "open-crm-failed") {
    openFailedCrmSync(Number(button.dataset.index));
  }

  if (button.dataset.action === "open-crm-reviewed") {
    openReviewedCrmSync(Number(button.dataset.index));
  }

  if (button.dataset.action === "retry-crm-one") {
    retrySingleFailedCrmSync(Number(button.dataset.index));
  }

  if (button.dataset.action === "requeue-crm-reviewed-one") {
    requeueSingleReviewedCrmSync(Number(button.dataset.index));
  }
});
clearFormButton.addEventListener("click", resetForm);
importInput.addEventListener("change", importCsv);
exportButton.addEventListener("click", exportCsv);
resetButton.addEventListener("click", resetSamples);
teamActorForm.addEventListener("submit", saveTeamSyncActor);
checkTeamSyncButton.addEventListener("click", checkTeamSync);
pullTeamProspectsButton.addEventListener("click", pullTeamProspects);
pushTeamProspectsButton.addEventListener("click", pushTeamProspects);
refreshTeamBackupsButton.addEventListener("click", refreshTeamBackups);
deleteFilteredBackupsButton.addEventListener("click", deleteFilteredTeamBackups);
teamBackupSearchInput.addEventListener("input", applyTeamBackupFilters);
teamBackupIntegrityFilter.addEventListener("change", applyTeamBackupFilters);
teamBackupProtectionFilter.addEventListener("change", applyTeamBackupFilters);
teamBackupSortSelect.addEventListener("change", applyTeamBackupFilters);
teamBackupList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "preview-backup") {
    previewAutomaticTeamBackup(button.dataset.filename);
  }

  if (button.dataset.action === "clear-backup-filters") {
    clearTeamBackupFilters();
  }

  if (button.dataset.action === "refresh-backups") {
    refreshTeamBackups();
  }

  if (button.dataset.action === "export-team-backup") {
    exportTeamBackup();
  }

  if (button.dataset.action === "download-backup") {
    downloadAutomaticTeamBackup(button.dataset.filename);
  }

  if (button.dataset.action === "rename-backup") {
    renameAutomaticTeamBackup(button.dataset.filename, button.dataset.label);
  }

  if (button.dataset.action === "toggle-protected-backup") {
    toggleProtectedTeamBackup(button.dataset.filename, button.dataset.protected === "true");
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

  if (button.id === "dismissTeamRestoreSummaryButton") {
    clearTeamRestorePreview();
    setTeamSyncStatus("Restore confirmation dismissed.");
  }
});
runDailyAiButton.addEventListener("click", runDailyAiWorkflow);
stopDailyAiButton.addEventListener("click", requestDailyAiStop);
discoveryForm.addEventListener("input", renderDailyRunCapacitySummary);
dailyReviewSearch.addEventListener("input", renderDailyRunReviewQueue);
dailyReviewReadinessFilter.addEventListener("change", renderDailyRunReviewQueue);
clearDailyReviewFiltersButton.addEventListener("click", clearDailyReviewFilters);
dailyRunHistoryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "export-daily-history") {
    exportDailyRunHistoryJson();
  }

  if (button.dataset.action === "copy-daily-history-summary") {
    copyDailyRunHistorySummary();
  }

  if (button.dataset.action === "copy-daily-history-status-counts") {
    copyDailyRunHistoryStatusCounts();
  }

  if (button.dataset.action === "copy-daily-history-source-summary") {
    copyDailyRunHistorySourceSummary();
  }

  if (button.dataset.action === "show-failed-daily-history") {
    showFailedDailyRunHistory();
  }

  if (button.dataset.action === "toggle-compact-daily-history") {
    compactDailyRunHistory = !compactDailyRunHistory;
    renderDailyRunHistory();
  }

  if (button.dataset.action === "toggle-all-daily-history") {
    showAllDailyRunHistory = !showAllDailyRunHistory;
    renderDailyRunHistory();
  }

  if (button.dataset.action === "clear-daily-history-filter") {
    clearDailyRunHistoryFilter();
  }

  if (button.dataset.action === "reset-daily-history-view") {
    resetDailyRunHistoryView();
  }

  if (button.dataset.action === "set-daily-history-filter") {
    dailyRunHistoryStatusFilter = button.dataset.value || "all";
    renderDailyRunHistory();
  }

  if (button.dataset.action === "copy-stopped-daily-history") {
    copyStoppedDailyRunHistorySummary();
  }

  if (button.dataset.action === "copy-skipped-daily-history") {
    copySkippedDailyRunHistorySummary();
  }

  if (button.dataset.action === "export-skipped-daily-history") {
    exportSkippedDailyRunHistoryJson();
  }

  if (button.dataset.action === "export-skipped-daily-history-csv") {
    exportSkippedDailyRunHistoryCsv();
  }

  if (button.dataset.action === "export-stopped-daily-history") {
    exportStoppedDailyRunHistoryJson();
  }

  if (button.dataset.action === "export-stopped-daily-history-csv") {
    exportStoppedDailyRunHistoryCsv();
  }

  if (button.dataset.action === "export-daily-history-csv") {
    exportDailyRunHistoryCsv();
  }

  if (button.dataset.action === "clear-daily-history") {
    clearDailyRunHistory();
  }

  if (button.dataset.action === "retry-daily-history-failures") {
    retryDailyRunHistoryFailures(button.dataset.id);
  }

  if (button.dataset.action === "retry-visible-daily-history-failures") {
    retryVisibleDailyRunHistoryFailures();
  }

  if (button.dataset.action === "copy-visible-daily-history-failures") {
    copyVisibleDailyRunHistoryFailurePacket();
  }

  if (button.dataset.action === "export-visible-daily-history-failures") {
    exportVisibleDailyRunHistoryFailuresJson();
  }

  if (button.dataset.action === "export-visible-daily-history-failures-csv") {
    exportVisibleDailyRunHistoryFailuresCsv();
  }

  if (button.dataset.action === "clear-visible-daily-history-failures") {
    clearVisibleDailyRunHistoryFailures();
  }

  if (button.dataset.action === "requeue-stopped-daily-history") {
    requeueStoppedDailyRun(button.dataset.id);
  }
});
dailyRunHistoryList.addEventListener("change", (event) => {
  const field = event.target.closest("[data-action='filter-daily-history']");
  if (!field) return;

  dailyRunHistoryStatusFilter = field.value;
  renderDailyRunHistory();
});
generateDiscoveryButton.addEventListener("click", generateDiscoveryCandidates);
clearDiscoveryButton.addEventListener("click", clearDiscoveryQueue);
checkSearchSetupButton.addEventListener("click", checkSearchSetup);
testSearchSetupButton.addEventListener("click", testSearchSetup);
crmPresetSelect.addEventListener("change", renderCrmProviderPreset);
detailAdvanceButton.addEventListener("click", () => advanceStage(selectedProspectIndex));
detailEditButton.addEventListener("click", () => editProspect(selectedProspectIndex));
savePromptsButton.addEventListener("click", savePromptTemplateEdits);
resetPromptsButton.addEventListener("click", resetPromptTemplates);
modelSelect.addEventListener("change", () => setAiStatus(`Local AI ready: ${modelSelect.value}`));
researchAccountButton.addEventListener("click", researchSelectedAccount);
generateBriefButton.addEventListener("click", generateCompanyBrief);
generateEmailButton.addEventListener("click", generatePersonalizedEmail);
saveEmailDraftButton.addEventListener("click", saveCurrentEmailDraft);
emailDraft.addEventListener("input", () => renderEmailSendStatus());
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
retryFailedCrmButton.addEventListener("click", retryFailedCrmSyncs);
markReviewedCrmButton.addEventListener("click", markFailedCrmSyncsReviewed);
requeueSelectedReviewedCrmButton.addEventListener("click", requeueSelectedReviewedCrmSync);
requeueReviewedCrmButton.addEventListener("click", requeueReviewedCrmSyncs);
exportFailedCrmButton.addEventListener("click", exportFailedCrmSyncs);
exportFailedCrmCsvButton.addEventListener("click", exportFailedCrmSyncCsv);
exportReviewedCrmButton.addEventListener("click", exportReviewedCrmSyncs);
exportReviewedCrmCsvButton.addEventListener("click", exportReviewedCrmSyncCsv);
copyCrmStatusSummaryButton.addEventListener("click", copyCrmStatusSummary);
downloadCrmStatusSummaryButton.addEventListener("click", downloadCrmStatusSummary);
clearResolvedCrmButton.addEventListener("click", clearResolvedCrmQueueState);
clearCrmNotesButton.addEventListener("click", cleanCrmSyncNotes);
copyHandoffPacketButton.addEventListener("click", copySelectedHandoffPacket);
copyCrmMappingButton.addEventListener("click", copySelectedCrmMapping);
markCrmReadyButton.addEventListener("click", markSelectedCrmReady);

renderPromptTemplates();
renderCrmProviderPreset();
renderDiscoveryQueue();
renderTeamSyncActor();
renderDailyRunHistory();
renderProspects();
checkSearchSetup();
checkCrmSetup();
checkTeamSync();
refreshTeamBackups();
