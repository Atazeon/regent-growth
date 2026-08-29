# Production Test-Mailbox Replay

Use this replay path to validate the first provider adapter implementation without sending email.

## Fixture

Use:

```text
tests/fixtures/production-test-mailbox-reviewed-send.json
```

The fixture uses:

- provider: `test-mailbox`
- sender: `sender@example.com`
- recipient: `founder@example.com`
- automation: disabled
- human review: required
- compliance review: required
- release gate: ready

## Environment

```powershell
$env:REGENT_EMAIL_PROVIDER="test-mailbox"
$env:REGENT_TEST_MAILBOX_SENDER="sender@example.com"
$env:REGENT_TEST_MAILBOX_ADDRESS="founder@example.com"
```

## Expected Result

- `accepted: true`
- `captured: true`
- `sent: false`
- `booked: false`
- `providerMessageId: ""`

If sender or recipient does not match the configured environment, the adapter must reject the packet.
