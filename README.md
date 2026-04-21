# Creative Writing App

A production-minded shortform creative writing app with three modes:

- Poem
- Short Story
- LinkedIn Post

It includes mode-specific validation, article upload parsing for LinkedIn mode, a backend generation route, graceful error handling, and rewrite actions.

## Recommended file structure

```text
src/
  components/
    app/
      FormField.tsx
      ModeTabs.tsx
      OutputPanel.tsx
    ui/
      button.tsx
      card.tsx
      input.tsx
      select.tsx
      textarea.tsx
  lib/
    api.ts
    constants.ts
    files.ts
    prompts.ts
    sanitize.ts
    types.ts
    utils.ts
    validation.ts
  test/
    validation.test.ts
  App.tsx
  index.css
  main.tsx
server/
  api/
    demo.ts
    openai.ts
    route.ts
    types.ts
  viteApiPlugin.ts
```

## Architecture

- `src/App.tsx` owns the product flow, state, and mode switching.
- `src/lib/validation.ts` handles reusable per-mode validation.
- `src/lib/prompts.ts` builds reusable prompts for all generation and rewrite flows.
- `src/lib/files.ts` extracts readable text from uploaded `.txt`, `.md`, and `.html` article files.
- `src/lib/api.ts` sends a unified request schema to the backend.
- `server/api/route.ts` validates again on the server, maps errors into safe user-facing messages, and calls either:
  - `server/api/openai.ts` for real model generation
  - `server/api/demo.ts` for local demo mode when `OPENAI_API_KEY` is missing and demo mode is allowed
- `server/viteApiPlugin.ts` exposes the backend route in both `vite dev` and `vite preview`

## UI flow

1. Choose a mode.
2. Fill in the mode-specific fields.
3. Upload source article files for LinkedIn mode.
4. Press `Generate`.
5. Review the output.
6. Copy, regenerate, or use a rewrite action such as `Make shorter` or `Make warmer`.

## Validation logic

- Required fields are enforced per mode.
- Inputs are sanitized before validation and again before prompt construction.
- Oversized text fields are limited.
- LinkedIn uploads fail safely for:
  - unsupported file types
  - unreadable files
  - too many files
  - too little extracted article text
- Story word count targets must be numeric.

## API route

- Endpoint: `POST /api/creative`
- Actions:
  - `generate`
  - `rewrite`
- Supported modes:
  - `poem`
  - `story`
  - `linkedin`

## Example request payload

```json
{
  "mode": "linkedin",
  "action": "generate",
  "input": {
    "ownAngle": "Most AI product trust issues are really UX issues.",
    "targetAudience": "Product leaders",
    "postGoal": "Share a practical insight",
    "tone": "Thoughtful and credible",
    "cta": "How are you handling this in your product?",
    "desiredLength": "Medium",
    "articles": [
      {
        "id": "source-1",
        "name": "article.txt",
        "text": "Article body goes here...",
        "mimeType": "text/plain",
        "size": 2048
      }
    ]
  }
}
```

## Example success response

```json
{
  "ok": true,
  "data": {
    "mode": "linkedin",
    "action": "generate",
    "title": "LinkedIn post draft",
    "content": "Final generated text...",
    "source": "openai",
    "notices": []
  }
}
```

## Example error response

```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "Please check your inputs and try again.",
    "retryable": false,
    "fieldErrors": {
      "articles": "Upload at least one article to synthesize."
    }
  }
}
```

## Error handling strategy

The app explicitly handles:

- empty required fields
- invalid file upload type
- unreadable upload
- article upload with too little text
- API timeout
- API rate limit
- malformed model response
- network failure
- unsupported mode
- user input that is too long
- prompt construction failure
- missing environment variables
- generic unexpected exceptions

Sensitive details stay in server logs, while users see a calm human-friendly message and keep their entered form data.

## Prompt builders

- `buildPoemPrompt`
- `buildStoryPrompt`
- `buildLinkedInPrompt`
- `buildRewritePrompt`

All prompts steer away from direct imitation and instead target high-level writing traits.

## Tests

Example tests live in `src/test/validation.test.ts` and cover:

- invalid poem submissions
- valid short story input
- invalid LinkedIn article uploads
- prompt composition for LinkedIn mode

Run them with:

```bash
npm test
```

## Environment variables

Use a real backend model by setting:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Optional:

```bash
DISABLE_DEMO_MODE=true
```

If `OPENAI_API_KEY` is missing, the app falls back to a built-in demo generator unless demo mode is disabled.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Optional v2 ideas

- richer article format support such as PDF or DOCX extraction
- draft history with version compare
- saved prompts and presets per mode
- tone sliders instead of text fields
- citations or source-summary panes for LinkedIn mode
- streaming output for long story generation
