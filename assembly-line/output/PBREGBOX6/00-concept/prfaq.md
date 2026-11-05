# PBREG box-6: Todo API additions — PR/FAQ

**Stage:** CONCEPT
**Programme:** `prg-03026a39-1d06-4f2f-a310-c589a7c67d40`
**Stage run:** `srun-516933ba-92ff-4525-81d4-94d9934bbbcc`
**Requirements:** REQ-PB-003, REQ-PB-004

## Press release

The pb-regression-sandbox todo API will expose a small summary endpoint and
will protect the create endpoint from overlong titles. Consumers can request
`GET /todos/stats` to receive the number of todos and the number completed,
without downloading the todo list. Creating a todo with a title over 200
characters will return a clear client error instead of creating invalid data.

This is intentionally a narrow extension of the existing throwaway API. The
current list endpoint, pagination behaviour, successful create response, and
todo representation remain compatible.

## Customer experience

### Todo statistics

`GET /todos/stats` returns HTTP 200 and JSON with exactly these counters:

```json
{ "total": 3, "done": 1 }
```

`total` is the count of all stored todos. `done` is the count whose `done`
field is `true`. With no todos, the endpoint returns `{ "total": 0,
"done": 0 }`.

**Traceability:** REQ-PB-003 — “GET /todos/stats returns 200 with JSON
`{\"total\": <count>, \"done\": <count>}` (auto).”

### Title-length validation

`POST /todos` continues to create a todo with HTTP 201 when its title is at
most 200 characters. A title longer than 200 characters returns HTTP 400 with
a JSON error message, for example:

```json
{ "error": "title must be 200 characters or fewer" }
```

The rejected request makes no change to the stored todo collection.

**Traceability:** REQ-PB-004 — “POST /todos refuses a title longer than 200
characters with 400 and a message (auto).”

## FAQ

### Why a dedicated statistics endpoint?

Callers that only need counts should not have to fetch and paginate the todo
collection. The endpoint derives both values from the same in-memory list used
by the current API, so it introduces no new persistence or synchronization
model.

### What counts as done?

Only todos whose existing `done` boolean is `true` are included in `done`.
All stored todos are included in `total`.

### Is the 200-character boundary accepted?

Yes. REQ-PB-004 only rejects titles longer than 200 characters. A 200-character
title is valid; a 201-character title is rejected.

### What does “a message” mean for invalid input?

The response body will be JSON and include a human-readable error value that
states the title-length limit. The precise wording is not a contract; HTTP 400
and the presence of an explanatory message are.

### Does this change existing endpoints?

No. `GET /todos` retains its existing paginated response. Valid `POST /todos`
requests retain the existing 201 response and todo shape. No authentication,
database, schema migration, or client changes are part of this work.

## Delivery and verification

Implementation will add the route and validation at the HTTP boundary, using
the existing todo module as the single source of truth for counts. Automated
tests will demonstrate:

- `GET /todos/stats` returns 200 with correct `total` and `done` counts,
  including the empty collection.
- A valid 200-character title creates a todo with 201.
- A 201-character title returns 400, includes an error message, and does not
  increase the todo count.

## Out of scope

- Manual requirement variants REQ-PB-001 and REQ-PB-002.
- Validation rules other than the maximum title length.
- Changes to pagination, persistence, authentication, or todo completion
  semantics.
