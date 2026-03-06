import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "pages")));

// ── Approved sources with herb-specific content pages ─────────
// These are detail/content pages, not index pages
const APPROVED_SOURCES = [
  // NCCIH individual herb pages
  { url: "https://www.nccih.nih.gov/health/chamomile", name: "NCCIH", herb: "chamomile" },
  { url: "https://www.nccih.nih.gov/health/ginger", name: "NCCIH", herb: "ginger" },
  { url: "https://www.nccih.nih.gov/health/peppermint-oil", name: "NCCIH", herb: "peppermint" },
  { url: "https://www.nccih.nih.gov/health/lavender", name: "NCCIH", herb: "lavender" },
  { url: "https://www.nccih.nih.gov/health/valerian", name: "NCCIH", herb: "valerian" },
  { url: "https://www.nccih.nih.gov/health/st-johns-wort", name: "NCCIH", herb: "st johns wort" },
  { url: "https://www.nccih.nih.gov/health/echinacea", name: "NCCIH", herb: "echinacea" },
  { url: "https://www.nccih.nih.gov/health/elderberry", name: "NCCIH", herb: "elderberry" },
  { url: "https://www.nccih.nih.gov/health/turmeric", name: "NCCIH", herb: "turmeric" },
  { url: "https://www.nccih.nih.gov/health/licorice-root", name: "NCCIH", herb: "licorice root" },
  { url: "https://www.nccih.nih.gov/health/lemon-balm", name: "NCCIH", herb: "lemon balm" },
  { url: "https://www.nccih.nih.gov/health/passionflower", name: "NCCIH", herb: "passionflower" },
  // MSKCC herb pages
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/chamomile", name: "MSKCC", herb: "chamomile" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ginger", name: "MSKCC", herb: "ginger" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/peppermint", name: "MSKCC", herb: "peppermint" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/lavender", name: "MSKCC", herb: "lavender" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/valerian", name: "MSKCC", herb: "valerian" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/echinacea", name: "MSKCC", herb: "echinacea" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/elderberry", name: "MSKCC", herb: "elderberry" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/turmeric", name: "MSKCC", herb: "turmeric" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/lemon-balm", name: "MSKCC", herb: "lemon balm" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/passionflower", name: "MSKCC", herb: "passionflower" },
];

// ── Ailment → herb mapping for smart pre-filtering ────────────
// Avoids fetching all 20 pages every time — only fetches relevant herbs
const AILMENT_HERB_MAP = {
  "headache":       ["peppermint", "lavender", "ginger", "chamomile", "valerian"],
  "migraine":       ["peppermint", "lavender", "ginger", "chamomile"],
  "stomachache":    ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "nausea":         ["ginger", "peppermint", "chamomile", "lemon balm"],
  "stomach":        ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "digestion":      ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "indigestion":    ["ginger", "peppermint", "chamomile", "licorice root"],
  "bloating":       ["peppermint", "ginger", "chamomile", "lemon balm"],
  "anxiety":        ["chamomile", "lavender", "lemon balm", "passionflower", "valerian"],
  "stress":         ["chamomile", "lavender", "lemon balm", "passionflower", "valerian"],
  "sleep":          ["valerian", "chamomile", "lavender", "passionflower", "lemon balm"],
  "insomnia":       ["valerian", "chamomile", "lavender", "passionflower"],
  "cold":           ["echinacea", "elderberry", "ginger", "peppermint", "licorice root"],
  "flu":            ["echinacea", "elderberry", "ginger", "peppermint"],
  "immune":         ["echinacea", "elderberry", "turmeric", "ginger"],
  "inflammation":   ["turmeric", "ginger", "chamomile", "licorice root"],
  "pain":           ["turmeric", "ginger", "peppermint", "lavender", "chamomile"],
  "depression":     ["st johns wort", "lemon balm", "lavender", "chamomile"],
  "mood":           ["st johns wort", "lemon balm", "lavender"],
  "fatigue":        ["ginger", "peppermint", "lemon balm", "echinacea"],
  "cough":          ["licorice root", "ginger", "peppermint", "elderberry", "echinacea"],
  "sore throat":    ["licorice root", "ginger", "chamomile", "echinacea"],
  "cramps":         ["chamomile", "ginger", "peppermint", "lemon balm", "valerian"],
  "menstrual":      ["chamomile", "ginger", "lemon balm", "valerian"],
};

