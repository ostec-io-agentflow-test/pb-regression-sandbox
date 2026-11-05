# PBREG box-4: Todo API summary and title guardrails

**Stage:** CONCEPT  
**Programme:** `prg-1204c31e-c386-46a8-8ec4-6128ddd60616`  
**Stage run:** `srun-5f7143ba-79b5-4c98-8217-54a5029dcd20`

## Press release

Today, the pb-regression-sandbox todo API gains two small, dependable behaviours that make it easier for API consumers to understand a todo collection and to submit usable todo titles. Consumers can retrieve an at-a-glance count of all todos and completed todos, and they receive an immediate, clear rejection if they try to create a todo whose title exceeds 200 characters.

The new `GET /todos/stats` endpoint returns a JSON summary with `total` and `done` counts. This lets a client show progress without downloading and calculating from the full list itself. The count represents the todos currently held by the API: `total` is every todo, while `done` is the subset marked complete.

`POST /todos` now protects the collection from impractically long titles. A title longer than 200 characters receives HTTP 400 and an explanatory message; a title of 200 characters or fewer continues through the normal creation flow. Clients can surface the server’s feedback and correct the title before retrying.

These behaviours preserve the API’s compact JSON style and give callers predictable outcomes for the two supported use cases: progress reporting and title-length validation.

## Customer problem

API consumers need a lightweight way to display todo progress and a server-side limit that prevents unusually long titles from entering the shared collection. Reconstructing progress from a list response duplicates work in every client, while accepting oversized titles produces inconsistent, difficult-to-render data.

## Scope and traceability

| Requirement | Concept commitment |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 with JSON `{ "total": <count>, "done": <count> }`. |
| REQ-PB-004 | `POST /todos` refuses a title longer than 200 characters with HTTP 400 and a message. |

## Customer experience

### Get collection progress

1. A client calls `GET /todos/stats`.
2. The API responds with HTTP 200 and JSON containing numeric `total` and `done` fields.
3. The client uses `total` as the number of current todos and `done` as the number currently completed.

Example response:

```json
{ "total": 8, "done": 3 }
```

### Create a todo with a bounded title

1. A client sends `POST /todos` with a title.
2. If the title contains 200 or fewer characters, creation follows the existing successful flow.
3. If the title contains more than 200 characters, the API responds with HTTP 400 and a clear message explaining the limit; it does not create a todo.

## Frequently asked questions

### Does the stats endpoint change the existing todo list response?

No. It is a separate `GET /todos/stats` endpoint. The existing listing experience remains the place to retrieve individual todo records.

### What do the two stats fields mean?

`total` is the count of all current todos. `done` is the count of current todos whose completed state is true. Both are counts, not percentages.

### What happens at the title boundary?

A 200-character title is accepted. A 201-character title is rejected with HTTP 400 and a message. The requirement does not specify exact message wording or a fixed error-object schema; the implementation should make the length limit clear in the JSON response.

### Is validation only a client-side concern?

No. The API enforces the limit so every caller gets the same protection, even when it has no client-side validation.

### Are other title rules being introduced?

No. This concept adds only the maximum-length rule requested by REQ-PB-004. It does not introduce additional requirements for title content, uniqueness, or formatting.

## Success criteria

- A request to `GET /todos/stats` consistently returns HTTP 200 with the specified `total` and `done` JSON fields (REQ-PB-003).
- A title longer than 200 characters produces HTTP 400 and an explanatory message, without a created todo (REQ-PB-004).
- A title at the 200-character boundary retains the existing successful creation behaviour (REQ-PB-004).
- The stats counts accurately distinguish all todos from completed todos (REQ-PB-003).

## Non-goals

- Changing pagination or the existing `GET /todos` response.
- Changing how a todo becomes completed.
- Adding persistence, authentication, analytics, bulk operations, or new title rules beyond the requested maximum length.
- Defining an exact error-message string or additional error-response fields not prescribed by the PRD.

## Decisions, assumptions, and open questions

**Decision:** Deliver the two retained-PRD requirements only: REQ-PB-003 and REQ-PB-004.

**Assumption:** The existing JSON todo API remains the integration surface; the new stats route is additive.

**Open questions:** None for the concept stage. Exact validation-message wording can be selected during implementation as long as it is clear and accompanies HTTP 400.
