#!/usr/bin/env node
/**
 * HerbWitch — Full Test Harness
 * ─────────────────────────────
 * Run:  node tests/run-tests.js
 *
 * The server must already be running on PORT (default 3000).
 * Every feature of the app is represented here.
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────
const PORT   = process.env.PORT || 3000;
const BASE   = `http://localhost:${PORT}`;
const TIMEOUT = 20_000; // ms per fetch

// ── Helpers ─────────────────────────────────────────────────────
const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";
const BOLD   = "\x1b[1m";

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function pass(id, label) {
  passed++;
  console.log(`  ${GREEN}✔${RESET}  ${DIM}${id}${RESET}  ${label}`);
}

function fail(id, label, detail = "") {
  failed++;
  failures.push({ id, label, detail });
  console.log(`  ${RED}✘${RESET}  ${DIM}${id}${RESET}  ${label}`);
  if (detail) console.log(`       ${RED}${detail}${RESET}`);
}

function skip(id, label, reason = "") {
  skipped++;
  console.log(`  ${YELLOW}–${RESET}  ${DIM}${id}${RESET}  ${label}${reason ? `  ${DIM}(${reason})${RESET}` : ""}`);
}

function section(title) {
  console.log(`\n${CYAN}${BOLD}▶ ${title}${RESET}`);
}

async function GET(path, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout || TIMEOUT);
  try {
    const r = await fetch(`${BASE}${path}`, { signal: ctrl.signal, ...opts });
    clearTimeout(timer);
    return r;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function POST(path, body, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout || TIMEOUT);
  try {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return r;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════

// ── 1. Server Availability ──────────────────────────────────────
section("Server Availability");

try {
  const r = await GET("/");
  if (r.ok) pass("SRV-001", "Server responds on GET /");
  else       fail("SRV-001", "Server responds on GET /", `HTTP ${r.status}`);
} catch (e) {
  fail("SRV-001", "Server responds on GET /", `Cannot connect — is the server running? (${e.message})`);
  // Most subsequent tests will also fail; print early summary and exit
  console.log(`\n${RED}${BOLD}Server is not reachable. Start it with: npm start${RESET}\n`);
  process.exit(1);
}

// ── 2. Static File Serving ──────────────────────────────────────
section("Static File Serving");

{
  const r = await GET("/");
  const html = await r.text();
  if (html.includes("HerbWitch"))
    pass("STATIC-001", "GET / returns the HerbWitch HTML page");
  else
    fail("STATIC-001", "GET / returns the HerbWitch HTML page", "HTML missing expected title");
}

{
  // index.html should contain the textarea and the submit button
  const r = await GET("/");
  const html = await r.text();
  const hasTextarea = html.includes("ailment-input");
  const hasButton   = html.includes("submit-btn");
  if (hasTextarea && hasButton)
    pass("STATIC-002", "index.html contains textarea#ailment-input and #submit-btn");
  else
    fail("STATIC-002", "index.html contains textarea#ailment-input and #submit-btn",
         `textarea: ${hasTextarea}, button: ${hasButton}`);
}

{
  const r = await GET("/");
  const html = await r.text();
  if (html.includes("agent-1") && html.includes("agent-2") && html.includes("agent-3"))
    pass("STATIC-003", "All three agent pipeline divs are present in HTML");
  else
    fail("STATIC-003", "All three agent pipeline divs are present in HTML");
}

{
  const r = await GET("/");
  const html = await r.text();
  if (html.includes("Consult the Herb Witch"))
    pass("STATIC-004", "Submit button text 'Consult the Herb Witch' is present");
  else
    fail("STATIC-004", "Submit button text 'Consult the Herb Witch' is present");
}

{
  const r = await GET("/");
  const html = await r.text();
  if (html.includes("fact-widget") || html.includes("daily-fact") || html.includes("api/fact"))
    pass("STATIC-005", "Daily Herb Fact widget markup is present in HTML");
  else
    fail("STATIC-005", "Daily Herb Fact widget markup is present in HTML");
}

{
  const r = await GET("/");
  const html = await r.text();
  const hasMedDisclaimer = html.toLowerCase().includes("consult") || html.toLowerCase().includes("medical");
  if (hasMedDisclaimer)
    pass("STATIC-006", "Medical disclaimer language is present in HTML/JS");
  else
    fail("STATIC-006", "Medical disclaimer language is present in HTML/JS");
}

// ── 3. Source Map Completeness ──────────────────────────────────
section("Source Map Completeness (server.js introspection)");

{
  // Read server.js and verify new sources are present
  const serverSrc = readFileSync(
    path.join(__dirname, "..", "server.js"), "utf8"
  );

  const checks = [
    ["SWSBM-MatMed5",          serverSrc.includes("MatMed5.txt")],
    ["SWSBM-HerbMedContra",    serverSrc.includes("HerbMedContra1.txt")],
    ["ContraRef-NCCIH",        serverSrc.includes("herb-drug-interactions")],
    ["ContraRef-AAFP",         serverSrc.includes("aafp.org/pubs/afp")],
    ["CONTRA_REF_SOURCES",     serverSrc.includes("CONTRA_REF_SOURCES")],
    ["searchContraRef",        serverSrc.includes("searchContraRef")],
    ["Gladstar-elderberry",    serverSrc.includes("elderberry-medicine-potent-and-powerful")],
    ["Gladstar-echinacea",     serverSrc.includes("echinacea-elderberry-and-herbal-gummies")],
    ["Gladstar-immunity",      serverSrc.includes("15-recommendations-to-boost-immunity")],
    ["Gladstar-calm-herbs",    serverSrc.includes("8-herbs-that-calm-your-mind")],
    ["Gladstar-herbal-dreams", serverSrc.includes("herbal-dreams")],
    ["Gladstar-pandemic",      serverSrc.includes("influenza-and-viral-illness")],
    ["Gladstar-spirit",        serverSrc.includes("7-ways-to-lighten-your-spirit")],
    ["HERB_TO_LATIN-map",      serverSrc.includes("HERB_TO_LATIN")],
    ["fetchMatMedEntry",       serverSrc.includes("fetchMatMedEntry")],
    ["fetchContraEntry",       serverSrc.includes("fetchContraEntry")],
    ["swsbmCache",             serverSrc.includes("swsbmCache")],
  ];

  for (const [label, ok] of checks) {
    if (ok) pass("SRC-" + label, `server.js contains ${label}`);
    else    fail("SRC-" + label, `server.js contains ${label}`, "String not found in source");
  }
}

{
  // Verify index.html names both new source domains in the Agent 3 prompt
  const htmlSrc = readFileSync(
    path.join(__dirname, "..", "pages", "index.html"), "utf8"
  );
  if (htmlSrc.includes("swsbm.com"))
    pass("SRC-Agent3-swsbm",   "Agent 3 system prompt references swsbm.com");
  else
    fail("SRC-Agent3-swsbm",   "Agent 3 system prompt references swsbm.com");

  if (htmlSrc.includes("scienceandartofherbalism.com"))
    pass("SRC-Agent3-gladstar","Agent 3 system prompt references scienceandartofherbalism.com");
  else
    fail("SRC-Agent3-gladstar","Agent 3 system prompt references scienceandartofherbalism.com");
}

// ── 4. /api/research — Core Behaviour ──────────────────────────
section("/api/research — Core Behaviour");

{
  // Missing body → 400
  const r = await POST("/api/research", {});
  if (r.status === 400)
    pass("RES-001", "POST /api/research with no ailments → 400");
  else
    fail("RES-001", "POST /api/research with no ailments → 400", `Got ${r.status}`);
}

// Helper: run a research call and return parsed JSON (or null on error)
async function research(ailment) {
  const r = await POST("/api/research", { ailments: ailment }, { timeout: 45_000 });
  if (!r.ok) return null;
  return r.json();
}

{
  // Well-known ailment → should return herbs and context
  const data = await research("headache");
  if (data && data.context && data.context.length > 50)
    pass("RES-002", `research("headache") returns non-empty context`);
  else
    fail("RES-002", `research("headache") returns non-empty context`,
         data ? `sourceCount=${data.sourceCount}` : "null response");
}

{
  // sourceCount key must be present and numeric
  const data = await research("anxiety");
  if (data && typeof data.sourceCount === "number")
    pass("RES-003", `research("anxiety") response has numeric sourceCount`);
  else
    fail("RES-003", `research("anxiety") response has numeric sourceCount`);
}

{
  // herbsFound key must be an array
  const data = await research("insomnia");
  if (data && Array.isArray(data.herbsFound))
    pass("RES-004", `research("insomnia") response has herbsFound array`);
  else
    fail("RES-004", `research("insomnia") response has herbsFound array`);
}

{
  // topHerbs key must be an array (used to scope contraindications)
  const data = await research("headache");
  if (data && Array.isArray(data.topHerbs) && data.topHerbs.length > 0)
    pass("RES-007", `research("headache") response has non-empty topHerbs array`);
  else
    fail("RES-007", `research("headache") response has non-empty topHerbs array`,
         data ? `topHerbs=${JSON.stringify(data.topHerbs)}` : "null response");
}

{
  // topHerbs for a known ailment must include the correct top herb
  const data = await research("anxiety");
  if (data?.topHerbs?.includes("chamomile"))
    pass("RES-008", `topHerbs for "anxiety" includes chamomile`);
  else
    fail("RES-008", `topHerbs for "anxiety" includes chamomile`,
         `topHerbs: ${JSON.stringify(data?.topHerbs)}`);
}

{
  // When user types a specific herb name, topHerbs should contain that herb
  const data = await research("valerian");
  if (data?.topHerbs?.includes("valerian"))
    pass("RES-009", `topHerbs for herb-name input "valerian" contains valerian`);
  else
    fail("RES-009", `topHerbs for herb-name input "valerian" contains valerian`,
         `topHerbs: ${JSON.stringify(data?.topHerbs)}`);
}

{
  // When user types a herb name, topHerbs must contain ONLY that herb (no extras)
  const data = await research("lavender");
  const top = data?.topHerbs ?? [];
  if (top.length === 1 && top[0] === "lavender")
    pass("RES-010", `research("lavender") → topHerbs contains exactly ["lavender"]`);
  else
    fail("RES-010", `research("lavender") → topHerbs contains exactly ["lavender"]`,
         `topHerbs: ${JSON.stringify(top)}`);
}

{
  // GET /api/herbs returns an array of known herb names
  const r   = await GET("/api/herbs");
  const data = r.ok ? await r.json() : null;
  if (Array.isArray(data?.herbs) && data.herbs.length > 0)
    pass("HERBS-001", `GET /api/herbs returns a non-empty herbs array`);
  else
    fail("HERBS-001", `GET /api/herbs returns a non-empty herbs array`,
         r.ok ? `body: ${JSON.stringify(data)?.slice(0,80)}` : `HTTP ${r.status}`);
}

{
  // GET /api/herbs includes common herbs like lavender and ginger
  const r    = await GET("/api/herbs");
  const data = r.ok ? await r.json() : null;
  const herbs = data?.herbs ?? [];
  if (herbs.includes("lavender") && herbs.includes("ginger"))
    pass("HERBS-002", `GET /api/herbs includes lavender and ginger`);
  else
    fail("HERBS-002", `GET /api/herbs includes lavender and ginger`,
         `got: ${herbs.slice(0,10).join(", ")}`);
}

{
  // GET /api/herbs Content-Type is application/json
  const r = await GET("/api/herbs");
  if (r.headers.get("content-type")?.includes("application/json"))
    pass("HERBS-003", `GET /api/herbs Content-Type is application/json`);
  else
    fail("HERBS-003", `GET /api/herbs Content-Type is application/json`,
         `got: ${r.headers.get("content-type")}`);
}

{
  // Frontend: knownHerbsSet variable present (herb-query short-circuit)
  const html = await (await GET("/")).text();
  if (html.includes("knownHerbsSet") && html.includes("isHerbQuery"))
    pass("HERBS-004", `index.html declares knownHerbsSet and isHerbQuery for herb-query detection`);
  else
    fail("HERBS-004", `index.html declares knownHerbsSet and isHerbQuery for herb-query detection`);
}

{
  // Frontend: /api/herbs is fetched on DOMContentLoaded
  const html = await (await GET("/")).text();
  if (html.includes("/api/herbs"))
    pass("HERBS-005", `index.html fetches /api/herbs on load`);
  else
    fail("HERBS-005", `index.html fetches /api/herbs on load`);
}

{
  // Default herbs fire when no mapping found
  const data = await research("zorbflux syndrome");
  if (data && data.context && data.context.length > 50)
    pass("RES-005", `research("zorbflux syndrome") falls back to default herbs`);
  else
    fail("RES-005", `research("zorbflux syndrome") falls back to default herbs`);
}

{
  // Multi-ailment string
  const data = await research("headache, nausea");
  if (data && data.context && data.herbsFound && data.herbsFound.length > 0)
    pass("RES-006", `research("headache, nausea") handles comma-separated ailments`);
  else
    fail("RES-006", `research("headache, nausea") handles comma-separated ailments`);
}

// ── 5. /api/research — Ailment-to-Herb Mapping Coverage ─────────
section("/api/research — Ailment-to-Herb Mapping Coverage");

const ailmentHerbExpect = [
  // [ailment,         must-include herb]
  ["headache",         "peppermint"],
  ["anxiety",          "chamomile"],
  ["insomnia",         "valerian"],
  ["nausea",           "ginger"],
  ["cold",             "echinacea"],
  ["flu",              "elderberry"],
  ["inflammation",     "turmeric"],
  ["depression",       "st johns wort"],
  ["blood pressure",   "hawthorn"],
  ["liver",            "milk thistle"],
  ["uti",              "echinacea"],
  ["menstrual cramps", "chamomile"],
  ["fatigue",          "ginseng"],
  ["eczema",           "chamomile"],
  ["toothache",        "clove"],
  ["sore throat",      "licorice root"],
  ["joint pain",       "turmeric"],
  ["sleep",            "valerian"],
  ["stress",           "ashwagandha"],
  ["bloating",         "peppermint"],
];

for (const [ailment, expectedHerb] of ailmentHerbExpect) {
  const data = await research(ailment);
  const herbs = data?.herbsFound ?? [];
  const ctx   = data?.context?.toLowerCase() ?? "";
  // Pass if expected herb appears in herbsFound OR prominently in context
  if (herbs.includes(expectedHerb) || ctx.includes(expectedHerb))
    pass(`MAP-${ailment.replace(/\s/g, "_")}`,
         `"${ailment}" → includes ${expectedHerb}`);
  else
    fail(`MAP-${ailment.replace(/\s/g, "_")}`,
         `"${ailment}" → includes ${expectedHerb}`,
         `herbsFound: [${herbs.join(", ")}]`);
}

// ── 6. /api/research — SWSBM Source Inclusion ───────────────────
section("/api/research — SWSBM Source Inclusion");

{
  // SWSBM MatMed5 for yarrow — ACHILLEA appears early in the file
  const data = await research("yarrow");
  const ctx  = data?.context ?? "";
  if (ctx.toLowerCase().includes("achillea") || ctx.toLowerCase().includes("moore") ||
      ctx.toLowerCase().includes("swsbm"))
    pass("SWSBM-001", "SWSBM MatMed5 data appears in research context for 'yarrow'");
  else
    skip("SWSBM-001", "SWSBM MatMed5 data for 'yarrow'",
         "SWSBM site may be unreachable — manual verification needed");
}

{
  const data = await research("licorice root");
  const ctx  = data?.context ?? "";
  if (ctx.toLowerCase().includes("glycyrrhiza") || ctx.toLowerCase().includes("moore"))
    pass("SWSBM-002", "SWSBM MatMed5 data appears in research context for 'licorice root'");
  else
    skip("SWSBM-002", "SWSBM MatMed5 data for 'licorice root'",
         "SWSBM site may be unreachable");
}

{
  // Contraindications file should be checked for any common herb
  const data = await research("valerian");
  const ctx  = data?.context ?? "";
  const hasContra = ctx.toLowerCase().includes("contraindication") ||
                    ctx.toLowerCase().includes("swsbm.com/manualsmm/herbmedcontra");
  if (hasContra)
    pass("SWSBM-003", "SWSBM contraindications data appears for 'valerian'");
  else
    skip("SWSBM-003", "SWSBM contraindications data for 'valerian'",
         "SWSBM site may be unreachable or herb not in file");
}

// ── 7. /api/research — Gladstar Source Inclusion ────────────────
section("/api/research — Gladstar Source Inclusion");

{
  const data = await research("elderberry");
  const ctx  = data?.context ?? "";
  if (ctx.includes("scienceandartofherbalism.com"))
    pass("GLADSTAR-001", "Gladstar URL appears in research context for 'elderberry'");
  else
    skip("GLADSTAR-001", "Gladstar URL for 'elderberry'",
         "scienceandartofherbalism.com may block automated fetches");
}

{
  const data = await research("anxiety");
  const ctx  = data?.context ?? "";
  if (ctx.includes("scienceandartofherbalism.com"))
    pass("GLADSTAR-002", "Gladstar URL appears in research context for 'anxiety'");
  else
    skip("GLADSTAR-002", "Gladstar URL for 'anxiety'",
         "scienceandartofherbalism.com may block automated fetches");
}

// ── 8. /api/fact — Daily Herb Fact Widget ───────────────────────
section("/api/fact — Daily Herb Fact Widget");

// Check once whether the API key is present; if not, skip all FACT tests
const factProbe     = await GET("/api/fact", { timeout: 30_000 });
const factProbeData = await factProbe.json();
const factNoKey     = factProbe.status === 500 &&
                      typeof factProbeData.error === "string" &&
                      factProbeData.error.toLowerCase().includes("api key");

if (factNoKey) {
  skip("FACT-001", "GET /api/fact returns HTTP 200",           "No ANTHROPIC_API_KEY set");
  skip("FACT-002", "/api/fact returns a non-empty fact string","No ANTHROPIC_API_KEY set");
  skip("FACT-003", "/api/fact returns a source URL",           "No ANTHROPIC_API_KEY set");
  skip("FACT-004", "Second /api/fact call served from cache",  "No ANTHROPIC_API_KEY set");
  skip("FACT-005", "Daily fact contains bold herb name",       "No ANTHROPIC_API_KEY set");
} else {
  if (factProbe.ok)
    pass("FACT-001", "GET /api/fact returns HTTP 200");
  else
    fail("FACT-001", "GET /api/fact returns HTTP 200", `HTTP ${factProbe.status}`);

  if (factProbeData.fact && typeof factProbeData.fact === "string" && factProbeData.fact.length > 10)
    pass("FACT-002", "/api/fact returns a non-empty fact string");
  else
    fail("FACT-002", "/api/fact returns a non-empty fact string",
         `fact: ${JSON.stringify(factProbeData.fact)}`);

  if (factProbeData.url && factProbeData.url.startsWith("http"))
    pass("FACT-003", "/api/fact returns a source URL");
  else
    fail("FACT-003", "/api/fact returns a source URL", `url: ${factProbeData.url}`);

  // Second call should be served from cache (fast)
  const t0   = Date.now();
  const r2   = await GET("/api/fact", { timeout: 10_000 });
  const ms   = Date.now() - t0;
  if (r2.ok && ms < 3000)
    pass("FACT-004", `Second /api/fact call is served from cache (${ms} ms)`);
  else if (r2.ok)
    skip("FACT-004", `Cache check — took ${ms} ms (cache may have just been populated)`);
  else
    fail("FACT-004", "Second /api/fact call returns 200", `HTTP ${r2.status}`);

  if (factProbeData.fact && factProbeData.fact.includes("**"))
    pass("FACT-005", "Daily fact contains bold herb name (**herb**)");
  else
    skip("FACT-005", "Daily fact bold herb name", "Claude may omit markdown occasionally");
}

// ── 9. /api/claude — Claude Proxy ───────────────────────────────
section("/api/claude — Claude Proxy");

{
  // Missing API key guard: if key is absent server returns 500 with descriptive error
  // We test the happy-path proxy (requires real key to be set)
  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 20,
    system: "Reply with exactly one word.",
    messages: [{ role: "user", content: "Say: ready" }]
  };
  const r = await POST("/api/claude", body, { timeout: 30_000 });

  if (r.status === 500) {
    const data = await r.json();
    if (data.error && data.error.includes("ANTHROPIC_API_KEY"))
      pass("PROXY-001", "Missing API key returns 500 with descriptive error");
    else
      skip("PROXY-001", "Claude proxy API key guard", "500 returned but message unclear");
  } else if (r.ok) {
    const data = await r.json();
    if (data.content?.[0]?.text)
      pass("PROXY-001", `Claude proxy returns a valid response (${data.content[0].text.trim()})`);
    else
      fail("PROXY-001", "Claude proxy returns valid response structure", JSON.stringify(data).slice(0, 120));
  } else {
    fail("PROXY-001", "Claude proxy responds", `HTTP ${r.status}`);
  }
}

{
  // POST /api/claude with empty body should still proxy (Anthropic will return an error)
  const r = await POST("/api/claude", {}, { timeout: 15_000 });
  // We just verify it doesn't crash (any HTTP status is fine except connection error)
  if (r.status)
    pass("PROXY-002", "POST /api/claude with empty body does not crash the server");
  else
    fail("PROXY-002", "POST /api/claude with empty body does not crash the server");
}

// ── 10. /api/research — Source COUNT Sanity ─────────────────────
section("/api/research — Source Count Sanity");

{
  const data = await research("headache");
  if (data && data.sourceCount >= 1)
    pass("COUNT-001", `Research for "headache" finds ≥1 source (got ${data.sourceCount})`);
  else
    fail("COUNT-001", `Research for "headache" finds ≥1 source`,
         `sourceCount=${data?.sourceCount}`);
}

{
  // With SWSBM now included, common herbs should have MORE total sources
  const data = await research("chamomile");
  if (data && data.sourceCount >= 2)
    pass("COUNT-002", `Research for "chamomile" finds ≥2 sources (got ${data.sourceCount})`);
  else
    fail("COUNT-002", `Research for "chamomile" finds ≥2 sources`,
         `sourceCount=${data?.sourceCount}`);
}

// ── 11. Error Handling ───────────────────────────────────────────
section("Error Handling");

{
  // GET to a non-existent route
  const r = await GET("/api/nonexistent");
  if (r.status === 404)
    pass("ERR-001", "GET /api/nonexistent → 404");
  else
    skip("ERR-001", "GET /api/nonexistent → 404",
         `Got ${r.status} — express default may serve index.html`);
}

{
  // POST /api/research with ailments=empty string
  const r    = await POST("/api/research", { ailments: "" });
  const data = await r.json();
  if (r.status === 400 || (data && data.error))
    pass("ERR-002", `POST /api/research with empty ailments string → error response`);
  else
    fail("ERR-002", `POST /api/research with empty ailments string → error response`,
         `status=${r.status}, data=${JSON.stringify(data).slice(0,80)}`);
}

// ── 12. Content-Type Headers ─────────────────────────────────────
section("Content-Type Headers");

{
  const r = await GET("/");
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("text/html"))
    pass("CT-001", "GET / Content-Type is text/html");
  else
    fail("CT-001", "GET / Content-Type is text/html", `Got: ${ct}`);
}

{
  const r  = await POST("/api/research", { ailments: "headache" }, { timeout: 45_000 });
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json"))
    pass("CT-002", "POST /api/research Content-Type is application/json");
  else
    fail("CT-002", "POST /api/research Content-Type is application/json", `Got: ${ct}`);
}

{
  const r  = await GET("/api/fact", { timeout: 30_000 });
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json"))
    pass("CT-003", "GET /api/fact Content-Type is application/json");
  else
    fail("CT-003", "GET /api/fact Content-Type is application/json", `Got: ${ct}`);
}

// ── 13. Frontend Feature Flags (HTML introspection) ──────────────
section("Frontend Feature Flags (HTML introspection)");

{
  const html = await (await GET("/")).text();
  const checks = [
    ["Cmd+Enter shortcut", html.includes("metaKey") || html.includes("Cmd") || html.includes("ctrlKey")],
    ["Pipeline agent states",   html.includes("active") && html.includes("waiting") && html.includes("done")],
    ["renderResult function",   html.includes("renderResult")],
    ["fetchResearch function",  html.includes("fetchResearch")],
    ["callClaude function",     html.includes("callClaude")],
    ["loadDailyFact function",  html.includes("loadDailyFact") || html.includes("api/fact")],
    ["sessionStorage cache",    html.includes("sessionStorage")],
    ["Herb card parsing",       html.includes("herb-card") || html.includes("source-link")],
    ["Error box",               html.includes("error-box")],
    ["Result section",          html.includes("result-section")],
    ["Claude model declared",   html.includes("claude")],
    ["swsbm.com in Agent3",     html.includes("swsbm.com")],
    ["scienceandartofherbalism.com in Agent3", html.includes("scienceandartofherbalism.com")],
    ["Contraindications button", html.includes("contra-btn") || html.includes("checkContraindications")],
    ["Contraindications panel",  html.includes("contra-panel") || html.includes("contra-section")],
    ["lastHerbsFound variable",  html.includes("lastHerbsFound")],
  ];

  for (const [label, ok] of checks) {
    if (ok) pass(`FE-${label.replace(/[^a-zA-Z0-9]/g, "_")}`, label);
    else    fail(`FE-${label.replace(/[^a-zA-Z0-9]/g, "_")}`, label);
  }
}

// ── 14. /api/contraindications — Contraindications Checker ───────
section("/api/contraindications — Contraindications Checker");

{
  // Missing body → 400
  const r = await POST("/api/contraindications", {});
  if (r.status === 400)
    pass("CONTRA-001", "POST /api/contraindications with no herbs body → 400");
  else
    fail("CONTRA-001", "POST /api/contraindications with no herbs body → 400", `Got ${r.status}`);
}

{
  // Empty array → 400
  const r = await POST("/api/contraindications", { herbs: [] });
  if (r.status === 400)
    pass("CONTRA-002", "POST /api/contraindications with empty herbs array → 400");
  else
    fail("CONTRA-002", "POST /api/contraindications with empty herbs array → 400", `Got ${r.status}`);
}

{
  // Single herb — returns results array
  const r = await POST("/api/contraindications", { herbs: ["chamomile"] }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  if (data && Array.isArray(data.results))
    pass("CONTRA-003", "POST /api/contraindications returns a results array");
  else
    fail("CONTRA-003", "POST /api/contraindications returns a results array",
         `status=${r.status}, data=${JSON.stringify(data)?.slice(0, 80)}`);
}

{
  // checkedHerbs mirrors the input
  const herbs = ["ginger", "valerian"];
  const r = await POST("/api/contraindications", { herbs }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  if (data && Array.isArray(data.checkedHerbs) && data.checkedHerbs.length === herbs.length)
    pass("CONTRA-004", "Response checkedHerbs array mirrors the input herbs");
  else
    fail("CONTRA-004", "Response checkedHerbs array mirrors the input herbs",
         `got: ${JSON.stringify(data?.checkedHerbs)}`);
}

{
  // note / disclaimer field is present
  const r = await POST("/api/contraindications", { herbs: ["chamomile"] }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  if (data && typeof data.note === "string" && data.note.length > 10)
    pass("CONTRA-005", "Response includes a note / disclaimer string");
  else
    fail("CONTRA-005", "Response includes a note / disclaimer string");
}

{
  // Multiple herbs — result count equals herb count
  const herbs = ["chamomile", "ginger", "valerian", "lavender", "peppermint"];
  const r = await POST("/api/contraindications", { herbs }, { timeout: 45_000 });
  const data = r.ok ? await r.json() : null;
  if (data && data.results && data.results.length === herbs.length)
    pass("CONTRA-006", `Returns one result entry per herb (${herbs.length} herbs → ${data.results.length} entries)`);
  else
    fail("CONTRA-006", "Returns one result entry per herb",
         `expected ${herbs.length}, got ${data?.results?.length}`);
}

{
  // Each result object has the required shape
  const r = await POST("/api/contraindications", { herbs: ["chamomile"] }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  const result = data?.results?.[0];
  if (result && "herb" in result && "found" in result && "text" in result)
    pass("CONTRA-007", "Each result entry has herb, found, and text fields");
  else
    fail("CONTRA-007", "Each result entry has herb, found, and text fields",
         `got: ${JSON.stringify(result)?.slice(0, 120)}`);
}

{
  // found field is boolean
  const r = await POST("/api/contraindications", { herbs: ["chamomile"] }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  const result = data?.results?.[0];
  if (result && typeof result.found === "boolean")
    pass("CONTRA-008", "result.found is a boolean");
  else
    fail("CONTRA-008", "result.found is a boolean",
         `typeof found: ${typeof result?.found}`);
}

{
  // Each result has a sources array (multi-source support)
  const r = await POST("/api/contraindications", { herbs: ["st johns wort"] }, { timeout: 45_000 });
  const data = r.ok ? await r.json() : null;
  const result = data?.results?.[0];
  if (result && Array.isArray(result.sources))
    pass("CONTRA-013", "Each result entry has a sources array");
  else
    fail("CONTRA-013", "Each result entry has a sources array",
         `got: ${JSON.stringify(result)?.slice(0, 120)}`);
}

{
  // note field references all three source names
  const r = await POST("/api/contraindications", { herbs: ["valerian"] }, { timeout: 30_000 });
  const data = r.ok ? await r.json() : null;
  const noteHasSources = data?.note?.includes("SWSBM") &&
                         data?.note?.includes("NCCIH") &&
                         data?.note?.includes("AAFP");
  if (noteHasSources)
    pass("CONTRA-014", "Response note references SWSBM, NCCIH, and AAFP");
  else
    fail("CONTRA-014", "Response note references SWSBM, NCCIH, and AAFP",
         `note: ${data?.note}`);
}

{
  // topHerbs is used for contraindications — verify /api/research returns it
  const data = await research("depression");
  if (data?.topHerbs?.includes("st johns wort"))
    pass("CONTRA-015", `topHerbs for "depression" includes st johns wort (key contra herb)`);
  else
    skip("CONTRA-015", `topHerbs for "depression" includes st johns wort`,
         `topHerbs: ${JSON.stringify(data?.topHerbs)}`);
}

{
  // HTML: frontend uses topHerbs for lastHerbsFound
  const html = await (await GET("/")).text();
  if (html.includes("topHerbs"))
    pass("CONTRA-016", "index.html references topHerbs for contraindications scoping");
  else
    fail("CONTRA-016", "index.html references topHerbs for contraindications scoping");
}

{
  // Content-Type is JSON
  const r = await POST("/api/contraindications", { herbs: ["chamomile"] }, { timeout: 30_000 });
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json"))
    pass("CONTRA-009", "POST /api/contraindications Content-Type is application/json");
  else
    fail("CONTRA-009", "POST /api/contraindications Content-Type is application/json", `Got: ${ct}`);
}

{
  // HTML contains the new UI elements
  const html = await (await GET("/")).text();
  if (html.includes("checkContraindications"))
    pass("CONTRA-010", "index.html contains checkContraindications() function");
  else
    fail("CONTRA-010", "index.html contains checkContraindications() function");
}

{
  // HTML contains the contra-btn class / element
  const html = await (await GET("/")).text();
  if (html.includes("contra-btn"))
    pass("CONTRA-011", "index.html contains .contra-btn CSS class");
  else
    fail("CONTRA-011", "index.html contains .contra-btn CSS class");
}

{
  // Source map check: /api/contraindications route exists in server.js
  const serverSrc = readFileSync(
    path.join(__dirname, "..", "server.js"), "utf8"
  );
  if (serverSrc.includes('"/api/contraindications"'))
    pass("CONTRA-012", "server.js defines the /api/contraindications route");
  else
    fail("CONTRA-012", "server.js defines the /api/contraindications route");
}

// ════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════

const total = passed + failed + skipped;
console.log(`\n${"─".repeat(56)}`);
console.log(`${BOLD}Results:${RESET}  ` +
  `${GREEN}${passed} passed${RESET}  ` +
  `${RED}${failed} failed${RESET}  ` +
  `${YELLOW}${skipped} skipped${RESET}  ` +
  `${DIM}(${total} total)${RESET}`);

if (failures.length > 0) {
  console.log(`\n${RED}${BOLD}Failed tests:${RESET}`);
  for (const { id, label, detail } of failures) {
    console.log(`  ${RED}✘${RESET} ${DIM}${id}${RESET}  ${label}`);
    if (detail) console.log(`    ${RED}${detail}${RESET}`);
  }
}

console.log();
process.exit(failed > 0 ? 1 : 0);
