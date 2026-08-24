import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Heritage map" },
  { href: "/masters", label: "Find a master" },
  { href: "/document", label: "Document heritage" },
  { href: "/verify", label: "Verify" },
];

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-150 group-hover:rotate-[-8deg]">
              <span className="font-display text-2xl leading-none">अ</span>
            </span>
            <span className="leading-none">
              <span className="block font-mono-archive text-[10px] font-medium uppercase tracking-[0.22em] text-accent">Living archive</span>
              <span className="font-display text-[22px] tracking-[-0.03em]">AI Heritage Archive</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`archive-link text-[12px] font-semibold uppercase tracking-[0.11em] ${location === item.href ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-28 truncate text-xs text-muted-foreground" title={user?.name ?? undefined}>{user?.name ?? "Contributor"}</span>
                <Button size="sm" variant="outline" className="rounded-full border-primary/20 px-4 text-xs" onClick={() => void logout()}>Sign out</Button>
              </>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 px-4 text-xs" onClick={() => startLogin()}>Sign in</Button>
            )}
            <Link href="/document" className="group inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground transition-transform duration-150 hover:-translate-y-0.5 active:scale-[.97]">
              Share knowledge <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button className="grid size-10 place-items-center rounded-full border border-border lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-card px-5 py-5 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-3 text-sm font-semibold ${location === item.href ? "bg-secondary text-accent" : "text-foreground hover:bg-muted"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              {isAuthenticated ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => void logout()}>Sign out</Button> : <Button size="sm" variant="outline" className="rounded-full" onClick={() => startLogin()}>Sign in</Button>}
              <Link href="/document" onClick={() => setOpen(false)} className="rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground">Share knowledge</Link>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:px-12">
          <div>
            <div className="mb-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground"><span className="font-display text-xl">अ</span></span><span className="font-display text-2xl">AI Heritage Archive</span></div>
            <p className="max-w-sm text-sm leading-6 text-primary-foreground/65">A source-linked living archive for Assam’s voices, skills, objects, and seasonal memory. Built to preserve with care, not to replace community knowledge.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70"><ShieldCheck className="size-3.5 text-accent" /> Consent-led by design</div>
          </div>
          <div><p className="mb-4 font-mono-archive text-[10px] uppercase tracking-[0.2em] text-accent">Explore</p><div className="grid gap-3 text-sm text-primary-foreground/70"><Link href="/explore" className="hover:text-white">All records</Link><Link href="/map" className="hover:text-white">Heritage map</Link><Link href="/masters" className="hover:text-white">Find a master</Link></div></div>
          <div><p className="mb-4 font-mono-archive text-[10px] uppercase tracking-[0.2em] text-accent">Participate</p><div className="grid gap-3 text-sm text-primary-foreground/70"><Link href="/document" className="hover:text-white">Document heritage</Link><Link href="/verify" className="hover:text-white">Verify a record</Link><a href="mailto:archive@example.org" className="hover:text-white">Contact the archive</a></div></div>
        </div>
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 border-t border-primary-foreground/10 px-5 py-5 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/45 sm:flex-row sm:px-8 lg:px-12"><span>Assam pilot · five seeded traditions</span><span>AI-assisted · human-verified</span></div>
      </footer>
    </div>
  );
}
