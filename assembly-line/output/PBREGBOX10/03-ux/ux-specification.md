# PBREG box-10 automatic — UX specification

**Stage:** UX  
**Programme:** `prg-be26f3fd-928d-4426-9952-f38614b58325`  
**Stage run:** `srun-70600045-e710-49fc-99b6-fa4806d296f8`

## Purpose and scope

This specification defines the client-facing API contract and the presentation states needed for the automatic PBREG box-10 change. It covers only:

- **REQ-PB-003** — `GET /todos/stats` returns HTTP 200 and JSON containing `total` and `done` counts.
- **REQ-PB-004** — `POST /todos` rejects a title longer than 200 characters with HTTP 400 and a message.

It does not introduce a new todo-list UI, authentication, pagination, or behaviour for the manual requirements.

## Design tokens

color-background: #ffffff
color-surface: #f5f8fa
color-text: #0c2238
color-muted-text: #526575
color-border: #b8c5cf
color-success: #176b45
color-error: #b42318
color-error-surface: #fff1f0
focus-ring: #1a73e8
font-body: system-ui, sans-serif
font-size-body: 16px
font-size-caption: 14px
line-height-body: 1.5
space-1: 4px
space-2: 8px
space-3: 16px
radius-control: 4px

## API-facing experience

### Todo summary

The consuming client requests `GET /todos/stats` when it needs the current todo summary. On a successful response, present the two returned values as a concise, readable summary:

`done of total todos complete` (with `done` and `total` replaced by the returned numeric values)

Use `{color-text}` on `{color-background}` for the summary. Keep the words “todos complete” visible; counts must not be conveyed by colour, icon, or position alone. If `total` is zero, display `0 of 0 todos complete` rather than implying an unavailable result.

| State | Trigger | Presentation | Behaviour |
| --- | --- | --- | --- |
| Loading | summary request is in flight | “Loading todo summary…” in `{color-muted-text}` | Preserve the last successfully rendered summary, if one exists. |
| Success | HTTP 200 with numeric `total` and `done` | Render the returned `done` and `total` values as “done of total todos complete” in `{color-text}` | Replace loading text with the returned counts. |
| Unavailable | request fails or the payload is unusable | “Todo summary is unavailable. Try again.” in `{color-error}` | Offer a retry that makes a new `GET /todos/stats` request. |

### Create-todo title validation

The title control accepts at most 200 characters. Show a live character counter below the control in the format `N/200 characters`, using `{font-size-caption}` and `{color-muted-text}`. The counter is supplemental: submission handling remains authoritative because the API validates the same rule.

When a user submits a title longer than 200 characters and receives HTTP 400, keep their entered title unchanged, associate the returned message with the title field, and show the message in an inline error region. If the response does not supply usable message text, show this fallback: `Title must be 200 characters or fewer.`

| State | Trigger | Presentation | Behaviour |
| --- | --- | --- | --- |
| Default | title length is 0–200 characters | Standard border `{color-border}`; counter `{color-muted-text}` | Submission is available under the normal create-todo flow. |
| Client warning | title length exceeds 200 before submission | Error border `{color-error}`; counter and helper text in `{color-error}`: “Title must be 200 characters or fewer.” | Prevent client submission where supported; retain all entered text so it can be corrected. |
| Server validation error | `POST /todos` returns HTTP 400 for an overlength title | Error border `{color-error}` and `{color-error-surface}` error region containing the API message or fallback | Move focus to the title field after the response. Clear the error as soon as the title is corrected to 200 characters or fewer. |

## Interaction and content rules

- Update the character counter on every title edit, including paste and deletion.
- Count characters as the client submits them; do not silently truncate a title.
- Use the API’s 400 message verbatim when it is safe, plain text. Otherwise use the defined fallback.
- Do not treat another HTTP status as the overlength-title validation state; show the application’s general request-failure treatment instead.
- A retry for the summary must be keyboard operable and have an accessible name such as “Retry todo summary”.

## Accessibility

- Label the title input with a persistent visible “Title” label; placeholder text is not a substitute.
- Connect the counter and validation message to the input with programmatic descriptive text. Set `aria-invalid="true"` only while the title is invalid.
- Announce the server validation message in a non-duplicative error/status live region after the failed submission.
- Ensure the error foreground `{color-error}` and summary text `{color-text}` have sufficient contrast against their respective background tokens.
- All focus indicators use `{focus-ring}` and remain visible with keyboard navigation.

## Acceptance mapping

| Requirement | UX acceptance evidence |
| --- | --- |
| REQ-PB-003 | A successful `GET /todos/stats` renders both numeric fields as “done of total todos complete” with those words replaced by the returned values; the loading, retry, and unavailable states do not obscure a valid returned summary. |
| REQ-PB-004 | A title exceeding 200 characters is clearly correctable, and an HTTP 400 preserves the input and presents the server message (or stated fallback) at the title field. |
