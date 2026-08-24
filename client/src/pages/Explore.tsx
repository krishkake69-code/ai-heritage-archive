import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Filter, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { RecordCard, RiskBadge, SectionHeading, StatusBadge } from "@/components/ArchivePrimitives";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [language, setLanguage] = useState("All languages");
  const [risk, setRisk] = useState("All risk levels");
  const [verification, setVerification] = useState("All verification");
  const filtersInput = useMemo(() => ({ query, category, language, risk, verification, limit: 20 }), [query, category, language, risk, verification]);
  const { data: filters } = trpc.archive.filters.useQuery();
  const { data: records = [], isLoading, isError } = trpc.archive.list.useQuery(filtersInput);

  return <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-14 sm:px-8 lg:px-12 lg:pt-20">
    <div className="grid gap-10 border-b border-border pb-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="font-mono-archive text-[10px] uppercase tracking-[0.22em] text-accent">Explore the living archive</p><h1 className="mt-4 max-w-2xl font-display text-6xl leading-[.88] tracking-[-.05em] text-primary sm:text-8xl">Find the story<br /><em className="text-accent">behind</em> the object.</h1></div><div className="max-w-xl lg:justify-self-end"><p className="text-lg leading-8 text-muted-foreground">Search the Assam pilot by craft, song, seasonal knowledge, place, or knowledge holder. The archive only surfaces public records and keeps verification status visible.</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">5 seeded traditions</span><span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Source-linked</span><span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Human review visible</span></div></div></div>

    <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 lg:grid-cols-[1.3fr_repeat(4,.7fr)]"><div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “bamboo crafts of Assam”" aria-label="Search heritage records" className="h-12 rounded-xl border-border bg-background pl-11 text-sm" /></div><FilterSelect ariaLabel="Filter by category" value={category} onChange={setCategory} options={filters?.categories ?? ["All categories"]} /><FilterSelect ariaLabel="Filter by language" value={language} onChange={setLanguage} options={filters?.languages ?? ["All languages"]} /><FilterSelect ariaLabel="Filter by risk level" value={risk} onChange={setRisk} options={filters?.riskLevels ?? ["All risk levels"]} /><FilterSelect ariaLabel="Filter by verification" value={verification} onChange={setVerification} options={filters?.verificationLevels ?? ["All verification"]} /></div>

    <div className="mt-12 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-accent" /><p className="font-mono-archive text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{records.length} public records found</p></div><h2 className="mt-2 font-display text-4xl text-primary">Assam, in many voices.</h2></div>{query && <button className="text-xs font-bold text-accent hover:underline" onClick={() => setQuery("")}>Clear search</button>}</div>

    {isLoading ? <div className="mt-8 grid gap-5 lg:grid-cols-3"><div className="h-96 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div> : isError ? <div className="mt-8 rounded-2xl border border-[#c7663d]/30 bg-[#fff0e7] p-8 text-sm text-[#9f4826]">The public index is taking a pause. Please try again in a moment.</div> : records.length ? <div className="mt-8 grid gap-5 lg:grid-cols-3">{records.map((record) => <RecordCard key={record.id} record={record} />)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center"><Sparkles className="mx-auto size-7 text-accent" /><h3 className="mt-4 font-display text-3xl text-primary">No record matches that path yet.</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Try a broader phrase or clear a filter. This pilot intentionally stays small so each seeded record can keep its source and context in view.</p><Button className="mt-6 rounded-full" onClick={() => { setQuery(""); setCategory("All categories"); setLanguage("All languages"); setRisk("All risk levels"); setVerification("All verification"); }}>Reset filters</Button></div>}

    <section className="mt-20 grid gap-6 rounded-[1.5rem] bg-primary p-7 text-primary-foreground sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="font-mono-archive text-[10px] uppercase tracking-[0.18em] text-[#e6ba63]">Search with care</p><h2 className="mt-3 max-w-2xl font-display text-4xl leading-none text-white sm:text-5xl">Discovery is not the same as certainty.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/65">A semantic result helps you find a starting point. Open the record to inspect its original testimony, evidence cues, uncertainty notes, and human verification history.</p></div><Link href="/document" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">Add a source <ArrowUpRight className="size-4" /></Link></section>
  </div>;
}

function FilterSelect({ value, onChange, options, ariaLabel }: { value: string; onChange: (value: string) => void; options: string[]; ariaLabel: string }) {
  return <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-primary outline-none focus:ring-2 focus:ring-ring">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}
