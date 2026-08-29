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

## Production Provider Setup

Use this section before connecting real email or calendar providers:

1. Save the in-app production provider setup with the intended provider, sender email, default booking link, and review gate enabled.
1. Start the local server with provider environment variables when testing configuration:

```powershell
$env:REGENT_EMAIL_PROVIDER="gmail"
$env:REGENT_EMAIL_API_URL="https://your-reviewed-send-middleware.example/email"
$env:REGENT_EMAIL_API_KEY="your_email_api_key"
$env:REGENT_EMAIL_API_KEY_HEADER="Authorization"
$env:REGENT_CALENDAR_API_URL="https://your-reviewed-booking-middleware.example/calendar"
$env:REGENT_CALENDAR_API_KEY="your_calendar_api_key"
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

1. Click `Check provider` in the app and confirm the local server reports provider configuration.
1. Copy or download the provider setup packet before changing any production credentials.
1. Keep reviewed handoff enabled. The local server reports production configuration only; real automatic sending and booking stay disabled until explicit send and booking endpoints are implemented, tested, and reviewed.
1. Review `docs/PRODUCTION_PROVIDER_BOUNDARY.md` before building real send or booking functionality.

## Provider Stub Dry Run

Use the provider stub to test the reviewed send contract without connecting Gmail, Outlook, or any real provider:

1. Start the provider stub in a separate terminal:

```powershell
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" production-provider-stub.js
```

1. Start the app server with the stub endpoint configured:

```powershell
$env:REGENT_EMAIL_PROVIDER="stub"
$env:REGENT_EMAIL_API_URL="http://127.0.0.1:5194/reviewed-send"
$env:REGENT_EMAIL_API_KEY=""
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

1. In the app, save provider setup, click `Check provider`, then use `Dry-run send`.
1. Confirm dry-run history records `Sent: no` and `Booked: no`.

## Middleware Skeleton

Use the middleware skeleton when preparing provider adapters. It validates the same contract but still returns `sent: false`.

```powershell
$env:REGENT_EMAIL_PROVIDER="gmail"
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" production-provider-middleware.js
```

Point the app server at the skeleton when testing the provider setup path:

```powershell
$env:REGENT_EMAIL_PROVIDER="gmail"
$env:REGENT_EMAIL_API_URL="http://127.0.0.1:5195/reviewed-send"
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-research-server.js
```

The skeleton is not a real sender. It exists to test adapter selection, contract validation, and release-gate handling before adding OAuth or provider API calls.

Check skeleton status at:

```text
http://127.0.0.1:5195/status
```

## Test-Mailbox Adapter Capture

Use the test-mailbox adapter before implementing Gmail, Outlook, or custom provider sends. It validates one configured sender and one configured recipient, captures the reviewed packet result, and still returns `sent: false`.

```powershell
$env:REGENT_EMAIL_PROVIDER="test-mailbox"
$env:REGENT_TEST_MAILBOX_SENDER="sender@example.com"
$env:REGENT_TEST_MAILBOX_ADDRESS="founder@example.com"
& "C:\Users\ibrah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" production-provider-middleware.js
```

Check readiness and replay endpoints:

```text
http://127.0.0.1:5195/adapter-readiness
http://127.0.0.1:5195/adapter-readiness/export
POST http://127.0.0.1:5195/replay
POST http://127.0.0.1:5195/replay/export
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the initial replay body after changing its provider to `test-mailbox` and matching the configured sender and recipient. Do not use a real prospect recipient in this adapter.

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
- If provider setup fails, set `REGENT_EMAIL_PROVIDER` and `REGENT_EMAIL_API_URL`, then restart the local server.
- If team sync or backup actions fail, start the app through `local-research-server.js` instead of opening `index.html` directly.
- If a run is slow, lower the Daily AI limit or use `qwen2.5:0.5b` for a faster rough pass.
