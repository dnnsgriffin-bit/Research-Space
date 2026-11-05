import { ALTERNATIVE_CAUSES } from "@/lib/studio-data";
import { learningProblemCheck } from "@/lib/studio-engine";
import { snapshotOf, useStudio } from "@/lib/studio-store";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";
import { TextArea } from "@/components/studio/Fields";

const PROBLEM_STYLE: Record<string, string> = {
  Likely: "text-[var(--evidence)]",
  Possible: "text-[var(--teal)]",
  Unclear: "text-muted-foreground",
  "Potentially not a learning problem": "text-[var(--signal)]",
};

/** "Is this even a learning problem?" — the first question, before any design. */
export function LearningProblemPanel() {
  const { state, updateEvidence, toggleCause } = useStudio();
  const problem = learningProblemCheck(snapshotOf(state));

  return (
    <section className="border border-border bg-[var(--tint-clay)] p-6 sm:p-8">
      <p className="label-xs text-[var(--clay)]">Before you design anything</p>
      <h3 className="mt-3 text-[22px] leading-snug">Is this even a learning problem?</h3>
      <p className="measure mt-3 text-[15px] leading-relaxed text-foreground/80">
        Mark every cause that plausibly contributes. The check is deliberately biased against
        assuming instruction is the answer.
      </p>

      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <div>
          <ul className="flex flex-wrap gap-2">
            {ALTERNATIVE_CAUSES.map((c) => {
              const on = state.evidence.causes.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggleCause(c.id)}
                    aria-pressed={on}
                    title={c.implication}
                    className={`min-h-11 border px-3 py-2 text-[13px] transition-colors ${
                      on
                        ? c.learning
                          ? "border-[var(--teal)] bg-[var(--teal)] text-[var(--surface)]"
                          : "border-[var(--signal)] bg-[var(--signal)] text-[var(--surface)]"
                        : "border-border bg-[var(--surface)] text-foreground/80 hover:border-[var(--teal)]"
                    }`}
                  >
                    {c.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <TextArea
              label="What you actually observed about the cause"
              rows={2}
              value={state.evidence.causeNote}
              onChange={(v) => updateEvidence({ causeNote: v })}
              placeholder="What did you see, hear or count that points at this cause?"
            />
          </div>
        </div>

        <div className="border border-[var(--navy)] bg-[var(--surface)] p-6">
          <p className="label-xs text-[var(--teal)]">Learning problem confidence</p>
          <p className={`mt-3 text-[20px] leading-tight ${PROBLEM_STYLE[problem.level]}`}>
            {problem.level}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{problem.statement}</p>
          <p className="label-xs mt-5 text-[var(--navy)]">Recommended next step</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">
            {problem.nextStep}
          </p>
          <div className="mt-4">
            <EvidenceLabel kind={problem.nonLearningCauses.length ? "hypothesis" : "model"} />
          </div>
          <JudgmentNote judgment={problem.judgment} />
        </div>
      </div>
    </section>
  );
}
