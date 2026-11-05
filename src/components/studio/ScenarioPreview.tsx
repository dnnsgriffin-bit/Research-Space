import { useId, useState } from "react";
import { componentDef, DEMO_SCENARIO_A, DEMO_SCENARIO_B, DEMO_SCENARIO_C } from "@/lib/studio-data";

const DESIGNS = [
  { name: "Current workshop", code: "A", components: DEMO_SCENARIO_A },
  { name: "Spaced alternative", code: "B", components: DEMO_SCENARIO_B },
  { name: "Lean alternative", code: "C", components: DEMO_SCENARIO_C },
];

export function ScenarioPreview() {
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const design = DESIGNS[selected]!;
  const baseline = DEMO_SCENARIO_A.reduce((sum, c) => sum + c.minutes, 0);
  const total = design.components.reduce((sum, c) => sum + c.minutes, 0);
  const delta = total - baseline;
  return (
    <section
      aria-label="Compare fictional Northstar designs"
      className="mt-6 border border-border bg-[var(--surface)]"
    >
      <div
        role="group"
        aria-label="Choose a design to inspect"
        className="grid grid-cols-3 gap-px border-b border-border bg-border"
      >
        {DESIGNS.map((item, i) => (
          <button
            type="button"
            key={item.code}
            aria-pressed={selected === i}
            aria-controls={panelId}
            onClick={() => setSelected(i)}
            className={`state-transition min-h-16 border-t-2 p-3 text-left text-sm ${selected === i ? "border-[var(--teal)] bg-[var(--tint-teal)] text-[var(--teal)]" : "border-transparent bg-[var(--surface)] hover:bg-[var(--background)]"}`}
          >
            <span className="label-xs block">Scenario {item.code}</span>
            <span className="mt-2 block font-semibold">{item.name}</span>
          </button>
        ))}
      </div>
      <div id={panelId} className="p-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-5">
          <div>
            <dt className="label-xs text-muted-foreground">Learner time</dt>
            <dd className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums">
              {total}
              <span className="ml-2 font-sans text-sm">minutes</span>
            </dd>
          </div>
          <div>
            <dt className="label-xs text-muted-foreground">Scheduled activities</dt>
            <dd className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums">
              {design.components.length}
            </dd>
          </div>
        </dl>
        <p role="status" aria-live="polite" className="mt-4 min-h-10 text-sm text-[var(--teal)]">
          {selected === 0
            ? "Current design: the baseline for this comparison."
            : `${design.name}: ${Math.abs(delta)} ${delta >= 0 ? "more" : "fewer"} minutes per learner than the current design. These are planned activities, not measured outcomes.`}
        </p>
        <ol key={selected} className="inspector-enter mt-4 border-t border-border">
          {design.components.map((c) => (
            <li
              key={c.uid}
              className="flex items-baseline gap-4 border-b border-border py-3 text-sm"
            >
              <span className="w-12 shrink-0 text-[var(--teal)]">Day {c.day}</span>
              <span className="flex-1">{componentDef(c.refId).name}</span>
              <span className="tabular-nums text-muted-foreground">{c.minutes}m</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          All designs and figures are fictional. More practice opportunities do not establish a
          learning gain; effectiveness and feasibility still need testing.
        </p>
      </div>
    </section>
  );
}
