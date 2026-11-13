import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, MoveRight } from "lucide-react";
import { useState } from "react";
import {
  DEMO_BRIEF,
  DEMO_CONTEXT,
  DEMO_MEASURED,
  DEMO_PILOT,
  DEMO_PROFILES,
  DEMO_SCENARIO_A,
  DEMO_SCENARIO_B,
} from "@/lib/studio-data";
import { chainStates, compareScenarios, evidenceStatement } from "@/lib/studio-logic";
import { ScenarioPreview } from "@/components/studio/ScenarioPreview";
import { EvidenceChain } from "@/components/studio/EvidenceChain";
import { NORTHSTAR_PROVENANCE } from "@/lib/chain-provenance";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { Section, NextStage } from "@/components/site/SiteChrome";
import { Orientation } from "@/components/site/Orientation";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/example")({
  head: () => ({
    meta: [
      { title: "Worked example: Northstar Services — Evidence Studio" },
      {
        name: "description",
        content:
          "A fictional worked example: managers complete performance-conversation training, but coaching quality stays inconsistent. What can the evidence support?",
      },
      { property: "og:title", content: "Worked example: Northstar Services — Evidence Studio" },
      {
        property: "og:description",
        content:
          "A fictional worked example following one program from learner context to executive decision brief.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamplePage,
});

const PHASES = [
  { id: "diagnose", name: "Diagnose", blurb: "The situation and the people in it." },
  { id: "design", name: "Design", blurb: "Two designs, compared." },
  { id: "prove", name: "Test", blurb: "What is measured, and what is not." },
  { id: "decide", name: "Decide", blurb: "The brief, and the next test." },
] as const;

function ExamplePage() {
  const { state, loadDemo, setStep } = useStudio();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<(typeof PHASES)[number]["id"]>("diagnose");
  const states = chainStates(DEMO_MEASURED);
  const rows = compareScenarios(DEMO_SCENARIO_A, DEMO_SCENARIO_B);

  const hasOwnWork =
    !state.demo && Boolean(state.context.company?.trim() || state.context.problem?.trim());

  const open = () => {
    if (
      hasOwnWork &&
      !window.confirm(
        "Loading this example will replace the inputs already in the Studio. Continue?",
      )
    ) {
      return;
    }
    loadDemo();
    void navigate({ to: "/studio" });
  };

  const openReview = () => {
    if (
      hasOwnWork &&
      !window.confirm("Loading this example will replace your Studio inputs. Continue?")
    )
      return;
    loadDemo();
    setStep(5);
    void navigate({ to: "/studio", hash: "skeptical-review" });
  };

  return (
    <div className="pb-8">
      <Orientation
        current="example"
        kicker="Worked example · fictional · nothing to fill in"
        title="One program, followed from a reassuring report to a decision leaders can defend."
        steps={[
          <>
            Read top to bottom, or jump between the four stages: <b>Diagnose</b>, <b>Design</b>,{" "}
            <b>Test</b> and <b>Decide</b>.
          </>,
          "Select any link in the evidence chain to see what the evidence can and can’t support.",
          <>
            To try this on your own program, choose <b>Open in Studio</b> and edit the case.
          </>,
        ]}
      >
        <p>
          Northstar Services is a made-up company. Its new-manager coaching program shows high
          completion, yet leaders still hear that coaching quality varies. This page shows how the
          Evidence Studio method works through that case, stage by stage. It is the long version of
          what the two-minute Evidence Check does.
        </p>
      </Orientation>

      <Section className="pt-9 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.72fr)] lg:items-end lg:gap-14">
          <div>
            <p className="label-xs text-[var(--teal)]">Case file 01 / 04 · Diagnose</p>
            <h1 className="editorial mt-4 max-w-[19ch]">
              Northstar Services: the completion question
            </h1>
            <p className="measure mt-5 text-[1.07rem] leading-relaxed text-foreground/85">
              New managers attended a coaching program. Completion looked reassuring. Leaders still
              heard that coaching quality varied. Before commissioning more training, what does the
              evidence actually say?
            </p>
            <p className="mt-4 border-l-2 border-l-[var(--state-assumed)] bg-[var(--tint-assumed)] px-4 py-3 text-[14.5px] leading-relaxed text-foreground/85">
              <strong className="font-semibold">
                Fictional worked example — all organizations, observations and results are
                illustrative.
              </strong>{" "}
              No real employer data appears anywhere in this project.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#evidence-chain"
                className="state-transition inline-flex min-h-11 items-center bg-[var(--navy)] px-5 py-3 text-[15px] font-medium text-white hover:bg-[var(--teal)]"
              >
                Take the guided tour <ArrowDown aria-hidden className="ml-2 h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={open}
                className="state-transition min-h-11 border border-[var(--navy)] px-5 py-3 text-[15px] font-medium text-[var(--navy)] hover:bg-[var(--tint-navy)]"
              >
                Open in Studio
              </button>
            </div>
          </div>
          <div className="case-quote border border-border bg-[var(--deep)] p-7 text-[var(--background)] sm:p-9">
            <p className="label-xs text-[var(--sage)]">The question behind the numbers</p>
            <p className="mt-7 font-[family-name:var(--font-display)] text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.17]">
              “Completion is a metric. It is not evidence of transfer.”
            </p>
            <p className="mt-8 border-t border-white/20 pt-4 text-[13px] leading-relaxed text-white/75">
              A working principle for this fictional case, not a testimonial or observed outcome.
            </p>
          </div>
        </div>
        <dl className="mt-9 grid gap-px bg-border sm:grid-cols-3">
          {[
            ["Organization", DEMO_CONTEXT.company],
            ["Audience", DEMO_CONTEXT.audience],
            ["Presenting problem", DEMO_CONTEXT.problem],
          ].map(([k, v]) => (
            <div key={k} className="bg-[var(--surface)] p-5 sm:p-6">
              <dt className="label-xs text-muted-foreground">{k}</dt>
              <dd className="mt-2.5 text-[15px] leading-relaxed text-foreground/85">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* The chain, early */}
      <Section id="evidence-chain" className="mt-12 scroll-mt-24">
        <p className="label-xs border-t border-border pt-4 text-muted-foreground">
          Where the evidence stands
        </p>
        <div className="mt-6">
          <EvidenceChain
            states={states}
            provenance={NORTHSTAR_PROVENANCE}
            title="Northstar evidence chain"
            knownLabel="What we observed"
            intro="Select a link to inspect what this fictional case can and cannot support. Completion, attendance, satisfaction and self-reported confidence were recorded; demonstrated learning and workplace outcomes were not assessed."
          />
        </div>
      </Section>

      <Section id="skeptical-challenge" className="mt-12 scroll-mt-24">
        <div className="grid gap-6 border-l-[3px] border-l-[var(--signal)] bg-[var(--tint-clay)] p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label-xs text-[var(--signal)]">
              Skeptical Review · the signature challenge
            </p>
            <h2 className="mt-3 text-[1.55rem] leading-tight">
              What if the program was never the constraint?
            </h2>
            <p className="measure mt-3 text-[15px] leading-relaxed text-foreground/85">
              A careful reviewer would ask whether managers had time, support and real opportunities
              to coach. Open the Northstar recommendation and see the rule-based challenge before
              you accept the brief.
            </p>
          </div>
          <button
            type="button"
            onClick={openReview}
            className="state-transition inline-flex min-h-11 items-center justify-center bg-[var(--navy)] px-5 py-3 text-[14px] font-medium text-white hover:bg-[var(--teal)]"
          >
            Challenge the recommendation <MoveRight aria-hidden className="ml-2 h-4 w-4" />
          </button>
        </div>
      </Section>

      {/* Phase navigation */}
      <Section className="mt-12">
        <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
          <nav aria-label="Example phases" className="mb-8 lg:mb-0">
            <p className="label-xs border-t border-border pt-4 text-muted-foreground">
              Guided progression
            </p>
            <ul className="mt-4 flex gap-px overflow-x-auto lg:sticky lg:top-24 lg:block lg:overflow-visible">
              {PHASES.map((p, i) => {
                const active = p.id === phase;
                return (
                  <li key={p.id} className="min-w-[142px] flex-1 lg:min-w-0">
                    <button
                      type="button"
                      onClick={() => setPhase(p.id)}
                      aria-current={active ? "step" : undefined}
                      className={`state-transition w-full border-l-2 py-2.5 pl-3 pr-2 text-left ${
                        active
                          ? "border-l-[var(--teal)] bg-[var(--tint-teal)]"
                          : "border-l-border hover:bg-[var(--tint-navy)]"
                      }`}
                    >
                      <span
                        className={`label-xs ${active ? "text-[var(--teal)]" : "text-muted-foreground"}`}
                      >
                        {String(i + 1).padStart(2, "0")} {p.name}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-muted-foreground">
                        {p.blurb}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div key={phase} className="min-w-0 inspector-enter">
            {phase === "diagnose" && (
              <div>
                <h2 className="text-[clamp(1.4rem,2.6vw,1.95rem)] leading-tight">
                  Completion was high. Coaching quality was still reported as inconsistent.
                </h2>
                <p className="measure mt-3 text-[15.5px] leading-relaxed text-foreground/85">
                  Two illustrative manager profiles show why a single explanation is unlikely:
                  motivation, manager support, protected time and practice opportunity differ
                  sharply across the population. These ratings are practitioner judgments, not
                  measurements.
                </p>
                <ul className="mt-6 grid gap-px bg-border md:grid-cols-2">
                  {DEMO_PROFILES.map((p) => (
                    <li key={p.id} className="bg-[var(--surface)] p-5 sm:p-6">
                      <p className="text-[17px] text-[var(--navy)]">{p.name}</p>
                      <p className="mt-1 text-[13.5px] text-muted-foreground">{p.role}</p>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/85">
                        {p.note}
                      </p>
                      <ul className="mt-4 grid grid-cols-2 gap-y-1.5 text-[13px] text-muted-foreground">
                        <li>Motivation {p.motivation}/5</li>
                        <li>Manager support {p.managerSupport}/5</li>
                        <li>Protected time {p.timeAvailable}/5</li>
                        <li>Practice opportunity {p.practiceOpportunity}/5</li>
                      </ul>
                      <div className="mt-4">
                        <EvidenceLabel kind="user" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase === "design" && (
              <div>
                <h2 className="text-[clamp(1.4rem,2.6vw,1.95rem)] leading-tight">
                  One workshop, or the same content spaced with feedback?
                </h2>
                <p className="measure mt-3 text-[15.5px] leading-relaxed text-foreground/85">
                  The comparison below is qualitative and directional. It reflects design logic, not
                  a measured result in this fictional organization.
                </p>
                <ScenarioPreview />

                <ul className="mt-10">
                  {rows.slice(0, 5).map((r) => (
                    <li key={r.id} className="border-t border-border py-4 last:border-b">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h3 className="text-[15.5px] text-[var(--navy)]">
                          {r.label} —{" "}
                          {r.direction === "tradeoff"
                            ? "Potential tradeoff"
                            : r.direction === "similar"
                              ? "Similar"
                              : r.direction === "stronger"
                                ? "Likely stronger"
                                : "Likely improvement"}
                        </h3>
                        <EvidenceLabel kind={r.labelKind} />
                      </div>
                      <p className="measure mt-1.5 text-[14px] leading-relaxed text-foreground/80">
                        {r.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase === "prove" && (
              <div>
                <h2 className="text-[clamp(1.4rem,2.6vw,1.95rem)] leading-tight">
                  What this program has actually measured.
                </h2>
                <p className="measure mt-3 text-[16px] leading-relaxed text-[var(--navy)]">
                  {evidenceStatement(DEMO_MEASURED)}
                </p>
                <div className="mt-6 grid gap-px bg-border lg:grid-cols-3">
                  {[
                    ["Before pilot — what we expect", DEMO_PILOT.expectation],
                    ["After pilot — what we observed", DEMO_PILOT.observation],
                    ["Calibration — what changed", DEMO_PILOT.calibration],
                  ].map(([t, v]) => (
                    <div key={t} className="bg-[var(--surface)] p-5 sm:p-6">
                      <p className="label-xs text-[var(--teal)]">{t}</p>
                      <p className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/85">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[14.5px] leading-relaxed text-foreground/85">
                  <span className="label-xs mr-3 text-[var(--navy)]">Next experiment</span>
                  {DEMO_PILOT.nextExperiment}
                </p>
                <p className="mt-4 border-l-2 border-l-[var(--state-assumed)] bg-[var(--tint-assumed)] px-4 py-3 text-[13.5px] leading-relaxed text-foreground/85">
                  The comparison design and sample sizes in this example are illustrative. They are
                  not a guarantee of sufficient evidence, and nothing here establishes return on
                  investment.
                </p>
              </div>
            )}

            {phase === "decide" && (
              <div>
                <h2 className="text-[clamp(1.4rem,2.6vw,1.95rem)] leading-tight">
                  {DEMO_BRIEF.businessQuestion}
                </h2>
                <div className="mt-6 grid gap-px bg-border md:grid-cols-2">
                  <div className="bg-[var(--surface)] p-5 sm:p-6">
                    <p className="label-xs text-[var(--navy)]">Decision leaders can make now</p>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/85">
                      {DEMO_BRIEF.decisionNow}
                    </p>
                  </div>
                  <div className="bg-[var(--surface)] p-5 sm:p-6">
                    <p className="label-xs text-[var(--navy)]">Key tradeoff</p>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/85">
                      {DEMO_BRIEF.keyTradeoff}
                    </p>
                  </div>
                </div>
                <p className="measure mt-5 text-[14.5px] leading-relaxed text-foreground/80">
                  Nothing in this example claims a learning gain. Confidence was self-rated on a
                  post-only survey, which cannot establish that knowledge or skill changed.
                </p>
                <button
                  type="button"
                  onClick={open}
                  className="state-transition mt-6 min-h-11 bg-[var(--navy)] px-5 py-3 text-[15px] font-medium text-[oklch(0.99_0_0)] hover:bg-[var(--teal)]"
                >
                  Walk through it yourself
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>

      <NextStage stage="example" />
    </div>
  );
}
