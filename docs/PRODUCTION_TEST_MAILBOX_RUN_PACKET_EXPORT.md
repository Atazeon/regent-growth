# Production Test-Mailbox Run Packet Export

Use the run packet export as setup evidence before moving from test-mailbox capture to a real provider adapter.

## Export Command

Start the middleware with the test-mailbox environment, then open:

```text
GET http://127.0.0.1:5195/test-mailbox/run-packet
```

Save the JSON response with the provider implementation notes.

## Required Evidence

- `schemaVersion` is `regent-growth.test-mailbox-run-packet.v1`.
- `provider` is `test-mailbox`.
- `mode` is `capture-only`.
- `sentEnabled` is `false`.
- `bookedEnabled` is `false`.
- `status` includes the current `REGENT_TEST_MAILBOX_SENDER` and `REGENT_TEST_MAILBOX_ADDRESS` configuration state.
- `requiredSteps` includes the matching fixture, mismatch fixture, and `bodyContentStored is false` audit check.

Do not use this export as approval for real Gmail, Outlook, or custom sends. It only proves the local capture rehearsal path is configured.
