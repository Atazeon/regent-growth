const storageKey = "regent-growth-prospects";
const stageOrder = ["Research", "Email Drafted", "Sequence", "LinkedIn", "Call", "Meeting", "Assessment"];
const sampleProspects = [
  {
    company: "Northstar Dental Group",
    industry: "Healthcare services",
    size: "85 employees",
    website: "northstardental.example",
    decisionMaker: "Operations Director",
    score: 86,
    trigger: "Expanding to two new clinics this quarter",
    fit: "Multi-location operator with appointment volume and front-desk follow-up pressure.",
    stage: "Research"
  },
  {
    company: "CivicStone Roofing",
    industry: "Commercial construction",
    size: "120 employees",
    website: "civicstone.example",
    decisionMaker: "VP Sales",
    score: 91,
    trigger: "Hiring outbound sales representatives",
    fit: "High-ticket B2B service where faster lead qualification can create direct revenue lift.",
    stage: "Email Drafted"
  },
  {
    company: "Atlas Managed IT",
    industry: "IT services",
    size: "42 employees",
    website: "atlasmanaged.example",
    decisionMaker: "Founder",
    score: 78,
    trigger: "Publishing new cybersecurity assessment offer",
    fit: "Clear assessment-led sales motion and likely need for qualified local business leads.",
    stage: "Sequence"
  }
];

let prospects = loadProspects();
let editingIndex = null;

const prospectList = document.querySelector("#prospectList");
const stageFilter = document.querySelector("#stageFilter");
const researchPrompt = document.querySelector("#researchPrompt");
const emailDraft = document.querySelector("#emailDraft");
const prospectForm = document.querySelector("#prospectForm");
const formTitle = document.querySelector("#formTitle");
const clearFormButton = document.querySelector("#clearFormButton");
const exportButton = document.querySelector("#exportButton");
const resetButton = document.querySelector("#resetButton");

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

function normalizeProspect(prospect) {
  return {
    company: prospect.company || "",
    industry: prospect.industry || "",
    size: prospect.size || "",
    website: prospect.website || "",
    decisionMaker: prospect.decisionMaker || "",
    score: Number(prospect.score) || 0,
    trigger: prospect.trigger || "",
    fit: prospect.fit || "",
    stage: stageOrder.includes(prospect.stage) ? prospect.stage : "Research"
  };
}

function saveProspects() {
  localStorage.setItem(storageKey, JSON.stringify(prospects));
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
  const visibleProspects = prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter((item) => selectedStage === "all" || item.prospect.stage === selectedStage);

  if (visibleProspects.length === 0) {
    prospectList.innerHTML = `<p class="empty-state">No companies match this stage yet.</p>`;
  } else {
    prospectList.innerHTML = visibleProspects.map(({ prospect, index }) => `
      <article class="prospect-card">
        <div>
          <h3>${escapeHtml(prospect.company)}</h3>
          <p class="prospect-meta">${escapeHtml(prospect.industry)} | ${escapeHtml(prospect.size)} | ${escapeHtml(prospect.website)}</p>
          <p>${escapeHtml(prospect.fit)}</p>
          <p><strong>Decision-maker:</strong> ${escapeHtml(prospect.decisionMaker)}</p>
          <p><strong>Trigger:</strong> ${escapeHtml(prospect.trigger)}</p>
          <p class="score">Fit score ${escapeHtml(prospect.score)}</p>
        </div>
        <div class="card-actions">
          <button type="button" data-action="advance" data-index="${index}">${escapeHtml(prospect.stage)}</button>
          <button class="secondary-button" type="button" data-action="edit" data-index="${index}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-index="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  updateMetrics();
  setDrafts(visibleProspects[0]?.prospect || prospects[0]);
}

function updateMetrics() {
  document.querySelector("#qualifiedMetric").textContent = prospects.length;
  document.querySelector("#emailMetric").textContent = prospects.filter((prospect) => prospect.stage !== "Research").length;
  document.querySelector("#followUpMetric").textContent = prospects.filter((prospect) => prospect.stage === "Sequence").length;
  document.querySelector("#meetingMetric").textContent = prospects.filter((prospect) => prospect.stage === "Meeting").length;
}

function setDrafts(prospect) {
  if (!prospect) {
    researchPrompt.value = "";
    emailDraft.value = "";
    return;
  }

  researchPrompt.value = `Research ${prospect.company} (${prospect.website}).

Find:
- what the company sells
- likely decision-makers
- recent growth signals
- sales or operations pain points
- why Regent Growth could help
- one specific opening line for an email

Known trigger: ${prospect.trigger}
Fit reason: ${prospect.fit}`;

  emailDraft.value = `Subject: Quick idea for ${prospect.company}

Hi {{first_name}},

I noticed ${prospect.company} is ${prospect.trigger.toLowerCase()}.

Regent Growth helps teams turn that kind of momentum into a steadier pipeline by finding qualified companies, researching the account, writing personalized outreach, and tracking follow-up through booked meetings.

Would it be worth a quick conversation to see if we can help your team add more qualified meetings this month?

Best,
Ibrahim`;
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
  prospectForm.score.value = prospect.score;
  prospectForm.stage.value = prospect.stage;
  prospectForm.trigger.value = prospect.trigger;
  prospectForm.fit.value = prospect.fit;
  document.querySelector("#prospectFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteProspect(index) {
  prospects.splice(index, 1);
  saveProspects();
  resetForm();
  renderProspects();
}

function resetForm() {
  editingIndex = null;
  formTitle.textContent = "Add Company";
  prospectForm.reset();
  prospectForm.score.value = 75;
  prospectForm.stage.value = "Research";
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
    score: formData.get("score"),
    stage: formData.get("stage"),
    trigger: formData.get("trigger").trim(),
    fit: formData.get("fit").trim()
  });

  if (editingIndex === null) {
    prospects.unshift(prospect);
  } else {
    prospects[editingIndex] = prospect;
  }

  saveProspects();
  resetForm();
  renderProspects();
}

function exportCsv() {
  const headers = ["company", "industry", "size", "website", "decisionMaker", "score", "trigger", "fit", "stage"];
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

function resetSamples() {
  prospects = structuredClone(sampleProspects);
  saveProspects();
  resetForm();
  renderProspects();
}

prospectList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const actions = {
    advance: advanceStage,
    edit: editProspect,
    delete: deleteProspect
  };

  actions[button.dataset.action]?.(index);
});

stageFilter.addEventListener("change", renderProspects);
prospectForm.addEventListener("submit", saveProspectFromForm);
clearFormButton.addEventListener("click", resetForm);
exportButton.addEventListener("click", exportCsv);
resetButton.addEventListener("click", resetSamples);

renderProspects();
