import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Check, GraduationCap, MapPin, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { StatusBadge, SectionHeading } from "@/components/ArchivePrimitives";

const craftOptions = ["All crafts", "Bamboo craft", "Basketry", "Hand weaving", "Folk music", "Seasonal food"];
const verificationOptions = ["All verification", "Pending verification", "Community verified", "Expert verified"];

export default function FindMaster() {
  const [query, setQuery] = useState("");
  const [craft, setCraft] = useState("All crafts");
  const [verification, setVerification] = useState("All verification");
  const [workshopOnly, setWorkshopOnly] = useState(false);
  const input = useMemo(() => ({ query, craft, verification, workshopOnly }), [query, craft, verification, workshopOnly]);
  const { data: people = [], isLoading } = trpc.archive.practitioners.useQuery(input);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-14 sm:px-8 lg:px-12 lg:pt-20">
      <div className="grid gap-10 border-b border-border pb-14 lg:grid-cols-[1fr_.72fr] lg:items-end">
        <div>
          <p className="font-mono-archive text-[10px] uppercase tracking-[0.22em] text-accent">Find a master</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[.87] tracking-[-.05em] text-primary sm:text-8xl">Meet the people<br />who keep it <em className="text-accent">alive.</em></h1>
        </div>
        <div>
          <p className="text-lg leading-8 text-muted-foreground">Discover public profiles of knowledge holders who have agreed to be listed in this pilot. Every profile shows its verification status and links back to approved archive material.</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><span className="grid size-7 place-items-center rounded-full bg-[#e6f3e9] text-[#2f654d]"><Check className="size-3.5" /></span> Consent to public listing is required</div>
        </div>
      </div>

      <div className="mt-10 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1.4fr_.8fr_.8fr_auto] sm:items-center">
        <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-accent" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, craft, or district" className="h-11 rounded-xl border-border bg-background pl-10" /></div>
        <FilterSelect value={craft} onChange={setCraft} options={craftOptions} ariaLabel="Filter by craft" />
        <FilterSelect value={verification} onChange={setVerification} options={verificationOptions} ariaLabel="Filter by verification" />
        <Button variant={workshopOnly ? "default" : "outline"} className="h-11 rounded-xl text-xs" onClick={() => setWorkshopOnly((value) => !value)}><GraduationCap className="mr-2 size-4" /> Workshops</Button>
      </div>

      <div className="mt-12">
        <SectionHeading kicker={`${people.length} public profiles`} title="Knowledge holders, with consent." description="This directory is intentionally small. It is a bridge to living practitioners, not a substitute for their voice or a promise of availability." />
        {isLoading && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><LoadingCard /><LoadingCard /><LoadingCard /></div>}
        {!isLoading && people.length > 0 && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{people.map((person) => <PersonCard key={person.id} person={person} />)}</div>}
        {!isLoading && people.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><UserRound className="mx-auto size-7 text-accent" /><h3 className="mt-3 font-display text-3xl text-primary">No public profile matches yet.</h3><p className="mt-2 text-sm text-muted-foreground">Try clearing one of the directory filters.</p></div>}
      </div>

      <section className="mt-20 grid gap-8 rounded-[1.5rem] bg-[#efe5d5] p-7 sm:p-10 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="font-mono-archive text-[10px] uppercase tracking-[0.18em] text-accent">A respectful invitation</p><h2 className="mt-3 max-w-xl font-display text-4xl leading-none text-primary sm:text-5xl">Are you preserving a living practice?</h2><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Document the knowledge with the holder’s permission, keep the original recording attached, and let community review shape what becomes public.</p></div><Link href="/document" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">Document heritage <ArrowUpRight className="size-4" /></Link></section>
    </div>
  );
}

function PersonCard({ person }: { person: { id: string; displayName: string; role: string; district: string; region: string; specialties: string[]; workshopAvailable: boolean; archiveCount: number; verificationStatus: "pending" | "community" | "expert" | "changes_requested" } }) {
  return <article className="group flex min-h-[300px] flex-col rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(40,52,81,.1)]"><div className="flex items-start justify-between"><div className="grid size-14 place-items-center rounded-full bg-secondary font-display text-3xl text-primary">{person.displayName.charAt(0)}</div><StatusBadge status={person.verificationStatus} /></div><div className="mt-6"><p className="font-mono-archive text-[10px] uppercase tracking-[0.14em] text-accent">{person.role}</p><h3 className="mt-2 font-display text-3xl leading-none text-primary">{person.displayName}</h3><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5 text-accent" />{person.district}, {person.region}</p></div><div className="mt-auto pt-6"><div className="flex flex-wrap gap-1.5">{person.specialties.slice(0, 2).map((specialty) => <span key={specialty} className="rounded-full bg-background px-2.5 py-1 text-[10px] text-muted-foreground">{specialty}</span>)}{person.workshopAvailable && <span className="rounded-full bg-[#e6f3e9] px-2.5 py-1 text-[10px] text-[#2f654d]">Workshops</span>}</div><div className="mt-4 flex items-center justify-between border-t border-border pt-4"><span className="text-[10px] text-muted-foreground">{person.archiveCount} approved archive links</span><Link href={`/master/${person.id}`} className="grid size-8 place-items-center rounded-full bg-primary text-white transition group-hover:rotate-45" aria-label={`View ${person.displayName}'s profile`}><ArrowUpRight className="size-3.5" /></Link></div></div></article>;
}

function LoadingCard() { return <div className="h-72 animate-pulse rounded-2xl bg-muted" />; }

function FilterSelect({ value, onChange, options, ariaLabel }: { value: string; onChange: (value: string) => void; options: string[]; ariaLabel: string }) {
  return <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-primary outline-none focus:ring-2 focus:ring-ring">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}
