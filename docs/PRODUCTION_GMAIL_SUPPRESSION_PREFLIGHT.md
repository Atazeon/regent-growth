# Production Gmail Suppression Preflight

Use this endpoint to check whether a reviewed Gmail packet recipient is suppressed before any Gmail send implementation exists.

```text
POST http://127.0.0.1:5195/gmail/suppression-preflight
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The response uses `regent-growth.gmail-suppression-preflight.v1` and must keep:

- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Suppression Inputs

The preflight checks comma-separated email addresses from:

- `REGENT_SUPPRESSION_EMAILS`
- `REGENT_GMAIL_SUPPRESSION_EMAILS`

The provider-specific list is combined with the shared suppression list. Email comparisons are lowercased and trimmed.

## Result Fields

Review these fields before moving toward Gmail send implementation:

- `recipientEmail`
- `suppressionListConfigured`
- `suppressed`
- `suppressedEmailCount`
- `issues`
- `blockedReasons`

If `suppressed` is true, the recipient must not be contacted. This endpoint is not send approval; it only proves the suppression decision path is available before live Gmail work.
