# Production Provider Adapter Checklist

Use this checklist before changing any provider adapter from skeleton-only to send-capable.

Machine-readable export: `docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json`.

## Shared Gates

- Keep `automationAllowed: false` required.
- Keep human review required.
- Keep compliance review required.
- Keep automatic booking disabled from the email send endpoint.
- Require release gate evidence.
- Require suppression-list checks before provider calls.
- Require unsubscribe or opt-out text before provider calls.
- Require sender identity matching the authenticated provider account.
- Require test-account replay and dry-run evidence.
- Require before-send and after-send audit records.
- Require provider rate limits per sender and per recipient domain.
- Keep message body out of audit exports unless explicit encrypted storage is added.

## Gmail Adapter

- Confirm `REGENT_GMAIL_CLIENT_ID`, `REGENT_GMAIL_CLIENT_SECRET`, and `REGENT_GMAIL_REFRESH_TOKEN`.
- Use a dedicated test mailbox first.
- Verify OAuth consent and mail send scope.
- Reject packets where `packet.provider.senderEmail` does not match the Gmail account.
- Store refresh tokens server-side only.

## Outlook Adapter

- Confirm `REGENT_OUTLOOK_CLIENT_ID`, `REGENT_OUTLOOK_CLIENT_SECRET`, `REGENT_OUTLOOK_TENANT_ID`, and `REGENT_OUTLOOK_REFRESH_TOKEN`.
- Use a dedicated test mailbox first.
- Verify Microsoft Graph mail send scope.
- Reject packets where `packet.provider.senderEmail` does not match the Outlook account.
- Store refresh tokens server-side only.

## Custom Adapter

- Confirm `REGENT_CUSTOM_SEND_URL` and `REGENT_CUSTOM_SEND_KEY`.
- Require the custom endpoint to accept `regent-growth.reviewed-send.v1`.
- Require the custom endpoint to return provider message IDs only after provider confirmation.
- Require provider-side suppression, rate limit, and audit evidence.

## Release Rule

Do not set `canSend: true` for any adapter until every shared gate and provider-specific gate above has test coverage.
