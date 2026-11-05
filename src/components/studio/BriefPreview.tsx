import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { demoState, snapshotOf } from "@/lib/studio-store";
import { compareScenarios } from "@/lib/studio-logic";
import { executiveBrief, claimSafety } from "@/lib/studio-engine";

const demo = demoState();
const snap = snapshotOf(demo);
const brief = executiveBrief(
  snap,
  compareScenarios(snap.scenarios.A, snap.scenarios.B, snap.profiles),
);
const safety = claimSafety(snap);

export function BriefPreview() {
  return (
    <article
      aria-label="Fictional Northstar decision brief preview"
      className="brief-preview border border-border bg-[var(--surface)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
        <p className="label-xs text-[var(--teal)]">Decision brief / 01</p>
        <span className="text-xs text-muted-foreground">Fictional Northstar example</span>
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="max-w-[32ch] text-2xl leading-tight">{demo.brief.businessQuestion}</h3>
        <p className="label-xs mt-6 text-[var(--teal)]">Studio suggestion · rule-based</p>
        <p className="mt-2 text-lg font-medium">{brief.decision}</p>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="label-xs text-muted-foreground">What we can say</dt>
            <dd className="mt-2 text-sm leading-relaxed">
              Participation and reported confidence are documented in this fictional case.
            </dd>
          </div>
          <div>
            <dt className="label-xs text-muted-foreground">What is still unknown</dt>
            <dd className="mt-2 text-sm leading-relaxed">
              Whether learning or coaching at work changed, and whether the programme caused a
              change.
            </dd>
          </div>
        </dl>
        <details className="disclosure mt-6 border-t border-border">
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-3 text-sm font-semibold text-[var(--teal)]">
            Read the reasoning and next test{" "}
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0" />
          </summary>
          <div className="disclosure-content space-y-4 pb-4 text-sm leading-relaxed">
            <p>{brief.why}</p>
            <div>
              <p className="font-semibold">Evidence to collect next</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {safety.wouldStrengthen.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="text-muted-foreground">
              A planning suggestion, not a verified outcome or a decision to scale.
            </p>
          </div>
        </details>
      </div>
      <Link
        to="/example"
        className="state-transition flex min-h-12 items-center justify-between border-t border-border px-5 py-4 text-sm font-semibold text-[var(--teal)] hover:bg-[var(--tint-teal)] sm:px-7"
      >
        Explore the complete case <ArrowUpRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}
