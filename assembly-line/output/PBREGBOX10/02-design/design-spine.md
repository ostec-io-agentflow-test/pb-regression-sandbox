# PBREG box-10 R4 automatic — Design spine

## Scope and traceability

This spine defines the automatic requirement set in the retained PRD.

| Requirement | Design coverage |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON counts for all todos and completed todos. |
| REQ-PB-004 | `POST /todos` rejects a title whose length exceeds 200 characters with HTTP 400 and a JSON message. |

Existing `GET /todos`, normal valid `POST /todos`, `completeTodo`, pagination, and 404 behaviour remain outside this design change.

### AD-1 Keep HTTP route selection in the existing request handler
Binds: `src/server.js` owns method-and-path dispatch for `GET /todos/stats` and continues to use the existing JSON response helper.
Prevents: A second server, router dependency, or route-specific response serialization from being introduced for REQ-PB-003.
Rule: When a request method is `GET` and its pathname is `/todos/stats`, the handler must return HTTP 200 with the statistics object before reaching the 404 response.

### AD-2 Compute statistics from the todo domain collection
Binds: `src/todos.js` exposes a statistics operation that derives `total` from every stored todo and `done` from stored todos whose `done` property is `true`.
Prevents: HTTP-layer counters, independently maintained completion totals, and counts limited to a paginated `listTodos()` response.
Rule: The statistics operation must return exactly an object with numeric `total` and `done` properties, where `total` is the current number of stored todos and `done` is the current number of stored todos with `done === true`.

### AD-3 Preserve statistics as a read-only representation
Binds: The stats endpoint reads the in-memory collection through the domain statistics operation and does not call `addTodo` or `completeTodo`.
Prevents: A stats request from changing todo identifiers, todo membership, titles, or completion state.
Rule: Repeated `GET /todos/stats` requests without intervening successful todo mutations must return the same `total` and `done` values.

### AD-4 Validate title length at the POST boundary before mutation
Binds: The `POST /todos` request path evaluates the parsed request body's `title` before invoking `addTodo`.
Prevents: A title longer than 200 characters from being stored, assigned an identifier, or affecting the stats counts.
Rule: If the submitted `title` is a string whose JavaScript `length` is greater than 200, the handler must return HTTP 400 with a JSON object containing a non-empty `message` property and must not call `addTodo`.

### AD-5 Retain the established success contract for valid creation
Binds: A `POST /todos` title that is not a string longer than 200 characters follows the existing creation path and returns the created todo with HTTP 201.
Prevents: The upper-bound validation from changing the response status or persisted representation for titles of 200 characters or fewer.
Rule: A string title whose JavaScript `length` is 200 or less must be passed unchanged to `addTodo`, and its successful response must remain HTTP 201.

### AD-6 Prove both API behaviour and mutation safety with automated tests
Binds: Automated tests exercise the HTTP handler for the stats route and overlength POST rejection, and domain tests exercise statistics over incomplete and completed todos.
Prevents: A route that exists but returns an incorrect JSON shape, a validation response that still mutates state, or a regression that counts completed todos incorrectly.
Rule: The automated test suite must assert an empty-state stats response of `{ "total": 0, "done": 0 }`, a mixed-state stats response whose done count excludes incomplete todos, an over-200-character POST response of HTTP 400 with a non-empty message, and unchanged stats before and after that rejected POST.
