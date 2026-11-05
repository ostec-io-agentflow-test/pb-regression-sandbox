# PBREG box-4 — PRD review

Stage: `PRD_REVIEW`  
Programme: `prg-1204c31e-c386-46a8-8ec4-6128ddd60616`  
Stage run: `srun-42e3692e-5219-4f5d-b1d1-d455e5e7eea7`

## Source and scope

The retained source PRD, `document.md`, asks for two automatic todo API additions only.  The matching canonical requirements are `REQ-PB-003` and `REQ-PB-004`.

`REQ-PB-001` and `REQ-PB-002` are the manual counterparts in the same project and are outside this programme stage.

## Reviewed requirements

### REQ-PB-003 — todo statistics

`GET /todos/stats` must return HTTP 200 and a JSON object with:

- `total`: the count of all todos.
- `done`: the count of todos whose `done` value is true.

The values must be numbers, including `0` for both fields when there are no todos.  The endpoint belongs alongside the existing `GET /todos` route and must not alter its pagination response.

Implementation is straightforward: derive the figures from the existing in-memory todo collection (or an exported stats helper), then serialize them through the established JSON response helper.  Counts must reflect todos added and later completed during the same process.

Verification should cover an empty collection and a mixed collection, asserting status 200, JSON content type, and the exact `{ total, done }` payload.

### REQ-PB-004 — title length validation

`POST /todos` must reject a title longer than 200 characters with HTTP 400 and a message.  A 200-character title remains valid and receives the existing successful-create response (201).

The validation should occur before `addTodo` mutates the in-memory collection.  The error response should be JSON and expose a clear message; its precise text is intentionally not prescribed by the PRD.  Normal valid POST behavior and unrelated routes must remain unchanged.

Verification should submit titles at 200 and 201 characters, assert 201 and 400 respectively, assert that the 400 response has a message/error field, and confirm the rejected title did not increase the todo count.

## Current-state assessment

`src/server.js` currently routes only `GET /todos` and `POST /todos`; it does not expose `/todos/stats` and sends every other path to 404.  Its POST path passes the parsed title directly to `addTodo` and has no title-length validation.  `src/todos.js` already supplies the required data for both additions: `listTodos()` returns all todos and todo records hold a boolean `done` field.

The repository baseline test suite passed (`npm test`: 2 tests, 0 failures).  Existing tests are unit-level and do not cover HTTP routes, so the implementation stage should add route-level coverage for both requirements.

## Review outcome

The PRD is internally consistent, traceable to `REQ-PB-003` and `REQ-PB-004`, and ready for implementation.  No external dependency, data migration, or product decision is required.
