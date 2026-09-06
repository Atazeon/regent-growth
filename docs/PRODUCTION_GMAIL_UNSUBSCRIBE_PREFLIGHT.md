# Production Gmail Unsubscribe Preflight

Use this endpoint to verify that a reviewed Gmail packet includes unsubscribe or opt-out language before any Gmail send implementation exists.

```text
POST http://127.0.0.1:5195/gmail/unsubscribe-preflight
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body, then add compliant opt-out language to the message body while testing.

The response uses `regent-growth.gmail-unsubscribe-preflight.v1` and must keep:

- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`
- `bodyContentStored: false`

## Required Language

The local preflight accepts message bodies that include either:

- `unsubscribe`
- `opt out`

The check is case-insensitive. It does not store message body content in the response.

## Result Fields

Review:

- `hasUnsubscribeLanguage`
- `requiredTerms`
- `issues`
- `blockedReasons`

This endpoint is not Gmail send approval. If `hasUnsubscribeLanguage` is false, the draft must be fixed before Gmail implementation review.
