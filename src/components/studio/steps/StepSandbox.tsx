import { useState } from "react";
import { DIRECTION_TEXT, type Direction, type ScenarioKey } from "@/lib/studio-data";
import { compareScenarios, comparisonJudgment, tradeoffs } from "@/lib/studio-logic";
import { contextFlags, mechanismNotes } from "@/lib/studio-engine";
import { useStudio } from "@/lib/studio-store";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";
import { TransferConditions } from "@/components/studio/TransferConditions";
import { InterventionEditor, JourneyStrip } from "./StepIntervention";

const DIRECTION_STYLE: Record<Direction, string> = {
  "much-stronger": "text-[var(--evidence)]",
  stronger: "text-[var(--evidence)]",
  "slightly-stronger": "text-[var(--teal)]",
  similar: "text-muted-foreground",
  tradeoff: "text-[var(--signal)]",
  weaker: "text-[var(--signal)]",
  unknown: "text-muted-foreground",
  insufficient: "text-muted-foreground",
};

const DIRECTION_GLYPH: Record<Direction, string> = {
  "much-stronger": "▲▲",
  stronger: "▲",
  "slightly-stronger": "△",
  similar: "=",
  tradeoff: "◆",
  weaker: "▼",
  unknown: "?",
  insufficient: "—",
};

const NAMES: Record<ScenarioKey, string> = {
  A: "Scenario A — Current approach",
  B: "Scenario B — Alternative approach",
  C: "Scenario C — Lean alternative",
};

const SEVERITY_STYLE = {
  watch: "text-muted-foreground",
  constraint: "text-[var(--teal)]",
  blocker: "text-[var(--signal)]",
} as const;

export function StepSandbox() {
  const { state, toggleScenario, copyScenario } = useStudio();
  const [editing, setEditing] = useState<ScenarioKey>("B");
  const [against, setAgainst] = useState<ScenarioKey>("B");

  const altComponents = state.scenarios[against].components;
  const rows = compareScenarios(state.scenarios.A.components, altComponents, state.profiles);
  const costs = tradeoffs(state.scenarios.A.components, altComponents, state.profiles);
  const flags = contextFlags(state.profiles, altComponents);
  const mechanisms = mechanismNotes(altComponents);

  return (
    <div>
      <p className="measure text-[16px] leading-relaxed text-foreground/80">
        Build an alternative and compare it against the current approach. Comparisons are
        directional and explained — the studio does not estimate effect sizes it cannot justify.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {(["A", "B", "C"] as ScenarioKey[]).map((k) => {
          const s = state.scenarios[k];
          const active = editing === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setEditing(k)}
              aria-pressed={active}
              className={`min-h-11 border px-4 py-2.5 text-[14px] transition-colors ${
                active
                  ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--surface)]"
                  : "border-border bg-[var(--surface)] text-foreground/80 hover:border-[var(--teal)]"
              }`}
            >
              {NAMES[k]}
              {!s.enabled && k === "C" ? " (off)" : ""}
            </button>
          );
        })}
        {editing === "C" && (
          <label className="flex min-h-11 items-center gap-2 text-[13px] text-foreground/85">
            <input
              type="checkbox"
              checked={state.scenarios.C.enabled}
              onChange={() => toggleScenario("C")}
              className="size-4 accent-[var(--teal)]"
            />
            Include the lean alternative
          </label>
        )}
        {editing !== "A" && (
          <button
            type="button"
            onClick={() => copyScenario("A", editing)}
            className="min-h-11 text-[13px] text-[var(--teal)] underline underline-offset-4"
          >
            Copy from Scenario A
          </button>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <InterventionEditor scenarioKey={editing} />
      </div>

      <div className="mt-16">
        <TransferConditions
          profiles={state.profiles}
          components={state.scenarios[editing].components}
        />
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--navy)] pt-4">
          <h3 className="label-xs text-[var(--navy)]">Directional comparison</h3>
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            Compare A against
            <select
              value={against}
              onChange={(e) => setAgainst(e.target.value as ScenarioKey)}
              className="min-h-11 border border-border bg-[var(--surface)] px-2 py-1.5 text-foreground focus:border-[var(--teal)] focus:outline-none"
            >
              <option value="B">Scenario B</option>
              {state.scenarios.C.enabled && <option value="C">Scenario C</option>}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="label-xs mb-3 text-muted-foreground">{NAMES.A}</p>
            <JourneyStrip components={state.scenarios.A.components} />
          </div>
          <div>
            <p className="label-xs mb-3 text-muted-foreground">{NAMES[against]}</p>
            <JourneyStrip components={altComponents} />
          </div>
        </div>

        <ul className="mt-10">
          {rows.map((r) => (
            <li key={r.id} className="border-t border-border last:border-b">
              <div className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h4 className="text-[16px] text-[var(--navy)]">{r.label}</h4>
                    <EvidenceLabel kind={r.labelKind} />
                  </div>
                  <p className="measure mt-2 text-[14px] leading-relaxed text-foreground/80">
                    {r.note}
                  </p>
                </div>
                <p
                  className={`flex items-baseline gap-2 text-[14px] sm:justify-end ${DIRECTION_STYLE[r.direction]}`}
                >
                  <span aria-hidden className="text-[11px]">
                    {DIRECTION_GLYPH[r.direction]}
                  </span>
                  {DIRECTION_TEXT[r.direction]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <JudgmentNote
          judgment={comparisonJudgment(state.scenarios.A.components, altComponents, state.profiles)}
        />

        <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Directional language is used deliberately. No claim of the form &ldquo;retention will
          increase by 23%&rdquo; can be supported by a design comparison alone.
        </p>
      </div>

      {/* --------------------------- mechanisms ------------------------------- */}
      {mechanisms.length > 0 && (
        <div className="mt-16">
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Mechanisms introduced by {NAMES[against].toLowerCase()}
          </p>
          <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {mechanisms.map((m) => (
              <div key={m.component} className="border-t border-border pt-3">
                <dt className="text-[16px] text-[var(--navy)]">{m.component}</dt>
                <dd className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                  This {m.mechanism}.
                  <span className="mt-1.5 block text-[13px] text-muted-foreground">
                    {m.caution}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* --------------------------- tradeoff engine --------------------------- */}
      <div className="mt-16">
        <p className="label-xs border-t border-[var(--signal)] pt-4 text-[var(--signal)]">
          Tradeoffs — what this design costs
        </p>
        <ul className="mt-6 grid gap-px bg-border sm:grid-cols-2">
          {costs.map((t) => (
            <li key={t.headline} className="bg-[var(--surface)] p-6">
              <p className="text-[16px] leading-snug text-[var(--navy)]">{t.headline}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">{t.explanation}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          A recommendation where everything is better than the alternative is a recommendation whose
          cost has not been located yet.
        </p>
      </div>

      {/* --------------------------- context sensitivity ----------------------- */}
      {flags.length > 0 && (
        <div className="mt-16">
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Learner context applied to this design
          </p>
          <ul className="mt-6">
            {flags.map((f) => (
              <li key={f.id} className="border-t border-border py-4 last:border-b">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-[16px] text-[var(--navy)]">{f.condition}</span>
                  <span className={`label-xs ${SEVERITY_STYLE[f.severity]}`}>{f.severity}</span>
                </div>
                <p className="measure mt-2 text-[14px] leading-relaxed text-foreground/80">
                  {f.implication}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
