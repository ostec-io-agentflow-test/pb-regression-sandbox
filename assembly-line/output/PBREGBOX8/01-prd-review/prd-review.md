# PRD review — PBREG box-8 automatic

Stage: `PRD_REVIEW`  
Programme: `prg-e6b5cb5a-cdba-4d0c-8228-83c9af400c5a`  
Stage run: `srun-ba06d42a-e691-44ae-8886-cc806e246b1c`

## Source and scope

Reviewed source: `document.md`, retained for this programme. The PRD requests two small, automatic todo-API additions. This review covers only the corresponding requirement references below; the similarly worded manual requirements `REQ-PB-001` and `REQ-PB-002` are explicitly outside this stage.

| Requirement | PRD requirement | Review outcome |
| --- | --- | --- |
| `REQ-PB-003` | `GET /todos/stats` returns `200` with JSON `{ "total": <count>, "done": <count> }`. | Implement a distinct GET route and calculate counts from the current todo collection. |
| `REQ-PB-004` | `POST /todos` refuses a title longer than 200 characters with `400` and a message. | Validate before creating or persisting a todo, and return a JSON error message. |

## Existing-state assessment

The seeded server currently exposes `GET /todos` and `POST /todos` only. `src/todos.js` provides `listTodos()` and stores each todo's `done` state, so no schema or persistence change is needed for the statistics response. The POST handler currently passes the parsed title directly to `addTodo()` and always returns `201`; it has no length validation.

## Delivery guidance

### `REQ-PB-003` — statistics endpoint

- Add `GET /todos/stats` ahead of the existing `GET /todos` route (or otherwise ensure the more specific path is handled).
- Respond with JSON and status `200` through the existing `send` helper.
- `total` is the number of todos returned by the collection; `done` is the number whose `done` value is true.
- Counts must reflect the in-memory state at request time, including todos completed through the existing `completeTodo` function.
- Do not change pagination or the existing `GET /todos` response shape.

Acceptance evidence should exercise an empty collection and a populated collection containing both incomplete and completed todos, asserting exactly `{ total, done }` and HTTP `200`.

### `REQ-PB-004` — title length limit

- For `POST /todos`, reject titles whose length is greater than 200 before calling `addTodo`.
- Return HTTP `400` and a JSON body that contains a human-readable message. The PRD does not prescribe the message text or key; use the repository's existing JSON-error convention (`{ error: "..." }`) for consistency.
- A title of exactly 200 characters is accepted; a title of 201 characters is rejected.
- A rejected request must not increase the todo count or consume an ID.
- Preserve the existing successful POST status (`201`) and response body.

Acceptance evidence should send both boundary values and verify the `400` error response includes a non-empty message for 201 characters, while the 200-character request creates one todo.

## Test and implementation considerations

The current tests call the todo module directly and do not start the HTTP handler. Add focused HTTP-level tests for status codes and serialized JSON, using the exported `handler` or a small test server. Keep tests independent despite the module's in-memory global collection: establish expected counts relative to a captured baseline or add an explicit test-only reset only if necessary. No external dependency is required; the project already uses Node's built-in test runner.

Malformed JSON, missing titles, non-string titles, authentication, persistence, and changes to completion routes are not specified by this PRD. They should not be introduced as requirements for this delivery. If implementation needs to choose behavior for those cases, preserve current behavior unless a later requirement changes it.

## Review disposition

The requirements are clear, bounded, and implementable in the current codebase. Proceed to implementation with automated HTTP tests traced to `REQ-PB-003` and `REQ-PB-004`.
