# Production Gmail Response Mapping Preview

Use this endpoint to preview how a Gmail API response would map into Regent Growth provider result fields.

```text
POST http://127.0.0.1:5195/gmail/response-mapping-preview
```

Example success body:

```json
{
  "id": "gmail-message-1",
  "threadId": "gmail-thread-1"
}
```

The preview response uses `regent-growth.gmail-response-mapping-preview.v1`; the nested mapping uses `regent-growth.gmail-response-mapping.v1`.

Mapped fields include:

- `accepted`
- `sent: false`
- `booked: false`
- `providerMessageId`
- `threadId`
- `retryable`
- `issueCount`
- `issues`
- `rawResponseStored: false`

## Retryable Errors

The preview marks Gmail errors as retryable when the error reason or code is:

- `rateLimitExceeded`
- `backendError`
- `internalError`

## Boundary

This endpoint is not send approval. It does not store raw Gmail responses and must keep `canSend: false`, `sentEnabled: false`, and `bookedEnabled: false`.
