# 🌿 HerbWitch — Living Test Harness
> **Purpose:** This file is the single source of truth for all user-facing features and their tests.
> It should be read at the start of every build session and updated whenever a feature changes.
> When a feature is added or modified, add or update the corresponding test block below.

---

## How To Use This File

1. **Before building:** Read this file to understand what features exist and what their tests expect.
2. **After changing a feature:** Find its test block below, update the `Description` and `Steps` to match the new behavior, and update `Expected Result`.
3. **When adding a feature:** Copy the test block template and fill it in.
4. **Test status key:**
   - ✅ Passing
   - ❌ Failing
   - ⚠️ Untested / Needs verification
   - 🔄 Feature changed — test needs update

---

## Project Overview (keep current)

| Property | Value |
|---|---|
| App name | HerbWitch |
| Stack | HTML + vanilla JS frontend, Node/Express proxy backend |
| Entry point | `http://localhost:3000` (serves `pages/index.html`) |
| Proxy route | `POST /api/claude` |
| Model | `claude-sonnet-4-20250514` |
| Agent count | 3 (Interpreter, Researcher, Witch) |
| Web search | None — server fetches approved sources directly via /api/research |
| Key storage | `.env` file — never committed to git |

---

## Feature Test Blocks

---

### TEST-000 — Server Running Pre-check
**Status:** ✅ Passing  
**Feature:** The Express server must be running before the app will function at all.  
**Element:** Terminal / `npm start`

**Steps:**
1. Before opening the app, confirm the server is running:
```bash
lsof -i :3000
```
2. If nothing appears, start it:
```bash
npm start
```

**Expected Result:**
- Terminal shows: `🌿 HerbWitch server running at http://localhost:3000`
- `lsof -i :3000` shows a node process listening

**Notes:** A NetworkError on Agent 1 (before any agents complete) almost always means the server is not running. This is the first thing to check.

---

### TEST-001 — Text Input Field
**Status:** ✅ Passing  
**Feature:** User can type a description of their ailment into the textarea.  
**Element:** `#ailment-input`

**Steps:**
1. Open `http://localhost:3000`
2. Click the textarea
3. Type: `"I have a headache and an upset stomach"`

**Expected Result:**
- Text appears in the field as typed
- Placeholder text disappears on focus
- Field is resizable vertically

**Notes:** Placeholder reads *"e.g. I have a tension headache and my stomach feels unsettled after eating…"*

---

### TEST-002 — Submit Button (normal state)
**Status:** ✅ Passing  
**Feature:** Clicking the submit button triggers the pipeline.  
**Element:** `#submit-btn`

**Steps:**
1. Type any ailment text into `#ailment-input`
2. Click the "Consult the Herb Witch" button

**Expected Result:**
- Button becomes disabled immediately
- Pipeline tracker becomes visible
- Agent 1 enters `active` state (spinner shows)

---

### TEST-003 — Submit Button (empty input guard)
**Status:** ✅ Passing  
**Feature:** Submitting with an empty input shows an alert and does not start the pipeline.  
**Element:** `#submit-btn`, `#ailment-input`

**Steps:**
1. Leave the textarea empty
2. Click the submit button

**Expected Result:**
- Browser alert fires: `"Please describe your ailment first."`
- Pipeline does NOT become visible
- Button remains enabled

---

### TEST-004 — Keyboard Shortcut (Cmd+Enter)
**Status:** ✅ Passing  
**Feature:** Pressing Cmd+Enter inside the textarea submits the form.  
**Element:** `#ailment-input` keydown listener

**Steps:**
1. Click into the textarea
2. Type any ailment
3. Press `Cmd+Enter`

**Expected Result:**
- Same behavior as clicking the submit button
- Pipeline starts, button disables

**Notes:** Regular `Enter` should NOT submit — it should add a newline.

---

### TEST-005 — Agent 1: The Interpreter
**Status:** ✅ Passing  
**Feature:** First agent activates, processes the ailment text, and completes.  
**Element:** `#agent-1`, `#status-1`

**Steps:**
1. Submit any ailment query
2. Watch Agent 1 row

**Expected Result:**
- Agent 1 row changes to `active` class (amber border pulse, spinner in status)
- After API response, changes to `done` class (green border, "✓ done" text)
- Agent 2 then becomes active

---

### TEST-006 — Agent 2: Researcher (server-side source fetching)
**Status:** ⚠️ Untested  
**Feature:** Second agent calls `/api/research` on the server, which fetches the approved sources directly and returns trimmed excerpts. No Claude API tokens consumed during this step.  
**Element:** `#agent-2`, `#status-2`, `/api/research` route

**Approved sources fetched by server:**
- nccih.nih.gov/health/herbsataglance
- mskcc.org/…/herbs/search
- ods.od.nih.gov/factsheets/list-all/
- herbalgram.org/resources/healthy-ingredients/
- botanicalmedicine.org

