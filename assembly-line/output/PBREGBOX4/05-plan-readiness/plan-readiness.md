# PBREG box-4 R4 automatic — Plan readiness

**Programme:** `prg-1204c31e-c386-46a8-8ec4-6128ddd60616`  
**Stage:** `PLAN_READINESS`  
**Stage run:** `srun-e48a2adb-38ae-481f-972c-0b2fa976a3c8`

## Scope

This plan is derived only from the programme PRD and the automatic requirements it
names:

| Requirement | Required outcome |
| --- | --- |
| `REQ-PB-003` | `GET /todos/stats` returns HTTP 200 and JSON `{ "total": <count>, "done": <count> }`. |
| `REQ-PB-004` | `POST /todos` refuses a title longer than 200 characters with HTTP 400 and a message. |

`REQ-PB-001` and `REQ-PB-002` are manual-set requirements in the project registry
and are not in this programme stage's scope.

## Baseline and readiness assessment

The implementation is a small dependency-free Node HTTP API. `src/todos.js` holds
an in-memory array and already exposes `listTodos()` and `completeTodo()`. The
request handler in `src/server.js` currently supports `GET /todos` and `POST
/todos`; it has no stats route or title-length validation. Existing `npm test`
passes (2 tests, 0 failures).

The work is ready to build: no external service, schema change, migration, or
product decision is required. The only behaviour intentionally fixed by this plan
where the PRD is not more specific is the error payload: use a JSON object with a
human-readable `error` message while preserving the existing JSON content type.

## Implementation plan

1. Add a small stats operation in `src/todos.js` (or calculate equivalently from
   `listTodos()` in the handler) that derives `total` from all stored todos and
   `done` from todos whose `done` value is `true`. It must not mutate the store.
2. Add `GET /todos/stats` in `src/server.js`, before any catch-all response. Return
   status 200 with exactly the count object required by `REQ-PB-003`.
3. In the existing POST body completion path, validate the supplied title before
   calling `addTodo()`. A title of 201 characters or more returns status 400 with
   a JSON error message and creates no todo. A title of exactly 200 characters
   remains valid. Keep successful POST behaviour (201 and todo JSON) unchanged.
4. Add HTTP-level tests that exercise the exported handler through a temporary
   server, rather than only testing store helpers. Ensure test setup does not make
   assumptions about test execution order because the current store is module
   scoped and in-memory.

## Verification and acceptance checks

| Requirement | Checks |
| --- | --- |
| `REQ-PB-003` | Create a mix of incomplete and completed todos; request `GET /todos/stats`; assert HTTP 200, JSON response, `total` equals all todos, and `done` equals only completed todos. Also cover an empty store if deterministic test isolation is added. |
| `REQ-PB-004` | POST a 201-character title and assert HTTP 400, JSON payload containing a non-empty error/message, and no new todo. POST a 200-character title and assert the existing 201 success response, proving the boundary. |

Run `npm test` after implementation. The route tests must be included in that
command so this programme's automatic behaviour is regression-protected.

## Constraints and risks

- The API parses the POST body with `JSON.parse` and has no malformed-body handling;
  that is pre-existing behaviour and outside these two requirements.
- Store state is process-local. Tests must reset or isolate state to avoid count
  leakage between test cases.
- The PRD says only "a message" for invalid titles. A JSON `error` field is the
  planned compatibility-preserving interpretation; no exact text is required.

## Ready-for-build decision

Ready. The route locations, state source, validation boundary, expected status
codes, payload shape, and test command are all identified and trace directly to
`REQ-PB-003` and `REQ-PB-004`.
