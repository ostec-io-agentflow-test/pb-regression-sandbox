# PBREG box-6 — Work breakdown

Programme: `prg-03026a39-1d06-4f2f-a310-c589a7c67d40`  
Stage: `BREAKDOWN`  
Stage run: `srun-8b9f1f8c-90cf-4eec-b46a-194530ad0706`

## Scope and traceability

The retained PRD specifies two automatic todo API additions. This breakdown covers only
`REQ-PB-003` and `REQ-PB-004`; the similarly worded manual requirements are outside this
programme stage.

## Work items

### 1. Add tested todo statistics endpoint

- Platform work item: `wi-67c78c96-1a26-4ecd-a7e8-bbecf8b64a69`
- Covers: `REQ-PB-003`
- Dependencies: none
- Deliverable: add a read-side statistics operation for the in-memory todo list and route
  `GET /todos/stats` to it before generic request handling.
- Implementation commitment: return HTTP 200 with JSON containing numeric `total` and `done`
  fields. `total` is the current todo count and `done` is the count whose `done` value is true.
- Verification commitment: add automated HTTP-handler tests that create todos, complete a
  subset, then assert status 200, JSON content type, exact response shape, and both counts.
- Acceptance criteria:
  - `GET /todos/stats` responds with HTTP 200 and `application/json`.
  - Its body is exactly an object with numeric `total` and `done` fields.
  - Counts reflect both newly created and completed todos.

### 2. Validate oversized todo titles at the POST boundary

- Platform work item: `wi-508dadbd-082d-49cb-9755-132d0311ef8f`
- Covers: `REQ-PB-004`
- Dependencies: none
- Deliverable: validate the submitted title before the server calls `addTodo` for
  `POST /todos`.
- Implementation commitment: reject titles longer than 200 characters with HTTP 400 and a JSON
  body containing a client-facing message; retain the existing HTTP 201 creation response for a
  200-character title.
- Verification commitment: add automated HTTP-handler boundary tests for a 200-character title
  being accepted and a 201-character title being rejected; assert that rejection does not append
  a todo to the in-memory list.
- Acceptance criteria:
  - A 201-character title produces HTTP 400 and a JSON message.
  - A rejected request does not persist a todo.
  - A 200-character title produces the existing HTTP 201 success response.

## Delivery order

The two changes have no code dependency and may be implemented independently. Each work item
includes its own implementation and automated verification; no work is deferred by this
breakdown.