**Steps:**
1. Submit any ailment query
2. Wait for Agent 1 to complete
3. Watch Agent 2 row (labeled "Researching")

**Expected Result:**
- Agent 2 activates after Agent 1 completes
- Server fetches all 5 approved sources in parallel
- Relevant sentences are scored and trimmed to max ~1200 chars per source
- Returns `{ context, sourceCount }` to the browser
- No Claude API call made during this step — zero tokens consumed
- Completes and passes context string to Agent 3

**Notes:** This is the key architectural change that eliminates the 429 rate limit error. The server logs how many sources returned relevant excerpts (e.g. `Found excerpts from 3/5 sources`).

**Server-side curl test:**
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"ailments": "headache, anxiety"}'
```
Expected: JSON with `context` string and `sourceCount` number.

---

### TEST-007 — Agent 3: The Witch (synthesizes pre-fetched research)
**Status:** ⚠️ Untested  
**Feature:** Third agent receives pre-fetched source excerpts from Agent 2 and synthesizes them into a warm, readable remedy response with citations. This is now the only heavy Claude API call.  
**Element:** `#agent-3`, `#status-3`

**Steps:**
1. Wait for Agent 2 (Researching) to complete
2. Watch Agent 3 row (labeled "Crafting Your Remedy")

**Expected Result:**
- Activates after Agent 2 completes
- Receives source excerpts as input context (not raw web search results)
- Every herb recommendation is based only on the provided excerpts
- Every herb card includes a *Source: [URL]* line
- Source renders as a clickable `📖 domain.com` link in the UI
- On completion, result section becomes visible with remedy cards
- Max tokens: 700

**Notes:** If source excerpts contain no relevant herbs, the Witch responds honestly rather than hallucinating.

---

### TEST-017 — /api/research Server Route
**Status:** ⚠️ Untested  
**Feature:** The `/api/research` POST route fetches approved sources in parallel, scores sentences by relevance, and returns trimmed excerpts.  
**Element:** `server.js` `/api/research` route

**Steps:**
1. With server running, execute:
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"ailments": "headache, nausea"}'
```

**Expected Result:**
- HTTP 200
- JSON response with `context` (string of source excerpts) and `sourceCount` (number 0–5)
- Server terminal logs: `Found excerpts from X/5 sources`
- Each excerpt prefixed with `SOURCE: [url]`
- Total context string under ~6000 chars

**Notes:** Sources that time out or return no relevant sentences are silently skipped. A `sourceCount` of 0 means no relevant content was found — the Witch will say so honestly.

---

### TEST-016 — Source Citation Links
**Status:** ⚠️ Untested  
**Feature:** Each herb card displays a clickable source link to its approved reference URL.  
**Element:** `.source-link`

**Steps:**
1. Complete a full pipeline run
2. Inspect each herb card in the result

**Expected Result:**
- Each herb card contains a `📖 domain.com` link
- Link opens the source URL in a new tab
- Link styled with dashed moss-green underline, turns amber on hover
- Source domain is one of the five approved domains

---

### TEST-009 — Result Display (herb cards)
**Status:** ✅ Passing  
**Feature:** The remedy response renders as styled herb cards with names and descriptions.  
**Element:** `#result-section`, `.result-box`, `.herb-card`, `.herb-name`, `.herb-desc`

**Steps:**
1. Complete a full pipeline run with a clear ailment (e.g. "headache")
2. Inspect the result area

**Expected Result:**
- `#result-section` becomes visible with `fadeIn` animation
- Result box shows a "🌿 Your Herbal Remedy" header
- At least one `.herb-card` renders with a `.herb-name` and `.herb-desc`
- Disclaimer appears at the bottom of the result

---

### TEST-010 — Disclaimer Display
**Status:** ✅ Passing  
**Feature:** A medical disclaimer always appears below every result.

**Steps:**
1. Complete any pipeline run
2. Scroll to bottom of result box

**Expected Result:**
- Disclaimer text visible: *"This is folk & traditional knowledge, not medical advice..."*
- Styled in muted italic text, separated by a top border

---

### TEST-011 — Error State Display
**Status:** ✅ Passing  
**Feature:** If the API call fails, a user-friendly error message displays.  
**Element:** `.error-box` inside `#result-box`

**Steps:**
1. Temporarily break the API (e.g. stop the server mid-request, or use a bad key)
2. Submit a query

**Expected Result:**
- Result section becomes visible
- Red-tinted `.error-box` appears with message: `"⚠️ The spirits encountered a disturbance: [error]. Please try again."`
- Button re-enables after error

---

### TEST-012 — Button Re-enables After Completion
**Status:** ✅ Passing  
**Feature:** Submit button re-enables after pipeline completes (success or error).  
**Element:** `#submit-btn`

