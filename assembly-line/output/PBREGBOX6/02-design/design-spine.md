# PBREG box-6 R4 automatic design spine

## Scope and traceability

This spine delivers only the automatic requirement set from the retained PRD.

| Requirement | Design coverage |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON `{"total": <count>, "done": <count>}`. |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a JSON message. |

### AD-1 Keep statistics as a read-only HTTP resource
Binds: REQ-PB-003; `src/server.js`; `GET /todos/stats`.
Prevents: applying pagination intended for `GET /todos`, requiring a request body, or changing todo state while reading statistics.
Rule: The request handler shall dispatch `GET /todos/stats` before the fallback response, call the statistics query, and return HTTP 200 through the existing JSON response helper with exactly the `total` and `done` fields.

### AD-2 Derive counts from the authoritative todo collection
Binds: REQ-PB-003; `src/todos.js`; each todo's `done` boolean.
Prevents: separately maintained counters that drift after future todo mutations, counting only the current page, or treating a missing `done` value as completed.
Rule: The todo domain shall expose a statistics query that calculates `total` from all stored todos and calculates `done` by counting only stored todos whose `done` value is `true`; it shall return a new JSON-serializable object and shall not mutate the collection.

### AD-3 Reject overlong titles before creating a todo
Binds: REQ-PB-004; `POST /todos`; maximum title length of 200 characters.
Prevents: creation of an invalid todo, incrementing the todo identifier for a rejected request, or returning HTTP 201 for a title longer than 200 characters.
Rule: After parsing the POST JSON body and before calling the todo creation operation, the request handler shall check whether `title` is a string with length greater than 200; for that condition it shall return HTTP 400 with JSON containing a non-empty `error` message and shall not call the creation operation.

### AD-4 Preserve existing successful-create behavior and response conventions
Binds: REQ-PB-004; `src/server.js`; the existing `send` JSON helper.
Prevents: changing the HTTP 201 response for titles of 200 characters or fewer, emitting a non-JSON validation response, or exposing an inconsistent error payload shape.
Rule: A POST request whose title is not a string longer than 200 characters shall continue through the existing creation path and return HTTP 201 with the created todo; both the validation response and the statistics response shall use the existing JSON content type and serializer.

### AD-5 Prove the externally observable contract with isolated tests
Binds: REQ-PB-003; REQ-PB-004; `test/`.
Prevents: a route that is only unit-tested without HTTP status and payload verification, incorrect done totals, or an overlong-title rejection that still persists data.
Rule: Tests shall invoke the HTTP handler and verify that `GET /todos/stats` returns HTTP 200 with total and done counts after creating and completing todos, and that `POST /todos` with a 201-character title returns HTTP 400 with a non-empty error message and leaves the todo collection unchanged; tests shall also verify that a 200-character title returns HTTP 201.
