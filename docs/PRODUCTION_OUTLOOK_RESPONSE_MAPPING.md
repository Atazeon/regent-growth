# Production Outlook Response Mapping Preview

Use this endpoint to preview how a Microsoft Graph send response would map into Regent Growth provider result fields.

```text
POST http://127.0.0.1:5195/outlook/response-mapping-preview
```

Example success body:

```json
{
  "id": "outlook-message-1",
  "conversationId": "outlook-conversation-1"
}
```

The preview response uses `regent-growth.outlook-response-mapping-preview.v1`; the nested mapping uses `regent-growth.outlook-response-mapping.v1`.

Mapped fields include:

- `accepted`
- `sent: false`
- `booked: false`
- `providerMessageId`
- `conversationId`
- `retryable`
- `issueCount`
- `issues`
- `rawResponseStored: false`

## Retryable Errors

The preview marks Microsoft Graph errors as retryable when the error code is:

- `TooManyRequests`
- `ServiceUnavailable`
- `Timeout`
- `MailboxUnavailable`

## Boundary

This endpoint is not send approval. It does not store raw Outlook responses and must keep `canSend: false`, `sentEnabled: false`, and `bookedEnabled: false`.
