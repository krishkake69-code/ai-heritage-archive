import { Link } from "wouter";
import { ArrowUpRight, Check, CircleAlert, Clock3, Headphones, Image as ImageIcon, MapPin, Play, ShieldCheck, Sparkles, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scoreLabel, statusLabel, type HeritageRecord, type HeritageStatus, type KnowledgeBlock, type RiskLevel } from "@shared/heritage";

const statusClasses: Record<HeritageStatus, string> = {
  pending: "border-[#d8a23b]/35 bg-[#fff5db] text-[#8a6212]",
  community: "border-[#5a8c74]/35 bg-[#e6f3e9] text-[#2f654d]",
  expert: "border-[#7083b4]/35 bg-[#eaf0fb] text-[#425884]",
  changes_requested: "border-[#c7663d]/35 bg-[#fff0e7] text-[#9f4826]",
};

const riskClasses: Record<RiskLevel, string> = {
  low: "bg-[#e6f3e9] text-[#2f654d]",
  moderate: "bg-[#fff5db] text-[#8a6212]",
  high: "bg-[#fff0e7] text-[#9f4826]",
  critical: "bg-[#f9e2e2] text-[#a33131]",
};

export function StatusBadge({ status }: { status: HeritageStatus }) {
  return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", statusClasses[status])}><span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />{statusLabel(status)}</Badge>;
}

export function RiskBadge({ level, score, compact = false }: { level: RiskLevel; score?: number; compact?: boolean }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", riskClasses[level])}><CircleAlert className="size-3" />{scoreLabel(level)}{score !== undefined && !compact ? ` · ${score}/100` : ""}</span>;
}

export function RecordCard({ record, featured = false }: { record: HeritageRecord; featured?: boolean }) {
  return <Link href={`/record/${record.slug}`} className={cn("group block overflow-hidden rounded-[1.35rem] border border-border bg-card transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(40,52,81,.12)]", featured && "lg:grid lg:grid-cols-[1.15fr_.85fr]")}>
    <div className={cn("relative overflow-hidden bg-[#cfb995]", featured ? "min-h-[270px] lg:min-h-full" : "h-52")}>
      <img src={record.media[0]?.url} alt="Documentary reference image for the seeded archive record" className="h-full w-full object-cover grayscale-[20%] sepia-[18%] transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#18233b]/65 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 flex flex-wrap gap-2"><span className="rounded-full bg-primary/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">{record.category}</span>{record.isDemo && <span className="rounded-full bg-[#f7f1e8]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Seeded demo</span>}</div>
      <span className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white"><MapPin className="size-3.5 text-[#e6ba63]" />{record.district}, Assam</span>
      <span className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-[#f7f1e8] text-primary transition duration-200 group-hover:rotate-45"><ArrowUpRight className="size-4" /></span>
    </div>
    <div className="flex flex-col justify-between p-6 sm:p-7">
      <div><div className="mb-3 flex items-center justify-between gap-3"><span className="font-mono-archive text-[10px] uppercase tracking-[0.18em] text-accent">{record.eyebrow}</span><StatusBadge status={record.status} /></div><h3 className="max-w-lg font-display text-[29px] leading-[1.02] tracking-[-0.025em] text-primary group-hover:text-accent">{record.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{record.shortDescription}</p></div>
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4"><span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="grid size-7 place-items-center rounded-full bg-secondary font-display text-sm text-primary">{record.practitionerName.charAt(0)}</span>{record.practitionerName}</span><RiskBadge level={record.risk.level} compact /></div>
    </div>
  </Link>;
}

export function EvidenceRow({ block, onPlay }: { block: KnowledgeBlock; onPlay?: (timecode: string) => void }) {
  return <div className="mt-4 rounded-xl border border-accent/20 bg-[#fffaf1] p-3.5"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f2dfc7] text-accent"><Headphones className="size-3.5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-mono-archive text-[9px] font-medium uppercase tracking-[0.15em] text-accent">Source evidence</p>{onPlay ? <button className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:text-accent" onClick={() => onPlay(block.evidence.timecode)}><Play className="size-3" />Play {block.evidence.timecode}</button> : <span className="font-mono-archive text-[10px] text-muted-foreground">{block.evidence.timecode}</span>}</div><p className="mt-1 text-xs leading-5 text-foreground/75">“{block.evidence.quote}”</p><p className="mt-1 text-[10px] text-muted-foreground">{block.evidence.label}</p></div></div></div>;
}

export function KnowledgeCard({ block, onPlay }: { block: KnowledgeBlock; onPlay?: (timecode: string) => void }) {
  const items = Array.isArray(block.content) ? block.content : [block.content];
  return <article className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono-archive text-[10px] uppercase tracking-[0.17em] text-accent">{block.kind}</p><h3 className="mt-1 font-display text-2xl text-primary">{block.label}</h3></div><div className="flex items-center gap-2"><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", block.status === "Verified" ? "bg-[#e6f3e9] text-[#2f654d]" : block.status === "Needs review" ? "bg-[#fff5db] text-[#8a6212]" : "bg-secondary text-primary/70")}><Sparkles className="mr-1 inline size-3" />{block.status}</span><span className="font-mono-archive text-[10px] text-muted-foreground">{Math.round(block.confidence * 100)}%</span></div></div><div className="mt-4">{Array.isArray(block.content) ? <ol className="grid gap-3">{items.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-foreground/80"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary font-mono-archive text-[10px] text-primary">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}</ol> : <p className="text-sm leading-7 text-foreground/80">{block.content}</p>}</div><EvidenceRow block={block} onPlay={onPlay} /></article>;
}

