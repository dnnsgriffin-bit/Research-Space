import { useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, CircleHelp, RotateCcw } from "lucide-react";

const OPTIONS = [
  {
    text: "The program improved coaching.",
    title: "A promising story. A missing observation.",
    explanation:
      "Completion and confidence tell us about participation and perception. We would need a direct measure of coaching at work to establish a change in performance.",
  },
  {
    text: "Managers participated and reported confidence.",
    title: "That is what these records support.",
    explanation:
      "We can describe participation and self-reported confidence. Learning and workplace transfer remain unmeasured. A useful next step is to observe coaching against a shared rubric.",
  },
  {
    text: "The program did not work.",
    title: "Missing evidence is not evidence of failure.",
    explanation:
      "Without measuring learning or coaching at work, we cannot tell whether either changed. Test the missing link before deciding to stop or scale the program.",
  },
];

/** An isolated fictional exercise. It never changes the visitor's Studio inputs. */
export function DecisionDemo({ onInspect }: { onInspect: () => void }) {
  const firstChoice = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const resultId = useId();
  const result = selected === null ? null : OPTIONS[selected];
  return (
    <section
      aria-labelledby="decision-demo-title"
      className="decision-demo overflow-hidden border border-border bg-[var(--surface)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <p className="label-xs text-[var(--teal)]">Try one decision</p>
        <span className="text-xs text-muted-foreground">Northstar · fictional case</span>
      </div>
      <div className="p-5 sm:p-6">
        <h2 id="decision-demo-title" className="text-[clamp(1.5rem,2.5vw,1.9rem)] leading-tight">
          What can we conclude?
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          Managers completed a coaching program and reported confidence. Coaching at work was not
          assessed.
        </p>
        <div className="my-5 grid grid-cols-2 gap-px border border-border bg-border text-sm">
          <div className="bg-[var(--tint-teal)] p-3">
            <span className="label-xs text-[var(--teal)]">Recorded</span>
            <p className="mt-2">Completion + confidence</p>
          </div>
          <div className="bg-[var(--background)] p-3">
            <span className="label-xs text-muted-foreground">Not assessed</span>
            <p className="mt-2">Coaching at work</p>
          </div>
        </div>
        <div
          role="group"
          aria-label="Choose the conclusion supported by the evidence"
          className="space-y-2"
        >
          {OPTIONS.map((option, index) => (
            <button
              key={option.text}
              ref={index === 0 ? firstChoice : undefined}
              type="button"
              aria-pressed={selected === index}
              aria-controls={resultId}
              onClick={() => setSelected(index)}
              className={`decision-choice state-transition flex min-h-12 w-full items-center gap-3 border p-3 text-left text-[15px] leading-snug ${selected === index ? "border-[var(--teal)] bg-[var(--tint-teal)]" : "border-border hover:border-[var(--teal)] hover:bg-[var(--background)]"}`}
            >
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs text-[var(--teal)]"
              >
                {selected === index ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              {option.text}
            </button>
          ))}
        </div>
        <div id={resultId} role="status" aria-live="polite" aria-atomic="true" className="mt-5">
          {result ? (
            <div key={selected} className="inspector-enter border-t border-border pt-4">
              <p className="font-semibold text-[var(--teal)]">{result.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {result.explanation}
              </p>
            </div>
          ) : (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <CircleHelp aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              Choose a conclusion to see what the evidence can carry.
            </p>
          )}
        </div>
        {selected !== null && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <a
              href="#evidence-chain"
              onClick={onInspect}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--teal)] underline underline-offset-4"
            >
              Inspect the missing link <ArrowDown aria-hidden className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                firstChoice.current?.focus();
              }}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" />
              Reset choice
            </button>
          </div>
        )}
      </div>
      <Link
        to="/example"
        className="state-transition flex min-h-12 items-center justify-between gap-3 border-t border-border bg-[var(--background)] px-5 py-4 text-sm font-semibold text-[var(--teal)] hover:bg-[var(--tint-teal)] sm:px-6"
      >
        Follow the complete Northstar case <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </section>
  );
}
