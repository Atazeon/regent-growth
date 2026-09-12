# Production Outlook Live-Send Blocked Endpoint

The Outlook live-send route exists only to reserve the future production contract and prove that real sending is still blocked.

```text
POST http://127.0.0.1:5195/outlook/send
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The endpoint returns HTTP `403` with `regent-growth.outlook-send-blocked.v1`.

Required blocked fields:

- `accepted: false`
- `sent: false`
- `booked: false`
- `providerMessageId: ""`

The result also includes:

- `readyForImplementationReview`
- `readinessSummary`
- `missingChecks`
- `issues`
- `blockedReasons`

## Boundary

This route must not send Outlook messages. It should remain blocked until a separate Outlook implementation adds Microsoft Graph OAuth sending, suppression enforcement, unsubscribe enforcement, provider audit logging, retry handling, response mapping, and manual setup approval.
