# Production Test-Mailbox Status

Use this endpoint to confirm the test-mailbox adapter has the required local environment before capture tests.

## Endpoint

```text
GET http://127.0.0.1:5195/test-mailbox/status
```

## Required Environment

- `REGENT_TEST_MAILBOX_SENDER`
- `REGENT_TEST_MAILBOX_ADDRESS`

## Status Meaning

- `configured: true` means both test-mailbox environment variables are present.
- `missingEnv` lists any missing local variables.
- `canSend: false` means the adapter still cannot send real email.
- `sentEnabled: false` means no send action is enabled.
- `bookedEnabled: false` means the email path cannot create calendar bookings.

This status endpoint is only a local configuration check. It is not approval to enable Gmail, Outlook, or custom provider sending.
