import { useState } from "react";
import type { Judgment } from "@/lib/studio-engine";

/**
 * Unobtrusive "How this judgment was made" disclosure.
 * Shows the evidence used, the assumption, the reasoning rule, the remaining
 * uncertainty and what would change the conclusion.
 */
export function JudgmentNote({ judgment }: { judgment: Judgment }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="label-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-[var(--teal)]"
      >
        {open ? "Hide reasoning" : "How this judgment was made"}
      </button>

      {open && (
        <div className="mt-3 border-l-2 border-[var(--teal)] bg-[var(--surface)] px-4 py-4">
          <p className="label-xs text-[var(--teal)]">{judgment.title}</p>
          <dl className="mt-3 space-y-3 text-[13px] leading-relaxed">
            <Row label="Evidence used">
              <ul className="space-y-1">
                {judgment.evidenceUsed.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Row>
            <Row label="Relevant assumption">{judgment.assumption}</Row>
            <Row label="Reasoning rule">{judgment.rule}</Row>
            <Row label="Uncertainty">{judgment.uncertainty}</Row>
            <Row label="What would change this">{judgment.wouldChange}</Row>
          </dl>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
            This reasoning runs entirely on what you entered. The Studio has no access to external
            evidence, and does not claim any.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label-xs text-[var(--navy)]">{label}</dt>
      <dd className="mt-1 text-foreground/85">{children}</dd>
    </div>
  );
}
