import {
  COMPONENT_LIBRARY,
  componentDef,
  type ComponentKind,
  type PlacedComponent,
  type ScenarioKey,
} from "@/lib/studio-data";
import { useStudio } from "@/lib/studio-store";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";

const KIND_LABEL: Record<ComponentKind, string> = {
  instruction: "Instruction",
  practice: "Practice",
  support: "Support",
  reinforcement: "Reinforcement",
  measure: "Measurement",
};

export function StepIntervention() {
  return (
    <div>
      <p className="measure text-[16px] leading-relaxed text-foreground/80">
        Assemble the experience as a sequence, not a catalogue. What people do, when they do it, and
        how often it recurs is the design.
      </p>
      <div className="mt-10">
        <InterventionEditor scenarioKey="A" />
      </div>
    </div>
  );
}

export function InterventionEditor({ scenarioKey }: { scenarioKey: ScenarioKey }) {
  const { state, addComponent, removeComponent, updateComponent, moveComponent } = useStudio();
  const scenario = state.scenarios[scenarioKey];
  const total = scenario.components.reduce((s, c) => s + c.minutes, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <div>
        <p className="label-xs border-t border-border pt-4 text-muted-foreground">
          Component library
        </p>
        <ul className="mt-4 space-y-px">
          {COMPONENT_LIBRARY.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => addComponent(scenarioKey, c.id)}
                className="group flex w-full min-h-11 items-center justify-between gap-3 border border-transparent bg-[var(--surface)] px-3 py-2.5 text-left transition-colors hover:border-[var(--teal)]"
              >
                <span className="text-[14px] text-foreground">{c.name}</span>
                <span className="label-xs shrink-0 text-muted-foreground group-hover:text-[var(--teal)]">
                  {KIND_LABEL[c.kind]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--navy)] pt-4">
          <p className="label-xs text-[var(--navy)]">The journey</p>
          <p className="text-[13px] text-muted-foreground tabular-nums">
            {scenario.components.length} components · {total} minutes of learner time
          </p>
        </div>

        {scenario.components.length === 0 ? (
          <div className="mt-6 border border-dashed border-border bg-[var(--surface)] p-10 text-center">
            <p className="text-[15px] text-foreground/80">No components yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Select from the library to place the first element on the timeline. Sequence and
              spacing matter more than volume.
            </p>
          </div>
        ) : (
          <ol className="mt-6">
            {scenario.components.map((c, i) => (
              <ComponentRow
                key={c.uid}
                item={c}
                first={i === 0}
                last={i === scenario.components.length - 1}
                onChange={(patch) => updateComponent(scenarioKey, c.uid, patch)}
                onRemove={() => removeComponent(scenarioKey, c.uid)}
                onMove={(d) => moveComponent(scenarioKey, c.uid, d)}
              />
            ))}
          </ol>
        )}

        <p className="mt-6">
          <EvidenceLabel kind="user" />
        </p>
      </div>
    </div>
  );
}

function ComponentRow({
  item,
  first,
  last,
  onChange,
  onRemove,
  onMove,
}: {
  item: PlacedComponent;
  first: boolean;
  last: boolean;
  onChange: (p: Partial<PlacedComponent>) => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
}) {
  const def = componentDef(item.refId);
  return (
    <li className="border-t border-border last:border-b">
      <div className="grid gap-4 py-5 sm:grid-cols-[110px_1fr_auto]">
        <div>
          <label className="label-xs block text-muted-foreground" htmlFor={`day-${item.uid}`}>
            Day
          </label>
          <input
            id={`day-${item.uid}`}
            type="number"
            min={0}
            value={item.day}
            onChange={(e) => onChange({ day: Number(e.target.value) })}
            className="mt-1.5 w-full min-h-11 border border-border bg-[var(--surface)] px-2.5 py-2 text-[18px] tabular-nums text-[var(--navy)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>

        <div>
          <p className="text-[16px] text-[var(--navy)]">{def.name}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{def.rationale}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
            <label className="flex items-center gap-2 text-[13px] text-foreground/80">
              <span className="label-xs text-muted-foreground">Minutes</span>
              <input
                type="number"
                min={0}
                value={item.minutes}
                onChange={(e) => onChange({ minutes: Number(e.target.value) })}
                aria-label={`${def.name} learner minutes`}
                className="w-20 min-h-11 border border-border bg-[var(--surface)] px-2 py-1.5 tabular-nums focus:border-[var(--teal)] focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <span className="label-xs text-muted-foreground">Frequency</span>
              <select
                value={item.frequency}
                onChange={(e) => onChange({ frequency: e.target.value })}
                aria-label={`${def.name} frequency`}
                className="min-h-11 border border-border bg-[var(--surface)] px-2 py-1.5 focus:border-[var(--teal)] focus:outline-none"
              >
                {["Once", "Weekly", "Biweekly", "Monthly"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <span className="label-xs text-muted-foreground">Spacing</span>
              <select
                value={item.spacing}
                onChange={(e) => onChange({ spacing: e.target.value })}
                aria-label={`${def.name} spacing`}
                className="min-h-11 border border-border bg-[var(--surface)] px-2 py-1.5 focus:border-[var(--teal)] focus:outline-none"
              >
                {["Single exposure", "Spaced", "Distributed"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[13px] text-foreground/85">
              <input
                type="checkbox"
                checked={item.managerInvolved}
                onChange={(e) => onChange({ managerInvolved: e.target.checked })}
                className="size-4 accent-[var(--teal)]"
              />
              Manager involved
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[13px] text-foreground/85">
              <input
                type="checkbox"
                checked={item.practice}
                onChange={(e) => onChange({ practice: e.target.checked })}
                className="size-4 accent-[var(--teal)]"
              />
              Practice opportunity
            </label>
          </div>
        </div>

        <div className="flex items-start gap-1 sm:flex-col">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={first}
            aria-label={`Move ${def.name} earlier`}
            className="min-h-11 min-w-11 border border-border text-[13px] text-muted-foreground transition-colors hover:text-[var(--teal)] disabled:opacity-35"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={last}
            aria-label={`Move ${def.name} later`}
            className="min-h-11 min-w-11 border border-border text-[13px] text-muted-foreground transition-colors hover:text-[var(--teal)] disabled:opacity-35"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${def.name}`}
            className="min-h-11 min-w-11 border border-border text-[13px] text-muted-foreground transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)]"
          >
            ×
          </button>
        </div>
      </div>
    </li>
  );
}

export function JourneyStrip({ components }: { components: PlacedComponent[] }) {
  if (!components.length)
    return <p className="text-[14px] text-muted-foreground">No components placed.</p>;
  return (
    <ol className="flex gap-px overflow-x-auto bg-border">
      {components.map((c) => (
        <li key={c.uid} className="min-w-[150px] flex-1 bg-[var(--surface)] p-4">
          <p className="label-xs text-[var(--teal)]">Day {c.day}</p>
          <p className="mt-2 text-[14px] leading-snug text-[var(--navy)]">
            {componentDef(c.refId).name}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">{c.minutes} min</p>
        </li>
      ))}
    </ol>
  );
}
