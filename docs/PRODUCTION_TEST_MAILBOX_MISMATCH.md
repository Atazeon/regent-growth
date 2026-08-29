# Production Test-Mailbox Mismatch

Use the mismatch fixture to confirm the test-mailbox adapter rejects packets that do not match the configured sender or recipient.

## Fixture

```text
tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json
```

The fixture intentionally uses:

- sender: `wrong-sender@example.com`
- recipient: `wrong-recipient@example.com`

## Environment

```powershell
$env:REGENT_EMAIL_PROVIDER="test-mailbox"
$env:REGENT_TEST_MAILBOX_SENDER="sender@example.com"
$env:REGENT_TEST_MAILBOX_ADDRESS="founder@example.com"
```

## Expected Rejection

- `accepted: false`
- `captured: false`
- `sent: false`
- `booked: false`
- issue: `Sender email must match REGENT_TEST_MAILBOX_SENDER.`
- issue: `Recipient email must match REGENT_TEST_MAILBOX_ADDRESS.`

The sanitized audit entry should preserve sender and recipient metadata but must not store the message body.
