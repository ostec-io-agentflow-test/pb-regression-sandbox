# PBREG box-4 automatic design spine

## Scope and traceability

This design covers only the PRD's automatic requirements:

- REQ-PB-003 — `GET /todos/stats` returns HTTP 200 and JSON containing `total` and `done` counts.
- REQ-PB-004 — `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message.

The API remains the existing dependency-free Node HTTP service and retains its in-memory todo collection.

### AD-1 Expose statistics as a dedicated read route
Binds: REQ-PB-003 to `GET /todos/stats` in the HTTP handler, which responds with HTTP 200 and a JSON object having exactly the `total` and `done` fields.
Prevents: Returning a paginated todo list, using an alternate route, or treating the statistics request as a mutation.
Rule: The handler must dispatch `GET /todos/stats` before the generic `GET /todos` route, obtain the current statistics from the todo service, and send it with the existing JSON response helper.

### AD-2 Derive counts from the authoritative todo collection
Binds: REQ-PB-003 to a todo-service statistics operation that reads the same in-memory collection used by `addTodo`, `listTodos`, and `completeTodo`.
Prevents: Maintaining a second counter that can drift, counting only the current pagination page, or reporting completed todos as anything other than todos whose `done` value is `true`.
Rule: The statistics operation must return `total` as the number of stored todos and `done` as the number of stored todos with `done === true`, calculated when the request is handled.

### AD-3 Enforce the title limit before persistence
Binds: REQ-PB-004 to `POST /todos`, with a maximum accepted title length of 200 characters and rejection of every title whose length is greater than 200 characters.
Prevents: Creating an overlength todo, incrementing the todo identifier for a rejected request, or returning the existing HTTP 201 success response after a validation failure.
Rule: The POST handler must validate the parsed request title before calling `addTodo`; when the title is longer than 200 characters it must return HTTP 400 with JSON `{ "error": "title must be 200 characters or fewer" }` and must not mutate the todo collection.

### AD-4 Prove automatic requirements at the HTTP boundary
Binds: REQ-PB-003 and REQ-PB-004 to automated tests that call the HTTP handler and assert status codes and JSON response bodies.
Prevents: Tests that validate only internal helpers while route selection, response status, or serialization diverges from the API contract.
Rule: The automated tests must verify a statistics response after todos exist in both incomplete and completed states, and must verify that a 201-character title receives HTTP 400, includes the validation message, and does not increase the reported total.
