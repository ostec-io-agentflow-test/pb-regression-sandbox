# PBREG box-5 R4 manual — PR/FAQ

## Press release

**pb-regression-sandbox makes a todo list’s progress and input limits explicit.**

Users of the small todo API can now ask for one concise progress summary and can
rely on invalidly long titles being rejected before a todo is created. `GET
/todos/stats` returns the total number of todos and the number marked complete;
`POST /todos` accepts titles through 200 characters and returns a clear client
error for a longer one. The existing paginated list and valid todo creation
continue to work as they do today.

This delivers a deliberately small, manual API addition. It is not a new
reporting system, a persistence change, or a redesign of the todo resource.

## Customer FAQ

### What will `GET /todos/stats` return?

It will respond with HTTP 200 and a JSON object of this exact shape:

```json
{ "total": 3, "done": 1 }
```

`total` is the number of todos currently held by the API. `done` is the subset
whose `done` value is `true`. With no todos, both values are zero.

**Traceability:** REQ-PB-001 — “GET /todos/stats returns 200 with JSON
`{\"total\": <count>, \"done\": <count>}` (manual).”

### What happens if I create a todo with a title longer than 200 characters?

The API will return HTTP 400 with a JSON error message explaining that the title
is too long. It will not create a todo or advance the generated ID for that
request. A title of exactly 200 characters remains valid and receives the
existing successful-create response.

**Traceability:** REQ-PB-002 — “POST /todos refuses a title longer than 200
characters with 400 and a message (manual).”

### Does this change existing successful requests?

No. Valid `POST /todos` requests still create a todo with the current response
shape and status, and `GET /todos` retains its current pagination behavior. The
new stats endpoint is additive.

### What is not included?

This release does not add authentication, filtering, persistent storage,
per-user statistics, bulk operations, title normalization, or any different
validation rule beyond the specified maximum title length.

## Implementation-facing FAQ

### Where should counting live?

The route should obtain its values from the same todo collection used by the
existing list and completion operations. A focused stats accessor keeps the HTTP
handler from knowing storage details and guarantees `total` and `done` are
calculated from the same current in-memory state.

### How should validation behave?

Validate the submitted title before calling the creation operation. A title
whose character length is greater than 200 must produce 400 and a machine-
readable JSON message; the exact error field name is not prescribed by the PRD.
Malformed JSON and other currently unspecified validation behavior are outside
this requirement set and should not be broadened during this manual change.

### What proves the requirements manually?

1. Start with an empty process and request `GET /todos/stats`; expect 200 and
   `{ "total": 0, "done": 0 }`.
2. Create todos, complete one through the existing mechanism, then request
   stats; expect `total` to include every created todo and `done` to include
   only completed ones.
3. Submit a `POST /todos` payload containing a 201-character title; expect 400
   plus an explanatory JSON message, then confirm it is absent from the list and
   stats.
4. Submit a 200-character title; expect the existing successful create result.

## Decisions and assumptions

| Item | Decision |
| --- | --- |
| Scope | Only REQ-PB-001 and REQ-PB-002 from the retained PRD. |
| Compatibility | Existing successful list and create contracts remain unchanged. |
| Boundary | The maximum is inclusive: 200 is valid; 201 is rejected. |
| Error contract | Status and explanatory message are required; a specific JSON error schema is not. |
| Data source | Counts describe the API’s current in-memory todo collection. |

## Open questions

None for the concept stage. The PRD intentionally leaves the error-object field
name unspecified; implementation may choose a concise JSON message while
preserving the required 400 status.
