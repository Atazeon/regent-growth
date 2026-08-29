# Production Test-Mailbox Capture

The test-mailbox capture endpoint exercises the first provider adapter path without sending email.

## Endpoint

```text
POST http://127.0.0.1:5195/test-mailbox/capture
```

Use `tests/fixtures/production-test-mailbox-reviewed-send.json` as the request body.

## Required Environment

```powershell
$env:REGENT_EMAIL_PROVIDER="test-mailbox"
$env:REGENT_TEST_MAILBOX_SENDER="sender@example.com"
$env:REGENT_TEST_MAILBOX_ADDRESS="founder@example.com"
```

## Expected Capture Result

- `accepted: true`
- `captured: true`
- `sent: false`
- `booked: false`
- `provider: "test-mailbox"`

## Audit Export

```text
GET http://127.0.0.1:5195/test-mailbox/capture/export
```

The export uses `regent-growth.test-mailbox-capture-audit.v1`, includes summary counts, and does not store message body content.
