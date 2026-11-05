# PBREG box-4: Todo API additions — PR/FAQ

**Stage:** CONCEPT  
**Programme:** `prg-2cc895a2-fd4a-4e8e-9508-dd0971342b53`  
**Requirements:** REQ-PB-001, REQ-PB-002

## Press release

**PBREG box-4 adds a fast way to see todo progress and protects the todo API from overlong titles.**

Users of the todo API can now request `GET /todos/stats` and receive an immediate JSON snapshot of how many todos exist and how many are done. The endpoint returns `200 OK` with exactly these count fields:

```json
{ "total": 3, "done": 1 }
```

Todo creation also has a clear, enforceable title boundary. `POST /todos` continues to create a todo for a title of 200 characters or fewer. A title longer than 200 characters is not created; the API returns `400 Bad Request` and a JSON error message, for example:

```json
{ "error": "title must be 200 characters or fewer" }
```

This deliberately small addition retains the service's existing JSON HTTP conventions and in-memory todo behavior. It adds no storage, authentication, pagination changes, or changes to the existing successful-create response.

## FAQ

### Who benefits, and what problem does this solve?

API clients and manual operators can display or check aggregate progress without retrieving and counting the full todo list. Clients also receive a deterministic response when a title exceeds the supported limit, rather than creating a value outside the API's stated boundary.

### What is the stats endpoint contract? — REQ-PB-001

`GET /todos/stats` returns `200 OK` with `Content-Type: application/json` and this shape:

```json
{ "total": <count>, "done": <count> }
```

- `total` is the number of todos currently held by the service.
- `done` is the number of those todos whose `done` value is `true`.
- With no todos, the response is `{ "total": 0, "done": 0 }`.
- The response contains aggregate counts only; it does not return todo records, pagination metadata, or derived percentages.

The counts reflect the same in-process collection used by the existing todo operations. They therefore represent the current process's state, not a durable cross-process report.

### What is the title-limit contract? — REQ-PB-002

For `POST /todos`, a title of 200 characters or fewer follows the current success flow and returns the created todo with `201 Created`. A title longer than 200 characters is rejected before a todo is added. The response is `400 Bad Request`, JSON-formatted, and includes a human-readable error message, using the existing API error convention:

```json
{ "error": "title must be 200 characters or fewer" }
```

The boundary is inclusive: a 200-character title is accepted; a 201-character title is rejected. The failed request leaves both the todo collection and subsequent stats unchanged.

### Why return only `total` and `done`?

Those are the two values requested by the PRD. Returning exactly them makes the endpoint compact and avoids creating an accidental compatibility promise for unrelated metrics such as overdue counts, percentages, or lists.

### Why use a 400 response for an overlong title?

The request violates a client-controlled input rule. A 400 status makes the request failure explicit and lets a client correct the title without treating the service as unavailable. The JSON error preserves the service's existing JSON response convention.

### Are malformed JSON and other title validation rules changing?

No. This concept scopes only the maximum title length requested in REQ-PB-002. It does not introduce rules for missing titles, title type, whitespace, Unicode normalization, malformed request bodies, or validation of other fields.

### How will we know the delivery meets the requirements?

Automated coverage should demonstrate:

1. `GET /todos/stats` returns `200` and JSON `{ total, done }` for an empty set and after todos are created/completed.
2. `POST /todos` accepts a title of exactly 200 characters and still returns `201`.
3. `POST /todos` with 201 characters returns `400`, provides the JSON error message, and does not change the stored-todo count.

### What is intentionally out of scope?

- Persistence or database-backed statistics.
- New todo fields, bulk endpoints, filters, or pagination changes.
- Authentication, authorization, rate limiting, and UI changes.
- Altering existing success payloads or unrelated error handling.

## Requirement traceability

| Requirement | Concept commitment | Verification focus |
| --- | --- | --- |
| REQ-PB-001 | Add `GET /todos/stats`, returning `200` JSON with `total` and `done` counts. | Empty and populated/partially completed collections return correct counts. |
| REQ-PB-002 | Reject `POST /todos` titles longer than 200 characters with `400` and a JSON message, without mutation. | 200 is accepted; 201 is rejected with a message and no new todo. |
