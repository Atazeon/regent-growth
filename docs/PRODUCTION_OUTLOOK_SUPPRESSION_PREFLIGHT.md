# Production Outlook Suppression Preflight

Use this endpoint to check whether a reviewed Outlook packet recipient is suppressed before any Outlook send implementation exists.

```text
POST http://127.0.0.1:5195/outlook/suppression-preflight
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The response uses `regent-growth.outlook-suppression-preflight.v1` and must keep:

- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Suppression Inputs

The preflight checks comma-separated email addresses from:

- `REGENT_SUPPRESSION_EMAILS`
- `REGENT_OUTLOOK_SUPPRESSION_EMAILS`

The provider-specific list is combined with the shared suppression list. Email comparisons are lowercased and trimmed.

## Result Fields

Review these fields before moving toward Outlook send implementation:

- `recipientEmail`
- `suppressionListConfigured`
- `suppressed`
- `suppressedEmailCount`
- `issues`
- `blockedReasons`

If `suppressed` is true, the recipient must not be contacted. This endpoint is not send approval; it only proves the suppression decision path is available before live Outlook work.
