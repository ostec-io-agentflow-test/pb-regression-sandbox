# PBREG box-8 R4 Automatic Design Spine

## Scope and traceability

This spine defines the automatic PRD scope only.

| Requirement | Contract |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON with numeric `total` and `done` counts. |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a JSON message. |

### AD-1 Preserve the HTTP-to-domain boundary

Binds: `src/server.js` owns route selection, request parsing, HTTP status selection, and JSON serialization; `src/todos.js` owns the in-memory todo collection and operations over it.
Prevents: Route handlers from directly reaching into module-private todo state or returning unencoded domain values.
Rule: New statistics logic is exposed by an operation in `src/todos.js` and `src/server.js` calls that operation only for `GET /todos/stats`.

### AD-2 Derive statistics from the authoritative todo collection

Binds: REQ-PB-003 to a `GET /todos/stats` handler that returns HTTP 200 with exactly the JSON object shape `{ "total": <count>, "done": <count> }`, where `total` is the number of stored todos and `done` is the number whose `done` field is `true`.
Prevents: Cached counters, pagination-dependent counts, and counts derived from only the current response page.
Rule: Each statistics response is calculated from the complete in-memory collection at request time, and both returned values are non-negative integers.

### AD-3 Reject overlength titles before mutation

Binds: REQ-PB-004 to the `POST /todos` request path and a title maximum of 200 characters.
Prevents: Persisting a todo when its title contains more than 200 characters or returning HTTP 201 for that invalid request.
Rule: If the supplied title is longer than 200 characters, the handler returns HTTP 400 with a JSON object containing a human-readable error message and does not call `addTodo`.

### AD-4 Verify observable API contracts

Binds: Automated tests to the two public HTTP contracts, including empty and populated statistics, completed and incomplete todo counts, a 200-character accepted title, and a 201-character rejected title.
Prevents: A passing implementation that changes status codes, response JSON shape, count semantics, or mutates state on rejected input.
Rule: Tests exercise the exported HTTP handler and assert HTTP status, parsed JSON body, and absence of a newly stored todo after a rejected overlength title.
