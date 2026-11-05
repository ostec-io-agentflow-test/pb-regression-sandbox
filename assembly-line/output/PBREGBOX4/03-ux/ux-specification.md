# PBREG box-4 — UX specification

## Purpose and scope

This specification defines the developer-facing experience for the two automatic
todo API additions in the retained PRD. It covers only the following requirement
references:

- **REQ-PB-003** — `GET /todos/stats` returns a successful aggregate response.
- **REQ-PB-004** — `POST /todos` rejects a title longer than 200 characters with
  a useful client error.

The existing todo-list response, pagination, todo completion flow, authentication,
and the manual requirement set are outside this stage.

## Users and context

The primary user is an API consumer: a frontend, automation client, or developer
integrating with the todo service. The response contract must be simple to parse,
stable in shape, and explicit when client input cannot be accepted. JSON is the
only interaction surface for this change; no browser UI is introduced.

## Design tokens

api-surface: JSON over HTTP
success-status: 200
created-status: 201
validation-status: 400
content-type: application/json
title-max-length: 200
colour-success: #16794b
colour-error: #b42318
colour-text: #0c2238
colour-surface: #ffffff
space-unit: 8px

## Experience principles

- Make aggregate state immediately legible: the two returned numbers have fixed,
  plain-language keys and require no client-side interpretation beyond display.
- Make invalid input actionable: identify the `title` field and state the allowed
  maximum so a client can correct and resubmit without guessing.
- Preserve machine readability: success and error bodies remain JSON and use
  `{content-type}`.
- Keep status semantics unambiguous: successful reads use `{success-status}`;
  a rejected request uses `{validation-status}` and does not create a todo.

## Endpoint experience: statistics

### Request

The consumer requests `GET /todos/stats` with no request body. This route reports
the current aggregate state of the todo collection; it is not paginated and does
not require a todo identifier.

### Successful response

Return HTTP `{success-status}` with `{content-type}` and exactly this JSON shape:

```json
{
  "total": 12,
  "done": 5
}
```

`total` is the number of todos currently held by the service. `done` is the
number among that same collection whose `done` value is true. Both are
non-negative integers. An empty collection returns `{ "total": 0, "done": 0 }`.
The visual or client presentation may emphasize the completion count with
`{colour-success}`, while retaining `{colour-text}` contrast against
`{colour-surface}`; this styling guidance is optional because the API does not
return presentation metadata.

### Consumer handling

Consumers can render the values as a compact summary such as “5 of 12 complete,”
or use them directly for progress calculations. They must not infer a list of
todos from this response; fetching individual records remains the responsibility
of the existing list endpoint.

## Endpoint experience: title-length validation

### Request and boundary

The consumer submits `POST /todos` with a JSON body containing `title`. A title
of at most `{title-max-length}` characters follows the normal creation path and
receives the existing created response with `{created-status}`. The maximum is
inclusive: a title of exactly `{title-max-length}` characters is accepted.

### Validation error

When `title` exceeds `{title-max-length}` characters, return HTTP
`{validation-status}`, `{content-type}`, and a JSON error body with a human- and
machine-readable message. The message must identify `title`, state that it is too
long, and state the maximum. Recommended body:

```json
{
  "error": "title must be 200 characters or fewer"
}
```

The response is an error state and has `{colour-error}` emphasis in any client
that presents API feedback. It does not create a todo, allocate an id, or modify
the statistics returned by `/todos/stats`.

### Consumer recovery

The client retains the submitted value, highlights the title field, communicates
the maximum ({title-max-length}), and allows correction and resubmission. For
non-visual consumers, the `error` string provides the equivalent actionable
feedback. Clients should branch on `{validation-status}` rather than treating the
response as a created todo.

## State and edge-case matrix

| Scenario | HTTP result | JSON body | Expected consumer outcome |
| --- | --- | --- | --- |
| No todos exist; read stats | `{success-status}` | `{ "total": 0, "done": 0 }` | Render an empty-state summary. |
| Todos exist; read stats | `{success-status}` | `total` and `done` non-negative integers | Present a consistent completion summary. |
| Title is 200 characters | `{created-status}` | Existing created-todo body | Treat as a successful creation. |
| Title is over 200 characters | `{validation-status}` | JSON `error` naming the title limit | Keep input, show correction guidance, create nothing. |

## Requirement traceability

| Requirement | UX commitment | Verification focus |
| --- | --- | --- |
| REQ-PB-003 | `GET /todos/stats` returns `{ "total": <count>, "done": <count> }` with `{success-status}`. | Test empty and populated collections; assert the two keys and numeric counts. |
| REQ-PB-004 | An overlength `title` returns `{validation-status}` and an explanatory JSON message; no todo is created. | Submit 201 characters, assert status/message, then assert counts are unchanged. |

## Acceptance notes

- The statistics response must retain the `total` and `done` key names exactly.
- The validation message may vary in wording only if it remains explicit about
  the title field and the `{title-max-length}`-character maximum.
- No requirement in this stage changes success behavior for valid todo creation.
