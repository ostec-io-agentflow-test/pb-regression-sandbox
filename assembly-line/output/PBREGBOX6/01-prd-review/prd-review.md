# PRD Review — PBREG box-6 automatic

## Source and scope

Reviewed source: `document.md` for programme `prg-03026a39-1d06-4f2f-a310-c589a7c67d40`.

This automatic requirement set contains only:

| Requirement | Reviewed contract |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 and JSON with numeric `total` and `done` counts. |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message. |

`REQ-PB-001` and `REQ-PB-002` are separate manual-set requirements and are out of scope for this stage.

## Review outcome

The PRD is implementable as written. It requires two focused changes to the existing todo API:

1. Add a read-only `/todos/stats` route. `total` is the count of all todos; `done` is the count whose `done` property is `true`.
2. Validate the submitted `title` before a todo is created. A title with more than 200 characters must return status 400 and a JSON response containing a human-readable message. Titles of exactly 200 characters remain valid.

## Acceptance checks

| Requirement | Observable verification |
| --- | --- |
| REQ-PB-003 | With existing todos in different completion states, request `GET /todos/stats`; assert status 200 and `{ total: <all todos>, done: <completed todos> }`. |
| REQ-PB-004 | Submit a `POST /todos` body whose title has 201 characters; assert status 400, a message in the JSON response, and no new todo created. Submit a 200-character title and assert the existing create behavior still succeeds. |

## Constraints and decisions for implementation

- Preserve the API's existing JSON response content type and its in-memory todo store.
- Count completion from the existing `done` boolean; no new persistence or data model is needed.
- The PRD does not prescribe the message field name or wording. A stable JSON error/message field is acceptable, provided a message is present.
- Validation must run before `addTodo` so rejected requests do not increment the ID sequence or mutate the todo list.

## Open questions

None blocking. The unspecified error-message wording and field name can be selected during implementation and fixed in tests.
