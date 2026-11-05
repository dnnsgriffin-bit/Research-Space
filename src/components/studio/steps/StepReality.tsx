import {
  ALTERNATIVE_CAUSES,
  CONSISTENCY_OPTIONS,
  EVIDENCE_DESIGNS,
  MEASURES,
  MEASURE_META,
  RECENCY_OPTIONS,
  SAMPLE_OPTIONS,
  type Consistency,
  type EvidenceDesignId,
  type Recency,
  type SampleFit,
} from "@/lib/studio-data";
import { chainStates } from "@/lib/studio-logic";
import { causalClaimCheck, claimSafety, evidenceConfidence } from "@/lib/studio-engine";
import { transferEvidenceStatus } from "@/lib/transfer";
import { snapshotOf, useStudio } from "@/lib/studio-store";
import { ChainDiagram, StateMark } from "@/components/studio/ChainDiagram";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";
import { TextArea } from "@/components/studio/Fields";

const TIERS = ["Participation", "Reaction", "Learning", "Transfer", "Performance", "Outcome"];

const LEVEL_STYLE: Record<string, string> = {
  "LOW CONFIDENCE": "text-[var(--signal)]",
  "MODERATE CONFIDENCE": "text-[var(--teal)]",
  "STRONG CONFIDENCE": "text-[var(--evidence)]",
};

