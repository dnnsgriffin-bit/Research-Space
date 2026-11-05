import type { PlacedComponent, Profile } from "@/lib/studio-data";
import { transferConditions, type TransferBand } from "@/lib/transfer";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";

const BAND_STYLE: Record<TransferBand, { text: string; dot: string; bg: string }> = {
  Weak: {
    text: "text-[var(--signal)]",
    dot: "bg-[var(--signal)]",
    bg: "bg-[color-mix(in_oklab,var(--signal)_7%,var(--surface))]",
  },
  Fragile: {
    text: "text-[var(--clay)]",
    dot: "bg-[var(--clay)]",
    bg: "bg-[var(--tint-clay)]",
  },
  Workable: {
    text: "text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
    bg: "bg-[var(--tint-teal)]",
  },
  Supported: {
    text: "text-[var(--evidence)]",
    dot: "bg-[var(--evidence)]",
    bg: "bg-[color-mix(in_oklab,var(--evidence)_7%,var(--surface))]",
  },
};

export function TransferConditions({
  profiles,
  components,
}: {
  profiles: Profile[];
  components: PlacedComponent[];
}) {
  const reading = transferConditions(profiles, components);

  return (
    <section className="border border-[var(--navy)] bg-[var(--surface)]">
      <header className="border-b border-border bg-[var(--tint-navy)] px-6 py-5">
        <p className="label-xs text-[var(--teal)]">The most overlooked link</p>
        <h3 className="mt-3 text-[22px] leading-snug">Transfer conditions</h3>
        <p className="measure mt-3 text-[14px] leading-relaxed text-foreground/80">
          Most programs fail after the event, not during it. These five conditions decide whether
          anything designed here ever shows up in the work. Each band is derived from your own
          context and design inputs by a fixed rule.
        </p>
      </header>

      <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {reading.conditions.map((c) => {
          const s = BAND_STYLE[c.band];
          return (
            <li key={c.id} className={`${s.bg} p-6`}>
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-[16px] leading-snug text-[var(--navy)]">{c.label}</h4>
                <span className={`label-xs inline-flex items-center gap-2 ${s.text}`}>
                  <span aria-hidden className={`h-2 w-2 ${s.dot}`} />
                  {c.band}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{c.question}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{c.driver}</p>
              <p className="mt-4 border-t border-border pt-3 text-[13px] leading-relaxed text-foreground/80">
                <span className="label-xs mr-2 text-[var(--teal)]">Move</span>
                {c.move}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">
                <span className="label-xs mr-2 text-[var(--clay)]">Cost</span>
                {c.cost}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border px-6 py-6">
        <p className="label-xs text-[var(--navy)]">Transfer risk</p>
        <p className="measure mt-3 text-[16px] leading-relaxed text-foreground/85">
          {reading.summary}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {reading.observedNote}
        </p>
        <div className="mt-4">
          <EvidenceLabel kind="model" />
        </div>
        <JudgmentNote
          judgment={{
            title: "Transfer conditions",
            evidenceUsed: [
              "Learner context ratings for practice opportunity, manager support, workload and protected time",
              "The placed components, their spacing, the span of the design and whether a manager is involved",
            ],
            assumption:
              "Transfer depends on the work environment at least as much as on the quality of the instruction.",
            rule: "Each condition maps its input to one of four bands by a fixed threshold. A supporting design element can raise a band by one step but cannot rescue an absent condition. The weakest condition is reported as the break point.",
            uncertainty:
              "These are plausibility bands, not measurements. Ratings are your judgment of the environment, so the output inherits that subjectivity.",
            wouldChange:
              "Observed application data — behavior ratings, system usage or manager observation after the event — would replace these bands with evidence.",
          }}
        />
      </div>
    </section>
  );
}