// ── Helper: strip HTML ────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ── Helper: fetch one herb page and extract useful sentences ──
async function fetchHerbPage(source) {
  try {
    const resp = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!resp.ok) return null;

    const html = await resp.text();
    const text = stripHtml(html);

    // Extract meaningful sentences (not too short, not too long)
    const sentences = text.match(/[^.!?]{30,300}[.!?]/g) || [];

    // Keep sentences that mention uses, benefits, or preparation
    const usefulKeywords = [
      "used for", "used to", "may help", "has been used", "traditional",
      "shown to", "evidence", "benefit", "effective", "treat", "relief",
      "reduce", "relieve", "help with", "tea", "steep", "brew", "infus",
      "dry", "fresh", "dose", "preparation", "side effect", "caution", "safe"
    ];

    const useful = sentences
      .filter(s => usefulKeywords.some(k => s.toLowerCase().includes(k)))
      .slice(0, 6)
      .join(" ");

    if (useful.length < 80) return null;

    const excerpt = useful.length > 1500 ? useful.slice(0, 1500) + "..." : useful;

    return {
      herb: source.herb,
      name: source.name,
      url: source.url,
      excerpt
    };

  } catch (err) {
    console.warn(`  Could not fetch ${source.url}: ${err.message}`);
    return null;
  }
}

// ── Route: research ───────────────────────────────────────────
app.post("/api/research", async (req, res) => {
  const { ailments } = req.body;
  if (!ailments) return res.status(400).json({ error: "ailments is required" });

  console.log(`\n🌿 Researching: "${ailments}"`);

  // Find relevant herbs from ailment map
  const ailmentList = ailments.toLowerCase().split(/,\s*/);
  const relevantHerbs = new Set();

  for (const ailment of ailmentList) {
    for (const [key, herbs] of Object.entries(AILMENT_HERB_MAP)) {
      if (ailment.includes(key) || key.includes(ailment)) {
        herbs.forEach(h => relevantHerbs.add(h));
      }
    }
  }

  // If no mapping found, use a default set of common herbs
  if (relevantHerbs.size === 0) {
    ["chamomile", "ginger", "peppermint", "lavender", "lemon balm"].forEach(h => relevantHerbs.add(h));
  }

  console.log(`   Relevant herbs: ${[...relevantHerbs].join(", ")}`);

  // Filter sources to only relevant herbs, prefer NCCIH
  const sourcesToFetch = APPROVED_SOURCES.filter(s =>
    relevantHerbs.has(s.herb) && s.name === "NCCIH"
  ).slice(0, 5); // max 5 fetches

  // Fall back to MSKCC if NCCIH doesn't have enough
  if (sourcesToFetch.length < 3) {
    const mskcc = APPROVED_SOURCES.filter(s =>
      relevantHerbs.has(s.herb) && s.name === "MSKCC" &&
      !sourcesToFetch.find(f => f.herb === s.herb)
    ).slice(0, 5 - sourcesToFetch.length);
    sourcesToFetch.push(...mskcc);
  }

  console.log(`   Fetching ${sourcesToFetch.length} herb pages...`);

  // Fetch in parallel
  const results = await Promise.all(sourcesToFetch.map(fetchHerbPage));
  const found = results.filter(Boolean);

  console.log(`   Got excerpts for: ${found.map(r => r.herb).join(", ") || "none"}`);

  const context = found.length > 0
    ? found.map(r =>
        `HERB: ${r.herb}\nSOURCE: ${r.url}\n${r.excerpt}`
      ).join("\n\n---\n\n")
    : "No relevant herb information found in approved sources.";

  res.json({ context, sourceCount: found.length, herbsFound: found.map(r => r.herb) });
});


