# Production Gmail Audit Preview

Use this endpoint to record a Gmail preflight audit preview without sending email.

```text
POST http://127.0.0.1:5195/gmail/audit-preview
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The result uses `regent-growth.gmail-audit-preview-result.v1` and returns:

- `recorded`
- `sent: false`
- `booked: false`
- `preflight`
- `auditPreview`

Export the preview trail with:

```text
GET http://127.0.0.1:5195/gmail/audit-preview/export
```

The export uses `regent-growth.gmail-audit-preview.v1`.

## Stored Metadata

Audit preview entries may store:

- sender email
- recipient email
- subject presence
- issue count
- issue text
- reviewed packet validity
- environment configuration status
- implementation readiness status

They must not store message body content. Confirm `bodyStored: false` on entries and `bodyContentStored: false` on the export.

## Send Blockers

This preview is not Gmail send approval. It exists to test the audit path before OAuth handling, provider response mapping, suppression enforcement, unsubscribe enforcement, retry handling, and manual setup approval are implemented.
