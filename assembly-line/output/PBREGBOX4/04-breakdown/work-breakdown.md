# PBREG box-4 R4 automatic — work breakdown

## Scope and traceability

Source programme: `prg-1204c31e-c386-46a8-8ec4-6128ddd60616`  
Stage: `BREAKDOWN`  
Stage run: `srun-fa73677a-09bf-427b-af5a-6b5f24ae7f31`

The retained PRD defines two automatic requirements. This breakdown addresses only
`REQ-PB-003` and `REQ-PB-004`. `REQ-PB-001` and `REQ-PB-002` are equivalent manual
requirements from another set and are outside this stage.

## Build items

### 1. Add todo statistics endpoint

- Platform work item: `wi-ed3edeaf-eb3b-405a-9ae7-c93593894784`
- Covers: `REQ-PB-003` — GET `/todos/stats` returns 200 with JSON `{ "total": <count>, "done": <count> }`.
- Dependencies: none.
- Implementation commitment:
  - Add a todo-domain statistics operation in `src/todos.js` that derives `total` from all stored todos and `done` from todos whose `done` flag is true.
  - Update `src/server.js` to route GET `/todos/stats` and respond with status 200 and the calculated JSON payload.
  - Extend automated tests with HTTP-level requests that assert the empty state and a mixed state after creating and completing todos.
- Acceptance criteria:
  - GET `/todos/stats` returns HTTP 200.
  - Its JSON body has numeric `total` and `done` fields, with no unrelated fields.
  - `total` matches the stored-todo count and `done` matches the count marked complete.
  - The test suite covers both zero todos and a mixture of complete and incomplete todos.

### 2. Reject overlong todo titles

- Platform work item: `wi-1e8aeca5-2153-47b1-a14d-9641dc687225`
- Covers: `REQ-PB-004` — POST `/todos` refuses a title longer than 200 characters with 400 and a message.
- Dependencies: none.
- Implementation commitment:
  - Update the POST `/todos` request handling in `src/server.js` to check the parsed title length before calling `addTodo`.
  - Return HTTP 400 with a JSON error message for titles longer than 200 characters.
  - Preserve the existing successful creation path for titles up to and including 200 characters.
  - Extend automated HTTP-level tests to verify rejection of a 201-character title, the error message, absence of persistence after rejection, and success at exactly 200 characters.
- Acceptance criteria:
  - POST `/todos` with a title longer than 200 characters returns HTTP 400.
  - The response body is JSON with a non-empty error message.
  - A rejected request creates no todo.
  - A title of exactly 200 characters returns HTTP 201.
  - The automated tests cover both the rejected and boundary-length requests.

## Completion evidence for implementation

Each work item must modify the named application code and its associated automated
tests, then pass `npm test`. Together, the two items satisfy every in-scope PRD
requirement; there is no deferred scope in this breakdown.
