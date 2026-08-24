export type HeritageStatus = "pending" | "community" | "expert" | "changes_requested";
export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type KnowledgeKind = "summary" | "procedure" | "materials" | "tools" | "significance" | "metadata" | "uncertainty";

export type Evidence = {
  label: string;
  quote: string;
  timecode: string;
};

export type KnowledgeBlock = {
  kind: KnowledgeKind;
  label: string;
  content: string | string[];
  confidence: number;
  status: "AI assisted" | "Human edited" | "Needs review" | "Verified";
  evidence: Evidence;
};

export type RiskAssessment = {
  score: number;
  level: RiskLevel;
  explanation: string;
  factors: Array<{ label: string; value: string; note: string }>;
};

export type Practitioner = {
  id: string;
  displayName: string;
  role: string;
  biography: string;
  region: string;
  district: string;
  languages: string[];
  specialties: string[];
  isPublic: boolean;
  workshopAvailable: boolean;
  verificationStatus: HeritageStatus;
  archiveCount: number;
};

export type HeritageRecord = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  shortDescription: string;
  category: string;
  region: string;
  district: string;
  village: string;
  originalLanguage: string;
  festival?: string;
  practitionerId: string;
  practitionerName: string;
  status: HeritageStatus;
  publicationState: "public" | "preview";
  isDemo: boolean;
  sourceLabel: string;
  media: Array<{ type: "video" | "audio" | "photo" | "text"; label: string; url: string; duration?: string }>;
  knowledge: KnowledgeBlock[];
  relationships: Array<{ type: string; label: string; detail: string }>;
  risk: RiskAssessment;
  coordinates: { lat: number; lng: number };
  transcript: { original: string; translation: string; language: string };
};

export const DEMO_MEDIA_URL = "/manus-storage/assam-bamboo-makers_902b5de7.jpg";

const evidence = (label: string, quote: string, timecode: string): Evidence => ({ label, quote, timecode });

export const practitioners: Practitioner[] = [
  {
    id: "p-anjali",
    displayName: "Anjali Das",
    role: "Bamboo craft practitioner",
    biography: "A seeded demonstration profile representing a knowledge holder whose process notes are being preserved with consent-aware publication controls.",
    region: "Assam",
    district: "Majuli",
    languages: ["Assamese", "Hindi"],
    specialties: ["Bamboo craft", "Basketry"],
    isPublic: true,
    workshopAvailable: true,
    verificationStatus: "community",
    archiveCount: 12,
  },
  {
    id: "p-rina",
    displayName: "Rina Saikia",
    role: "Traditional weaving practitioner",
    biography: "A seeded demonstration profile for exploring how textile knowledge can be linked to place, materials, and everyday use.",
    region: "Assam",
    district: "Sivasagar",
    languages: ["Assamese", "English"],
    specialties: ["Hand weaving", "Textile motifs"],
    isPublic: true,
    workshopAvailable: true,
    verificationStatus: "expert",
    archiveCount: 8,
  },
  {
    id: "p-biren",
    displayName: "Biren Moran",
    role: "Folk music knowledge holder",
    biography: "A seeded demonstration profile showing a respectful path for preserving songs, context, and performance memory without treating living culture as a static object.",
    region: "Assam",
    district: "Dibrugarh",
    languages: ["Assamese", "Mising"],
    specialties: ["Folk music", "Oral traditions"],
    isPublic: true,
    workshopAvailable: false,
    verificationStatus: "community",
    archiveCount: 6,
  },
  {
    id: "p-maya",
    displayName: "Maya Hazarika",
    role: "Food knowledge practitioner",
    biography: "A seeded demonstration profile for documenting seasonal food knowledge while keeping publication and community review visible in the record lifecycle.",
    region: "Assam",
    district: "Jorhat",
    languages: ["Assamese", "Hindi"],
    specialties: ["Seasonal food", "Household knowledge"],
    isPublic: true,
    workshopAvailable: true,
    verificationStatus: "pending",
    archiveCount: 4,
  },
];

