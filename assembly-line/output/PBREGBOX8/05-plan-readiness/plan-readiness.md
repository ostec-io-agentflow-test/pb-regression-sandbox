# Plan readiness — PBREG box-8 R4 automatic

## Verdict

**Ready to build.** The retained PRD is available and its two automatic requirements are present in the canonical requirement list. The proposed work is small, isolated to the existing todo HTTP API, and has a passing baseline (`npm test`). No external service, schema migration, or new dependency is required.

## Authoritative scope

| Requirement | PRD contract | Current state | Planned result |
| --- | --- | --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON `{ "total": <count>, "done": <count> }`. | No stats route exists. `src/todos.js` exposes the todo list and completion state needed to calculate both values. | Add a read-only stats route and a small domain helper or route-local calculation. Return exactly the two stated numeric fields. |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message. | The route passes any supplied title straight to `addTodo` and always returns 201. | Validate before persistence; on length greater than 200, return 400 with a JSON error message and do not create a todo. |

REQ-PB-001 and REQ-PB-002 are manual variants in the same project and are explicitly out of scope for this automatic programme stage.

## Build plan

1. Add a `GET /todos/stats` branch in `src/server.js`, using the current in-memory todo state. Keep response encoding through the existing `send` helper.
2. Add title-length validation to the `POST /todos` flow before calling `addTodo`. Preserve the existing successful-create response (`201`) for accepted titles.
3. Add endpoint-level tests using the exported `handler` to verify both contracts:
   - Seed todos with a mix of incomplete and completed records, then assert `/todos/stats` returns 200 and the expected `total` and `done` values.
   - Submit a 201-character title, assert 400 and a non-empty JSON error message, then assert no todo was added.
   - Include the 200-character boundary as accepted, to distinguish “longer than 200” from “200 or more.”
4. Run `npm test` as the verification command.

## Acceptance and traceability

- **REQ-PB-003:** A request to `/todos/stats` has status 200 and a JSON object containing `total` equal to all stored todos and `done` equal to completed todos.
- **REQ-PB-004:** A POST body with a title of 201 characters receives status 400 and a JSON message; it does not mutate the todo collection. A 200-character title remains valid.

## Constraints, assumptions, and risks

- Keep the dependency-free Node HTTP structure; this repository uses Node's built-in test runner and has no test HTTP client dependency.
- Counts are derived from the process-local in-memory collection, matching the current persistence model.
- The PRD says only “a message” for the error response. The implementation may choose the error-field wording, but tests should assert the presence of a non-empty message rather than a particular undocumented phrase.
- The current test suite has shared module-level todo state. New tests must avoid brittle absolute counts by using before/after values or carefully controlled test ordering/state.

## Readiness evidence

- Source PRD: retained `document.md` for programme `prg-e6b5cb5a-cdba-4d0c-8228-83c9af400c5a`.
- Canonical in-scope requirements: REQ-PB-003 and REQ-PB-004.
- Baseline: `npm test` passed, 2 tests, 0 failures.
- Planning journal: scope decision `6aed8ec5eb0e5003b7eafb67`; implementation constraint `6aed8edfeb0e5003b7eafb68`; contract assumptions `6aed8edfeb0e5003b7eafb69`.
