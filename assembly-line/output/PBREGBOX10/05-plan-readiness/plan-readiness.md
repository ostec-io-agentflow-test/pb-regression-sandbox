# Plan readiness — PBREG box-10 R4 automatic

Stage: `PLAN_READINESS`  
Programme: `prg-be26f3fd-928d-4426-9952-f38614b58325`  
Stage run: `srun-8ae5adb6-5d2c-4d8d-ade7-839c813fecdb`

## Scope and traceability

This plan is derived from the programme's retained PRD, **PBREG box-10 auto:
todo API additions**. Its scope is limited to the PRD's two automatic
requirements:

| Requirement | Required observable behaviour | Planned proof |
| --- | --- | --- |
| `REQ-PB-003` | `GET /todos/stats` returns HTTP 200 and JSON `{ "total": <count>, "done": <count> }`. | HTTP test verifies status, exact payload keys, total count, and done count against known todos. |
| `REQ-PB-004` | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message. | HTTP test posts 201 characters, verifies 400 and a non-empty error message, then verifies no todo was added. |

`REQ-PB-001` and `REQ-PB-002` are manual variants listed on the project and
are deliberately out of scope for this automatic-requirement stage.

## Current-state assessment

- `src/server.js` exports the HTTP `handler`, has `GET /todos` and `POST
  /todos`, and serializes JSON through its local `send` helper.
- `src/todos.js` owns the in-memory list and exposes `addTodo`, `listTodos`,
  and `completeTodo`; `done` is a boolean.
- Tests currently exercise store functions only. The project has no
  dependency-based HTTP test framework and runs `node --test` on Node 20+.

The work is ready to build: the affected ownership boundaries and request
path are clear, the required output is fully specified, and the existing
test runner can test the exported handler without adding a dependency.

## Implementation plan

1. **Add a store-level stats projection — `src/todos.js`**

   Export a function (for example, `getTodoStats`) that derives `total` from
   the current todo list length and `done` by counting todos whose `done`
   property is `true`. It must not mutate the list or any todo. Keeping this
   projection beside the store avoids duplicating data-shape knowledge in the
   HTTP layer.

2. **Expose the stats resource — `src/server.js`**

   Import the stats projection and add the `GET /todos/stats` branch before
   the generic 404 response. Return it with `send(res, 200, stats)`, so the
   response remains JSON and uses the existing status/header behavior. This
   route has no query parameters and must not change the existing paginated
   `GET /todos` behaviour.

3. **Validate titles before persistence — `src/server.js`**

   In the existing `POST /todos` end handler, read `title` once, and when it
   is a string with length greater than 200, respond `400` with a JSON error
   message and return without calling `addTodo`. For the required rejected
   request, use a stable message such as `{ "error": "title must be 200
   characters or fewer" }`. Keep current successful-create behavior (201 and
   the created todo) unchanged. The PRD does not define behavior for missing,
   non-string, or malformed JSON bodies, so do not broaden validation in this
   change.

4. **Add automated coverage — `test/todos.test.js` or a focused HTTP test file**

   Retain the existing store test and add a small server helper that starts
   `createServer(handler)` on an ephemeral port, makes requests with the
   built-in Node HTTP/fetch facilities, and closes the server reliably. Avoid
   hard-coded expected totals because the module-scoped store is shared;
   capture a baseline or make assertions relative to setup data. Cover:

   - a stats request after adding at least two todos and completing one;
   - status 200 and precisely `total` / `done` numeric fields for the stats
     response;
   - a 201-character title POST producing status 400 and a non-empty JSON
     error message;
   - no increase in the todo count after that rejected POST; and
   - a 200-character title accepted with the existing 201 behavior, proving
     the boundary rather than merely the rejection.

5. **Verify and hand off**

   Run `npm test`. Exercise (or let the HTTP tests exercise) both routes with
   the exact required methods and paths. Review the diff to confirm only the
   two automatic PRD requirements and their tests changed; do not add a new
   package or alter unrelated pagination behavior.

## Acceptance checklist

- [ ] `GET /todos/stats` returns 200 JSON with only `total` and `done`.
- [ ] `total` equals all persisted todos and `done` equals those completed.
- [ ] A POST title of 201 characters returns 400 with a message and creates
      no todo.
- [ ] A title of exactly 200 characters still creates a todo with 201.
- [ ] `npm test` passes using the existing dependency-free test command.
- [ ] Implementation and tests trace only to `REQ-PB-003` and `REQ-PB-004`.

## Assumptions and open questions

Assumption: a JSON object containing a non-empty `error` string satisfies the
PRD's unspecified “message” requirement. This is intentionally a plan-level
choice; the externally observable 400 status and message are the contract.

Open questions: none. The PRD specifies the required behavior sufficiently
for implementation. Non-string titles and malformed JSON are intentionally
unchanged because they are outside the stated requirements.
