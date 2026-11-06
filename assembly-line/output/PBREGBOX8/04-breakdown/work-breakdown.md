# PBREG box-8 R4 automatic — work breakdown

## Scope and traceability

This breakdown implements only the automatic requirements in the retained PRD:

| Requirement | Work item | Delivery |
| --- | --- | --- |
| REQ-PB-003 | `wi-aeb0af9f-9534-4ff8-b19f-7c15aab7cafa` — Add todo statistics endpoint | Todo statistics operation, `GET /todos/stats`, and HTTP tests. |
| REQ-PB-004 | `wi-8da6bd90-683b-417e-9160-5816542d8009` — Reject todo titles longer than 200 characters | POST boundary validation, JSON 400 error, and HTTP tests. |

REQ-PB-001 and REQ-PB-002 are manual requirements from another set and are not part of this delivery.

## Build order

The items are independently deliverable and have no ordering dependency. Each item includes its production code and automated tests in the same change.

### 1. Add todo statistics endpoint

**Platform work item:** `wi-aeb0af9f-9534-4ff8-b19f-7c15aab7cafa`  
**Covers:** REQ-PB-003

Implement a statistics function in `src/todos.js` that derives `total` from all stored todos and `done` from todos whose `done` flag is true. Add `GET /todos/stats` in `src/server.js`, returning HTTP 200 and `{ "total": number, "done": number }` as JSON. Add HTTP-level automated tests that verify the empty state and a collection containing both complete and incomplete todos.

Done when the route returns the stated shape and accurate values for the collection at request time, with the tests passing under `npm test`.

### 2. Reject todo titles longer than 200 characters

**Platform work item:** `wi-8da6bd90-683b-417e-9160-5816542d8009`  
**Covers:** REQ-PB-004

Validate the title received by `POST /todos` before it reaches `addTodo`. When its length exceeds 200 characters, return HTTP 400 with an `application/json` response containing a human-readable error message, and leave the stored collection unchanged. Preserve successful creation for a title whose length is exactly 200 characters. Add HTTP-level automated tests for the 201-character rejection, unchanged collection, JSON error message, and 200-character boundary acceptance.

Done when the invalid request is rejected without mutation, valid boundary input is still created, and the tests pass under `npm test`.

## Verification

Run `npm test` after both items land. The suite must cover both new HTTP behaviors as well as existing todo behavior.
