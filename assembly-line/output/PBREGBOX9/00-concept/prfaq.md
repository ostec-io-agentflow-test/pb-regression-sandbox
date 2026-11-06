# PBREG box-9 auto — concept PR/FAQ

**Stage:** CONCEPT  
**Programme:** `prg-9fb0a37c-86f2-4f2c-874b-a332245aa817`  
**Stage run:** `srun-14c4371a-0a37-4275-8007-57816d53c35a`  
**Source:** PRD `document.md` retrieved for this programme  
**Requirements in scope:** REQ-PB-003, REQ-PB-004

## Press release

### Todo API adds lightweight progress reporting and predictable title validation

Users of the pb-regression-sandbox todo API will be able to retrieve an immediate summary of their list and will receive a clear client error when attempting to create a todo with an unreasonably long title. The additions keep the existing JSON API simple while making the two common outcomes—checking progress and correcting invalid input—explicit and automatable.

`GET /todos/stats` returns HTTP 200 and a JSON object containing the current todo count and completed-todo count:

```json
{ "total": 3, "done": 1 }
```

`POST /todos` accepts titles up to 200 characters, preserving the existing successful-create behavior. A title longer than 200 characters is refused with HTTP 400 and a JSON response containing a human-readable message. The rejected input does not create a todo.

These changes serve API consumers and the automated regression flow by providing a stable, small surface for checking list state and exercising input validation.

## Customer and user value

- API consumers can show or verify list progress without fetching and counting every todo.
- Clients get an actionable response for oversized titles rather than an invalid record entering the list.
- Automation can assert both outcomes using only HTTP status codes and JSON bodies.

## Scope and requirement traceability

| Requirement | Concept commitment | Observable result |
| --- | --- | --- |
| REQ-PB-003 | Add `GET /todos/stats`. | HTTP 200 with JSON `{ "total": <count>, "done": <count> }`, derived from the current in-memory todo list. |
| REQ-PB-004 | Validate a `POST /todos` title’s length before creation. | A title longer than 200 characters returns HTTP 400 with a message and is not persisted. |

The manual counterparts REQ-PB-001 and REQ-PB-002 are not part of this automatic requirement set and are out of scope for this stage.

## Experience and API contract

### Statistics

The new endpoint sits alongside the existing `GET /todos` list endpoint.

| Request | Response |
| --- | --- |
| `GET /todos/stats` | `200 application/json` with numeric `total` and `done` fields. `total` is the number of todos; `done` is the number whose `done` field is `true`. |

An empty list therefore returns `{ "total": 0, "done": 0 }`. The values reflect the API process’s current in-memory list at request time.

### Title validation

| Request | Response |
| --- | --- |
| `POST /todos` with a title of 0–200 characters | Existing success path: `201 application/json` and the created todo. |
| `POST /todos` with a title of more than 200 characters | `400 application/json` with a non-empty, human-readable message explaining the maximum title length; no todo is added. |

The PRD does not prescribe an error-field name or exact message text. The build stage may use the repository’s established error-response convention, provided the response is JSON and includes a message.

## FAQ

### Why add a stats endpoint instead of extending `GET /todos`?

The PRD explicitly requires a compact `GET /todos/stats` response. It avoids pagination affecting a client that only needs aggregate counts and preserves the current list response.

### What counts as done?

A todo counts when its `done` property is `true`; all todos count toward `total`.

### Does the endpoint introduce persistence or multi-user aggregation?

No. This repository’s current todos are in memory, so the counts are process-local and reset when that state resets. Persistence, authentication, and filtering are outside the PRD.

### Does a 200-character title fail?

No. The boundary is inclusive: only titles longer than 200 characters are rejected.

### What happens to an oversized title?

The API returns HTTP 400 with a message and does not create or mutate a todo. This prevents an invalid write from changing later statistics.

### Are malformed JSON, missing titles, or title type validation included?

No additional rules for those cases are specified by the PRD. This concept does not broaden validation beyond the required length check.

## Delivery guardrails

- Preserve the existing `GET /todos` pagination and the successful `POST /todos` contract.
- Compute statistics from the same source used by the list endpoint so counts are consistent with visible todos.
- Perform the length validation before calling the create operation to prevent a rejected request from affecting `total` or `done`.
- Add automated coverage for empty and mixed completion statistics, the 200-character boundary, and a 201-character rejection with no side effect.

## Decisions, assumptions, and open questions

### Decisions

- Trace only REQ-PB-003 and REQ-PB-004, as directed by the programme brief.
- Treat title length as an inclusive maximum of 200 characters.
- Keep the exact error JSON shape intentionally open because the PRD requires only a message.

### Assumptions

- “Count” means the current in-memory todo records used by the existing API.
- The existing `done: true` state is the authoritative completed marker.
- JavaScript string length is the appropriate implementation measure unless a later stage specifies a different character-counting rule.

### Open questions

- None blocking the concept stage. The build stage can select an error-message field name and wording consistent with the codebase.
