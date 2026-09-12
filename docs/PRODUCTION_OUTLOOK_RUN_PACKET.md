# Production Outlook Provider Run Packet

Use this endpoint to export the full Outlook provider setup checklist before any live Outlook send implementation.

```text
GET http://127.0.0.1:5195/outlook/run-packet
```

The response uses `regent-growth.outlook-provider-run-packet.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Included Endpoints

The run packet lists:

- `/outlook/status`
- `/outlook/preflight`
- `/outlook/audit-preview`
- `/outlook/audit-preview/export`
- `/outlook/retry-preview`
- `/outlook/response-mapping-preview`
- `/outlook/suppression-preflight`
- `/outlook/unsubscribe-preflight`
- `/outlook/send-readiness`
- `/outlook/send`

## Required Proof

Before implementing Outlook sending, confirm:

- Outlook environment status export reviewed.
- Reviewed packet preflight passes validation.
- Suppression preflight confirms recipient is not suppressed.
- Unsubscribe preflight confirms opt-out language.
- Audit preview export confirms `bodyContentStored is false`.
- Response mapping preview covers success and retryable errors.
- Blocked send endpoint returns `403` with `sent false`.

This packet is not send approval. It is only the local proof checklist for the later Outlook implementation task.
