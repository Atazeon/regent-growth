# Production Provider Decision Record

Use this endpoint after choosing a provider from `/provider-selection-plan`.

```text
GET http://127.0.0.1:5195/provider-decision-record?provider=gmail
```

Supported provider values are `gmail`, `outlook`, and `custom`. If no provider is passed, the middleware uses `REGENT_SELECTED_EMAIL_PROVIDER` or the current selection-plan recommendation.

The response uses `regent-growth.real-provider-decision-record.v1` and records:

- `provider`
- `requestedProvider`
- `validProvider`
- `selectionPlanEndpoint`
- `preflightEndpoint`
- `requiredDecisionInputs`
- `requiredImplementationBeforeSend`

Required no-send fields:

- `approvedForRealSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Required Before Send

Do not enable `canSend` for the selected provider until the decision record is paired with:

- Provider-specific send adapter
- Suppression-list enforcement
- Unsubscribe or opt-out enforcement
- Provider audit logging
- Provider retry and failure handling
- Manual setup review approval

An invalid provider should return `validProvider: false` and include a blocked reason naming the allowed provider set.
