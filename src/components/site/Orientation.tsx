import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Orientation band for the paper pages: a case-file cover that says what the
 * page is, what to do on it, and where it sits in the path Check -> Example -> Studio.
 * Always visible on reading pages; on working pages it can fold to one line and
 * remembers that choice in this browser (a convenience only; it works without storage).
 */

type Rung = "check" | "example" | "studio";

const PATH: { key: Rung; to: "/check" | "/example" | "/studio"; label: string; note: string }[] = [
  { key: "check", to: "/check", label: "Evidence Check", note: "About two minutes" },
  { key: "example", to: "/example", label: "Worked example", note: "Read a full case" },
  { key: "studio", to: "/studio", label: "Studio", note: "Your own program" },
];

export function Orientation({
  current,
  kicker,
  title,
  children,
  steps,
  foldable = false,
  foldLabel = "How this page works",
}: {
  current: Rung;
  kicker: string;
  title: string;
  children: ReactNode;
  steps: ReactNode[];
  /** Working pages: start open on a first visit, then remember open or folded. */
  foldable?: boolean;
  /** Button text while folded. */
  foldLabel?: string;
}) {
  const storeKey = `es-orientation-${current}`;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!foldable) return;
    try {
      if (window.localStorage.getItem(storeKey) === "folded") setOpen(false);
    } catch {
      /* storage blocked: stay open */
    }
  }, [foldable, storeKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      window.localStorage.setItem(storeKey, next ? "open" : "folded");
    } catch {
      /* storage blocked: the choice lasts for this visit only */
    }
  };

  const bodyId = `orientation-${current}`;

  return (
    <section
      aria-label="About this page"
      className="orientation border-b border-border bg-[var(--surface)]"
    >
      <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-6">
          <p className="label-xs text-muted-foreground">{kicker}</p>
          {foldable && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={bodyId}
              className="state-transition min-h-9 text-[13.5px] text-muted-foreground underline underline-offset-4 hover:text-[var(--navy)]"
            >
              {open ? "Hide this guide" : foldLabel}
            </button>
          )}
        </div>

        <div id={bodyId} hidden={!open}>
          <div className="grid gap-8 pb-7 pt-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div>
              <h2 className="max-w-[26ch] text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.12]">
                {title}
              </h2>
              <div className="measure mt-4 text-[15.5px] leading-relaxed text-foreground/80">
                {children}
              </div>
            </div>
            <div>
              <p className="label-xs border-t border-border pt-4 text-muted-foreground">
                How to use this page
              </p>
              <ol className="mt-1">
                {steps.map((s, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[2.25rem_1fr] gap-2 border-b border-border py-3 text-[14.5px] leading-relaxed text-foreground/85 last:border-b-0"
                  >
                    <span className="label-xs pt-[0.3rem] text-muted-foreground" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <nav aria-label="Where this page sits" className="border-t border-border">
            <ol className="grid grid-cols-3 gap-px">
              {PATH.map((r, i) => {
                const here = r.key === current;
                return (
                  <li key={r.key}>
                    <Link
                      to={r.to}
                      aria-current={here ? "page" : undefined}
                      className={`state-transition block border-t-2 py-3 pr-3 ${
                        here
                          ? "border-t-[var(--navy)]"
                          : "border-t-transparent hover:border-t-[var(--rule)]"
                      }`}
                    >
                      <span
                        className={`label-xs ${here ? "text-[var(--navy)]" : "text-muted-foreground"}`}
                      >
                        {String(i + 1).padStart(2, "0")} {r.label}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-muted-foreground">
                        {here ? "You are here" : r.note}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