export const records: HeritageRecord[] = [
  {
    id: "r-bamboo",
    slug: "bamboo-basketry-majuli",
    title: "Bamboo basketry of Majuli",
    eyebrow: "Traditional craft · Assam",
    shortDescription: "A demonstration record showing how a living craft can be preserved from original testimony to a source-linked public heritage card.",
    category: "Traditional craft",
    region: "Assam",
    district: "Majuli",
    village: "Kamalabari",
    originalLanguage: "Assamese",
    festival: "Bihu season",
    practitionerId: "p-anjali",
    practitionerName: "Anjali Das",
    status: "community",
    publicationState: "public",
    isDemo: true,
    sourceLabel: "Seeded demonstration interview · Video #104",
    media: [{ type: "video", label: "Original process recording", url: DEMO_MEDIA_URL, duration: "02:14" }, { type: "audio", label: "Original voice recording", url: DEMO_MEDIA_URL, duration: "02:14" }, { type: "photo", label: "Process photograph", url: DEMO_MEDIA_URL }],
    transcript: { original: "প্ৰথমে আমি কোমল বাঁহ বাছি লওঁ, তাৰ পিছত পাতল ফালি কৰি শুকুৱাই লওঁ।", translation: "First, we select a supple bamboo, then split it into thin strips and let them dry.", language: "Assamese" },
    knowledge: [
      { kind: "summary", label: "Short explanation", content: "A basketry process built around careful bamboo selection, patient preparation, and a woven base that is strengthened at the rim.", confidence: 0.91, status: "Verified", evidence: evidence("Artisan interview — Video #104", "We select a supple bamboo before we begin.", "00:18") },
      { kind: "procedure", label: "How it is made", content: ["Select suitable bamboo with a flexible wall.", "Split and smooth the bamboo strips.", "Dry and treat the strips before weaving.", "Create the base and weave the sides.", "Fold and finish the rim."], confidence: 0.87, status: "Verified", evidence: evidence("Artisan interview — Video #104", "The base comes first; the sides are woven around it.", "01:08") },
      { kind: "materials", label: "Materials", content: ["Bamboo", "Natural water-based dye", "Cotton binding thread"], confidence: 0.83, status: "Human edited", evidence: evidence("Artisan interview — Video #104", "The bamboo is left to rest before the final binding.", "01:42") },
      { kind: "tools", label: "Tools", content: ["Bamboo knife", "Smoothing blade", "Hand awl"], confidence: 0.88, status: "Verified", evidence: evidence("Artisan interview — Video #104", "This small blade helps us keep each strip even.", "00:44") },
      { kind: "significance", label: "Cultural significance", content: "The record connects a practical household object to skills, seasonal work, and the knowledge carried by makers across generations.", confidence: 0.74, status: "Needs review", evidence: evidence("Artisan interview — Video #104", "A basket is useful because it is made for the work of the household.", "01:56") },
      { kind: "uncertainty", label: "Uncertainty note", content: "This seeded record is a demonstration of the archive workflow. Community context and regional variation should be reviewed before use as a historical authority.", confidence: 0.99, status: "Human edited", evidence: evidence("Archive editorial note", "Demonstration content is visibly labelled for review.", "—") },
    ],
    relationships: [{ type: "Material", label: "Bamboo", detail: "Primary material" }, { type: "Tool", label: "Bamboo knife", detail: "Preparation tool" }, { type: "Festival", label: "Bihu season", detail: "Seasonal context" }, { type: "Region", label: "Majuli", detail: "Public-safe location" }],
    risk: { score: 78, level: "high", explanation: "The indicator prioritizes documentation where the practitioner base is small, average age is high, and public documentation is limited.", factors: [{ label: "Active practitioners", value: "3 known", note: "Limited local practitioner base" }, { label: "Average practitioner age", value: "68 years", note: "Knowledge holder continuity needs attention" }, { label: "Young practitioners", value: "1", note: "Few documented successors" }, { label: "Documentation available", value: "Low", note: "Prioritize a source recording" }, { label: "Commercial practice", value: "Low", note: "Fewer market pathways" }, { label: "Geographic spread", value: "Limited", note: "Practice is concentrated" }] },
    coordinates: { lat: 27.0, lng: 94.2 },
  },
  {
    id: "r-weaving",
    slug: "mekhela-chador-weaving-sivasagar",
    title: "Everyday weaving in Sivasagar",
    eyebrow: "Textile knowledge · Assam",
    shortDescription: "A seeded record focused on motifs, loom preparation, and the relationship between household practice and place.",
    category: "Traditional weaving",
    region: "Assam",
    district: "Sivasagar",
    village: "Demow",
    originalLanguage: "Assamese",
    festival: "Bihu season",
    practitionerId: "p-rina",
    practitionerName: "Rina Saikia",
    status: "expert",
    publicationState: "public",
    isDemo: true,
    sourceLabel: "Seeded demonstration interview · Audio #205",
    media: [{ type: "audio", label: "Original weaving interview", url: DEMO_MEDIA_URL, duration: "04:10" }, { type: "photo", label: "Loom and motif study", url: DEMO_MEDIA_URL }],
    transcript: { original: "সূতাৰ টান আৰু ৰঙৰ মিলনেই কাপোৰখনৰ স্বভাৱ গঢ়ে।", translation: "The tension of the thread and the meeting of colours shape the character of the cloth.", language: "Assamese" },
    knowledge: [
      { kind: "summary", label: "Short explanation", content: "A demonstration record of hand-weaving knowledge that connects loom setup, thread tension, and motif memory.", confidence: 0.94, status: "Verified", evidence: evidence("Weaving interview — Audio #205", "The tension of the thread shapes the cloth.", "00:36") },
      { kind: "procedure", label: "Key sequence", content: ["Prepare the loom and check the warp.", "Set the thread tension by hand.", "Build the border motif.", "Weave the body of the cloth.", "Inspect the finished edge."], confidence: 0.88, status: "Verified", evidence: evidence("Weaving interview — Audio #205", "The border is checked before the body is woven.", "02:04") },
      { kind: "materials", label: "Materials", content: ["Cotton thread", "Natural and synthetic colour references", "Loom reed"], confidence: 0.81, status: "Human edited", evidence: evidence("Weaving interview — Audio #205", "The thread is sorted before the loom is set.", "01:15") },
      { kind: "tools", label: "Tools", content: ["Handloom", "Shuttle", "Reed", "Batten"], confidence: 0.92, status: "Verified", evidence: evidence("Weaving interview — Audio #205", "The shuttle carries the thread across the shed.", "01:46") },
      { kind: "significance", label: "Cultural significance", content: "The record treats weaving as a living practice shaped by memory, use, and the maker's decisions rather than as a fixed pattern library.", confidence: 0.77, status: "Needs review", evidence: evidence("Weaving interview — Audio #205", "A motif can be remembered and still change with the maker.", "03:24") },
    ],
    relationships: [{ type: "Material", label: "Cotton thread", detail: "Primary material" }, { type: "Process", label: "Loom preparation", detail: "Foundational process" }, { type: "Festival", label: "Bihu season", detail: "Use context" }, { type: "Region", label: "Sivasagar", detail: "Public-safe location" }],
    risk: { score: 53, level: "moderate", explanation: "The indicator signals a practice worth documenting while a broader base of makers and continued household use provide resilience.", factors: [{ label: "Active practitioners", value: "22 known", note: "More distributed locally" }, { label: "Average practitioner age", value: "55 years", note: "Intergenerational continuity visible" }, { label: "Young practitioners", value: "6", note: "Growing learning pathway" }, { label: "Documentation available", value: "Moderate", note: "Some records exist" }, { label: "Commercial practice", value: "Moderate", note: "Use and market overlap" }, { label: "Geographic spread", value: "Regional", note: "Multiple communities" }] },
    coordinates: { lat: 27.0, lng: 94.6 },
  },
  {
    id: "r-bihu",
    slug: "bihu-ritual-memory-assam",
    title: "Bihu: songs, movement, and seasonal memory",
    eyebrow: "Living tradition · Assam",
    shortDescription: "A source-linked exploration of how oral memory, music, and seasonal gathering can be documented without flattening context.",
    category: "Festival & oral tradition",
    region: "Assam",
    district: "Dibrugarh",
    village: "Chabua",
    originalLanguage: "Assamese",
    festival: "Bihu",
    practitionerId: "p-biren",
    practitionerName: "Biren Moran",
    status: "community",
    publicationState: "public",
    isDemo: true,
    sourceLabel: "Seeded demonstration interview · Audio #318",
    media: [{ type: "audio", label: "Original song context recording", url: DEMO_MEDIA_URL, duration: "03:42" }, { type: "photo", label: "Gathering context", url: DEMO_MEDIA_URL }],
    transcript: { original: "বিহুৰ গীত কেৱল সুৰ নহয়, মানুহে একেলগে থকাৰ স্মৃতি।", translation: "A Bihu song is more than melody; it holds the memory of people being together.", language: "Assamese" },
    knowledge: [
      { kind: "summary", label: "Short explanation", content: "A demonstration record tracing how song, movement, and seasonal gathering carry memory across generations.", confidence: 0.89, status: "Verified", evidence: evidence("Bihu context recording — Audio #318", "The song holds the memory of people being together.", "00:28") },
      { kind: "procedure", label: "Documenting the practice", content: ["Name the gathering context.", "Record the original voice and surrounding sound.", "Describe the instruments and movement.", "Invite community review of translation and context."], confidence: 0.79, status: "Human edited", evidence: evidence("Bihu context recording — Audio #318", "First say where and why the song is sung.", "01:12") },
      { kind: "materials", label: "Materials", content: ["Drum and percussion references", "Clothing and adornment context", "Shared performance space"], confidence: 0.73, status: "Needs review", evidence: evidence("Bihu context recording — Audio #318", "The space matters as much as the sound.", "02:09") },
      { kind: "tools", label: "Sound tools", content: ["Pepā reference", "Dhol reference", "Hand percussion"], confidence: 0.76, status: "Needs review", evidence: evidence("Bihu context recording — Audio #318", "The drum marks a shared rhythm.", "02:34") },
      { kind: "significance", label: "Cultural significance", content: "The record keeps context, voice, and community review together so a song is not reduced to an isolated audio file.", confidence: 0.91, status: "Verified", evidence: evidence("Bihu context recording — Audio #318", "Context keeps the song alive.", "03:05") },
    ],
    relationships: [{ type: "Festival", label: "Bihu", detail: "Seasonal anchor" }, { type: "Sound", label: "Dhol", detail: "Instrument reference" }, { type: "Region", label: "Dibrugarh", detail: "Public-safe location" }, { type: "Person", label: "Biren Moran", detail: "Knowledge holder" }],
    risk: { score: 42, level: "moderate", explanation: "The indicator suggests active continuity, while documentation should preserve local variations and the context surrounding performance.", factors: [{ label: "Active practitioners", value: "Many", note: "Broad participation" }, { label: "Average practitioner age", value: "46 years", note: "Mixed generations" }, { label: "Young practitioners", value: "18", note: "Strong participation" }, { label: "Documentation available", value: "Moderate", note: "Context still matters" }, { label: "Commercial practice", value: "High", note: "Visibility can omit nuance" }, { label: "Geographic spread", value: "Wide", note: "Many local variations" }] },
    coordinates: { lat: 27.47, lng: 94.91 },
  },
  {
    id: "r-music",
    slug: "folk-music-dibrugarh",
    title: "Folk music as a memory practice",
    eyebrow: "Oral tradition · Assam",
    shortDescription: "A seeded audio-led record showing how a living performance can be connected to people, instruments, and place.",
    category: "Folk music",
    region: "Assam",
    district: "Dibrugarh",
    village: "Naharkatia",
    originalLanguage: "Mising",
    festival: "Harvest gatherings",
    practitionerId: "p-biren",
    practitionerName: "Biren Moran",
    status: "pending",
    publicationState: "preview",
    isDemo: true,
    sourceLabel: "Seeded demonstration interview · Audio #401",
    media: [{ type: "audio", label: "Original oral history", url: DEMO_MEDIA_URL, duration: "05:05" }, { type: "photo", label: "Instrument detail", url: DEMO_MEDIA_URL }],
    transcript: { original: "গীতটো গাঁৱৰ কথা আৰু নদীৰ কথা একেলগে কঢ়িয়াই নিয়ে।", translation: "The song carries the story of the village and the river together.", language: "Mising" },
    knowledge: [
      { kind: "summary", label: "Short explanation", content: "A pending demonstration record about songs as carriers of place-based memory and community history.", confidence: 0.82, status: "AI assisted", evidence: evidence("Oral history — Audio #401", "The song carries the village and the river together.", "00:51") },
      { kind: "procedure", label: "Recording approach", content: ["Ask the knowledge holder to name the setting.", "Preserve the original language recording.", "Add a human-reviewed translation.", "Document when the song is performed."], confidence: 0.84, status: "AI assisted", evidence: evidence("Oral history — Audio #401", "Name the river before translating the song.", "02:10") },
      { kind: "materials", label: "Context markers", content: ["River landscape", "Harvest gathering", "Shared singing space"], confidence: 0.67, status: "Needs review", evidence: evidence("Oral history — Audio #401", "The place is part of the story.", "03:00") },
      { kind: "tools", label: "Instruments", content: ["Hand drum reference", "Flute reference"], confidence: 0.71, status: "Needs review", evidence: evidence("Oral history — Audio #401", "The drum follows the river rhythm.", "03:48") },
      { kind: "significance", label: "Cultural significance", content: "Pending community review: the archive should preserve the song's setting, language, and relationships rather than publish a decontextualized summary.", confidence: 0.73, status: "Needs review", evidence: evidence("Oral history — Audio #401", "The story belongs to the place and the people.", "04:32") },
    ],
    relationships: [{ type: "Festival", label: "Harvest gatherings", detail: "Performance context" }, { type: "Place", label: "River landscape", detail: "Memory marker" }, { type: "Language", label: "Mising", detail: "Original language" }, { type: "Person", label: "Biren Moran", detail: "Knowledge holder" }],
    risk: { score: 68, level: "high", explanation: "The indicator highlights the need to preserve original-language recordings and local context while the record is still pending review.", factors: [{ label: "Active practitioners", value: "5 known", note: "Small documented group" }, { label: "Average practitioner age", value: "63 years", note: "Continuity concern" }, { label: "Young practitioners", value: "2", note: "Learning pathway needs support" }, { label: "Documentation available", value: "Low", note: "Few accessible records" }, { label: "Commercial practice", value: "Low", note: "Limited public distribution" }, { label: "Geographic spread", value: "Limited", note: "Place-specific memory" }] },
    coordinates: { lat: 27.29, lng: 94.73 },
  },
  {
    id: "r-food",
    slug: "seasonal-food-knowledge-jorhat",
    title: "Seasonal food knowledge in Jorhat",
    eyebrow: "Household knowledge · Assam",
    shortDescription: "A consent-aware example of documenting ingredients, seasonality, and the everyday decisions behind food knowledge.",
    category: "Traditional food knowledge",
    region: "Assam",
    district: "Jorhat",
    village: "Titabor",
    originalLanguage: "Assamese",
    festival: "Harvest season",
    practitionerId: "p-maya",
    practitionerName: "Maya Hazarika",
    status: "community",
    publicationState: "public",
    isDemo: true,
    sourceLabel: "Seeded demonstration interview · Video #517",
    media: [{ type: "video", label: "Original kitchen recording", url: DEMO_MEDIA_URL, duration: "03:16" }, { type: "photo", label: "Ingredient context", url: DEMO_MEDIA_URL }],
    transcript: { original: "ঋতুৰ লগত খাদ্য সলনি হয়, আৰু সেয়া গাঁওখনৰ স্মৃতিৰ অংশ।", translation: "Food changes with the season, and that change is part of the village's memory.", language: "Assamese" },
    knowledge: [
      { kind: "summary", label: "Short explanation", content: "A community-verified demonstration record about seasonality, ingredients, and memory in everyday food practice.", confidence: 0.9, status: "Verified", evidence: evidence("Kitchen recording — Video #517", "Food changes with the season.", "00:24") },
      { kind: "procedure", label: "Documenting the knowledge", content: ["Name the season and local context.", "Record ingredients with consent.", "Describe preparation in the knowledge holder's words.", "Invite review before public discovery."], confidence: 0.86, status: "Verified", evidence: evidence("Kitchen recording — Video #517", "Start with the season, then the ingredients.", "01:05") },
      { kind: "materials", label: "Materials", content: ["Seasonal greens", "Rice", "Local aromatics"], confidence: 0.83, status: "Human edited", evidence: evidence("Kitchen recording — Video #517", "The greens are gathered when the rains change.", "01:38") },
      { kind: "tools", label: "Tools", content: ["Hand knife", "Mortar and pestle", "Cooking vessel"], confidence: 0.89, status: "Verified", evidence: evidence("Kitchen recording — Video #517", "The mortar brings the ingredients together.", "02:04") },
      { kind: "significance", label: "Cultural significance", content: "The record preserves food knowledge as a seasonal, relational practice that lives in decisions about gathering, sharing, and care.", confidence: 0.88, status: "Verified", evidence: evidence("Kitchen recording — Video #517", "Sharing the food is part of remembering the season.", "02:52") },
    ],
    relationships: [{ type: "Season", label: "Harvest season", detail: "Seasonal anchor" }, { type: "Material", label: "Seasonal greens", detail: "Ingredient" }, { type: "Process", label: "Hand preparation", detail: "Household process" }, { type: "Region", label: "Jorhat", detail: "Public-safe location" }],
    risk: { score: 35, level: "moderate", explanation: "The indicator is lower where knowledge remains in active household use, though publication must still follow consent and community context rules.", factors: [{ label: "Active practitioners", value: "Many", note: "Distributed household knowledge" }, { label: "Average practitioner age", value: "51 years", note: "Mixed generations" }, { label: "Young practitioners", value: "12", note: "Everyday transfer continues" }, { label: "Documentation available", value: "Low", note: "Oral knowledge remains fragile" }, { label: "Commercial practice", value: "Moderate", note: "Some public visibility" }, { label: "Geographic spread", value: "Regional", note: "Variations are important" }] },
    coordinates: { lat: 26.75, lng: 94.2 },
  },
];

