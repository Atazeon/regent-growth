# Production Gmail Provider Run Packet

Use this endpoint to export the full Gmail provider setup checklist before any live Gmail send implementation.

```text
GET http://127.0.0.1:5195/gmail/run-packet
```

The response uses `regent-growth.gmail-provider-run-packet.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Included Endpoints

The run packet lists:

- `/gmail/status`
- `/gmail/preflight`
- `/gmail/audit-preview`
- `/gmail/audit-preview/export`
- `/gmail/retry-preview`
- `/gmail/response-mapping-preview`
- `/gmail/suppression-preflight`
- `/gmail/unsubscribe-preflight`
- `/gmail/send-readiness`
- `/gmail/send`

## Required Proof

Before implementing Gmail sending, confirm:

- Gmail environment status export reviewed.
- Reviewed packet preflight passes validation.
- Suppression preflight confirms recipient is not suppressed.
- Unsubscribe preflight confirms opt-out language.
- Audit preview export confirms `bodyContentStored is false`.
- Response mapping preview covers success and retryable errors.
- Blocked send endpoint returns `403` with `sent false`.

This packet is not send approval. It is only the local proof checklist for the later Gmail implementation task.
