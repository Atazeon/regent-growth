# Regent Growth

Regent Growth is a local-first AI sales operating system for building and working an outbound pipeline. It runs in the browser, uses local storage for the private workspace, and connects to Ollama for local AI research, candidate discovery, and personalized email drafting.

## What It Does

- Finds and queues qualified company candidates from target industries and buying signals.
- Uses Ollama locally for account research, company briefs, and first-email drafts.
- Tracks a first real outbound session with 25 setup, discovery, research, outreach, sequence, response, and handoff steps, plus area filters, next-step controls, first real run packet copy/execution checklist/live dry-run copy/download/JSON export, launch report, follow-up batch plan, second-batch readiness, second-batch execution packet, second-batch outcome tracking, second-batch report, batch comparison, scale decision, operating dashboard, first-run snapshot history/export/import/filtered export/CSV export/copy summary/launch checklist copy/clear/compare/restore/naming/delete/notes/search/readiness filter/unknown readiness/filter reset/readiness counts/count chips/count summary/timeline cues/compact controls/QA hardening/launch checklist, manual launch log, post-launch review, live run outcomes, and a filterable outcome-driven fix queue with owner workload, owner filter, filtered copy/CSV export, closeout copy/download, filtered closeout copy/download, guarded resolved archive/restore/cleanup, archive cleanup readiness, due date dashboard, and execution notes.
- Tracks prospects from research through email, sequence, LinkedIn, call, meeting, assessment, and customer handoff.
- Reviews AI-drafted emails before sending through mail app, Gmail, or Outlook handoff links.
- Tracks responses, follow-up reminders, owner workload, blocked handoffs, and assessment notes.
- Syncs warm leads to a configurable CRM webhook through the local research server.
- Keeps retry/review queues for failed CRM syncs and exports status summaries.
- Supports local team sync, shared-store backups, restore preview, integrity checks, and backup cleanup.

## Requirements

- Windows PowerShell or another terminal.
- Node.js. This project has been validated with the bundled Codex Node runtime.
- Ollama running locally at `http://127.0.0.1:11434`.
- The default AI model is `qwen3:8b`.

Optional connectors:

- `REGENT_SEARCH_API_URL` for external search/source discovery.
- `REGENT_SEARCH_API_KEY` and `REGENT_SEARCH_API_KEY_HEADER` for authenticated search providers.
- `REGENT_CRM_API_URL` for CRM webhook sync.
- `REGENT_CRM_API_KEY` and `REGENT_CRM_API_KEY_HEADER` for authenticated CRM endpoints.

## Run Locally

From the project folder:

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

Then open:

```text
http://127.0.0.1:5193/index.html
```

The local server provides the static app plus these local endpoints:

- `GET /api/health`
- `GET /api/search-status`
- `POST /api/search-sources`
- `POST /api/fetch-source`
- `GET /api/crm-status`
- `POST /api/crm-sync`
- `GET /api/team-prospects`
- `POST /api/team-prospects`
- `GET /api/team-backups`
- `GET /api/team-backup`

## Ollama

Make sure Ollama is running before using AI features:

```powershell
ollama list
ollama run qwen3:8b
```

The app also recognizes smaller fallback models such as `qwen2.5:0.5b` for faster rough drafts.

## CRM Setup

Set your CRM webhook before starting the local server:

```powershell
$env:REGENT_CRM_API_URL="https://your-crm-or-automation-webhook.example/leads"
$env:REGENT_CRM_API_KEY="your_api_key"
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

The CRM sync sends warm lead records from the browser to the local server, then the local server forwards them to your configured CRM endpoint.

## Tests

Run the source test suite:

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tests\run-source-tests.js
```

Useful syntax checks:

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" --check app.js
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" --check local-research-server.js
git diff --check
```

## Maintenance

- Use [docs/RUNBOOK.md](docs/RUNBOOK.md) for startup, smoke checks, validation, and troubleshooting.
- Use [docs/USER_FEEDBACK.md](docs/USER_FEEDBACK.md) after real outbound sessions to capture product feedback.
- Use [docs/POST_LAUNCH_USABILITY.md](docs/POST_LAUNCH_USABILITY.md) for the first real-user usability pass.
- Keep runtime data, shared backups, and secrets out of Git.

## Data And Secrets

Prospects, prompt settings, discovery queue, and run history are stored in browser local storage. Shared team data and backups are written under `data/` by the local server. Runtime data and `.env` files are ignored by Git.
