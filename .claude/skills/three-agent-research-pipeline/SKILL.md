---
name: three-agent-research-pipeline
description: >
  Use this skill when the user wants to build a multi-step AI pipeline that
  interprets a natural-language query, fetches real source content from
  pre-approved URLs without burning Claude API tokens, then synthesizes a
  cited answer. Trigger phrases include: "three-agent pipeline",
  "multi-agent research app", "server-side source fetching", "interpret then
  research then synthesize", "RAG without a vector DB", "cited AI answer",
  "pipeline with source excerpts", "herbwitch pattern", or any request to
  build an app where an AI interprets user input, looks up real sources, and
  writes a grounded response. Also triggers when the user wants to avoid
  Claude web-search tool costs or prevent AI hallucination by pinning answers
  to approved URLs.
version: 1.0.0
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Three-Agent Research Pipeline

A battle-tested pattern for building AI apps that give **cited, source-grounded
answers** without burning API tokens on web search or hitting rate limits.
Originally built for [HerbWitch](https://github.com/Pondering-North/herbwitch).

The core idea: only two Claude API calls per user query, no matter how many
sources you check. The expensive "go look it up" step runs server-side in plain
Node.js.

---

## How the pattern works

```
User query
    │
    ▼
┌─────────────────────────────────────────────────┐
│  AGENT 1 — Interpreter          (Claude call #1) │
│  Natural language → structured key terms         │
│  Max tokens: ~150   Cost: tiny                   │
└───────────────────────┬─────────────────────────┘
                        │ comma-separated terms
                        ▼
┌─────────────────────────────────────────────────┐
│  AGENT 2 — Researcher        (NO Claude call)    │
│  Server fetches approved URLs in parallel        │
│  Scores & trims sentences by keyword relevance   │
│  Returns context string + source URLs            │
│  Cost: $0 Claude tokens                          │
└───────────────────────┬─────────────────────────┘
                        │ excerpts + source URLs
                        ▼
┌─────────────────────────────────────────────────┐
│  AGENT 3 — Synthesizer          (Claude call #2) │
│  Reads excerpts, writes cited answer             │
│  Only cites URLs actually present in excerpts    │
│  Max tokens: ~700                                │
└─────────────────────────────────────────────────┘
```

**Why this beats alternatives:**
- Claude web-search tool: costs tokens on every search, can hallucinate URLs
- RAG / vector DB: complex infrastructure, embeddings cost, staleness issues
- Direct Claude answer: no citations, may hallucinate facts

This pattern fetches real live pages, extracts only relevant sentences, and
gives Claude exactly the context it needs — nothing more.

---

## Implementation guide

### 1. The approved source map

Define your sources as an array of `{url, name, topic}` objects. One URL per
topic page. This is your "approved domain" list — Claude will only cite these.

```js
const APPROVED_SOURCES = [
  // Map each topic to multiple authoritative sources
  { url: "https://example-authority.org/topic/chamomile", name: "Authority1", topic: "chamomile" },
  { url: "https://another-source.com/herbs/chamomile",    name: "Authority2", topic: "chamomile" },
  { url: "https://example-authority.org/topic/ginger",    name: "Authority1", topic: "ginger" },
  // ...repeat for every topic you want to cover
];
```

**Tips:**
- 3–6 sources per topic is plenty
- Mix authoritative institutional sources with practitioner/community sources
- The source `name` appears in your UI and in logs — make it human-readable
- For domains that publish plain `.txt` monographs (like Michael Moore's SWSBM),
  see the **text-file source** section below

---

### 2. The query → topic mapping

A plain JS object mapping user phrases to your topic names. This is the
"fuzzy matching" layer — no embeddings needed.

```js
const QUERY_TOPIC_MAP = {
  // exact terms
  "headache":        ["peppermint", "lavender", "feverfew"],
  "migraine":        ["feverfew", "peppermint", "lavender"],
  // synonyms and related phrases
  "head pain":       ["peppermint", "lavender", "feverfew"],
  "cant sleep":      ["valerian", "chamomile", "passionflower"],
  "can't sleep":     ["valerian", "chamomile", "passionflower"],
  // multi-word ailments
  "joint pain":      ["turmeric", "ginger", "willow bark"],
  // ...
};
```

**Matching strategy (two-tier — prevents wrong herbs from winning):**

```js
const priorityTopics = new Set();   // from exact / substring matches
const extraTopics    = new Set();   // from word-overlap fallback

for (const term of queryTerms) {
  for (const [key, topics] of Object.entries(QUERY_TOPIC_MAP)) {
    const isSubstring = term.includes(key) || key.includes(term);
    const wordOverlap = !isSubstring && term.split(/\s+/).some(
      w => w.length > 3 && key.split(/\s+/).some(k => k.includes(w) || w.includes(k))
    );

    if (isSubstring) topics.forEach(t => priorityTopics.add(t));
    else if (wordOverlap) topics.forEach(t => extraTopics.add(t));
  }
}

// Priority topics fill the top-5 slot first; extras are fallback
const relevantTopics = new Set([
  ...priorityTopics,
  ...[...extraTopics].filter(t => !priorityTopics.has(t))
]);
```

> **Why two tiers?** Without prioritisation, a word-overlap match can push
> the correct topics out of the top-5 fetch window. For example, "inflammation"
> matched sleep herbs via word overlap *before* the exact "inflammation" key
> was reached in Map iteration order, so turmeric never made it into the fetch.

---

### 3. Server-side research route (`/api/research`)

```js
// Express route — no Claude call, just parallel HTTP fetches
app.post("/api/research", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });

  const queryTerms  = query.toLowerCase().split(/,\s*/);
  const priorityTopics = new Set();
  const extraTopics    = new Set();

  for (const term of queryTerms) {
    for (const [key, topics] of Object.entries(QUERY_TOPIC_MAP)) {
      const isSubstring = term.includes(key) || key.includes(term);
      const wordOverlap = !isSubstring && term.split(/\s+/).some(
        w => w.length > 3 && key.split(/\s+/).some(k => k.includes(w) || w.includes(k))
      );
      if (isSubstring) topics.forEach(t => priorityTopics.add(t));
      else if (wordOverlap) topics.forEach(t => extraTopics.add(t));
    }
  }

  const relevantTopics = new Set([...priorityTopics,
    ...[...extraTopics].filter(t => !priorityTopics.has(t))]);

  if (relevantTopics.size === 0) {
    // domain-specific fallback topics
    ["default-topic-1", "default-topic-2"].forEach(t => relevantTopics.add(t));
  }

  const topTopics     = [...relevantTopics].slice(0, 5);
  const sourcesToFetch = APPROVED_SOURCES.filter(s => topTopics.includes(s.topic));

  // Fetch all in parallel — typically 15–30 requests, completes in ~2s
  const results = await Promise.all(sourcesToFetch.map(fetchPage));
  const found   = results.filter(Boolean);

  const context = found.length > 0
    ? found.map(r => `TOPIC: ${r.topic}\nSOURCE: ${r.url}\n${r.excerpt}`).join("\n\n---\n\n")
    : "No relevant information found in approved sources.";

  res.json({ context, sourceCount: found.length, topicsFound: [...new Set(found.map(r => r.topic))] });
});
```

---

### 4. The page fetcher + sentence scorer

```js
async function fetchPage(source) {
  try {
    const resp = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html,text/plain" },
      signal: AbortSignal.timeout(8000)
    });
    if (!resp.ok) return null;

    const raw  = await resp.text();
    const text = stripHtml(raw);   // see stripHtml() below

    // Pull sentences of a useful length
    const sentences = text.match(/[^.!?]{30,300}[.!?]/g) || [];

    // Score by domain-relevant keywords — customise this list for your domain
    const USEFUL_KEYWORDS = [
      "used for", "used to", "may help", "has been used", "traditional",
      "shown to", "evidence", "benefit", "effective", "treat", "relief",
      "reduce", "relieve", "study", "research", "clinical", "found", "suggest",
      // Add domain-specific terms:
      // "tea", "steep", "dose", "preparation"  ← herbalism
      // "dosage", "contraindicated", "interaction"  ← clinical
      // "recipe", "ingredient", "technique"  ← cooking
    ];

    const useful = sentences
      .filter(s => USEFUL_KEYWORDS.some(k => s.toLowerCase().includes(k)))
      .slice(0, 10)
      .join(" ");

    if (useful.length < 50) return null;

    return {
      topic:   source.topic,
      name:    source.name,
      url:     source.url,
      excerpt: useful.length > 1500 ? useful.slice(0, 1500) + "..." : useful
    };
  } catch (err) {
    console.warn(`Could not fetch ${source.url}: ${err.message}`);
    return null;
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}
```

---

### 5. Text-file sources (monographs, datasets)

For sources that publish large `.txt` files (one file, many topics inside —
e.g. Michael Moore's SWSBM Materia Medica):

```js
// Cache the whole file on first request, search in-memory thereafter
const fileCache = {};

async function loadTextFile(url, cacheKey) {
  if (fileCache[cacheKey]) return fileCache[cacheKey];
  const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) return null;
  const text = await resp.text();
  fileCache[cacheKey] = text;
  return text;
}

async function fetchTextFileEntry(fileUrl, cacheKey, searchTerm, topicName) {
  const text  = await loadTextFile(fileUrl, cacheKey);
  if (!text) return null;

  // If the file is indexed by a different term (e.g. Latin genus name),
  // keep a TERM_TO_INDEX_KEY map and look up before searching
  const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (idx === -1) return null;

  const start   = Math.max(0, idx - 200);           // some context before
  const end     = Math.min(text.length, idx + 1000);
  const excerpt = text.slice(start, end).trim();

  return { topic: topicName, name: "Source Name", url: fileUrl, excerpt };
}
```

Add text-file fetches alongside HTML page fetches in your route:

```js
const [htmlResults, ...textResults] = await Promise.all([
  Promise.all(sourcesToFetch.map(fetchPage)),
  ...topTopics.flatMap(topic => [
    fetchTextFileEntry(MONOGRAPH_URL, "monograph", topic, topic),
    fetchTextFileEntry(CONTRA_URL,    "contra",    topic, topic),
  ])
]);
const found = [...htmlResults.filter(Boolean), ...textResults.filter(Boolean)];
```

---

### 6. Claude proxy route

Keep your API key server-side. Frontend never touches it.

```js
app.post("/api/claude", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json(data);
  res.json(data);
});
```

---

### 7. Frontend pipeline

**HTML — three agent rows:**

```html
<div id="pipeline">
  <div class="agent waiting" id="agent-1">
    <span class="agent-icon">🔍</span>
    <span class="agent-name">Interpreting</span>
    <span class="agent-status" id="status-1">waiting</span>
  </div>
  <div class="agent waiting" id="agent-2">
    <span class="agent-icon">📚</span>
    <span class="agent-name">Researching</span>
    <span class="agent-status" id="status-2">waiting</span>
  </div>
  <div class="agent waiting" id="agent-3">
    <span class="agent-icon">✍️</span>
    <span class="agent-name">Writing Answer</span>
    <span class="agent-status" id="status-3">waiting</span>
  </div>
</div>
```

**CSS — three states:**

```css
.agent { display:flex; align-items:center; gap:0.6rem; padding:0.5rem 1rem;
         border-radius:8px; transition:all 0.3s; }
.agent.waiting  { opacity:0.4; }
.agent.active   { opacity:1; border:2px solid gold;
                  animation: pulse 1.2s ease-in-out infinite; }
.agent.done     { opacity:1; border:2px solid limegreen; }
@keyframes pulse { 0%,100% { box-shadow:0 0 0 0 gold; }
                   50%      { box-shadow:0 0 0 6px transparent; } }
```

**JS — the orchestration:**

```js
const MODEL = "claude-sonnet-4-20250514";  // or claude-haiku for lower cost

function setAgent(n, state) {
  document.getElementById(`agent-${n}`).className = `agent ${state}`;
  document.getElementById(`status-${n}`).textContent =
    state === "done" ? "✓ done" : state === "active" ? "…" : "waiting";
}

async function callClaude(system, user, maxTokens = 600) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens,
                           system, messages: [{ role:"user", content:user }] })
  });
  if (!r.ok) throw new Error(`Claude error ${r.status}`);
  const d = await r.json();
  return d.content.filter(b => b.type==="text").map(b=>b.text).join("\n");
}

async function runPipeline(userInput) {
  // Agent 1 — Interpret
  setAgent(1, "active");
  const terms = await callClaude(
    `You are the Interpreter. Extract the core topics from the user's message.
     Output ONLY a comma-separated list of terms. No explanations.`,
    userInput, 150
  );
  setAgent(1, "done");

  // Agent 2 — Research (server-side, no Claude token cost)
  setAgent(2, "active");
  const r = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: terms })
  });
  const { context } = await r.json();
  setAgent(2, "done");

  // Agent 3 — Synthesise
  setAgent(3, "active");
  const answer = await callClaude(
    `You are a knowledgeable assistant. Answer using the provided source excerpts.
     For each point, bold the topic name and include a *Source: [url]* line when
     a URL is available for it. Only cite URLs that actually appear in the excerpts —
     do not guess or invent URLs. End with: "Consult a professional if needed."`,
    `User question: "${userInput}"\n\nSource excerpts:\n\n${context}`,
    700
  );
  setAgent(3, "done");

  renderAnswer(answer);
}
```

---

### 8. Agent 1 system prompt tips

Agent 1 is tiny (150 tokens) but critical — its output drives the topic
lookup in step 2. Tune the prompt for your domain:

| Domain | Prompt example |
|--------|---------------|
| Herbalism | "Extract physical ailments. Output comma-separated list only." |
| Cooking | "Extract dish names or ingredients the user is asking about." |
| Legal | "Extract the legal topics or jurisdiction the user mentions." |
| Finance | "Extract financial instruments, companies, or concepts mentioned." |
| Travel | "Extract destination names, activities, or travel concerns." |

Keep it ruthlessly short — Agent 1 is a classifier, not a thinker.

---

### 9. Agent 3 system prompt tips

This is where your domain expertise lives. Key rules to always include:

1. **Prioritise excerpts** — "Use the provided excerpts as your primary source"
2. **Source pinning** — "Only cite URLs that appear in the excerpts. Do not invent URLs."
3. **Fallback gracefully** — "If excerpts are sparse, draw on your knowledge — but never say 'the excerpts don't cover this'"
4. **Format control** — specify bold names, source lines, headers, word limit
5. **Safety / disclaimer** — always close with a "consult a professional" line

---

### 10. Token cost profile

Typical query with 5 topics × 5 sources:

| Step | Claude tokens | Wall time |
|------|--------------|-----------|
| Agent 1 (Interpreter) | ~200 in / ~50 out | ~0.5s |
| Agent 2 (Research) | **0** | ~1.5–3s |
| Agent 3 (Synthesiser) | ~2000 in / ~500 out | ~3–5s |
| **Total** | **~2750 tokens** | **~5–9s** |

Equivalent naive approach (Claude searches each source): ~15,000+ tokens.

---

## Adapting to your domain

To reuse this pattern for a new subject area, you only need to change three things:

1. **`APPROVED_SOURCES`** — swap in your authoritative URLs
2. **`QUERY_TOPIC_MAP`** — map your domain's terminology to topic names
3. **Agent 1 + Agent 3 system prompts** — tune the language for your domain

The server infrastructure (`/api/research`, `/api/claude`, `fetchPage`,
`stripHtml`) is fully generic and reusable as-is.

---

## File structure

```
your-app/
├── server.js          # Express server with /api/research + /api/claude routes
├── pages/
│   └── index.html     # Frontend with pipeline UI
├── .env               # ANTHROPIC_API_KEY=sk-ant-...
└── package.json       # "test": "node tests/run-tests.js"
```

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Agent 3 invents source URLs | Add "only cite URLs present in excerpts" to system prompt |
| Word-overlap matching pulls wrong topics into top-5 | Use two-tier priority/extra Sets, not a single flat Set |
| API key exposed to frontend | All Claude calls go through `/api/claude` proxy |
| Too many Claude calls → rate limits | Keep Agent 2 server-side with zero Claude calls |
| Sources time out → empty context | Use `AbortSignal.timeout(8000)` and return null gracefully |
| SWSBM / txt file fetched once per herb | Cache at file level, search in-memory per herb |
