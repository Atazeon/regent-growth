# Regent Growth

An internal AI sales engine for finding qualified companies, researching them, drafting personalized outreach, and tracking every step from first email to monthly customer.

This repo starts as a lightweight local prototype so the workflow is visible before deeper automation is added.

## Workflow

1. Find 100 qualified companies every week.
2. Identify decision-makers.
3. Research the company and buying signals.
4. Generate personalized outbound email.
5. Run the follow-up sequence.
6. Send a LinkedIn connection.
7. Make the phone call.
8. Book the meeting.
9. Complete the assessment.
10. Convert to a monthly customer.

## Current Prototype

Open `index.html` in a browser to use the first local dashboard. It includes:

- daily/weekly prospect targets
- pipeline stage tracking
- saved prospect management in the browser
- add, edit, delete, and reset controls
- CSV export for prospect lists
- sample qualified prospects
- Ollama-powered company brief and email generation
- response and handoff checklist

## Local AI Direction

Regent Growth is intended to run locally first. The AI features use the local Ollama API at `http://127.0.0.1:11434` before relying on any cloud AI provider.

Verified local Ollama models on this machine:

- `qwen3:8b` recommended default
- `llama3:latest`
- `qwen2.5:0.5b`
- `phi3:mini`

The dashboard defaults to `qwen3:8b` for AI company briefs and personalized email drafts. Ollama must be running locally before those buttons can generate output. On CPU fallback, `qwen3:8b` may take a minute or two; use `qwen2.5:0.5b` from the model selector for quick rough drafts.

## Next Build Milestones

- Add CSV import for prospect lists.
- Connect enrichment providers for company and contact research.
- Add editable AI prompt templates.
- Store leads and sequences in a database.
- Integrate Gmail/Outlook, LinkedIn, and calendar scheduling.
- Add GitHub issues for each milestone once the first remote repo exists.

## Repository Setup

This workspace is already initialized as a Git repository. To publish it:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/regent-growth.git
git branch -M main
git push -u origin main
```

If you install GitHub CLI, you can create the repo from this folder:

```powershell
gh repo create regent-growth --private --source . --remote origin --push
```