export function StepReality() {
  const { state, toggleMeasure, updateEvidence, toggleDesign } = useStudio();
  const snap = snapshotOf(state);
  const states = chainStates(state.measured);
  const confidence = evidenceConfidence(snap);
  const safety = claimSafety(snap);
  const causal = causalClaimCheck(snap);
  const transfer = transferEvidenceStatus(state.measured);

  return (
    <div>
      <p className="measure text-[16px] leading-relaxed text-foreground/80">
        Mark what is actually measured today — not what could be measured, and not what appears in
        the program description. Everything below is derived from these entries by fixed rules.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Measurement inventory
          </p>
          <div className="mt-5 space-y-8">
            {TIERS.map((tier) => (
              <fieldset key={tier}>
                <legend className="label-xs text-muted-foreground">{tier}</legend>
                <ul className="mt-3 space-y-px">
                  {MEASURES.filter((m) => m.tier === tier).map((m) => {
                    const on = state.measured.includes(m.id);
                    return (
                      <li key={m.id}>
                        <label
                          className={`flex min-h-11 cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                            on
                              ? "border-[var(--teal)] bg-[var(--surface)]"
                              : "border-transparent bg-[var(--surface)] hover:border-border"
                          }`}
                          title={
                            MEASURE_META[m.id]
                              ? `Licenses: ${MEASURE_META[m.id]!.licenses}. Does not license: ${MEASURE_META[m.id]!.overreach}.`
                              : undefined
                          }
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleMeasure(m.id)}
                            className="size-4 accent-[var(--teal)]"
                          />
                          <span className="text-[15px] text-foreground">{m.label}</span>
                          <span className="label-xs ml-auto text-muted-foreground">
                            {on ? "Measured" : "Not measured"}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>

          <p className="label-xs mt-12 border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            How the evidence was produced
          </p>
          <ul className="mt-4 space-y-px">
            {EVIDENCE_DESIGNS.map((d) => {
              const on = state.evidence.designs.includes(d.id);
              return (
                <li key={d.id}>
                  <label
                    className={`flex cursor-pointer gap-3 border px-3 py-3 transition-colors ${
                      on
                        ? "border-[var(--teal)] bg-[var(--surface)]"
                        : "border-transparent bg-[var(--surface)] hover:border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleDesign(d.id as EvidenceDesignId)}
                      className="mt-1 size-4 shrink-0 accent-[var(--teal)]"
                    />
                    <span>
                      <span className="block text-[15px] text-foreground">{d.label}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                        {d.useful}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 grid gap-5">
            <SelectRow
              label="Recency"
              value={state.evidence.recency}
              options={RECENCY_OPTIONS}
              onChange={(v) => updateEvidence({ recency: v as Recency })}
            />
            <SelectRow
              label="Sample fit"
              value={state.evidence.sampleFit}
              options={SAMPLE_OPTIONS}
              onChange={(v) => updateEvidence({ sampleFit: v as SampleFit })}
            />
            <SelectRow
              label="Consistency across sources"
              value={state.evidence.consistency}
              options={CONSISTENCY_OPTIONS}
              onChange={(v) => updateEvidence({ consistency: v as Consistency })}
            />
          </div>
        </div>

        <div>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Evidence matrix
          </p>
          <ul className="mt-5">
            {MEASURES.map((m) => {
              const on = state.measured.includes(m.id);
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-4 border-t border-border py-3 last:border-b"
                >
                  <span className="label-xs text-[var(--navy)]">{m.label}</span>
                  <StateMark state={on ? "measured" : "unknown"} />
                </li>
              );
            })}
          </ul>

          <div className="mt-10 border border-[var(--navy)] bg-[var(--surface)] p-6">
            <p className="label-xs text-[var(--teal)]">Evidence confidence</p>
            <p className={`mt-3 text-[22px] leading-tight ${LEVEL_STYLE[confidence.level]}`}>
              {confidence.level}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {confidence.headline}
            </p>
            <dl className="mt-6 space-y-4">
              {confidence.dimensions.map((d) => (
                <div key={d.id} className="border-t border-border pt-3">
                  <dt className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="label-xs text-[var(--navy)]">{d.label}</span>
                    <span className="label-xs text-muted-foreground">{d.rating}</span>
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
                    <span className="text-muted-foreground">{d.question}</span> {d.why}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <EvidenceLabel kind="evidence" />
            </div>
            <JudgmentNote judgment={confidence.judgment} />
          </div>

          <ul className="mt-6 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
            <li>Satisfaction does not establish learning.</li>
            <li>Confidence does not establish competence.</li>
            <li>Correlation does not establish causation.</li>
          </ul>
        </div>
      </div>

      {/* ------------------------------ three groups --------------------------- */}
      <div className="mt-16">
        <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
          Reality check
        </p>
        <div className="mt-6 grid gap-px bg-border lg:grid-cols-3">
          <ClaimGroup
            title="What you can say"
            accent="var(--evidence)"
            kind="evidence"
            items={safety.canSay}
          />
          <ClaimGroup
            title="What you cannot say yet"
            accent="var(--signal)"
            kind="hypothesis"
            items={
              safety.cannotSay.length
                ? safety.cannotSay
                : ["Nothing is currently overstated by the measures you have selected."]
            }
          />
          <ClaimGroup
            title="What would strengthen the decision"
            accent="var(--teal)"
            kind="model"
            items={safety.wouldStrengthen}
          />
        </div>
        <JudgmentNote judgment={safety.judgment} />
      </div>

      {/* --------------------------- causal claim check ------------------------ */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Causal claim check
          </p>
          <div className="mt-6">
            <TextArea
              label="The claim you intend to make"
              hint="Write it the way it would appear on a slide."
              rows={3}
              value={state.evidence.claim}
              onChange={(v) => updateEvidence({ claim: v })}
              placeholder="The training worked — completion is high and satisfaction proved it."
            />
          </div>
          <div
            className={`mt-6 border p-5 ${
              causal.triggered
                ? "border-[var(--signal)] bg-[var(--surface)]"
                : "border-border bg-[var(--surface)]"
            }`}
          >
            <p
              className={`label-xs ${causal.triggered ? "text-[var(--signal)]" : "text-muted-foreground"}`}
            >
              {causal.triggered ? "Causal claim check — flagged" : "Causal claim check"}
            </p>
            {causal.phrases.length > 0 && (
              <p className="mt-2 text-[13px] text-muted-foreground">
                Language detected: {causal.phrases.map((p) => `“${p}”`).join(", ")}
              </p>
            )}
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {causal.explanation}
            </p>
            {causal.saferWording && (
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--navy)]">
                {causal.saferWording}
              </p>
            )}
            <JudgmentNote judgment={causal.judgment} />
          </div>
        </section>

        {/* ------------------------- transfer evidence ------------------------- */}
        <section>
          <p className="label-xs border-t border-[var(--navy)] pt-4 text-[var(--navy)]">
            Transfer — measured or assumed?
          </p>
          <div className="mt-6 border border-[var(--navy)] bg-[var(--tint-plum)] p-6">
            <p
              className={`text-[20px] leading-tight ${transfer.observed ? "text-[var(--evidence)]" : "text-[var(--plum)]"}`}
            >
              {transfer.observed ? "Transfer partially observed" : "Transfer unmeasured"}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {transfer.statement}
            </p>
            <p className="label-xs mt-5 text-[var(--navy)]">
              What would count as evidence of transfer
            </p>
            <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-foreground/80">
              <li>
                Observed change in how the task is performed, rated against a defined standard.
              </li>
              <li>System or workflow usage that only occurs when the behaviour occurs.</li>
              <li>Manager observation collected on a schedule, not on request.</li>
            </ul>
            <div className="mt-4">
              <EvidenceLabel kind={transfer.observed ? "evidence" : "hypothesis"} />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16">
        <p className="label-xs border-t border-border pt-4 text-muted-foreground">
          Your evidence chain, as currently instrumented
        </p>
        <div className="mt-6">
          <ChainDiagram states={states} />
        </div>
      </div>
    </div>
  );
}

function ClaimGroup({
  title,
  accent,
  kind,
  items,
}: {
  title: string;
  accent: string;
  kind: "evidence" | "model" | "hypothesis";
  items: string[];
}) {
  return (
    <section className="bg-[var(--surface)] p-6">
      <p className="label-xs" style={{ color: accent }}>
        {title}
      </p>
      <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-foreground/85">
        {items.map((i) => (
          <li key={i} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
            {i}
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <EvidenceLabel kind={kind} />
      </div>
    </section>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="label-xs block text-[var(--navy)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-11 w-full border border-border bg-[var(--surface)] px-3 py-2.5 text-[15px] text-foreground focus:border-[var(--teal)] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
