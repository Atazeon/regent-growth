const storageKey = "regent-growth-prospects";
const promptStorageKey = "regent-growth-prompt-templates";
const discoveryStorageKey = "regent-growth-discovery-queue";
const ollamaEndpoint = "http://127.0.0.1:11434/api/generate";
const ollamaTimeoutMs = 150000;
const stageOrder = ["Research", "Email Drafted", "Sequence", "LinkedIn", "Call", "Meeting", "Assessment"];
const responseStatuses = ["Not Contacted", "Contacted", "Replied", "Interested", "Meeting Booked", "Not Interested", "No Response"];
const linkedInStatuses = ["Not Started", "Connection Sent", "Connected", "Messaged", "No Profile", "Not Relevant"];
const callStatuses = ["Not Started", "Planned", "Called", "Left Voicemail", "Connected", "No Answer", "Bad Number"];
const sourceStatuses = ["Needs Review", "Sources Opened", "Evidence Found", "Rejected"];
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
    callNotes: ""
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
    callNotes: ""
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
    callNotes: "Call after the next sequence touch if no reply."
  }
];

let prospects = loadProspects();
let promptTemplates = loadPromptTemplates();
let discoveryQueue = loadDiscoveryQueue();
let editingIndex = null;
let selectedProspectIndex = 0;

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
const reminderList = document.querySelector("#reminderList");
const reminderCount = document.querySelector("#reminderCount");
const briefTemplateInput = document.querySelector("#briefTemplateInput");
const emailTemplateInput = document.querySelector("#emailTemplateInput");
const savePromptsButton = document.querySelector("#savePromptsButton");
const resetPromptsButton = document.querySelector("#resetPromptsButton");
const stageFilter = document.querySelector("#stageFilter");
const responseFilter = document.querySelector("#responseFilter");
const savedViews = document.querySelector("#savedViews");
const discoveryForm = document.querySelector("#discoveryForm");
const discoveryList = document.querySelector("#discoveryList");
const generateDiscoveryButton = document.querySelector("#generateDiscoveryButton");
const clearDiscoveryButton = document.querySelector("#clearDiscoveryButton");
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
  const visibleProspects = prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter((item) => selectedStage === "all" || item.prospect.stage === selectedStage)
    .filter((item) => selectedResponse === "all" || item.prospect.responseStatus === selectedResponse)
    .filter((item) => matchesSavedView(item.prospect, selectedView));

  if (visibleProspects.length === 0) {
    prospectList.innerHTML = `<p class="empty-state">${escapeHtml(getEmptyProspectMessage(selectedStage, selectedResponse, selectedView))}</p>`;
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
    "not-interested": "Not Interested",
    "no-response": "No Response",
    "follow-up-due": "Follow-up Due"
  };

  return labels[selectedView] || labels.all;
}

function getEmptyProspectMessage(selectedStage, selectedResponse, selectedView) {
  const hasStageFilter = selectedStage !== "all";
  const hasResponseFilter = selectedResponse !== "all";
  const hasSavedView = selectedView !== "all";

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
    return;
  }

  detailCompany.textContent = prospect.company;
  detailAdvanceButton.disabled = false;
  detailEditButton.disabled = false;
  responseForm.hidden = false;
  workflowForm.hidden = false;
  detailResponseStatus.value = prospect.responseStatus;
  detailLastTouch.value = prospect.lastTouch;
  detailNextTouch.value = prospect.nextTouch;
  detailResponseNotes.value = prospect.responseNotes;
  detailLinkedInStatus.value = prospect.linkedInStatus;
  detailCallStatus.value = prospect.callStatus;
  detailLinkedInNotes.value = prospect.linkedInNotes;
  detailCallNotes.value = prospect.callNotes;
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
  const headers = ["company", "industry", "size", "website", "decisionMaker", "contactEmail", "contactLinkedIn", "contactPhone", "score", "trigger", "fit", "stage", "bookingLink", "responseStatus", "lastTouch", "nextTouch", "responseNotes", "linkedInStatus", "linkedInNotes", "callStatus", "callNotes"];
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
    callNotes: values.callnotes || values.phonenotes || values.dialnotes
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
});
prospectForm.addEventListener("submit", saveProspectFromForm);
responseForm.addEventListener("submit", saveResponseFromForm);
workflowForm.addEventListener("submit", saveWorkflowFromForm);
clearFormButton.addEventListener("click", resetForm);
importInput.addEventListener("change", importCsv);
exportButton.addEventListener("click", exportCsv);
resetButton.addEventListener("click", resetSamples);
generateDiscoveryButton.addEventListener("click", generateDiscoveryCandidates);
clearDiscoveryButton.addEventListener("click", clearDiscoveryQueue);
detailAdvanceButton.addEventListener("click", () => advanceStage(selectedProspectIndex));
detailEditButton.addEventListener("click", () => editProspect(selectedProspectIndex));
savePromptsButton.addEventListener("click", savePromptTemplateEdits);
resetPromptsButton.addEventListener("click", resetPromptTemplates);
modelSelect.addEventListener("change", () => setAiStatus(`Local AI ready: ${modelSelect.value}`));
researchAccountButton.addEventListener("click", researchSelectedAccount);
generateBriefButton.addEventListener("click", generateCompanyBrief);
generateEmailButton.addEventListener("click", generatePersonalizedEmail);

renderPromptTemplates();
renderDiscoveryQueue();
renderProspects();
