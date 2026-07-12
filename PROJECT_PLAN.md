# Regent Growth Project Plan

## Product Goal

Build a private AI sales operating system that creates a repeatable outbound machine:

- 50 new prospects every weekday
- 100 qualified companies every week as the initial operating target
- personalized research and email generation
- automated follow-up
- LinkedIn and call task tracking
- meeting booking and warm-lead handoff
- local-first AI through Ollama

## MVP Scope

The first useful version should help with daily execution before trying to automate everything.

### Must Have

- Prospect list with company, fit reason, industry, size, website, and status
- Decision-maker tracking
- Research notes and buying triggers
- Personalized first email draft
- Sequence stage tracking
- Manual task list for LinkedIn, phone, meeting, and assessment

Current status: the local prototype now supports saved browser-based prospect management, including add, edit, delete, reset, stage advancement, contact-level fields, booking link tracking, duplicate detection, response outcome filters, saved response outcome views, CSV import/export, selected account details, response tracking, follow-up reminder tasks, manual LinkedIn and call task tracking, meeting outcome tracking, assessment notes, local AI company discovery queues, source review links and evidence notes, local website source fetching through the research server, configurable search API source discovery, in-app search provider setup checks, saved AI outputs, editable AI prompt templates, local Ollama account research, local Ollama generation for company briefs and personalized emails, Gmail/Outlook/mail-app draft handoff, CRM-ready warm-lead exports, selected-account handoff packets, multi-user handoff ownership basics, dashboard views for owner workload and blocked handoffs, configurable CRM API sync setup for warm leads, local shared team sync storage for prospects, conflict-safe team sync merging, shared sync activity history, team sync actor naming, team sync backup and restore, team sync restore preview, automatic shared-store backup before restore, shared-store backup browser, restore from automatic backup, team sync backup cleanup, team sync backup retention limits, team sync backup audit details, team sync backup integrity checks, team sync restore dry-run reports, team sync restore confirmation summaries, team sync backup downloads from the browser, team sync backup rename labels, team sync backup search/filter, team sync backup sort controls, team sync backup bulk cleanup, team sync backup protected favorites, team sync backup protection filters, and team sync backup metadata summary chips.

AI direction: use local Ollama through `http://127.0.0.1:11434` as the first AI backend. `qwen3:8b` is installed and verified, and the dashboard uses it as the default quality model. `qwen2.5:0.5b` remains available as a fast rough-draft fallback. Available local models include `qwen3:8b`, `llama3:latest`, `qwen2.5:0.5b`, and `phi3:mini`.

### Should Have

- Lead score
- Basic dashboard metrics

### Later

- Gmail/Outlook sending
- CRM sync API integration
- Team sync backup empty-state guidance

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
- `codex/ollama-research`
- `codex/email-generator`
- `codex/pipeline-storage`

## First Issues To Create

1. Add team sync backup empty-state guidance.
