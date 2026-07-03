# Regent Growth Project Plan

## Product Goal

Build a private AI sales operating system that creates a repeatable outbound machine:

- 50 new prospects every weekday
- 100 qualified companies every week as the initial operating target
- personalized research and email generation
- automated follow-up
- LinkedIn and call task tracking
- meeting booking and warm-lead handoff

## MVP Scope

The first useful version should help with daily execution before trying to automate everything.

### Must Have

- Prospect list with company, fit reason, industry, size, website, and status
- Decision-maker tracking
- Research notes and buying triggers
- Personalized first email draft
- Sequence stage tracking
- Manual task list for LinkedIn, phone, meeting, and assessment

Current status: the local prototype now supports saved browser-based prospect management, including add, edit, delete, reset, stage advancement, and CSV export.

### Should Have

- CSV import
- Email template variants
- Lead score
- Response status
- Calendar booking link field
- Basic dashboard metrics

### Later

- Automated company discovery
- Contact enrichment
- OpenAI research agent
- OpenAI email writer
- Gmail/Outlook sending
- LinkedIn workflow support
- CRM sync
- Multi-user handoff workflow

## Data Model Draft

### Company

- name
- website
- industry
- location
- size
- fit score
- qualification reason
- buying trigger
- source
- status

### Contact

- full name
- title
- email
- LinkedIn URL
- phone
- decision-maker role
- confidence

### Outreach

- first email subject
- first email body
- sequence step
- last touch date
- next touch date
- response status
- meeting date

## GitHub Progress Habit

Use small commits as the project grows:

```powershell
git status
git add README.md PROJECT_PLAN.md index.html styles.css app.js data/sample-prospects.json
git commit -m "Create Regent Growth starter prototype"
git push
```

Suggested branch names:

- `codex/csv-import`
- `codex/openai-research`
- `codex/email-generator`
- `codex/pipeline-storage`

## First Issues To Create

1. Add CSV prospect import.
2. Add selectable prospect detail view.
3. Add OpenAI company research prompt flow.
4. Add personalized email generation.
5. Add sequence task reminders.
