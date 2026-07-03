const prospects = [
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

const stageOrder = ["Research", "Email Drafted", "Sequence", "LinkedIn", "Call", "Meeting", "Assessment"];
const prospectList = document.querySelector("#prospectList");
const stageFilter = document.querySelector("#stageFilter");
const addProspectButton = document.querySelector("#addProspectButton");
const researchPrompt = document.querySelector("#researchPrompt");
const emailDraft = document.querySelector("#emailDraft");

function renderProspects() {
  const selectedStage = stageFilter.value;
  const visibleProspects = prospects
    .map((prospect, index) => ({ prospect, index }))
    .filter((item) => selectedStage === "all" || item.prospect.stage === selectedStage);

  prospectList.innerHTML = visibleProspects.map(({ prospect, index }) => `
    <article class="prospect-card">
      <div>
        <h3>${prospect.company}</h3>
        <p class="prospect-meta">${prospect.industry} | ${prospect.size} | ${prospect.website}</p>
        <p>${prospect.fit}</p>
        <p><strong>Decision-maker:</strong> ${prospect.decisionMaker}</p>
        <p><strong>Trigger:</strong> ${prospect.trigger}</p>
        <p class="score">Fit score ${prospect.score}</p>
      </div>
      <button type="button" data-index="${index}">${prospect.stage}</button>
    </article>
  `).join("");

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
  renderProspects();
}

function addSampleProspect() {
  prospects.unshift({
    company: "Summit Home Services",
    industry: "Home services",
    size: "64 employees",
    website: "summithome.example",
    decisionMaker: "General Manager",
    score: 83,
    trigger: "Launching a new maintenance plan",
    fit: "Recurring service offer with strong need for local prospecting and follow-up.",
    stage: "Research"
  });
  renderProspects();
}

prospectList.addEventListener("click", (event) => {
  if (event.target.matches("button[data-index]")) {
    advanceStage(Number(event.target.dataset.index));
  }
});

stageFilter.addEventListener("change", renderProspects);
addProspectButton.addEventListener("click", addSampleProspect);

renderProspects();
