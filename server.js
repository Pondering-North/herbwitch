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

// ── Approved sources — 5 sources × 35 herbs ─────────────────
const APPROVED_SOURCES = [
  // ── NCCIH ──────────────────────────────────────────────────
  { url: "https://www.nccih.nih.gov/health/chamomile",           name: "NCCIH", herb: "chamomile" },
  { url: "https://www.nccih.nih.gov/health/ginger",              name: "NCCIH", herb: "ginger" },
  { url: "https://www.nccih.nih.gov/health/peppermint-oil",      name: "NCCIH", herb: "peppermint" },
  { url: "https://www.nccih.nih.gov/health/lavender",            name: "NCCIH", herb: "lavender" },
  { url: "https://www.nccih.nih.gov/health/valerian",            name: "NCCIH", herb: "valerian" },
  { url: "https://www.nccih.nih.gov/health/st-johns-wort",       name: "NCCIH", herb: "st johns wort" },
  { url: "https://www.nccih.nih.gov/health/echinacea",           name: "NCCIH", herb: "echinacea" },
  { url: "https://www.nccih.nih.gov/health/elderberry",          name: "NCCIH", herb: "elderberry" },
  { url: "https://www.nccih.nih.gov/health/turmeric",            name: "NCCIH", herb: "turmeric" },
  { url: "https://www.nccih.nih.gov/health/licorice-root",       name: "NCCIH", herb: "licorice root" },
  { url: "https://www.nccih.nih.gov/health/lemon-balm",          name: "NCCIH", herb: "lemon balm" },
  { url: "https://www.nccih.nih.gov/health/passionflower",       name: "NCCIH", herb: "passionflower" },
  { url: "https://www.nccih.nih.gov/health/ashwagandha",         name: "NCCIH", herb: "ashwagandha" },
  { url: "https://www.nccih.nih.gov/health/black-cohosh",        name: "NCCIH", herb: "black cohosh" },
  { url: "https://www.nccih.nih.gov/health/feverfew",            name: "NCCIH", herb: "feverfew" },
  { url: "https://www.nccih.nih.gov/health/garlic",              name: "NCCIH", herb: "garlic" },
  { url: "https://www.nccih.nih.gov/health/ginkgo",              name: "NCCIH", herb: "ginkgo" },
  { url: "https://www.nccih.nih.gov/health/asian-ginseng",       name: "NCCIH", herb: "ginseng" },
  { url: "https://www.nccih.nih.gov/health/kava",                name: "NCCIH", herb: "kava" },
  { url: "https://www.nccih.nih.gov/health/milk-thistle",        name: "NCCIH", herb: "milk thistle" },
  { url: "https://www.nccih.nih.gov/health/saw-palmetto",        name: "NCCIH", herb: "saw palmetto" },
  { url: "https://www.nccih.nih.gov/health/green-tea",           name: "NCCIH", herb: "green tea" },
  { url: "https://www.nccih.nih.gov/health/hawthorn",            name: "NCCIH", herb: "hawthorn" },
  { url: "https://www.nccih.nih.gov/health/nettle",              name: "NCCIH", herb: "nettle" },
  { url: "https://www.nccih.nih.gov/health/red-clover",          name: "NCCIH", herb: "red clover" },
  { url: "https://www.nccih.nih.gov/health/rhodiola",            name: "NCCIH", herb: "rhodiola" },
  { url: "https://www.nccih.nih.gov/health/skullcap",            name: "NCCIH", herb: "skullcap" },
  { url: "https://www.nccih.nih.gov/health/willow-bark",         name: "NCCIH", herb: "willow bark" },
  { url: "https://www.nccih.nih.gov/health/yarrow",              name: "NCCIH", herb: "yarrow" },
  { url: "https://www.nccih.nih.gov/health/dong-quai",           name: "NCCIH", herb: "dong quai" },
  { url: "https://www.nccih.nih.gov/health/holy-basil",          name: "NCCIH", herb: "holy basil" },
  { url: "https://www.nccih.nih.gov/health/hops",                name: "NCCIH", herb: "hops" },
  { url: "https://www.nccih.nih.gov/health/mullein",             name: "NCCIH", herb: "mullein" },
  { url: "https://www.nccih.nih.gov/health/slippery-elm",        name: "NCCIH", herb: "slippery elm" },
  { url: "https://www.nccih.nih.gov/health/california-poppy",    name: "NCCIH", herb: "california poppy" },

  // ── MSKCC ──────────────────────────────────────────────────
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/chamomile",         name: "MSKCC", herb: "chamomile" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ginger",            name: "MSKCC", herb: "ginger" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/peppermint",        name: "MSKCC", herb: "peppermint" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/lavender",          name: "MSKCC", herb: "lavender" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/valerian",          name: "MSKCC", herb: "valerian" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/echinacea",         name: "MSKCC", herb: "echinacea" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/elderberry",        name: "MSKCC", herb: "elderberry" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/turmeric",          name: "MSKCC", herb: "turmeric" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/lemon-balm",        name: "MSKCC", herb: "lemon balm" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/passionflower",     name: "MSKCC", herb: "passionflower" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ashwagandha",       name: "MSKCC", herb: "ashwagandha" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/black-cohosh",      name: "MSKCC", herb: "black cohosh" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/feverfew",          name: "MSKCC", herb: "feverfew" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/garlic",            name: "MSKCC", herb: "garlic" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/ginkgo-biloba",     name: "MSKCC", herb: "ginkgo" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/asian-ginseng",     name: "MSKCC", herb: "ginseng" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/kava",              name: "MSKCC", herb: "kava" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/milk-thistle",      name: "MSKCC", herb: "milk thistle" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/saw-palmetto",      name: "MSKCC", herb: "saw palmetto" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/green-tea",         name: "MSKCC", herb: "green tea" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/hawthorn",          name: "MSKCC", herb: "hawthorn" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/stinging-nettle",   name: "MSKCC", herb: "nettle" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/red-clover",        name: "MSKCC", herb: "red clover" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/rhodiola",          name: "MSKCC", herb: "rhodiola" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/skullcap",          name: "MSKCC", herb: "skullcap" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/willow-bark",       name: "MSKCC", herb: "willow bark" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/yarrow",            name: "MSKCC", herb: "yarrow" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/dong-quai",         name: "MSKCC", herb: "dong quai" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/holy-basil",        name: "MSKCC", herb: "holy basil" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/hops",              name: "MSKCC", herb: "hops" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/mullein",           name: "MSKCC", herb: "mullein" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/slippery-elm",      name: "MSKCC", herb: "slippery elm" },
  { url: "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/california-poppy",  name: "MSKCC", herb: "california poppy" },

  // ── Examine.com ────────────────────────────────────────────
  { url: "https://examine.com/supplements/chamomile/",          name: "Examine", herb: "chamomile" },
  { url: "https://examine.com/supplements/ginger/",             name: "Examine", herb: "ginger" },
  { url: "https://examine.com/supplements/peppermint/",         name: "Examine", herb: "peppermint" },
  { url: "https://examine.com/supplements/lavender/",           name: "Examine", herb: "lavender" },
  { url: "https://examine.com/supplements/valerian/",           name: "Examine", herb: "valerian" },
  { url: "https://examine.com/supplements/st-johns-wort/",      name: "Examine", herb: "st johns wort" },
  { url: "https://examine.com/supplements/echinacea/",          name: "Examine", herb: "echinacea" },
  { url: "https://examine.com/supplements/elderberry/",         name: "Examine", herb: "elderberry" },
  { url: "https://examine.com/supplements/turmeric/",           name: "Examine", herb: "turmeric" },
  { url: "https://examine.com/supplements/licorice/",           name: "Examine", herb: "licorice root" },
  { url: "https://examine.com/supplements/lemon-balm/",         name: "Examine", herb: "lemon balm" },
  { url: "https://examine.com/supplements/passionflower/",      name: "Examine", herb: "passionflower" },
  { url: "https://examine.com/supplements/ashwagandha/",        name: "Examine", herb: "ashwagandha" },
  { url: "https://examine.com/supplements/black-cohosh/",       name: "Examine", herb: "black cohosh" },
  { url: "https://examine.com/supplements/feverfew/",           name: "Examine", herb: "feverfew" },
  { url: "https://examine.com/supplements/garlic/",             name: "Examine", herb: "garlic" },
  { url: "https://examine.com/supplements/ginkgo-biloba/",      name: "Examine", herb: "ginkgo" },
  { url: "https://examine.com/supplements/panax-ginseng/",      name: "Examine", herb: "ginseng" },
  { url: "https://examine.com/supplements/kava/",               name: "Examine", herb: "kava" },
  { url: "https://examine.com/supplements/milk-thistle/",       name: "Examine", herb: "milk thistle" },
  { url: "https://examine.com/supplements/saw-palmetto/",       name: "Examine", herb: "saw palmetto" },
  { url: "https://examine.com/supplements/green-tea-extract/",  name: "Examine", herb: "green tea" },
  { url: "https://examine.com/supplements/hawthorn/",           name: "Examine", herb: "hawthorn" },
  { url: "https://examine.com/supplements/stinging-nettle/",    name: "Examine", herb: "nettle" },
  { url: "https://examine.com/supplements/red-clover/",         name: "Examine", herb: "red clover" },
  { url: "https://examine.com/supplements/rhodiola-rosea/",     name: "Examine", herb: "rhodiola" },
  { url: "https://examine.com/supplements/skullcap/",           name: "Examine", herb: "skullcap" },
  { url: "https://examine.com/supplements/willow-bark/",        name: "Examine", herb: "willow bark" },
  { url: "https://examine.com/supplements/yarrow/",             name: "Examine", herb: "yarrow" },
  { url: "https://examine.com/supplements/dong-quai/",          name: "Examine", herb: "dong quai" },
  { url: "https://examine.com/supplements/holy-basil/",         name: "Examine", herb: "holy basil" },
  { url: "https://examine.com/supplements/hops/",               name: "Examine", herb: "hops" },
  { url: "https://examine.com/supplements/mullein/",            name: "Examine", herb: "mullein" },
  { url: "https://examine.com/supplements/slippery-elm/",       name: "Examine", herb: "slippery elm" },
  { url: "https://examine.com/supplements/california-poppy/",   name: "Examine", herb: "california poppy" },

  // ── MedlinePlus ────────────────────────────────────────────
  { url: "https://medlineplus.gov/druginfo/natural/952.html",    name: "MedlinePlus", herb: "chamomile" },
  { url: "https://medlineplus.gov/druginfo/natural/961.html",    name: "MedlinePlus", herb: "ginger" },
  { url: "https://medlineplus.gov/druginfo/natural/844.html",    name: "MedlinePlus", herb: "peppermint" },
  { url: "https://medlineplus.gov/druginfo/natural/838.html",    name: "MedlinePlus", herb: "lavender" },
  { url: "https://medlineplus.gov/druginfo/natural/870.html",    name: "MedlinePlus", herb: "valerian" },
  { url: "https://medlineplus.gov/druginfo/natural/329.html",    name: "MedlinePlus", herb: "st johns wort" },
  { url: "https://medlineplus.gov/druginfo/natural/978.html",    name: "MedlinePlus", herb: "echinacea" },
  { url: "https://medlineplus.gov/druginfo/natural/434.html",    name: "MedlinePlus", herb: "elderberry" },
  { url: "https://medlineplus.gov/druginfo/natural/662.html",    name: "MedlinePlus", herb: "turmeric" },
  { url: "https://medlineplus.gov/druginfo/natural/881.html",    name: "MedlinePlus", herb: "licorice root" },
  { url: "https://medlineplus.gov/druginfo/natural/437.html",    name: "MedlinePlus", herb: "lemon balm" },
  { url: "https://medlineplus.gov/druginfo/natural/871.html",    name: "MedlinePlus", herb: "passionflower" },
  { url: "https://medlineplus.gov/druginfo/natural/953.html",    name: "MedlinePlus", herb: "ashwagandha" },
  { url: "https://medlineplus.gov/druginfo/natural/383.html",    name: "MedlinePlus", herb: "black cohosh" },
  { url: "https://medlineplus.gov/druginfo/natural/842.html",    name: "MedlinePlus", herb: "feverfew" },
  { url: "https://medlineplus.gov/druginfo/natural/300.html",    name: "MedlinePlus", herb: "garlic" },
  { url: "https://medlineplus.gov/druginfo/natural/333.html",    name: "MedlinePlus", herb: "ginkgo" },
  { url: "https://medlineplus.gov/druginfo/natural/969.html",    name: "MedlinePlus", herb: "ginseng" },
  { url: "https://medlineplus.gov/druginfo/natural/872.html",    name: "MedlinePlus", herb: "kava" },
  { url: "https://medlineplus.gov/druginfo/natural/422.html",    name: "MedlinePlus", herb: "milk thistle" },
  { url: "https://medlineplus.gov/druginfo/natural/971.html",    name: "MedlinePlus", herb: "saw palmetto" },
  { url: "https://medlineplus.gov/druginfo/natural/960.html",    name: "MedlinePlus", herb: "green tea" },
  { url: "https://medlineplus.gov/druginfo/natural/527.html",    name: "MedlinePlus", herb: "hawthorn" },
  { url: "https://medlineplus.gov/druginfo/natural/997.html",    name: "MedlinePlus", herb: "nettle" },
  { url: "https://medlineplus.gov/druginfo/natural/375.html",    name: "MedlinePlus", herb: "red clover" },
  { url: "https://medlineplus.gov/druginfo/natural/883.html",    name: "MedlinePlus", herb: "rhodiola" },
  { url: "https://medlineplus.gov/druginfo/natural/975.html",    name: "MedlinePlus", herb: "willow bark" },
  { url: "https://medlineplus.gov/druginfo/natural/880.html",    name: "MedlinePlus", herb: "dong quai" },
  { url: "https://medlineplus.gov/druginfo/natural/974.html",    name: "MedlinePlus", herb: "hops" },
  { url: "https://medlineplus.gov/druginfo/natural/976.html",    name: "MedlinePlus", herb: "slippery elm" },

  // ── United Plant Savers ────────────────────────────────────
  { url: "https://www.unitedplantsavers.org/california-poppy-eschscholzia-californica/",  name: "UnitedPlantSavers", herb: "california poppy" },
  { url: "https://www.unitedplantsavers.org/valerian-valeriana-officinalis/",             name: "UnitedPlantSavers", herb: "valerian" },
  { url: "https://www.unitedplantsavers.org/yarrow-achillea-millefolium/",                name: "UnitedPlantSavers", herb: "yarrow" },
  { url: "https://www.unitedplantsavers.org/echinacea-echinacea-spp/",                   name: "UnitedPlantSavers", herb: "echinacea" },
  { url: "https://www.unitedplantsavers.org/skullcap-scutellaria-lateriflora/",           name: "UnitedPlantSavers", herb: "skullcap" },
  { url: "https://www.unitedplantsavers.org/passionflower-passiflora-incarnata/",         name: "UnitedPlantSavers", herb: "passionflower" },
  { url: "https://www.unitedplantsavers.org/black-cohosh-actaea-racemosa/",              name: "UnitedPlantSavers", herb: "black cohosh" },
  { url: "https://www.unitedplantsavers.org/wild-ginger-asarum-canadense/",              name: "UnitedPlantSavers", herb: "ginger" },
  { url: "https://www.unitedplantsavers.org/st-johns-wort-hypericum-perforatum/",        name: "UnitedPlantSavers", herb: "st johns wort" },
  { url: "https://www.unitedplantsavers.org/milk-thistle-silybum-marianum/",             name: "UnitedPlantSavers", herb: "milk thistle" },
  { url: "https://www.unitedplantsavers.org/mullein-verbascum-thapsus/",                 name: "UnitedPlantSavers", herb: "mullein" },
  { url: "https://www.unitedplantsavers.org/nettle-urtica-dioica/",                      name: "UnitedPlantSavers", herb: "nettle" },
];

