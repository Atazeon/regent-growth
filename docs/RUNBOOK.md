# Regent Growth Runbook

Use this runbook when starting, validating, or troubleshooting the local Regent Growth app.

## Start

1. Start Ollama and confirm the model is available:

```powershell
ollama list
ollama run qwen3:8b
```

1. Start the local research server from the project folder:

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

1. Open the app:

```text
http://127.0.0.1:5193/index.html
```

## Smoke Check

- The page title should be `Regent Growth`.
- The selected AI model should be `qwen3:8b`.
- Discovery, prospects, research, email, CRM export, team sync, reminders, and owner workload sections should render.
- The CRM setup status can say the CRM API URL is not configured until `REGENT_CRM_API_URL` is set.
- The browser console should not show app errors on load.

## Daily Use

- Generate or import prospects.
- Use Daily AI to research accounts and draft emails.
- Review drafted emails before sending.
- Mark sent emails so follow-up dates and sequence status update.
- Mark warm leads CRM ready before syncing them.
- Review failed CRM syncs before retrying or parking them.
- Export backups before restoring shared team data.

## Outbound Operating Sequence

Use this sequence before increasing outbound volume:

1. Copy the live dry-run packet and confirm no real send happens during rehearsal.
1. Save a first-run snapshot before and after the run.
1. Log launch decisions in the manual launch log.
1. Log outcomes with the correct batch tag: `First Run` or `Second Batch`.
1. Save the post-launch review after the first real run.
1. Copy the launch report and follow-up batch plan before batch two.
1. Use second-batch readiness and the second-batch execution packet before the next send.
1. Filter outcomes by batch, then export filtered text and CSV files.
1. Copy the batch comparison and scale decision before increasing volume.
1. Run the operating QA checklist and export the operating closeout.
1. Use the launch hardening checklist as the final no-send/no-scale guard.

## Validation

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" --check app.js
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" --check local-research-server.js
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tests\run-source-tests.js
git diff --check
```

## Troubleshooting

- If AI calls fail, make sure Ollama is running and `qwen3:8b` is installed.
- If source search fails, set `REGENT_SEARCH_API_URL` and restart the local server.
- If CRM sync fails, set `REGENT_CRM_API_URL` and restart the local server.
- If team sync or backup actions fail, start the app through `local-research-server.js` instead of opening `index.html` directly.
- If a run is slow, lower the Daily AI limit or use `qwen2.5:0.5b` for a faster rough pass.
