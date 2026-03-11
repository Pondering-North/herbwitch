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

/// ── Ailment → herb mapping ────────────────────────────────────
const AILMENT_HERB_MAP = {

  // ── Head & neurological ────────────────────────────────────
  "headache":              ["peppermint", "lavender", "feverfew", "ginger", "willow bark"],
  "head pain":             ["peppermint", "lavender", "feverfew", "willow bark", "ginger"],
  "tension headache":      ["peppermint", "lavender", "chamomile", "valerian", "willow bark"],
  "migraine":              ["feverfew", "peppermint", "lavender", "ginger", "willow bark"],
  "cluster headache":      ["feverfew", "peppermint", "lavender", "willow bark", "ginger"],
  "dizziness":             ["ginger", "peppermint", "ginkgo", "chamomile", "lavender"],
  "vertigo":               ["ginger", "ginkgo", "peppermint", "chamomile", "valerian"],
  "brain fog":             ["ginkgo", "ginseng", "rhodiola", "green tea", "holy basil"],
  "focus":                 ["ginkgo", "ginseng", "green tea", "holy basil", "rhodiola"],
  "memory":                ["ginkgo", "ginseng", "green tea", "rhodiola", "holy basil"],
  "concentration":         ["ginkgo", "ginseng", "green tea", "holy basil", "lemon balm"],
  "mental clarity":        ["ginkgo", "rhodiola", "green tea", "holy basil", "ginseng"],
  "cognitive":             ["ginkgo", "ginseng", "green tea", "rhodiola", "turmeric"],

  // ── Mood & mental health ───────────────────────────────────
  "anxiety":               ["chamomile", "lavender", "lemon balm", "passionflower", "kava", "ashwagandha"],
  "anxious":               ["chamomile", "lavender", "lemon balm", "passionflower", "ashwagandha"],
  "nervousness":           ["chamomile", "lavender", "lemon balm", "passionflower", "valerian"],
  "nervous":               ["chamomile", "lemon balm", "passionflower", "lavender", "valerian"],
  "stress":                ["ashwagandha", "rhodiola", "holy basil", "lemon balm", "passionflower", "chamomile"],
  "stressed":              ["ashwagandha", "rhodiola", "holy basil", "lemon balm", "chamomile"],
  "overwhelmed":           ["ashwagandha", "rhodiola", "holy basil", "lemon balm", "chamomile"],
  "burnout":               ["ashwagandha", "rhodiola", "holy basil", "ginseng", "lemon balm"],
  "depression":            ["st johns wort", "lemon balm", "lavender", "holy basil", "rhodiola"],
  "low mood":              ["st johns wort", "lemon balm", "lavender", "holy basil", "chamomile"],
  "sad":                   ["st johns wort", "lemon balm", "lavender", "holy basil", "rhodiola"],
  "grief":                 ["st johns wort", "lemon balm", "lavender", "chamomile", "passionflower"],
  "mood":                  ["st johns wort", "lemon balm", "lavender", "holy basil", "rhodiola"],
  "mood swings":           ["st johns wort", "lemon balm", "chamomile", "dong quai", "ashwagandha"],
  "irritability":          ["chamomile", "lemon balm", "passionflower", "st johns wort", "valerian"],
  "irritable":             ["chamomile", "lemon balm", "passionflower", "lavender", "valerian"],
  "panic":                 ["passionflower", "lemon balm", "lavender", "kava", "chamomile"],
  "panic attack":          ["passionflower", "kava", "lemon balm", "lavender", "chamomile"],
  "ptsd":                  ["passionflower", "ashwagandha", "lemon balm", "lavender", "valerian"],
  "trauma":                ["passionflower", "ashwagandha", "lemon balm", "st johns wort", "valerian"],
  "loneliness":            ["st johns wort", "lemon balm", "lavender", "chamomile", "holy basil"],

  // ── Sleep ──────────────────────────────────────────────────
  "sleep":                 ["valerian", "hops", "chamomile", "lavender", "passionflower", "california poppy"],
  "insomnia":              ["valerian", "hops", "passionflower", "chamomile", "california poppy"],
  "cant sleep":            ["valerian", "hops", "passionflower", "chamomile", "california poppy"],
  "can't sleep":           ["valerian", "hops", "passionflower", "chamomile", "california poppy"],
  "trouble sleeping":      ["valerian", "hops", "passionflower", "lavender", "california poppy"],
  "restless":              ["valerian", "chamomile", "passionflower", "lemon balm", "hops"],
  "restless sleep":        ["valerian", "hops", "chamomile", "passionflower", "california poppy"],
  "nightmares":            ["valerian", "chamomile", "lavender", "passionflower", "lemon balm"],
  "waking up at night":    ["valerian", "hops", "chamomile", "passionflower", "california poppy"],
  "jet lag":               ["valerian", "chamomile", "lavender", "passionflower", "lemon balm"],

  // ── Digestive ──────────────────────────────────────────────
  "stomachache":           ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm", "slippery elm"],
  "stomach ache":          ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "stomach pain":          ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "upset stomach":         ["ginger", "peppermint", "chamomile", "lemon balm", "slippery elm"],
  "nausea":                ["ginger", "peppermint", "chamomile", "lemon balm"],
  "nauseous":              ["ginger", "peppermint", "chamomile", "lemon balm"],
  "vomiting":              ["ginger", "peppermint", "chamomile", "lemon balm"],
  "motion sickness":       ["ginger", "peppermint", "chamomile", "lemon balm"],
  "morning sickness":      ["ginger", "peppermint", "lemon balm", "chamomile"],
  "stomach":               ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "digestion":             ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "digestive":             ["ginger", "peppermint", "chamomile", "licorice root", "lemon balm"],
  "indigestion":           ["ginger", "peppermint", "chamomile", "licorice root", "slippery elm"],
  "bloating":              ["peppermint", "ginger", "chamomile", "lemon balm", "fennel"],
  "bloated":               ["peppermint", "ginger", "chamomile", "lemon balm", "fennel"],
  "gas":                   ["peppermint", "ginger", "chamomile", "fennel", "lemon balm"],
  "flatulence":            ["peppermint", "ginger", "fennel", "chamomile", "lemon balm"],
  "constipation":          ["slippery elm", "licorice root", "dandelion", "ginger", "chamomile"],
  "diarrhea":              ["chamomile", "ginger", "slippery elm", "peppermint", "lemon balm"],
  "ibs":                   ["peppermint", "chamomile", "slippery elm", "lemon balm", "ginger"],
  "irritable bowel":       ["peppermint", "chamomile", "slippery elm", "lemon balm", "ginger"],
  "heartburn":             ["licorice root", "slippery elm", "chamomile", "ginger"],
  "acid reflux":           ["licorice root", "slippery elm", "chamomile", "ginger"],
  "gerd":                  ["licorice root", "slippery elm", "chamomile", "marshmallow root"],
  "appetite":              ["ginger", "chamomile", "lemon balm", "peppermint", "fennel"],
  "no appetite":           ["ginger", "chamomile", "peppermint", "lemon balm", "holy basil"],
  "liver":                 ["milk thistle", "turmeric", "dandelion", "licorice root"],
  "detox":                 ["milk thistle", "dandelion", "turmeric", "nettle", "green tea"],
  "hangover":              ["ginger", "milk thistle", "peppermint", "chamomile", "dandelion"],

  // ── Respiratory ────────────────────────────────────────────
  "cold":                  ["echinacea", "elderberry", "ginger", "peppermint", "licorice root", "mullein"],
  "common cold":           ["echinacea", "elderberry", "ginger", "garlic", "mullein"],
  "flu":                   ["echinacea", "elderberry", "ginger", "yarrow", "mullein"],
  "influenza":             ["echinacea", "elderberry", "ginger", "yarrow", "garlic"],
  "fever":                 ["elderberry", "yarrow", "echinacea", "peppermint", "ginger"],
  "chills":                ["ginger", "yarrow", "echinacea", "elderberry", "peppermint"],
  "cough":                 ["mullein", "licorice root", "slippery elm", "elderberry", "ginger"],
  "dry cough":             ["slippery elm", "licorice root", "mullein", "marshmallow root", "ginger"],
  "wet cough":             ["mullein", "thyme", "licorice root", "elderberry", "ginger"],
  "bronchitis":            ["mullein", "licorice root", "thyme", "elderberry", "echinacea"],
  "asthma":                ["mullein", "licorice root", "turmeric", "ginger", "chamomile"],
  "sore throat":           ["licorice root", "slippery elm", "chamomile", "echinacea"],
  "throat":                ["licorice root", "slippery elm", "chamomile", "echinacea", "sage"],
  "strep":                 ["echinacea", "licorice root", "slippery elm", "garlic", "chamomile"],
  "congestion":            ["peppermint", "ginger", "mullein", "elderberry", "echinacea"],
  "stuffy nose":           ["peppermint", "ginger", "elderberry", "mullein", "echinacea"],
  "runny nose":            ["elderberry", "echinacea", "nettle", "peppermint", "ginger"],
  "sinuses":               ["peppermint", "echinacea", "elderberry", "ginger", "mullein"],
  "sinus":                 ["peppermint", "echinacea", "elderberry", "ginger", "mullein"],
  "sinus infection":       ["echinacea", "elderberry", "garlic", "peppermint", "ginger"],
  "allergies":             ["nettle", "chamomile", "elderberry", "turmeric", "green tea"],
  "allergy":               ["nettle", "chamomile", "elderberry", "turmeric", "green tea"],
  "hay fever":             ["nettle", "chamomile", "elderberry", "turmeric", "echinacea"],
  "sneezing":              ["nettle", "chamomile", "elderberry", "peppermint", "echinacea"],

  // ── Immune ─────────────────────────────────────────────────
  "immune":                ["echinacea", "elderberry", "turmeric", "ginger", "ashwagandha", "garlic"],
  "immunity":              ["echinacea", "elderberry", "turmeric", "ginger", "ashwagandha", "garlic"],
  "poor immunity":         ["echinacea", "elderberry", "ashwagandha", "garlic", "turmeric"],
  "weak immune":           ["echinacea", "elderberry", "ashwagandha", "garlic", "ginger"],
  "low immunity":          ["echinacea", "elderberry", "ashwagandha", "turmeric", "garlic"],
  "getting sick":          ["echinacea", "elderberry", "ginger", "garlic", "mullein"],
  "sick":                  ["echinacea", "elderberry", "ginger", "peppermint", "garlic"],
  "infection":             ["echinacea", "garlic", "turmeric", "elderberry", "ginger"],
  "virus":                 ["echinacea", "elderberry", "garlic", "ginger", "turmeric"],
  "bacteria":              ["echinacea", "garlic", "turmeric", "ginger", "echinacea"],

  // ── Pain & inflammation ────────────────────────────────────
  "inflammation":          ["turmeric", "ginger", "chamomile", "willow bark", "nettle"],
  "inflamed":              ["turmeric", "ginger", "chamomile", "willow bark", "nettle"],
  "swelling":              ["turmeric", "ginger", "chamomile", "nettle", "willow bark"],
  "pain":                  ["willow bark", "turmeric", "ginger", "peppermint", "california poppy"],
  "aching":                ["willow bark", "turmeric", "ginger", "peppermint", "chamomile"],
  "aches":                 ["willow bark", "ginger", "turmeric", "peppermint", "chamomile"],
  "joint pain":            ["turmeric", "ginger", "willow bark", "nettle"],
  "joint":                 ["turmeric", "ginger", "willow bark", "nettle", "chamomile"],
  "arthritis":             ["turmeric", "ginger", "willow bark", "nettle"],
  "rheumatism":            ["turmeric", "ginger", "willow bark", "nettle", "chamomile"],
  "gout":                  ["nettle", "turmeric", "ginger", "willow bark", "chamomile"],
  "muscle":                ["valerian", "chamomile", "peppermint", "ginger", "california poppy"],
  "muscle pain":           ["peppermint", "ginger", "turmeric", "valerian", "california poppy"],
  "muscle tension":        ["valerian", "peppermint", "chamomile", "california poppy", "lavender"],
  "cramp":                 ["chamomile", "ginger", "valerian", "peppermint", "california poppy"],
  "spasm":                 ["valerian", "chamomile", "peppermint", "california poppy", "ginger"],
  "fibromyalgia":          ["turmeric", "valerian", "california poppy", "ashwagandha", "st johns wort"],
  "chronic pain":          ["turmeric", "willow bark", "california poppy", "ginger", "ashwagandha"],

  // ── Musculoskeletal ────────────────────────────────────────
  "shoulder":              ["turmeric", "ginger", "willow bark", "peppermint", "california poppy"],
  "shoulder pain":         ["turmeric", "ginger", "willow bark", "peppermint", "valerian"],
  "sore muscles":          ["peppermint", "ginger", "turmeric", "chamomile", "california poppy"],
  "sore":                  ["willow bark", "turmeric", "ginger", "peppermint", "chamomile"],
  "stiff":                 ["ginger", "turmeric", "willow bark", "peppermint", "chamomile"],
  "stiffness":             ["ginger", "turmeric", "willow bark", "peppermint", "chamomile"],
  "neck":                  ["valerian", "peppermint", "chamomile", "willow bark", "california poppy"],
  "neck pain":             ["valerian", "willow bark", "peppermint", "turmeric", "california poppy"],
  "back pain":             ["willow bark", "turmeric", "ginger", "valerian", "california poppy"],
  "back":                  ["willow bark", "turmeric", "ginger", "valerian", "chamomile"],
  "lower back":            ["willow bark", "turmeric", "ginger", "valerian", "california poppy"],
  "knee":                  ["turmeric", "ginger", "willow bark", "nettle", "california poppy"],
  "hip":                   ["turmeric", "ginger", "willow bark", "nettle", "valerian"],
  "wrist":                 ["turmeric", "ginger", "willow bark", "peppermint", "chamomile"],
  "tendon":                ["turmeric", "ginger", "willow bark", "nettle", "chamomile"],
  "sciatica":              ["willow bark", "turmeric", "valerian", "california poppy", "ginger"],
  "restless legs":         ["valerian", "chamomile", "california poppy", "passionflower", "lemon balm"],

  // ── Women's health ─────────────────────────────────────────
  "menstrual":             ["chamomile", "ginger", "lemon balm", "valerian", "dong quai", "yarrow"],
  "period":                ["chamomile", "ginger", "dong quai", "valerian", "lemon balm"],
  "period cramps":         ["chamomile", "ginger", "valerian", "california poppy", "lemon balm"],
  "period pain":           ["chamomile", "ginger", "valerian", "willow bark", "california poppy"],
  "menstrual cramps":      ["chamomile", "ginger", "valerian", "california poppy", "dong quai"],
  "cramps":                ["chamomile", "ginger", "lemon balm", "valerian", "california poppy"],
  "pms":                   ["chamomile", "dong quai", "lemon balm", "st johns wort", "valerian"],
  "premenstrual":          ["chamomile", "dong quai", "lemon balm", "st johns wort", "valerian"],
  "irregular period":      ["dong quai", "chamomile", "black cohosh", "red clover", "lemon balm"],
  "heavy period":          ["yarrow", "dong quai", "chamomile", "nettle", "lemon balm"],
  "menopause":             ["black cohosh", "red clover", "dong quai", "st johns wort", "valerian"],
  "hot flashes":           ["black cohosh", "red clover", "dong quai", "sage", "valerian"],
  "night sweats":          ["black cohosh", "sage", "red clover", "valerian", "chamomile"],
  "hormonal":              ["black cohosh", "red clover", "dong quai", "ashwagandha", "chamomile"],
  "hormone":               ["black cohosh", "red clover", "dong quai", "ashwagandha", "holy basil"],
  "fertility":             ["dong quai", "red clover", "ashwagandha", "rhodiola", "lemon balm"],
  "libido":                ["ashwagandha", "ginseng", "rhodiola", "dong quai", "holy basil"],
  "low libido":            ["ashwagandha", "ginseng", "rhodiola", "dong quai", "red clover"],
  "vaginal dryness":       ["black cohosh", "red clover", "dong quai", "chamomile", "licorice root"],

  // ── Energy & vitality ──────────────────────────────────────
  "fatigue":               ["ginseng", "rhodiola", "ashwagandha", "green tea", "holy basil", "ginger"],
  "tired":                 ["ginseng", "rhodiola", "ashwagandha", "green tea", "holy basil"],
  "exhausted":             ["ashwagandha", "rhodiola", "ginseng", "holy basil", "lemon balm"],
  "exhaustion":            ["ashwagandha", "rhodiola", "ginseng", "holy basil", "lemon balm"],
  "energy":                ["ginseng", "rhodiola", "green tea", "peppermint", "ashwagandha"],
  "low energy":            ["ginseng", "rhodiola", "ashwagandha", "green tea", "holy basil"],
  "adrenal":               ["ashwagandha", "rhodiola", "holy basil", "licorice root"],
  "adrenal fatigue":       ["ashwagandha", "rhodiola", "holy basil", "licorice root", "ginseng"],
  "stamina":               ["ginseng", "rhodiola", "ashwagandha", "green tea", "holy basil"],
  "weakness":              ["ginseng", "ashwagandha", "rhodiola", "nettle", "licorice root"],

  // ── Skin ───────────────────────────────────────────────────
  "skin":                  ["chamomile", "lavender", "nettle", "green tea", "turmeric"],
  "eczema":                ["chamomile", "nettle", "turmeric", "green tea", "licorice root"],
  "psoriasis":             ["chamomile", "turmeric", "nettle", "milk thistle", "licorice root"],
  "acne":                  ["nettle", "green tea", "chamomile", "turmeric", "echinacea"],
  "breakouts":             ["nettle", "green tea", "chamomile", "turmeric", "echinacea"],
  "rash":                  ["chamomile", "nettle", "lavender", "turmeric", "echinacea"],
  "hives":                 ["chamomile", "nettle", "lavender", "licorice root", "green tea"],
  "dry skin":              ["chamomile", "lavender", "nettle", "licorice root", "green tea"],
  "itchy skin":            ["chamomile", "nettle", "lavender", "licorice root", "green tea"],
  "wound":                 ["chamomile", "echinacea", "yarrow", "lavender", "calendula"],
  "cuts":                  ["yarrow", "chamomile", "echinacea", "lavender", "calendula"],
  "sunburn":               ["chamomile", "lavender", "green tea", "aloe", "calendula"],
  "aging skin":            ["green tea", "turmeric", "chamomile", "nettle", "milk thistle"],

  // ── Heart & circulation ────────────────────────────────────
  "heart":                 ["hawthorn", "garlic", "green tea", "turmeric", "ginkgo"],
  "heart health":          ["hawthorn", "garlic", "green tea", "turmeric", "ginkgo"],
  "blood pressure":        ["hawthorn", "garlic", "lemon balm", "valerian", "hibiscus"],
  "high blood pressure":   ["hawthorn", "garlic", "lemon balm", "valerian", "hibiscus"],
  "hypertension":          ["hawthorn", "garlic", "lemon balm", "valerian", "hibiscus"],
  "cholesterol":           ["garlic", "green tea", "hawthorn", "turmeric", "milk thistle"],
  "circulation":           ["ginkgo", "ginger", "hawthorn", "garlic", "green tea"],
  "poor circulation":      ["ginkgo", "ginger", "hawthorn", "garlic", "turmeric"],
  "cold hands":            ["ginkgo", "ginger", "hawthorn", "garlic", "turmeric"],
  "cold feet":             ["ginkgo", "ginger", "hawthorn", "garlic", "turmeric"],
  "varicose veins":        ["hawthorn", "ginkgo", "horse chestnut", "nettle", "turmeric"],
  "palpitations":          ["hawthorn", "lemon balm", "valerian", "chamomile", "passionflower"],

  // ── Dental & oral ──────────────────────────────────────────
  "toothache":             ["clove", "peppermint", "chamomile", "willow bark", "echinacea"],
  "tooth":                 ["clove", "peppermint", "chamomile", "willow bark", "echinacea"],
  "tooth pain":            ["clove", "peppermint", "willow bark", "chamomile", "echinacea"],
  "gum":                   ["chamomile", "echinacea", "peppermint", "clove", "sage"],
  "gum disease":           ["chamomile", "echinacea", "sage", "clove", "green tea"],
  "mouth":                 ["chamomile", "peppermint", "licorice root", "echinacea", "sage"],
  "mouth ulcer":           ["chamomile", "licorice root", "slippery elm", "echinacea", "sage"],
  "canker sore":           ["chamomile", "licorice root", "slippery elm", "echinacea", "sage"],
  "bad breath":            ["peppermint", "sage", "chamomile", "green tea", "fennel"],

  // ── Ear ────────────────────────────────────────────────────
  "earache":               ["echinacea", "elderberry", "garlic", "mullein", "chamomile"],
  "ear ache":              ["echinacea", "elderberry", "garlic", "mullein", "chamomile"],
  "ear pain":              ["echinacea", "garlic", "mullein", "chamomile", "elderberry"],
  "ear infection":         ["echinacea", "garlic", "elderberry", "mullein", "chamomile"],
  "ear":                   ["echinacea", "garlic", "mullein", "chamomile", "elderberry"],
  "ringing in ears":       ["ginkgo", "chamomile", "lemon balm", "valerian", "ginger"],
  "tinnitus":              ["ginkgo", "chamomile", "lemon balm", "valerian", "ginger"],

  // ── Eye ────────────────────────────────────────────────────
  "eye ache":              ["chamomile", "green tea", "nettle", "echinacea", "lavender"],
  "eye pain":              ["chamomile", "green tea", "nettle", "echinacea", "lavender"],
  "eye":                   ["chamomile", "green tea", "nettle", "echinacea", "lavender"],
  "eyestrain":             ["chamomile", "green tea", "lavender", "nettle", "lemon balm"],
  "dry eyes":              ["chamomile", "green tea", "nettle", "flaxseed", "lavender"],
  "puffy eyes":            ["chamomile", "green tea", "nettle", "lavender", "cucumber"],
  "eye infection":         ["chamomile", "echinacea", "green tea", "nettle", "garlic"],
  "conjunctivitis":        ["chamomile", "echinacea", "green tea", "nettle", "elderberry"],

  // ── Urinary ────────────────────────────────────────────────
  "urinary":               ["nettle", "saw palmetto", "dandelion", "echinacea", "chamomile"],
  "bladder":               ["nettle", "dandelion", "saw palmetto", "chamomile", "echinacea"],
  "uti":                   ["echinacea", "nettle", "dandelion", "chamomile", "garlic"],
  "urinary tract":         ["echinacea", "nettle", "dandelion", "chamomile", "garlic"],
  "kidney":                ["nettle", "dandelion", "chamomile", "milk thistle", "turmeric"],
  "kidney stones":         ["nettle", "dandelion", "chamomile", "lemon balm", "turmeric"],
  "prostate":              ["saw palmetto", "nettle", "green tea", "turmeric", "pumpkin seed"],
  "frequent urination":    ["saw palmetto", "nettle", "dandelion", "chamomile", "echinacea"],

  // ── Blood sugar & metabolism ───────────────────────────────
  "blood sugar":           ["cinnamon", "turmeric", "ginseng", "berberine", "green tea"],
  "diabetes":              ["cinnamon", "turmeric", "ginseng", "green tea", "milk thistle"],
  "insulin":               ["cinnamon", "turmeric", "ginseng", "green tea", "berberine"],
  "weight":                ["green tea", "ginger", "dandelion", "nettle", "turmeric"],
  "weight loss":           ["green tea", "ginger", "dandelion", "nettle", "peppermint"],
  "metabolism":            ["green tea", "ginger", "rhodiola", "ginseng", "holy basil"],
  "thyroid":               ["ashwagandha", "lemon balm", "turmeric", "nettle", "holy basil"],

  // ── Bones & structural ─────────────────────────────────────
  "bone":                  ["nettle", "horsetail", "turmeric", "chamomile", "dandelion"],
  "osteoporosis":          ["nettle", "horsetail", "turmeric", "red clover", "dandelion"],
  "calcium":               ["nettle", "horsetail", "dandelion", "chamomile", "red clover"],

  // ── General wellbeing ──────────────────────────────────────
  "general wellness":      ["chamomile", "ginger", "nettle", "green tea", "turmeric"],
  "overall health":        ["chamomile", "ginger", "nettle", "green tea", "ashwagandha"],
  "feeling unwell":        ["echinacea", "ginger", "chamomile", "elderberry", "peppermint"],
  "under the weather":     ["echinacea", "elderberry", "ginger", "chamomile", "garlic"],
  "run down":              ["ashwagandha", "echinacea", "elderberry", "ginseng", "nettle"],
  "inflammation overall":  ["turmeric", "ginger", "chamomile", "green tea", "willow bark"],
  "antioxidant":           ["green tea", "turmeric", "elderberry", "nettle", "ginkgo"],
  "detox":                 ["milk thistle", "dandelion", "turmeric", "nettle", "green tea"],
  "cleanse":               ["dandelion", "milk thistle", "nettle", "green tea", "ginger"],
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
    const ailmentClean = ailment.trim();
    for (const [key, herbs] of Object.entries(AILMENT_HERB_MAP)) {
      // Match if: ailment contains key, key contains ailment,
      // or any individual word in the ailment matches any word in the key
      const ailmentWords = ailmentClean.split(/\s+/);
      const keyWords = key.split(/\s+/);
      const wordOverlap = ailmentWords.some(w => w.length > 3 && keyWords.some(k => k.includes(w) || w.includes(k)));

      if (ailmentClean.includes(key) || key.includes(ailmentClean) || wordOverlap) {
        herbs.forEach(h => relevantHerbs.add(h));
      }
    }
  }

  // If no mapping found, use a default set of common herbs
  if (relevantHerbs.size === 0) {
    console.log("   No mapping found — using default herbs");
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🌿 HerbWitch running at http://localhost:${PORT}`);
    const uniqueHerbs = [...new Set(APPROVED_SOURCES.map(s => s.herb))].length;
    const uniqueSources = [...new Set(APPROVED_SOURCES.map(s => s.name))].length;
    console.log(`   Herb pages indexed: ${APPROVED_SOURCES.length} (${uniqueHerbs} herbs × ${uniqueSources} sources)`);
    console.log(`   Open: http://localhost:${PORT}\n`);
  });
}

export default app;