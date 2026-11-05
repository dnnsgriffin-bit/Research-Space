import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";

export const PERSONAL_SITE = "https://dennisrgriffin.com";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#demo", label: "Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

/** The chain mark: three links, the last one still dark. */
export function ChainMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 16" aria-hidden width="40" height="16">
      <circle cx="6" cy="8" r="5" fill="var(--ec-lamp)" />
      <line x1="11" y1="8" x2="15" y2="8" stroke="var(--ec-lamp)" strokeWidth="2" />
      <circle cx="20" cy="8" r="5" fill="var(--ec-lamp)" opacity=".55" />
      <line
        x1="25"
        y1="8"
        x2="29"
        y2="8"
        stroke="var(--ec-ash)"
        strokeWidth="2"
        strokeDasharray="1.5 2"
      />
      <circle
        cx="34"
        cy="8"
        r="4.2"
        fill="none"
        stroke="var(--ec-ash)"
        strokeWidth="1.6"
        strokeDasharray="1.5 2"
      />
    </svg>
  );
}

export function ProductHeader() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onTool = useLocation({ select: (l) => l.pathname }) === "/check";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${el.getBoundingClientRect().height}px`,
      );
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} className={`ph ${scrolled ? "is-scrolled" : ""}`}>
      <div className="ph-inner">
        <Link to="/" className="ph-brand" onClick={() => setOpen(false)}>
          <ChainMark />
          <span>Evidence Studio</span>
          <span className="ph-tag">Prototype</span>
        </Link>
        <nav aria-label="Primary" className="ph-nav">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={PERSONAL_SITE} target="_blank" rel="noopener" className="ph-ext">
            DennisRGriffin.com <span aria-hidden>↗</span>
          </a>
        </nav>
        <div className="ph-actions">
          {onTool ? (
            <a href="#ec-brief-title" className="ph-cta">
              Jump to your brief ↓
            </a>
          ) : (
            <Link to="/check" className="ph-cta">
              Try the prototype
            </Link>
          )}
          <button
            type="button"
            className="ph-menu"
            aria-expanded={open}
            aria-controls="ph-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i aria-hidden />
            <i aria-hidden />
          </button>
        </div>
      </div>
      <div id="ph-sheet" className={`ph-sheet ${open ? "open" : ""}`} hidden={!open}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href={PERSONAL_SITE} target="_blank" rel="noopener">
          DennisRGriffin.com ↗
        </a>
        {onTool ? (
          <a href="#ec-brief-title" className="ph-cta" onClick={() => setOpen(false)}>
            Jump to your brief ↓
          </a>
        ) : (
          <Link to="/check" className="ph-cta" onClick={() => setOpen(false)}>
            Try the prototype
          </Link>
        )}
      </div>
    </header>
  );
}

export function ProductFooter() {
  return (
    <footer className="pf">
      <div className="pf-inner">
        <div className="pf-brand">
          <p className="ph-brand">
            <ChainMark />
            <span>Evidence Studio</span>
          </p>
          <p className="pf-note">
            A prototype by Dennis Griffin, Ed.D. Rule-based guidance that shows what evidence can
            support. It does not predict impact or replace your judgment.
          </p>
        </div>
        <nav aria-label="Footer" className="pf-cols">
          <div>
            <p className="pf-h">Product</p>
            <Link to="/check">Evidence Check</Link>
            <a href="/#how">How it works</a>
            <a href="/#pricing">Pricing</a>
          </div>
          <div>
            <p className="pf-h">Go deeper</p>
            <Link to="/example">Worked example</Link>
            <Link to="/studio">Studio</Link>
            <Link to="/framework">Framework</Link>
          </div>
          <div>
            <p className="pf-h">Creator</p>
            <a href="/#about">About Dennis</a>
            <a href={PERSONAL_SITE} target="_blank" rel="noopener">
              DennisRGriffin.com ↗
            </a>
          </div>
        </nav>
      </div>
      <div className="pf-base">
        <span>© 2026 Dennis Griffin. All examples are illustrative.</span>
        <span>Nothing you enter leaves your browser.</span>
      </div>
    </footer>
  );
}
