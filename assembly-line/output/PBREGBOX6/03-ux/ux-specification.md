# PBREG box-6 — UX specification

## Purpose and scope

This specification defines the developer-facing experience for the two automatic
todo API additions in the source PRD. It covers only **REQ-PB-003** and
**REQ-PB-004**:

- **REQ-PB-003** — `GET /todos/stats` returns HTTP 200 and JSON containing
  `total` and `done` counts.
- **REQ-PB-004** — `POST /todos` rejects a title longer than 200 characters
  with HTTP 400 and a message.

Existing todo listing, pagination, creation within the limit, and all
requirements marked manual are outside this UX stage.

## Design tokens

color-surface: #ffffff
color-text: #0c2238
color-success: #0f766e
color-error: #b42318
color-border: #d0d5dd
space-1: 4px
space-2: 8px
space-3: 12px
radius-control: 6px
font-body: 14px
font-code: 13px

## API consumer experience

The API is consumed by a developer or automation client. Responses are JSON and
should be presented with readable code formatting using {font-code}, {color-text},
and a {color-surface} background. Success state is distinguishable with
{color-success}; input failure is distinguishable with {color-error}. If rendered
in an API explorer, apply {space-2} between request details, status, and response,
and use {radius-control} with a {color-border} boundary for the response panel.

### Statistics flow — REQ-PB-003

1. The client requests `GET /todos/stats` with no request body.
2. The service returns HTTP 200 and a JSON object with exactly the count fields
   required by the contract: `total` and `done`.
3. `total` is the number of todos held by the service; `done` is the number of
   those todos whose completion state is true. Both values are non-negative
   integers, and `done` cannot exceed `total`.
4. An empty collection is still a successful result: `{ "total": 0, "done": 0 }`.

Example success response:

```json
{
  "total": 3,
  "done": 1
}
```

The client can render the result as a compact summary, “1 of 3 completed,” while
retaining the raw JSON for programmatic use. Do not make the client derive these
values by reading paginated list results.

### Create validation flow — REQ-PB-004

1. The client submits `POST /todos` with a JSON `title`.
2. If `title` contains 200 characters or fewer, normal creation continues and
   retains the existing success behavior.
3. If `title` contains more than 200 characters, the service returns HTTP 400,
   does not create a todo, and includes a human-readable JSON error message.
4. The client surfaces the message adjacent to the title field, using
   {color-error}, {space-1}, and {font-body}. It preserves the submitted title so
   the user can shorten it instead of re-entering it.

Example overlength response:

```json
{
  "error": "title must be 200 characters or fewer"
}
```

The exact message text may vary, but it must clearly explain that the title
exceeds the 200-character limit. A 400 response is an expected correction state,
not an unavailable-service state.

## States and feedback

| State | Trigger | Client-facing feedback | Recovery |
| --- | --- | --- | --- |
| Stats available | `GET /todos/stats` returns 200 | Show `total` and `done` in JSON or summary form using {color-success}. | Refresh or request again when counts may have changed. |
| Empty stats | Stats returns zero for both counts | Show “0 of 0 completed”; this is successful, not missing data. | Create a todo through the existing flow. |
| Title valid | Title length is 200 characters or fewer | Preserve normal creation confirmation. | No action required. |
| Title too long | Title length is greater than 200 | Show the server message in {color-error}; do not claim creation succeeded. | Keep the entered title and ask for it to be shortened to 200 characters or fewer. |

## Accessibility and content

- Associate the validation message programmatically with the title input and
  announce it through an error-status mechanism so keyboard and screen-reader
  users receive the HTTP 400 outcome.
- Do not use colour alone: pair {color-error} with explicit text describing the
  200-character limit.
- Use concise, action-oriented copy: “Title must be 200 characters or fewer.”
- Keep response text readable at {font-body}; code payloads use {font-code}.

## Acceptance checks

- **REQ-PB-003:** A request to `GET /todos/stats` receives HTTP 200 and JSON
  with numeric `total` and `done` values, including the empty-state example.
- **REQ-PB-003:** The count relationship is intelligible: `done` is never
  greater than `total`, and clients need not infer totals from pagination.
- **REQ-PB-004:** A `POST /todos` title of 201 characters receives HTTP 400 and
  a readable message explaining the length limit.
- **REQ-PB-004:** The error experience does not imply that a todo was created
  and gives the client a clear recovery action.
