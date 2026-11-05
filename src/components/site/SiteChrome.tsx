import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export type StageKey = "about" | "framework" | "example" | "studio";

type NavItem = {
  to: "/" | "/about" | "/framework" | "/example" | "/studio";
  key: StageKey | "home";
  label: string;
  blurb: string;
};

/** Primary navigation. No forced journey — every destination is directly reachable. */
export const NAV: NavItem[] = [
  { to: "/", key: "home", label: "Home", blurb: "What this tool does." },
  {
    to: "/example",
    key: "example",
    label: "Worked Example",
    blurb: "One fictional programme, followed end to end.",
  },
  {
    to: "/studio",
    key: "studio",
    label: "Studio",
    blurb: "Work through your own decision and leave with a brief.",
  },
  {
    to: "/framework",
    key: "framework",
    label: "Framework",
    blurb: "The evidence chain, and the link nobody measures.",
  },
  {
    to: "/about",
    key: "about",
    label: "About",
    blurb: "Why this exists, and what it refuses to do.",
  },
];

const STAGE_META: Record<StageKey, { label: string; blurb: string }> = {
  example: { label: "Worked Example", blurb: NAV[1]!.blurb },
  studio: { label: "Studio", blurb: NAV[2]!.blurb },
  framework: { label: "Framework", blurb: NAV[3]!.blurb },
  about: { label: "About", blurb: NAV[4]!.blurb },
};

export function stageColor(_key: StageKey) {
  return "var(--teal)";
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="site-header sticky top-0 z-40 border-b border-border bg-[var(--background)]/95 backdrop-blur-[2px]"
    >
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2.5" onClick={() => setOpen(false)}>
          <span aria-hidden className="h-2 w-2 bg-[var(--teal)]" />
          <span className="font-[family-name:var(--font-display)] text-[1.15rem] tracking-tight text-[var(--navy)]">
            Evidence Studio
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="state-transition border-b-2 border-transparent pb-0.5 text-[14.5px] text-foreground/75 hover:text-[var(--teal)]"
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{
                className: "border-b-[var(--teal)] text-[var(--navy)] font-semibold",
                "aria-current": "page",
              }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/studio"
            className="state-transition min-h-10 bg-[var(--navy)] px-4 py-2 text-[14px] font-medium text-[oklch(0.99_0_0)] hover:bg-[var(--teal)]"
          >
            Work through your decision
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="label-xs -mr-2 min-h-11 px-2 text-[var(--navy)] lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-border lg:hidden">
          <ul className="px-5 pb-4 pt-1 sm:px-8">
            {NAV.map((n) => (
              <li key={n.to} className="border-b border-border last:border-b-0">
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: n.to === "/" }}
                  activeProps={{
                    className: "text-[var(--teal)] font-semibold",
                    "aria-current": "page",
                  }}
                  className="block py-3.5 text-[15px] text-foreground"
                >
                  {n.label}
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">{n.blurb}</span>
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Link
                to="/studio"
                onClick={() => setOpen(false)}
                className="block bg-[var(--navy)] px-4 py-3.5 text-center text-[15px] font-medium text-[oklch(0.99_0_0)]"
              >
                Work through your decision
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/** Quiet context bar at the top of a page. No step numbering, no forced sequence. */
export function StageRibbon({ stage }: { stage: StageKey }) {
  const s = STAGE_META[stage];
  return (
    <div className="border-b border-border bg-[var(--tint-navy)]">
      <div className="mx-auto flex max-w-[84rem] flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-2.5 sm:px-8">
        <span className="label-xs text-[var(--teal)]">{s.label}</span>
        <span className="text-[13.5px] text-muted-foreground">{s.blurb}</span>
      </div>
    </div>
  );
}

/** Quiet "where to go next" links. Suggestion only. */
export function NextStage({ stage }: { stage: StageKey }) {
  const others = NAV.filter((n) => n.key !== stage && n.key !== "home");
  return (
    <Section className="mt-16">
      <p className="label-xs border-t border-border pt-4 text-muted-foreground">Elsewhere</p>
      <ul className="mt-4 grid gap-px bg-border sm:grid-cols-3">
        {others.map((n) => (
          <li key={n.to}>
            <Link to={n.to} className="lift block h-full bg-[var(--surface)] p-5">
              <span className="label-xs text-[var(--teal)]">{n.label}</span>
              <span className="mt-2 block text-[14.5px] leading-relaxed text-foreground/80">
                {n.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer mt-16 border-t border-border">
      <div className="mx-auto max-w-[84rem] px-5 py-12 sm:px-8">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-5 border-b border-border pb-8">
          <h2 className="text-2xl sm:text-3xl">What decision are you working through?</h2>
          <Link to="/studio" className="action-primary">
            Open your Studio →
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[1.35rem] text-[var(--navy)]">
              Evidence Studio
            </p>
            <p className="mt-2 text-[14.5px] text-foreground/80">
              Created by <strong className="font-semibold">Dennis Griffin, Ed.D.</strong>
            </p>
            <p className="mt-1.5 text-[14.5px]">
              <a
                href="https://www.dennisrgriffin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--teal)] underline underline-offset-4"
              >
                Learn more about Dennis
              </a>
            </p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
              Your Studio inputs stay in this browser session. No account is needed. All
              organizations and figures in the worked example are fictional.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid gap-y-2.5 text-[14.5px]">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="state-transition text-foreground/75 hover:text-[var(--teal)]"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-[15px] italic text-[var(--teal)]">
          Built to explore better questions — not manufacture certainty.
        </p>
      </div>
    </footer>
  );
}

export function Section({
  eyebrow,
  children,
  className = "",
  id,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[84rem] px-5 sm:px-8 ${className}`}>
      {eyebrow && (
        <p className="label-xs mb-6 border-t border-border pt-4 text-muted-foreground">{eyebrow}</p>
      )}
      {children}
    </section>
  );
}
