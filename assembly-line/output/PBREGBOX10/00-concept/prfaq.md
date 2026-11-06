# PBREG box-10 — Concept PR/FAQ

**Stage:** CONCEPT  
**Programme:** `prg-be26f3fd-928d-4426-9952-f38614b58325`  
**Stage run:** `srun-18e7eceb-606c-4fb0-99f3-4f41a2895e24`  
**Scope:** retained PRD `PBREG box-10 auto: todo API additions`

## Press release

### A clearer, safer todo API for automated clients

The pb-regression-sandbox todo API will add two small, predictable behaviors for automated consumers. Clients will be able to retrieve a concise snapshot of all todo work through `GET /todos/stats`, and will receive an immediate, understandable error when attempting to create a todo whose title exceeds the supported 200-character limit.

The stats endpoint returns HTTP 200 and a JSON object with `total` (all current todos) and `done` (todos whose `done` field is `true`). It is a summary only: it does not alter todo state or replace the existing paginated `GET /todos` list endpoint.

When `POST /todos` receives a title longer than 200 characters, it returns HTTP 400 with a JSON error message and creates no todo. A title of exactly 200 characters remains valid and follows the existing successful-create behavior.

These additions make automated checks able to verify workload state without inspecting page-by-page list responses, while ensuring excessive input cannot silently enter the API.

## FAQ

### Which requirements does this concept cover?

| Requirement | Concept commitment |
| --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns HTTP 200 with JSON `{ "total": <count>, "done": <count> }`. |
| REQ-PB-004 | `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message. |

REQ-PB-001 and REQ-PB-002 are manual variants listed in the wider project requirement inventory and are not part of this automatic requirement set.

### What does `GET /todos/stats` return?

It returns `200 OK` and this shape:

```json
{
  "total": 3,
  "done": 1
}
```

`total` is the number of todos in the API's current store. `done` is the number of those todos with `done: true`. With no todos, both values are `0`. Both fields are non-negative integer counts; `done` cannot exceed `total`.

### What is unchanged by the stats endpoint?

It is read-only. Existing `GET /todos` pagination and its response body remain unchanged, and `GET /todos/stats` takes no pagination parameters. The endpoint reports the same in-memory todo collection used by the current API.

### How will an overlong title be handled?

Before adding a todo, the API checks the submitted `title`. A title whose length is greater than 200 receives `400 Bad Request`, a JSON body, and no persisted todo. The implementation should use a clear, stable message such as:

```json
{
  "error": "title must be 200 characters or fewer"
}
```

This proposal intentionally specifies the observable requirement—HTTP 400 and a message—rather than requiring a particular error-field name.

### What is the boundary behavior?

| Submitted title length | Result |
| --- | --- |
| 199 or fewer characters | Existing successful `POST /todos` behavior. |
| Exactly 200 characters | Existing successful `POST /todos` behavior. |
| 201 or more characters | `400 Bad Request`, JSON message, and no todo created. |

### What is deliberately out of scope?

The PRD does not ask to change missing-title handling, title trimming, Unicode normalization, malformed JSON handling, persistence, authentication, or the existing list endpoint's pagination. Those behaviors must not be broadened as part of REQ-PB-003 or REQ-PB-004.

### How will the automatic requirements be proven?

Automated API tests should establish all of the following:

1. An empty store yields `GET /todos/stats` → 200 with `{ "total": 0, "done": 0 }`.
2. After creating todos and marking a subset done, `GET /todos/stats` reports the corresponding total and done counts.
3. Posting a 200-character title succeeds under the current create contract.
4. Posting a 201-character title returns 400 with a message and does not increase the todo count.

## Delivery guardrails

- Preserve the existing `GET /todos` and successful `POST /todos` contracts except for rejecting titles over the stated maximum.
- Keep the new stats response limited to `total` and `done`; do not expose todo records in this summary.
- Treat the validation check as a precondition to mutation so an invalid request cannot consume an identifier or modify the store.