// ── Ailment → herb mapping ────────────────────────────────────
const AILMENT_HERB_MAP = {
  // Head & neurological
  "headache":         ["peppermint", "lavender", "feverfew", "ginger", "willow bark"],
  "migraine":         ["feverfew", "peppermint", "lavender", "ginger", "willow bark"],
  "focus":            ["ginkgo", "ginseng", "green tea", "holy basil", "rhodiola"],
  "memory":           ["ginkgo", "ginseng", "green tea", "rhodiola"],
  "concentration":    ["ginkgo", "ginseng", "green tea", "holy basil"],

  // Mood & mental health
  "anxiety":          ["chamomile", "lavender", "lemon balm", "passionflower", "kava", "ashwagandha"],
  "stress":           ["ashwagandha", "rhodiola", "holy basil", "lemon balm", "passionflower", "chamomile"],
  "depression":       ["st johns wort", "lemon balm", "lavender", "holy basil", "rhodiola"],
  "mood":             ["st johns wort", "lemon balm", "lavender", "holy basil"],
  "panic":            ["passionflower", "lemon balm", "lavender", "kava", "chamomile"],

  // Sleep
  "sleep":            ["valerian", "hops", "chamomile", "lavender", "passionflower", "california poppy"],
  "insomnia":         ["valerian", "hops", "passionflower", "chamomile", "california poppy"],

  // Digestive
  "stomachache":      ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm", "slippery elm"],
  "nausea":           ["ginger", "peppermint", "chamomile", "lemon balm"],
  "stomach":          ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "digestion":        ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "indigestion":      ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "bloating":         ["peppermint", "ginger", "chamomile", "lemon balm", "fennel"],
  "heartburn":        ["licorice root", "slippery elm", "chamomile", "ginger"],
  "liver":            ["milk thistle", "turmeric", "dandelion", "licorice root"],

  // Respiratory
  "cold":             ["echinacea", "elderberry", "ginger", "peppermint", "licorice root", "mullein"],
  "flu":              ["echinacea", "elderberry", "ginger", "yarrow", "mullein"],
  "cough":            ["mullein", "licorice root", "slippery elm", "elderberry", "thyme", "ginger"],
  "sore throat":      ["licorice root", "slippery elm", "chamomile", "echinacea", "sage"],
  "congestion":       ["peppermint", "eucalyptus", "ginger", "mullein", "elderberry"],
  "immune":           ["echinacea", "elderberry", "turmeric", "ginger", "ashwagandha", "garlic"],

  // Pain & inflammation
  "inflammation":     ["turmeric", "ginger", "chamomile", "willow bark", "nettle"],
  "pain":             ["willow bark", "turmeric", "ginger", "peppermint", "california poppy"],
  "joint pain":       ["turmeric", "ginger", "willow bark", "nettle", "devil's claw"],
  "arthritis":        ["turmeric", "ginger", "willow bark", "nettle"],
  "muscle":           ["valerian", "chamomile", "peppermint", "ginger", "california poppy"],

  // Energy & vitality
  "fatigue":          ["ginseng", "rhodiola", "ashwagandha", "green tea", "holy basil", "ginger"],
  "energy":           ["ginseng", "rhodiola", "green tea", "peppermint", "ashwagandha"],
  "adrenal":          ["ashwagandha", "rhodiola", "holy basil", "licorice root"],

  // Women's health
  "menstrual":        ["chamomile", "ginger", "lemon balm", "valerian", "dong quai", "yarrow"],
  "cramps":           ["chamomile", "ginger", "lemon balm", "valerian", "california poppy"],
  "pms":              ["chamomile", "dong quai", "lemon balm", "st johns wort", "valerian"],
  "menopause":        ["black cohosh", "red clover", "dong quai", "st johns wort", "valerian"],
  "hormonal":         ["black cohosh", "red clover", "dong quai", "ashwagandha"],

  // Skin
  "skin":             ["chamomile", "lavender", "nettle", "calendula", "green tea"],
  "eczema":           ["chamomile", "nettle", "calendula", "turmeric"],
  "acne":             ["nettle", "green tea", "chamomile", "turmeric"],

  // Heart & circulation
  "heart":            ["hawthorn", "garlic", "green tea", "turmeric", "ginkgo"],
  "blood pressure":   ["hawthorn", "garlic", "lemon balm", "valerian", "hibiscus"],
  "circulation":      ["ginkgo", "ginger", "hawthorn", "garlic", "green tea"],

  // Urinary
  "urinary":          ["nettle", "saw palmetto", "cranberry", "dandelion"],
  "bladder":          ["nettle", "dandelion", "saw palmetto"],
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

  // Fetch from ALL approved sources for the top relevant herbs
  // Cap at 3 herbs × 5 sources = up to 15 fetches in parallel
  const topHerbs = [...relevantHerbs].slice(0, 3);
  const sourcesToFetch = APPROVED_SOURCES.filter(s => topHerbs.includes(s.herb));
  const sourceNames = [...new Set(sourcesToFetch.map(s => s.name))].join(", ");

  console.log(`   Fetching ${sourcesToFetch.length} pages (${topHerbs.join(", ")} × ${sourceNames})...`);

  // Fetch all in parallel
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
  { url: "https://www.nccih.nih.gov/health/chamomile",        herb: "chamomile" },
  { url: "https://www.nccih.nih.gov/health/ginger",           herb: "ginger" },
  { url: "https://www.nccih.nih.gov/health/peppermint-oil",   herb: "peppermint" },
  { url: "https://www.nccih.nih.gov/health/lavender",         herb: "lavender" },
  { url: "https://www.nccih.nih.gov/health/valerian",         herb: "valerian" },
  { url: "https://www.nccih.nih.gov/health/elderberry",       herb: "elderberry" },
  { url: "https://www.nccih.nih.gov/health/turmeric",         herb: "turmeric" },
  { url: "https://www.nccih.nih.gov/health/lemon-balm",       herb: "lemon balm" },
  { url: "https://www.nccih.nih.gov/health/echinacea",        herb: "echinacea" },
  { url: "https://www.nccih.nih.gov/health/passionflower",    herb: "passionflower" },
  { url: "https://www.nccih.nih.gov/health/licorice-root",    herb: "licorice root" },
  { url: "https://www.nccih.nih.gov/health/st-johns-wort",    herb: "st johns wort" },
  { url: "https://www.nccih.nih.gov/health/ashwagandha",      herb: "ashwagandha" },
  { url: "https://www.nccih.nih.gov/health/feverfew",         herb: "feverfew" },
  { url: "https://www.nccih.nih.gov/health/garlic",           herb: "garlic" },
  { url: "https://www.nccih.nih.gov/health/ginkgo",           herb: "ginkgo" },
  { url: "https://www.nccih.nih.gov/health/asian-ginseng",    herb: "ginseng" },
  { url: "https://www.nccih.nih.gov/health/milk-thistle",     herb: "milk thistle" },
  { url: "https://www.nccih.nih.gov/health/green-tea",        herb: "green tea" },
  { url: "https://www.nccih.nih.gov/health/hawthorn",         herb: "hawthorn" },
  { url: "https://www.nccih.nih.gov/health/nettle",           herb: "nettle" },
  { url: "https://www.nccih.nih.gov/health/rhodiola",         herb: "rhodiola" },
  { url: "https://www.nccih.nih.gov/health/willow-bark",      herb: "willow bark" },
  { url: "https://www.nccih.nih.gov/health/black-cohosh",     herb: "black cohosh" },
  { url: "https://www.nccih.nih.gov/health/california-poppy", herb: "california poppy" },
  { url: "https://www.nccih.nih.gov/health/mullein",          herb: "mullein" },
  { url: "https://www.nccih.nih.gov/health/slippery-elm",     herb: "slippery elm" },
  { url: "https://www.nccih.nih.gov/health/hops",             herb: "hops" },
  { url: "https://www.nccih.nih.gov/health/holy-basil",       herb: "holy basil" },
  { url: "https://www.nccih.nih.gov/health/dong-quai",        herb: "dong quai" },
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
  const uniqueHerbs = [...new Set(APPROVED_SOURCES.map(s => s.herb))].length;
  const uniqueSources = [...new Set(APPROVED_SOURCES.map(s => s.name))].length;
  console.log(`   Herb pages indexed: ${APPROVED_SOURCES.length} (${uniqueHerbs} herbs × ${uniqueSources} sources)`);
  console.log(`   Open: http://localhost:${PORT}\n`);
});