export function MediaPill({ type, label }: { type: "video" | "audio" | "photo"; label: string }) {
  const Icon = type === "video" ? Video : type === "audio" ? Headphones : ImageIcon;
  return <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><Icon className="size-3.5 text-accent" />{label}</span>;
}

export function SectionHeading({ kicker, title, description, action }: { kicker: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono-archive text-[10px] font-medium uppercase tracking-[0.22em] text-accent">{kicker}</p><h2 className="max-w-2xl font-display text-4xl leading-[.96] tracking-[-0.03em] text-primary sm:text-5xl">{title}</h2>{description && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

export function ProvenanceStrip() {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-accent" /> Original voice preserved</span><span className="hidden size-1 rounded-full bg-border sm:block" /><span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[#5a8c74]" /> Source-linked fields</span><span className="hidden size-1 rounded-full bg-border sm:block" /><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#d8a23b]" /> Human review visible</span></div>;
}

export function AudioEvidencePlayer({ record, activeTimecode }: { record: HeritageRecord; activeTimecode?: string }) {
  const audio = record.media.find((item) => item.type === "audio") ?? record.media[0];
  const isPlayable = Boolean(audio?.url && /\.(mp3|wav|ogg|m4a|webm)(\?|$)/i.test(audio.url));
  return <div className="rounded-2xl bg-primary p-5 text-primary-foreground"><div className="flex items-start justify-between gap-4"><div><p className="font-mono-archive text-[10px] uppercase tracking-[0.16em] text-[#e6ba63]">Original testimony</p><p className="mt-2 font-display text-2xl">Listen to the knowledge holder</p></div><span className="grid size-10 place-items-center rounded-full bg-accent"><Headphones className="size-4" /></span></div><p className="mt-3 text-xs leading-5 text-primary-foreground/65">This recording remains the primary source. AI-assisted fields below are annotations, not replacements.</p>{isPlayable ? <audio className="mt-5 w-full" controls src={audio?.url} aria-label={audio?.label} /> : <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><button className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground" aria-label="Play seeded demo evidence cue"><Play className="size-4" /></button><div className="flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[38%] rounded-full bg-[#e6ba63]" /></div><div className="mt-2 flex justify-between font-mono-archive text-[9px] uppercase tracking-[0.1em] text-white/45"><span>Seeded cue · transcript-linked</span><span>02:14</span></div></div></div></div>}<div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-primary-foreground/45"><span>{audio?.label}</span>{activeTimecode && <span className="text-[#e6ba63]">Evidence cue · {activeTimecode}</span>}</div></div>;
}