// ── Route: fact of the day ────────────────────────────────────
// Fetches a random approved herb page and asks Claude for one fact.
// The frontend caches it in sessionStorage keyed by date.

const FACT_HERBS = [
  { url: "https://www.nccih.nih.gov/health/chamomile", herb: "chamomile" },
  { url: "https://www.nccih.nih.gov/health/ginger", herb: "ginger" },
  { url: "https://www.nccih.nih.gov/health/peppermint-oil", herb: "peppermint" },
  { url: "https://www.nccih.nih.gov/health/lavender", herb: "lavender" },
  { url: "https://www.nccih.nih.gov/health/valerian", herb: "valerian" },
  { url: "https://www.nccih.nih.gov/health/elderberry", herb: "elderberry" },
  { url: "https://www.nccih.nih.gov/health/turmeric", herb: "turmeric" },
  { url: "https://www.nccih.nih.gov/health/lemon-balm", herb: "lemon balm" },
  { url: "https://www.nccih.nih.gov/health/echinacea", herb: "echinacea" },
  { url: "https://www.nccih.nih.gov/health/passionflower", herb: "passionflower" },
  { url: "https://www.nccih.nih.gov/health/licorice-root", herb: "licorice root" },
  { url: "https://www.nccih.nih.gov/health/st-johns-wort", herb: "st johns wort" },
];

// Pick a deterministic herb based on the day of year — same herb all day
function getTodaysHerb() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return FACT_HERBS[dayOfYear % FACT_HERBS.length];
}

let factCache = { date: null, fact: null, url: null };

app.get("/api/fact", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "No API key" });

  const today = new Date().toISOString().slice(0, 10);

  // Return cached fact if already fetched today
  if (factCache.date === today && factCache.fact) {
    return res.json({ fact: factCache.fact, url: factCache.url });
  }

  const source = getTodaysHerb();
  console.log(`\n🌿 Fetching daily fact for: ${source.herb}`);

  try {
    // Fetch the herb page
    const pageResp = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html" },
      signal: AbortSignal.timeout(8000)
    });

    let excerpt = "";
    if (pageResp.ok) {
      const html = await pageResp.text();
      const text = stripHtml(html);
      // Grab sentences that sound factual
      const sentences = text.match(/[^.!?]{40,300}[.!?]/g) || [];
      const factual = sentences.filter(s =>
        /study|research|found|shown|evidence|traditional|used for|contain|percent|clinical/i.test(s)
      ).slice(0, 10).join(" ");
      excerpt = factual.slice(0, 2000);
    }

    // Ask Claude for one sharp fact
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 120,
        system: `You write one-sentence herbal facts for a website widget. Be specific, factual, and direct. No flowery language. Bold the herb name using **name**. Maximum 35 words. Output only the fact sentence, nothing else.`,
        messages: [{
          role: "user",
          content: excerpt
            ? `Write one interesting fact about ${source.herb} based on this excerpt:\n\n${excerpt}`
            : `Write one interesting, specific fact about ${source.herb} as a medicinal herb.`
        }]
      })
    });

    const claudeData = await claudeResp.json();
    const fact = claudeData.content?.[0]?.text?.trim() || `**${source.herb}** has been used in traditional herbal medicine for centuries.`;

    factCache = { date: today, fact, url: source.url };
    console.log(`   Fact: ${fact}`);
    res.json({ fact, url: source.url });

  } catch (err) {
    console.error("Fact error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Route: claude proxy ───────────────────────────────────────
app.post("/api/claude", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set. Add it to your .env file." });
  }

  try {
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
    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🌿 HerbWitch server running at http://localhost:${PORT}`);
  console.log(`   Herb pages indexed: ${APPROVED_SOURCES.length}`);
  console.log(`   Open: http://localhost:${PORT}\n`);
});