**Steps:**
1. Submit a query and wait for full completion or error
2. Check button state

**Expected Result:**
- `disabled` attribute is removed from button
- Button is clickable again for a new query

---

### TEST-013 — Proxy Server Route
**Status:** ✅ Passing  
**Feature:** The Express proxy at `/api/claude` forwards requests to Anthropic and returns responses.

**Steps:**
1. With server running, execute:
```bash
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"say hi"}]}'
```

**Expected Result:**
- Returns a valid JSON response with `content[0].text` containing a greeting
- HTTP status 200

---

### TEST-014 — Missing API Key Guard
**Status:** ⚠️ Untested  
**Feature:** If `.env` is missing or `ANTHROPIC_API_KEY` is not set, server returns a clear error.

**Steps:**
1. Temporarily remove or blank out `ANTHROPIC_API_KEY` in `.env`
2. Restart server
3. Submit a query or run the curl test above

**Expected Result:**
- Server returns HTTP 500 with JSON: `{"error": "ANTHROPIC_API_KEY is not set. Add it to your .env file."}`
- Frontend shows error box

---

### TEST-015 — Static File Serving
**Status:** ✅ Passing  
**Feature:** The Express server serves `pages/index.html` at the root URL.

**Steps:**
1. Start server with `npm start`
2. Open `http://localhost:3000` in browser

**Expected Result:**
- HerbWitch UI loads fully (header, textarea, button visible)
- No "Cannot GET /" error

---

### TEST-018 — Fun Fact of the Day Widget
**Status:** ⚠️ Untested
**Feature:** A fixed corner widget displays one herb fact per day, fetched from an approved source and cached so the same fact shows all day.
**Element:** `.fact-widget`, `#fact-text`, `#fact-source`, `/api/fact`

**Steps:**
1. Load `http://localhost:3000`
2. Check the bottom-right corner for the widget

**Expected Result:**
- Widget appears fixed in bottom-right corner with moss-green header "Herb Fact of the Day"
- On first load: shows "Gathering today's fact…" briefly, then displays a fact
- Fact is one sentence, bolding the herb name (e.g. **Chamomile**)
- A clickable 📖 Source link appears below the fact
- Refreshing the page shows the same fact (cached in sessionStorage)
- The next calendar day shows a different herb's fact

**Server curl test:**
```bash
curl http://localhost:3000/api/fact
```
Expected: `{"fact": "**Herb** ...", "url": "https://..."}`

**Notes:** Herb rotates deterministically by day-of-year — no randomness, so the same herb shows for all visitors on the same day. Server caches the fact in memory so Claude is only called once per day per server restart.

---
## Test Block Template
> Copy this when adding a new feature:

```
### TEST-XXX — Feature Name
**Status:** ⚠️ Untested
**Feature:** One-sentence description of what this feature does.
**Element:** CSS selector or file/function name

**Steps:**
1. Step one
2. Step two

**Expected Result:**
- What should happen

**Notes:** Any edge cases or gotchas.
```

---

## Change Log
| Date | Test | Change |
|---|---|---|
| 2026-03-05 | All | Initial harness created from v1 feature set |
| 2026-03-05 | TEST-006 | Agent 2 now source-pinned to 5 approved domains, output capped at 400 words |
| 2026-03-05 | TEST-007 | Agent 3 now strictly discards any herb without an approved-domain source URL |
| 2026-03-05 | TEST-008 | Agent 4 now required to cite source URL for every herb recommendation |
| 2026-03-05 | TEST-016 | New test added for clickable source citation links in result cards |
| 2026-03-05 | TEST-000 | Added server pre-check test — NetworkError on Agent 1 = server not running |
| 2026-03-05 | TEST-006/7/8 | Added per-agent max_tokens caps (150/500/400/600) and sleep delays (2s/3s/2s) between agents to prevent 429 rate limit errors |
| 2026-03-05 | TEST-006+007 | Merged Seeker + Distiller into single Researcher agent — reduces API calls from 4 to 3, cuts token chain significantly |
| 2026-03-05 | Architecture | Removed web search tool entirely — server now fetches approved sources directly via /api/research. Claude API calls reduced to 2. 429 rate limit errors eliminated. |
| 2026-03-05 | TEST-006 | Updated to reflect server-side source fetching — zero Claude tokens consumed during research step |
| 2026-03-05 | TEST-007 | Updated — Witch now synthesizes pre-fetched excerpts instead of raw web search output |
| 2026-03-05 | TEST-017 | New test added for /api/research server route |
| 2026-03-05 | server.js | Replaced index page fetching with herb-specific detail pages (NCCIH + MSKCC). Added ailment→herb mapping so only relevant herb pages are fetched per query. Fixes empty context bug. |
| 2026-03-05 | TEST-018 | Added fun fact of the day widget — fixed corner, daily cache, /api/fact route |