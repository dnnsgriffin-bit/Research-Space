import { createFileRoute } from "@tanstack/react-router";
import { STEPS, useStudio } from "@/lib/studio-store";
import { StepContext } from "@/components/studio/steps/StepContext";
import { StepIntervention } from "@/components/studio/steps/StepIntervention";
import { StepSandbox } from "@/components/studio/steps/StepSandbox";
import { StepReality } from "@/components/studio/steps/StepReality";
import { StepPilot } from "@/components/studio/steps/StepPilot";
import { StepBrief } from "@/components/studio/steps/StepBrief";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — work through the decision | Evidence Studio" },
      {
        name: "description",
        content:
          "Four phases — diagnose, design, test, decide — across six connected steps, ending in an executive decision brief with every claim labeled.",
      },
      { property: "og:title", content: "Studio — work through the decision | Evidence Studio" },
      {
        property: "og:description",
        content:
          "Diagnose the problem, design and compare interventions, inventory the evidence, and leave with a usable decision brief.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

/** Four phases grouped over the six detailed steps. No capability is removed. */
const PHASES: { name: string; steps: number[]; blurb: string }[] = [
  { name: "Diagnose", steps: [0], blurb: "Who is involved, and what is actually going wrong." },
  { name: "Design", steps: [1, 2], blurb: "Build the intervention and compare an alternative." },
  { name: "Test", steps: [3, 4], blurb: "Inventory the evidence and plan a pilot that can fail." },
  { name: "Decide", steps: [5], blurb: "Stress-test the case and export the brief." },
];

function phaseOf(step: number) {
  return PHASES.findIndex((p) => p.steps.includes(step));
}

function StudioPage() {
  const { state, step, setStep, loadDemo, reset } = useStudio();
  const current = STEPS[step] ?? STEPS[0]!;
  const activePhase = Math.max(0, phaseOf(step));

  const hasOwnWork =
    !state.demo && Boolean(state.context.company?.trim() || state.context.problem?.trim());

  const onLoadExample = () => {
    if (
      hasOwnWork &&
      !window.confirm(
        "Loading the worked example will replace the inputs you have entered. Continue?",
      )
    ) {
      return;
    }
    loadDemo();
  };

  const onReset = () => {
    if (hasOwnWork && !window.confirm("Clear all inputs and start over?")) return;
    reset();
  };

  return (
    <div className="pb-8">
      {/* Compact working header — the work itself starts immediately below */}
      <div className="studio-working-header border-b border-border bg-[var(--tint-navy)]">
        <div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className="label-xs text-[var(--teal)]">Studio</p>
            <p className="mt-1 text-[14px] text-foreground/80">
              {state.demo
                ? `${state.context.company} — fictional worked example loaded`
                : "Your own working session. Nothing leaves your browser."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLoadExample}
              className="state-transition min-h-10 border border-[var(--navy)] px-3.5 py-2 text-[13.5px] font-medium text-[var(--navy)] hover:bg-[var(--navy)] hover:text-[oklch(0.99_0_0)]"
            >
              Prefill worked example
            </button>
            <button
              type="button"
              onClick={onReset}
              className="state-transition min-h-10 px-2.5 py-2 text-[13.5px] text-muted-foreground underline underline-offset-4 hover:text-[var(--signal)]"
            >
              Start over
            </button>
          </div>
        </div>
      </div>

      {/* Phase + step navigation */}
      <nav
        aria-label="Studio phases and steps"
        className="studio-phase-nav sticky top-[var(--site-header-height)] z-30 border-b border-border bg-[var(--background)]/95 backdrop-blur-[2px]"
      >
        <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
          <ol className="flex gap-px overflow-x-auto">
            {PHASES.map((p, pi) => {
              const active = pi === activePhase;
              const done = pi < activePhase;
              return (
                <li key={p.name} className="min-w-[91px] flex-1 sm:min-w-[150px]">
                  <button
                    type="button"
                    onClick={() => setStep(p.steps[0]!)}
                    aria-current={active ? "step" : undefined}
                    className={`state-transition w-full border-t-2 py-2 pr-2 text-left sm:py-2.5 sm:pr-4 ${
                      active
                        ? "border-t-[var(--navy)]"
                        : done
                          ? "border-t-[var(--teal)]"
                          : "border-t-transparent"
                    }`}
                  >
                    <span
                      className={`label-xs ${active ? "text-[var(--navy)]" : "text-muted-foreground"}`}
                    >
                      {String(pi + 1).padStart(2, "0")} {p.name}
                    </span>
                    <span className="mt-1 hidden text-[12.5px] leading-snug text-muted-foreground sm:block">
                      {p.blurb}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <ol className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border py-2">
            {PHASES[activePhase]!.steps.map((sIdx) => {
              const s = STEPS[sIdx]!;
              const active = sIdx === step;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(s.id)}
                    aria-current={active ? "step" : undefined}
                    className={`state-transition min-h-9 text-[13.5px] ${
                      active
                        ? "font-semibold text-[var(--navy)] underline decoration-[var(--teal)] decoration-2 underline-offset-4"
                        : "text-muted-foreground hover:text-[var(--teal)]"
                    }`}
                  >
                    {s.name}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight">{current.headline}</h1>

        <div className="mt-8">
          {step === 0 && <StepContext />}
          {step === 1 && <StepIntervention />}
          {step === 2 && <StepSandbox />}
          {step === 3 && <StepReality />}
          {step === 4 && <StepPilot />}
          {step === 5 && <StepBrief />}
        </div>

        <div className="no-print mt-14 flex items-center justify-between gap-4 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="state-transition min-h-11 px-4 py-2.5 text-[14px] text-[var(--navy)] hover:text-[var(--teal)] disabled:opacity-35"
          >
            ← {step > 0 ? STEPS[step - 1]!.name : "Back"}
          </button>
          <span className="label-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={step === STEPS.length - 1}
            className="state-transition min-h-11 bg-[var(--navy)] px-5 py-2.5 text-[14px] font-medium text-[oklch(0.99_0_0)] hover:bg-[var(--teal)] disabled:opacity-35"
          >
            {step < STEPS.length - 1 ? STEPS[step + 1]!.name : "Complete"} →
          </button>
        </div>
      </div>
    </div>
  );
}
