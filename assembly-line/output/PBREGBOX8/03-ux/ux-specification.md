# PBREG box-8 automatic — UX specification

## Purpose and scope

This specification defines the consumer experience for the two automatic API additions in the source PRD. It is limited to **REQ-PB-003** and **REQ-PB-004**. The API is the product surface: its routes, response shapes, status codes, and actionable error messaging are the user experience.

| Requirement | Experience outcome |
| --- | --- |
| REQ-PB-003 | A caller can obtain an immediately usable aggregate of all todos and completed todos from `GET /todos/stats`. |
| REQ-PB-004 | A caller submitting a title over the 200-character limit receives a clear validation response and no todo is created. |

## Users and jobs

| User | Job | Success signal |
| --- | --- | --- |
| Todo dashboard or reporting client | Show workload and completion progress without fetching and counting every todo. | It reads `total` and `done` from one successful response. |
| Todo-creation client | Create a todo while giving a person an understandable correction when the title is too long. | It preserves the entered title, presents the message, and asks for a title of 200 characters or fewer. |

## Design tokens

color-api-success: #0b6b4f
color-api-error: #b42318
color-api-text: #172b4d
color-api-surface: #ffffff
color-api-border: #d0d5dd
space-compact: 8px
space-standard: 16px
radius-control: 4px
font-body: 16px
font-code: 14px
focus-ring: 0 0 0 3px #84adff

When a client renders these API states in a human-facing surface, use {color-api-success} for successful aggregate status, {color-api-error} for validation feedback, {color-api-text} on {color-api-surface}, and {color-api-border} for boundaries. Keep feedback separated by at least {space-standard}; controls use {radius-control}, body text uses {font-body}, code values use {font-code}, and keyboard focus uses {focus-ring}.

## Statistics retrieval — REQ-PB-003

### Primary flow

1. The consumer requests `GET /todos/stats`.
2. The service responds with HTTP `200` and JSON containing numeric `total` and `done` fields.
3. The consumer uses `total` as the count of every todo and `done` as the count of completed todos.
4. The consumer can derive outstanding work as `total - done`; it must not expect an extra field for that value.

### Response contract

| Condition | HTTP status | JSON fields | Consumer presentation |
| --- | --- | --- | --- |
| Stats available, including no todos | `200` | `total`: non-negative integer; `done`: non-negative integer | Treat as fresh aggregate data. A zero/zero result is a valid empty state, not an error. |

Example success payload:

```json
{
  "total": 12,
  "done": 7
}
```

### Content and state guidance

- Label values “Total todos” and “Completed todos” in a human-facing client; do not rename `done` in the wire response.
- Present `0` clearly for both fields when the list is empty.
- Do not imply that this endpoint returns todo records, pagination, or per-item completion detail. Those belong to the existing todo-list experience.
- Preserve the integer values exactly; clients should not turn `done` into a percentage when `total` is zero.

## Todo title validation — REQ-PB-004

### Primary flow

1. The consumer submits `POST /todos` with a `title` that is 200 characters or fewer.
2. The normal create-todo success experience continues unchanged.
3. Before sending, a human-facing client may show a live character count, but server validation is authoritative.

### Validation-error flow

1. The consumer submits `POST /todos` with a `title` longer than 200 characters.
2. The service responds with HTTP `400` and a JSON error message explaining that the title exceeds the 200-character maximum.
3. The client keeps the submitted title available for correction, associates the message with the title input, and does not show a created-todo confirmation.
4. After the title is reduced to 200 characters or fewer, the client may resubmit it.

### Response contract

| Condition | HTTP status | JSON fields | Consumer presentation |
| --- | --- | --- | --- |
| Title has at most 200 characters | Existing create success status and payload | Existing todo payload | Continue the normal success path. |
| Title has more than 200 characters | `400` | A message field describing the maximum of 200 characters | Show the returned message inline with the title field and in any response/error summary. |

Example validation payload:

```json
{
  "message": "Title must be 200 characters or fewer."
}
```

### Error copy and accessibility

- Required message meaning: the title is too long and the maximum is 200 characters. The server’s returned message is the source of truth.
- In a human-facing form, expose the error programmatically to assistive technology, move focus to the title field or error summary after submission, and retain the person’s entry.
- Use {color-api-error} together with text and an error indicator; color alone must not carry the invalid state.
- Give the title field `aria-invalid="true"` while the error is active and associate it with the message through `aria-describedby`.
- If a character counter is provided, announce it without interrupting typing; it supports, but does not replace, the server response.

## Boundary conditions and recovery

| Scenario | Expected experience |
| --- | --- |
| No todos exist | `GET /todos/stats` returns `200` with `total: 0` and `done: 0`. |
| All todos are complete | `done` equals `total`; this remains a normal success state. |
| Title is exactly 200 characters | It is valid and follows the existing create success flow. |
| Title is 201 characters | It is invalid and returns `400` with a message; no todo is added. |
| A client cannot parse the response | Treat it as a transport/integration failure, preserve any entered title, and offer a retry without claiming the todo was created. |

## Non-goals

- No change is specified to the existing todo-list route, pagination, completion action, or the existing successful create payload.
- No stats filtering, date ranges, percentages, charts, or additional aggregate fields are introduced.
- The required limit is an API validation rule; client-side counting is optional enhancement only.

## Acceptance trace

| Requirement | UX-verifiable acceptance criteria |
| --- | --- |
| REQ-PB-003 | Requesting `GET /todos/stats` returns `200` with numeric `total` and `done`; empty and all-complete data are represented as valid aggregates. |
| REQ-PB-004 | Posting a title longer than 200 characters returns `400` with a message; the client can display that message, retain the input, and does not present creation as successful. |
