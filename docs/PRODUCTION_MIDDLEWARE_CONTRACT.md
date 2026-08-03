# Production Provider Middleware Contract

This contract defines the middleware Regent Growth should call when real provider sending is eventually implemented. The current app does not call this contract for real sends.

## Endpoint Shape

```text
POST /reviewed-send
Content-Type: application/json
Authorization: Bearer <server-side-token>
```

## Request Body

```json
{
  "packet": {
    "schemaVersion": "regent-growth.reviewed-send.v1",
    "automationAllowed": false,
    "safety": {
      "humanReviewRequired": true,
      "automaticSendDisabled": true,
      "automaticBookingDisabled": true,
      "complianceReviewRequired": true
    },
    "provider": {
      "selectedProvider": "gmail",
      "senderEmail": "sender@example.com"
    },
    "message": {
      "to": "prospect@example.com",
      "subject": "Subject",
      "body": "Reviewed email body"
    },
    "calendar": {
      "bookingLink": "https://cal.example/link"
    }
  },
  "releaseGate": {
    "ready": true,
    "checkedAt": "2026-08-03T00:00:00.000Z"
  }
}
```

## Middleware Requirements

- Reject any packet where `automationAllowed` is not `false`.
- Reject any packet without human review, compliance review, recipient, subject, body, and sender.
- Reject any packet when local release gate evidence is missing.
- Apply provider-side rate limits and suppression-list checks.
- Store a send attempt audit record before and after provider calls.
- Return provider IDs only after the provider confirms the send.
- Never create calendar bookings from the email send endpoint.

## Response Body

```json
{
  "accepted": true,
  "sent": true,
  "booked": false,
  "provider": "gmail",
  "providerMessageId": "provider-message-id",
  "sentAt": "2026-08-03T00:00:00.000Z",
  "issues": []
}
```

## Error Response

```json
{
  "accepted": false,
  "sent": false,
  "booked": false,
  "issues": ["Human review is required."]
}
```