export const categories = ["All categories", "Traditional craft", "Traditional weaving", "Festival & oral tradition", "Folk music", "Traditional food knowledge"];
export const languages = ["All languages", "Assamese", "Mising"];
export const riskLevels = ["All risk levels", "Low", "Moderate", "High", "Critical"];
export const verificationLevels = ["All verification", "Pending", "Community verified", "Expert verified"];

export function getRecord(slug: string) {
  return records.find((record) => record.slug === slug);
}

export function scoreLabel(level: RiskLevel) {
  return level === "critical" ? "Critical" : level.charAt(0).toUpperCase() + level.slice(1);
}

export function statusLabel(status: HeritageStatus) {
  return status === "community" ? "Community verified" : status === "expert" ? "Expert verified" : status === "changes_requested" ? "Changes requested" : "Pending verification";
}

export function matchesRecord(record: HeritageRecord, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [record.title, record.shortDescription, record.category, record.region, record.district, record.originalLanguage, record.practitionerName, record.festival, ...record.relationships.map((relationship) => relationship.label), ...record.knowledge.flatMap((knowledge) => Array.isArray(knowledge.content) ? knowledge.content : [knowledge.content])].filter(Boolean).join(" ").toLowerCase();
  const terms = normalized.split(/\s+/).map((term) => term.endsWith("s") ? term.slice(0, -1) : term);
  return terms.every((term) => haystack.includes(term));
}
