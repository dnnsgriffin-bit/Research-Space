import { DEMO_PILOT } from "@/lib/studio-data";
import { snapshotOf, useStudio } from "@/lib/studio-store";
import { calibration, recommendPilot } from "@/lib/studio-engine";
import { TextArea, TextField } from "@/components/studio/Fields";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";

const TONE_STYLE = {
  neutral: "text-muted-foreground",
  supported: "text-[var(--evidence)]",
  challenge: "text-[var(--signal)]",
} as const;

const EFFORT_STYLE = {
  low: "text-[var(--evidence)]",
  moderate: "text-[var(--teal)]",
  high: "text-[var(--signal)]",
} as const;

export function StepPilot() {
  const { state, updatePilot } = useStudio();
  const p = state.pilot;
  const snap = snapshotOf(state);
  const advice = recommendPilot(snap);
  const cal = calibration(snap);

  return (
    <div>
      <p className="measure text-[16px] leading-relaxed text-foreground/80">
        A pilot is not a smaller rollout. It is a designed comparison that could change what you
        believe.
      </p>

      {/* -------------------------- recommended design ------------------------ */}
      <div className="mt-8 border border-[var(--navy)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="label-xs text-[var(--teal)]">Proportionate design for this decision</p>
          <span className={`label-xs ${EFFORT_STYLE[advice.primary.effort]}`}>
            {advice.primary.effort} effort
          </span>
        </div>
        <h3 className="mt-3 text-2xl leading-snug text-[var(--navy)]">{advice.primary.label}</h3>
        <p className="measure mt-3 text-[15px] leading-relaxed text-foreground/85">
          {advice.primary.why}
        </p>

        {advice.alternates.length > 0 && (
          <>
            <p className="label-xs mt-8 text-[var(--navy)]">Also worth considering</p>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {advice.alternates.map((a) => (
                <li key={a.id} className="border-t border-border pt-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[15px] text-[var(--navy)]">{a.label}</span>
                    <span className={`label-xs ${EFFORT_STYLE[a.effort]}`}>{a.effort}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">{a.why}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="measure mt-8 border-t border-border pt-4 text-[14px] leading-relaxed text-muted-foreground">
          {advice.avoid}
        </p>
        <div className="mt-4">
          <EvidenceLabel kind="model" />
        </div>
        <JudgmentNote judgment={advice.judgment} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">Design</p>
          <div className="mt-6 space-y-6">
            <TextField
              label="Target population"
              value={p.population}
              onChange={(v) => updatePilot({ population: v })}
              placeholder="New people managers, first 18 months in role"
            />
            <TextArea
              label="Sample / cohort description"
              value={p.cohort}
              onChange={(v) => updatePilot({ cohort: v })}
              placeholder="Two cohorts of 24, matched on function and span of control"
            />
            <TextArea
              label="Intervention condition"
              value={p.condition}
              onChange={(v) => updatePilot({ condition: v })}
            />
            <TextArea
              label="Comparison condition"
              hint="Optional, but without one the pilot cannot support causal language."
              value={p.comparison}
              onChange={(v) => updatePilot({ comparison: v })}
            />
          </div>
        </section>

        <section>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">Measures</p>
          <div className="mt-6 space-y-6">
            <TextField
              label="Baseline measure"
              value={p.baseline}
              onChange={(v) => updatePilot({ baseline: v })}
            />
            <TextField
              label="Immediate measure"
              value={p.immediate}
              onChange={(v) => updatePilot({ immediate: v })}
            />
            <TextField
              label="Delayed measure"
              value={p.delayed}
              onChange={(v) => updatePilot({ delayed: v })}
            />
            <TextField
              label="Transfer measure"
              value={p.transfer}
              onChange={(v) => updatePilot({ transfer: v })}
            />
            <TextField
              label="Performance measure"
              value={p.performance}
              onChange={(v) => updatePilot({ performance: v })}
            />
            <TextField
              label="Follow-up timing"
              value={p.timing}
              onChange={(v) => updatePilot({ timing: v })}
            />
          </div>
        </section>
      </div>

      <div className="mt-16">
        <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
          Expectation, observation, calibration
        </p>
        <div className="mt-6 grid gap-px bg-border lg:grid-cols-3">
          <PhaseCard
            title="Before pilot"
            sub="What we expect"
            value={p.expectation}
            onChange={(v) => updatePilot({ expectation: v })}
            placeholder={DEMO_PILOT.expectation}
            kind="hypothesis"
          />
          <PhaseCard
            title="After pilot"
            sub="What we observed"
            value={p.observation}
            onChange={(v) => updatePilot({ observation: v })}
            placeholder={DEMO_PILOT.observation}
            kind="user"
          />
          <PhaseCard
            title="Calibration"
            sub="What changed in our understanding"
            value={p.calibration}
            onChange={(v) => updatePilot({ calibration: v })}
            placeholder={DEMO_PILOT.calibration}
            kind="model"
          />
        </div>

        <div className="mt-8 max-w-3xl">
          <TextArea
            label="Next experiment"
            value={p.nextExperiment}
            onChange={(v) => updatePilot({ nextExperiment: v })}
            placeholder={DEMO_PILOT.nextExperiment}
          />
        </div>

        {/* --------------------------- calibration engine --------------------- */}
        <div className="mt-12">
          <p className="label-xs border-t border-[var(--teal)] pt-4 text-[var(--teal)]">
            Calibration reading
          </p>
          <ul className="mt-6 grid gap-px bg-border sm:grid-cols-2">
            {cal.sections.map((s) => (
              <li key={s.id} className="bg-[var(--surface)] p-6">
                <p className={`label-xs ${TONE_STYLE[s.tone]}`}>{s.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">{s.body}</p>
              </li>
            ))}
          </ul>
          <JudgmentNote judgment={cal.judgment} />
        </div>

        <div className="mt-8 border border-border bg-[var(--surface)] p-5">
          <p className="label-xs text-[var(--signal)]">Constraint on interpretation</p>
          <p className="measure mt-2 text-[14px] leading-relaxed text-foreground/85">
            {p.comparison.trim()
              ? "A comparison condition is described. Causal language remains conditional on how cohorts were assigned and on what else changed during the window."
              : "No comparison condition is described. Results from this pilot can describe what happened, but cannot establish that the intervention caused it."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  title,
  sub,
  value,
  onChange,
  placeholder,
  kind,
}: {
  title: string;
  sub: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  kind: "hypothesis" | "user" | "model";
}) {
  return (
    <div className="bg-[var(--surface)] p-6">
      <p className="label-xs text-[var(--teal)]">{title}</p>
      <p className="mt-2 text-[15px] text-[var(--navy)]">{sub}</p>
      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${title}: ${sub}`}
        className="mt-4 w-full resize-y border border-border bg-[var(--background)] px-3 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/80 focus:border-[var(--teal)] focus:outline-none"
      />
      <div className="mt-3">
        <EvidenceLabel kind={kind} />
      </div>
    </div>
  );
}
