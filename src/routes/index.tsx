import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Section } from "@/components/site/SiteChrome";
import { EvidenceChain } from "@/components/studio/EvidenceChain";
import { DecisionDemo } from "@/components/studio/DecisionDemo";
import { BriefPreview } from "@/components/studio/BriefPreview";
import { NORTHSTAR_PROVENANCE } from "@/lib/chain-provenance";
import { DEMO_MEASURED } from "@/lib/studio-data";
import { chainStates } from "@/lib/studio-logic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evidence Studio — Training was completed. Did work change?" },
      {
        name: "description",
        content:
          "Examine what the evidence supports, challenge the recommendation, and leave with a clear next decision. An interactive studio for learning, talent and research leaders.",
      },
      {
        property: "og:title",
        content: "Evidence Studio — Training was completed. Did work change?",
      },
      {
        property: "og:description",
        content: "Try a worked decision. Find the missing evidence. Leave with a usable brief.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
const PHASES = [
  {
    name: "Diagnose",
    question: "What needs to change?",
    text: "Separate a performance problem from a training request. Consider the people and the conditions around the work.",
  },
  {
    name: "Design",
    question: "What could help?",
    text: "Compare a proposed intervention with a credible alternative, including the time and effort each requires.",
  },
  {
    name: "Test",
    question: "What would we need to see?",
    text: "Identify missing evidence and plan a test that could change your recommendation.",
  },
  {
    name: "Decide",
    question: "What can we do now?",
    text: "Record the decision, its limits, and the next evidence to collect in a brief you can use.",
  },
];
function Home() {
  const [chainOpen, setChainOpen] = useState(false);
  return (
    <div className="pb-4">
      <Section className="pt-8 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-16">
          <div>
            <p className="label-xs text-[var(--teal)]">For learning, talent & research leaders</p>
            <h1 className="editorial mt-5 max-w-[17ch]">
              Training was completed. Did work change?
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-foreground/85">
              Examine what the evidence supports, challenge the recommendation, and leave with a
              clear next decision.
            </p>
            <p className="mt-3 max-w-[49ch] text-[15px] leading-relaxed text-muted-foreground">
              An interactive decision-support tool for the questions between a learning programme
              and its impact at work.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/example" className="action-primary">
                Explore a worked decision <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link to="/studio" className="action-secondary">
                Work through your decision
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No account needed. Studio inputs stay in this browser session.
            </p>
          </div>
          <DecisionDemo onInspect={() => setChainOpen(true)} />
        </div>
      </Section>
      <Section id="evidence-chain" className="mt-10 scroll-mt-24 sm:mt-14">
        <details
          open={chainOpen}
          onToggle={(event) => setChainOpen(event.currentTarget.open)}
          className="disclosure border-y border-border"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-5 py-5 sm:py-6">
            <span>
              <span className="label-xs block text-[var(--teal)]">Go one link deeper</span>
              <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl">
                Follow the claim. Find the missing link.
              </span>
            </span>
            <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[var(--teal)]" />
          </summary>
          <div className="disclosure-content pb-6">
            <EvidenceChain
              states={chainStates(DEMO_MEASURED)}
              provenance={NORTHSTAR_PROVENANCE}
              title="Interactive evidence chain"
              initialSelected={null}
              knownLabel="What we observed"
              intro="These are the same fictional Northstar records used above. Select a link to inspect the observation, its limits, and the next evidence to collect."
            />
          </div>
        </details>
      </Section>
      <Section className="mt-14 sm:mt-20">
        <div className="grid items-start gap-8 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <div className="pt-2">
            <p className="label-xs text-[var(--teal)]">What you leave with</p>
            <h2 className="mt-4 max-w-[17ch] text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">
              A brief that survives a hard question.
            </h2>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-foreground/85">
              See the decision and the evidence together. Keep the uncertainty visible. Name the
              next test before committing to a wider rollout.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              In the Studio, you can edit, copy, download or print your brief.
            </p>
            <Link
              to="/studio"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-[var(--teal)] underline underline-offset-4"
            >
              Build your decision brief <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <BriefPreview />
        </div>
      </Section>
      <div className="skeptical-band mt-16 py-10 sm:mt-20 sm:py-14">
        <Section>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
            <div>
              <p className="label-xs text-white/75">The Skeptical Review</p>
              <h2 className="mt-4 max-w-[23ch] text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">
                What would make this recommendation wrong?
              </h2>
              <p className="mt-4 max-w-[49ch] text-base leading-relaxed text-white/85">
                Challenge the weakest assumption, consider another explanation, and identify the
                evidence that could change your mind.
              </p>
              <Link
                to="/example"
                hash="skeptical-challenge"
                className="mt-6 inline-flex min-h-12 items-center gap-3 border border-white/50 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore Northstar’s challenge <ArrowUpRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="border-l border-white/30 pl-6 sm:pl-8">
              <p className="label-xs text-white/75">One question from the fictional case</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.4vw,2rem)] leading-snug">
                What if the programme was never the constraint?
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/85">
                Managers may need time, clearer expectations or support—not another workshop. A
                structured observation can help distinguish those explanations.
              </p>
              <p className="mt-5 border-t border-white/20 pt-4 text-sm text-white/70">
                Rule-based questions. Your judgment remains essential.
              </p>
            </div>
          </div>
        </Section>
      </div>
      <Section className="mt-14 sm:mt-20">
        <p className="label-xs text-[var(--teal)]">How it works</p>
        <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.15rem)]">Four phases, one decision.</h2>
        <ol className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase, i) => (
            <li key={phase.name} className="bg-[var(--surface)] p-5 sm:p-6">
              <span className="label-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")} / {phase.name}
              </span>
              <h3 className="mt-4 text-xl leading-tight">{phase.question}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{phase.text}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="mt-14 sm:mt-20">
        <Link
          to="/example"
          className="case-preview lift grid overflow-hidden border border-border bg-[var(--surface)] sm:grid-cols-[190px_1fr_auto] sm:items-center"
        >
          <img
            src="/northstar-editorial-room.png"
            alt="Illustrative meeting room; Northstar Services is fictional"
            loading="lazy"
            className="h-32 w-full object-cover sm:h-full sm:min-h-40"
          />
          <div className="p-5 sm:p-7">
            <p className="label-xs text-[var(--teal)]">Fictional case file 01</p>
            <h2 className="mt-2 text-2xl">One programme. A decision followed end to end.</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
              Follow Northstar from a reassuring completion report to a more defensible next step.
            </p>
          </div>
          <ArrowUpRight aria-hidden className="mb-5 ml-5 h-5 w-5 text-[var(--teal)] sm:m-7" />
        </Link>
      </Section>
    </div>
  );
}
