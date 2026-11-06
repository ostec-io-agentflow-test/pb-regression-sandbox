# PRD Review — PBREG box-10 automatic

Programme: `prg-be26f3fd-928d-4426-9952-f38614b58325`  
Stage: `PRD_REVIEW`  
Stage run: `srun-f93e5e23-ef4b-46b1-864f-f83241d8ea00`

## Source and scope

Reviewed the retained source document, `document.md` (PBREG box-10 auto: todo API additions), and the canonical programme requirements. This review is limited to the automatic requirements stated by the PRD:

| Requirement | PRD outcome | Review disposition |
| --- | --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON `{ "total": <count>, "done": <count> }` | Ready for implementation |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message | Ready for implementation |

`REQ-PB-001` and `REQ-PB-002` are manual variants and are outside this automatic requirement set.

## Baseline findings

The current service has `GET /todos` and `POST /todos`; it has no `/todos/stats` route. Todos are held in an in-memory array and have a boolean `done` field. `POST /todos` currently sends the result of `addTodo(title)` with status 201 without a title-length check. The requested changes fit the existing HTTP handler and todo module; no persistence, pagination, or route redesign is required.

## Acceptance criteria and verification

### REQ-PB-003

- `GET /todos/stats` responds with status 200.
- Its response is JSON with exactly the required count fields: `total` (all stored todos) and `done` (stored todos whose `done` field is true).
- With an empty store, the expected result is `{ "total": 0, "done": 0 }`.
- After creating todos and marking a subset complete, `total` reflects all created todos and `done` reflects only the completed subset.
- This route does not mutate todo state.

Suggested implementation boundary: expose a stats/count helper from `src/todos.js` and route `/todos/stats` in `src/server.js`. This preserves the existing separation between HTTP concerns and in-memory todo state.

### REQ-PB-004

- A `POST /todos` request whose title length is 201 characters or more responds with status 400.
- The 400 response is JSON and contains a message describing the title-length validation failure.
- A title of exactly 200 characters remains valid and follows the existing successful-create behavior (201).
- Validation failure does not create a todo or advance observable todo counts.

Suggested implementation boundary: validate before calling `addTodo`, returning the existing JSON response format with a descriptive message. The PRD does not prescribe the message key or exact wording; tests should assert that a non-empty validation message is present rather than impose unspecified text.

## Assumptions and non-goals

- “Count” means the current in-memory todo collection, because that is the only persistence model in the reviewed service.
- “Done” means `todo.done === true`, matching the existing domain model.
- The 200-character limit is inclusive: only titles longer than 200 are rejected.
- Error handling for malformed JSON, missing/non-string titles, persistence, authentication, pagination changes, and manual requirements are not requested by this PRD and are not part of this stage.

## Review result

The PRD is implementable as written. REQ-PB-003 and REQ-PB-004 are independently testable and have no unresolved product decisions. The only intentionally flexible detail is the validation-message schema/text, for which the PRD requires a message but specifies no exact contract.
