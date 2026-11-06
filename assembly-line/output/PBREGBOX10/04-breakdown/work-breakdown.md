# PBREG box-10 R4 automatic — Work Breakdown

Source programme: `prg-be26f3fd-928d-4426-9952-f38614b58325`  
Stage: `BREAKDOWN`  
Stage run: `srun-65641fef-119f-4cba-9fce-b530cfd9b49e`

## Scope

The source PRD requires two automatic todo API changes:

- `REQ-PB-003`: `GET /todos/stats` returns `200` and JSON containing numeric `total` and `done` counts.
- `REQ-PB-004`: `POST /todos` rejects a title longer than 200 characters with `400` and a message.

The manual counterparts `REQ-PB-001` and `REQ-PB-002` are outside this programme stage and are not covered by this breakdown.

## Work items

### 1. Deliver todo statistics endpoint

- Platform work item: `wi-af616eee-e519-4d52-a594-6e0116cfdd08`
- Covers: `REQ-PB-003`
- Dependencies: none
- Implementation commitment:
  - Add a todos-domain statistics function in `src/todos.js` that derives `total` from all stored todos and `done` from todos whose `done` property is true.
  - Import that function in `src/server.js` and route `GET /todos/stats` before the general `/todos` listing route.
  - Return status `200` via the existing JSON response helper with exactly `{ total, done }`.
  - Add HTTP-level tests that seed incomplete and completed todos, call the handler, and assert the status, JSON content type, and exact count payload.
- Acceptance checks:
  - `GET /todos/stats` returns `200` and `application/json`.
  - The body has numeric `total` and `done` properties only.
  - `total` counts every stored todo and `done` counts only completed todos.
  - The automated suite verifies mixed completed and incomplete data.

### 2. Enforce todo title length on creation

- Platform work item: `wi-78b68bb2-5fb3-4e35-be84-b064e76b87c8`
- Covers: `REQ-PB-004`
- Dependencies: none
- Implementation commitment:
  - In the `POST /todos` request-end handler in `src/server.js`, parse the JSON body and validate the title length before calling `addTodo`.
  - For a title longer than 200 characters, return `400` JSON with a clear error message and skip persistence.
  - Preserve the existing `201` creation response for titles of 200 characters or fewer.
  - Add HTTP-level tests for the 200-character accepted boundary and the 201-character rejected boundary, including an assertion that the rejected request did not add a todo.
- Acceptance checks:
  - An over-limit title receives `400`, `application/json`, and an error message.
  - An over-limit title does not change the stored todo count.
  - A title of exactly 200 characters receives `201`.
  - The automated suite covers both boundary cases.

## Verification

Run `npm test`. The resulting suite must cover the stats response and both title-length boundary outcomes in addition to the existing todo behavior.
