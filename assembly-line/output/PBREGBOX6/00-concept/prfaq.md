# PBREG box-6 — PR/FAQ concept

**Stage:** CONCEPT  
**Programme:** `prg-bf92b4d8-02a0-4133-9632-698a2cd6cf3c`  
**Source:** *PBREG box-6 manual: todo API additions*

## Press release

The pb-regression-sandbox todo API will gain two small, predictable behaviours that make manual checks faster and protect the API from oversized todo titles. Consumers can request one aggregate view of the current in-memory todo list, and they receive a clear client error before a title longer than 200 characters is created.

This change is deliberately limited to the two PRD requirements. It adds no persistence, authentication, pagination change, completion endpoint, or new todo fields.

## Customer experience

### Todo statistics

`GET /todos/stats` responds with HTTP 200 and JSON in this exact shape:

```json
{"total": 3, "done": 1}
```

- `total` is the number of todos currently held by the API.
- `done` is the number of those todos whose `done` value is `true`.
- With an empty list, the response is `{"total":0,"done":0}`.

### Title limit

`POST /todos` accepts a title of 200 characters or fewer using the existing success behaviour. A title longer than 200 characters is rejected with HTTP 400 and a JSON message, proposed as:

```json
{"error":"title must be 200 characters or fewer"}
```

The rejected request creates no todo and does not advance the observable list count. The exact error-message wording is a concept-level proposal because the PRD requires a message but does not specify its schema or text.

## Requirement traceability

| Requirement | Concept commitment | Acceptance evidence |
| --- | --- | --- |
| `REQ-PB-001` | Provide `GET /todos/stats` with HTTP 200 and JSON `{ "total": <count>, "done": <count> }`. | Manual request returns both numeric fields and values match the current todo list. |
| `REQ-PB-002` | Reject `POST /todos` when `title` exceeds 200 characters with HTTP 400 and a message. | A 201-character title receives 400 and a message; a 200-character title retains existing success behaviour. |

## FAQ

### Why a separate statistics endpoint?

It gives a manual tester or lightweight client the two counts requested by the PRD without requiring it to interpret the paginated `/todos` response. It is a read-only aggregate of the same in-memory todos.

### What does “done” mean?

It counts todos whose existing `done` flag is `true`. No new definition of completion is introduced.

### Is 200 characters allowed?

Yes. The limit rejects titles *longer than* 200 characters. The boundary is accepted.

### What happens after a rejected POST?

The server returns 400 with a message and makes no addition. A subsequent statistics request therefore has unchanged counts.

### Are empty, missing, non-string, or malformed titles changed?

No. They are outside this PRD. The delivery should preserve existing behaviour for those inputs except that any title value determined to be longer than 200 characters is rejected as required.

## Manual verification script

1. Start the API with `npm start`.
2. Request `GET /todos/stats`; verify HTTP 200 and `{"total":0,"done":0}` in a fresh process.
3. Create todos through the existing `POST /todos` flow and verify that `/todos/stats` increments `total` while `done` remains zero. Verify a non-zero `done` count using a controlled in-process test fixture that calls the existing todo completion function; the current HTTP API has no completion route.
4. POST a JSON body with a 200-character `title`; verify the existing success status and that the todo is present.
5. POST a JSON body with a 201-character `title`; verify HTTP 400, a response message, and unchanged statistics/list count.

## Delivery guardrails

- Preserve the existing `/todos` GET and valid POST contracts.
- Keep responses JSON with the server's existing content type convention.
- Add focused automated tests for the statistics response, empty/non-empty counts, 200/201-character boundary, error status/message, and no-create-on-rejection; manually execute the script above.
- Do not introduce requirements beyond `REQ-PB-001` and `REQ-PB-002`.
- The non-zero `done` manual scenario is constrained by the current API: it exposes no HTTP operation that completes a todo. This stage does not add one.
