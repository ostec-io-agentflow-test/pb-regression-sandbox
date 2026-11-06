# PR/FAQ: PBREG box-8 automatic todo API additions

## Press release

**The todo API now makes its workload visible and prevents invalidly long todo titles from entering the list.**

Teams using the pb-regression-sandbox can retrieve a compact, current snapshot of their todo list from one endpoint: the number of todos in total and the number completed. They can also rely on the API to reject titles that are longer than 200 characters before a todo is created. Together, these small additions make automated checks clearer and prevent oversized input from becoming stored data.

The existing list and successful-create flows remain unchanged. This is a focused API enhancement: it adds no authentication, storage model, filtering, or pagination changes.

## Customer problem

Automated consumers need an inexpensive way to assert aggregate todo state without retrieving and counting the entire list themselves. They also need a deterministic server-side limit so an invalidly long title is not accepted merely because a caller omitted client-side validation.

## What customers can do

### Retrieve todo statistics — REQ-PB-003

Call `GET /todos/stats`. The API responds with HTTP 200 and JSON in exactly this shape:

```json
{"total": 3, "done": 1}
```

- `total` is the count of all todos currently known to the API.
- `done` is the count of those todos whose completion state is `true`.
- With no todos, both values are `0`.

This endpoint reports aggregate state only; it does not replace `GET /todos`, alter its pagination, or return individual todo records.

### Create a valid todo title — REQ-PB-004

Call `POST /todos` as today, with a JSON body containing `title`.

- A title of 200 characters or fewer continues through the normal successful create flow.
- A title longer than 200 characters receives HTTP 400 and a JSON response containing a human-readable message explaining that the title exceeds the allowed length.
- A rejected request does not create a todo and therefore does not change the statistics.

The precise wording and additional fields of the error payload are an implementation choice. The stable contract is the 400 status and the presence of a message.

## FAQ

### Why add a separate statistics endpoint?

It gives automated clients a direct, readable assertion point for total and completed work. They no longer need to infer those two values by fetching all todo records.

### Does `/todos/stats` count only the current page of results?

No. It reports counts across all todos currently known to the API. It is intentionally independent of `GET /todos` pagination.

### What happens at the title boundary?

Exactly 200 characters is valid. More than 200 characters is invalid and must receive HTTP 400 with a message.

### Will existing clients break?

No expected breaking change is introduced. Existing `GET /todos` and successful `POST /todos` behavior remains in place. Only requests that submit titles longer than 200 characters are newly rejected.

### Are authentication, persistence, or broader input-validation rules included?

No. They are outside the PRD and this concept. This stage addresses only REQ-PB-003 and REQ-PB-004.

## Success measures and acceptance evidence

The delivery is successful when automated tests demonstrate all of the following:

1. `GET /todos/stats` returns HTTP 200 with JSON containing numeric `total` and `done` counts.
2. The counts correctly reflect no todos, added todos, and completed todos.
3. `POST /todos` accepts a 200-character title through the existing success path.
4. `POST /todos` rejects a 201-character title with HTTP 400 and a message, without changing stored todos or stats.

## Delivery boundaries

| Included | Excluded |
| --- | --- |
| `GET /todos/stats` aggregate counts | Changes to `GET /todos` pagination or response format |
| Server-side maximum title length of 200 characters | Authentication, authorization, persistence changes |
| HTTP 400 plus a message for an overlong title | New validation rules beyond the stated title length |
| Automated verification of REQ-PB-003 and REQ-PB-004 | Manual requirement set REQ-PB-001 and REQ-PB-002 |

## Open questions

None. The PRD supplies the observable behavior needed for this concept; error-message wording remains deliberately implementation-defined.
