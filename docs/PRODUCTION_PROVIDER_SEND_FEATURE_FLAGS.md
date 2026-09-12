# Provider Send Feature Flag Contract

Use this endpoint to inspect the send feature flags required before Gmail or Outlook can ever move from blocked to send-capable.

```text
GET http://127.0.0.1:5195/provider-send-feature-flags?provider=gmail
GET http://127.0.0.1:5195/provider-send-feature-flags?provider=outlook
```

The response uses `regent-growth.provider-send-feature-flag-contract.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Gmail Flags

The Gmail contract requires:

- `REGENT_GMAIL_SEND_ADAPTER_REVIEWED`
- `REGENT_GMAIL_SUPPRESSION_REVIEWED`
- `REGENT_GMAIL_UNSUBSCRIBE_REVIEWED`
- `REGENT_GMAIL_AUDIT_REVIEWED`
- `REGENT_GMAIL_RETRY_REVIEWED`
- `REGENT_GMAIL_SETUP_APPROVED`
- `REGENT_GMAIL_CAN_SEND`

## Outlook Flags

The Outlook contract requires:

- `REGENT_OUTLOOK_SEND_ADAPTER_REVIEWED`
- `REGENT_OUTLOOK_SUPPRESSION_REVIEWED`
- `REGENT_OUTLOOK_UNSUBSCRIBE_REVIEWED`
- `REGENT_OUTLOOK_AUDIT_REVIEWED`
- `REGENT_OUTLOOK_RETRY_REVIEWED`
- `REGENT_OUTLOOK_SETUP_APPROVED`
- `REGENT_OUTLOOK_CAN_SEND`

The response reports `enabledFlags` and `missingFlags` for the selected provider.

This contract is not send approval. A provider `canSend` flag may only change after every required flag is true and a separate implementation approval is recorded.
