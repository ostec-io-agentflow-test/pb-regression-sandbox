# PBREG box-8: Todo API guardrails and status visibility

## Press release

**A small, predictable todo API now makes its current workload visible and prevents oversized titles from entering the list.**

Teams using the manual todo API can ask for a compact summary of the current list at `GET /todos/stats`. The endpoint responds successfully with JSON that reports the total number of todos and how many are complete. This gives an operator or manual tester an immediate view of work volume and completion without having to count records from the paginated list response.

When creating a todo, the API now protects the list from impractically long titles. A `POST /todos` request whose title exceeds 200 characters is refused with HTTP 400 and a clear message. Titles of 200 characters or fewer continue through the existing creation flow, preserving the simple API experience for valid requests.

These additions are deliberately narrow: they add no authentication, persistence, pagination changes, or new todo state transitions. The existing `GET /todos` and valid `POST /todos` behaviors remain the source of the list and creation experience.

## Customer problem

Manual users currently have to inspect and count todo records to understand whether work exists and how much of it is done. They can also submit a title with no stated upper bound, allowing an oversized value to enter a small, display-oriented todo list.

## Target users

- Manual API users who need a quick operational count of all and completed todos.
- Manual API users who create todos and need immediate feedback when a title is too long.
- Testers verifying the API through direct HTTP requests.

## User experience

### See todo status at a glance

1. A user sends `GET /todos/stats`.
2. The API reads the same current in-memory todo collection used by the list endpoint.
3. It returns HTTP 200 with JSON exactly shaped as `{ "total": <count>, "done": <count> }`.
4. `total` is the count of all todos; `done` is the count whose `done` field is true.

Example response:

```json
{ "total": 3, "done": 1 }
```

### Keep titles within the supported limit

1. A user sends `POST /todos` with a JSON `title` value.
2. If the title is longer than 200 characters, the API returns HTTP 400 with a human-readable JSON message explaining that the title is too long.
3. The rejected request does not create a todo or change the stats.
4. A title of exactly 200 characters is accepted by the existing creation behavior; so is any shorter title.

Example invalid response shape:

```json
{ "error": "title must be 200 characters or fewer" }
```

## Requirement traceability

| Requirement | Concept commitment | Observable manual check |
| --- | --- | --- |
| REQ-PB-001 | Provide `GET /todos/stats` with HTTP 200 and JSON `total` and `done` counts. | Create/complete todos, request `/todos/stats`, and confirm both counts. |
| REQ-PB-002 | Refuse `POST /todos` titles longer than 200 characters with HTTP 400 and a message. | Post a 201-character title; confirm 400 and an explanatory message, then confirm no todo was added. |

## FAQ

### Is this a new reporting system?

No. It is a lightweight count over the current todo collection, intended for a manual request to the existing API.

### Does the stats endpoint change pagination or the todo list response?

No. `GET /todos/stats` is a separate summary route. Existing `GET /todos` pagination remains unchanged.

### What qualifies as done?

A todo is counted as done when its existing `done` field is `true`.

### Does a title at the limit fail?

No. The limit is exclusive: only a title longer than 200 characters is rejected. A 200-character title is valid.

### What happens to rejected titles?

They are not stored and do not affect totals or done counts.

### Are other validations included?

No. This concept only commits to the specified maximum title length. Behavior for missing, non-string, or otherwise malformed titles is outside this requirement set and must not be implied by this change.

## Scope and non-goals

In scope are only the two PRD commitments above, traced to `REQ-PB-001` and `REQ-PB-002`.

Out of scope: persistence, authentication, changes to pagination, changes to completion semantics, new filtering/reporting dimensions, and validation rules beyond rejecting titles longer than 200 characters.

## Assumptions and open questions

Assumptions:

- Counts are calculated from the current in-memory todo collection, consistent with the existing sandbox implementation.
- An error response can use the existing JSON error convention; the PRD requires a message but does not prescribe the field name or exact text.

Open questions:

- None for this concept stage. Exact response wording can be settled during implementation while retaining the required HTTP 400 and explanatory message.
