import { createFileRoute, Link } from "@tanstack/react-router";
import { CHAIN } from "@/lib/studio-data";
import { EvidenceChain, StateMark } from "@/components/studio/EvidenceChain";
import { ChevronDown } from "lucide-react";
import { EvidenceLegend } from "@/components/studio/EvidenceLabel";
import { Section, StageRibbon, NextStage } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/framework")({
  head: () => ({
    meta: [
      { title: "The Learning Evidence Chain — Evidence Studio" },
      {
        name: "description",
        content:
          "A structured chain from intervention to business outcome, with every link marked measured, assumed or unknown.",
      },
      { property: "og:title", content: "The Learning Evidence Chain — Evidence Studio" },
      {
        property: "og:description",
        content:
          "A structured chain from intervention to business outcome, with every link marked measured, assumed or unknown.",
      },
    ],
  }),
  component: FrameworkPage,
});

const ILLUSTRATIVE: Record<string, "measured" | "assumed" | "unknown"> = {
  intervention: "measured",
  mechanism: "assumed",
  learning: "unknown",
  opportunity: "assumed",
  transfer: "unknown",
  performance: "unknown",
  outcome: "unknown",
};

function FrameworkPage() {
  return (
    <div className="pb-8">
      <StageRibbon stage="framework" />
      <Section className="pt-16 sm:pt-24">
        <p className="label-xs text-[var(--teal)]">The framework</p>
        <h1 className="editorial mt-6 max-w-4xl">
          A chain is only as strong as the link you never measured.
        </h1>
        <p className="measure mt-7 text-[17px] leading-relaxed text-foreground/80">
          Most learning programs are evaluated at the two ends of the chain that are easiest to
          observe: what was delivered, and how people felt about it. The links in between carry the
          actual argument.
        </p>
      </Section>

      <Section eyebrow="Each link, stated plainly" className="mt-12">
        <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CHAIN.map((node, i) => (
            <div key={node.id} className="bg-[var(--surface)] p-6">
              <span className="label-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <dt className="mt-3 text-[17px] text-[var(--navy)]">{node.label}</dt>
              <dd className="mt-2 text-[14px] leading-relaxed text-foreground/80">
                {node.description}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="mt-12">
        <details className="disclosure border-y border-border">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-5 text-lg font-medium text-[var(--teal)]">
            Explore how to inspect a link <ChevronDown aria-hidden className="h-5 w-5" />
          </summary>
          <div className="disclosure-content pb-6">
            <EvidenceChain
              states={ILLUSTRATIVE}
              initialSelected={null}
              knownLabel="What this link means"
              intro="A conceptual reference, with illustrative states. These definitions explain the framework; they are not observations from a program."
            />
          </div>
        </details>
      </Section>
      <Section eyebrow="Evidence states" className="mt-16">
        <h2 className="text-3xl sm:text-4xl">What do we know at this link?</h2>
        <dl className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          {(
            [
              [
                "measured",
                "An observation was recorded. Its quality and relevance still need checking; measurement does not establish causation.",
              ],
              [
                "assumed",
                "A connection is proposed or taken for granted. It has not been demonstrated by the available evidence.",
              ],
              [
                "unknown",
                "The available evidence does not establish this link. Identify the next observation that would help.",
              ],
            ] as const
          ).map(([state, meaning]) => (
            <div key={state} className="bg-[var(--surface)] p-5">
              <dt>
                <StateMark state={state} />
              </dt>
              <dd className="mt-3 text-[15px] leading-relaxed text-foreground/80">{meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section eyebrow="Provenance labels" className="mt-16">
        <h2 className="text-3xl sm:text-4xl">Where does a statement come from?</h2>
        <p className="measure mt-4 text-[16px] leading-relaxed text-foreground/80">
          These four labels identify the basis of a statement. They complement the three evidence
          states above: provenance tells you where a statement comes from; a state tells you whether
          a link has been observed, assumed or remains unknown.
        </p>
        <div className="mt-10 max-w-4xl">
          <EvidenceLegend />
        </div>
      </Section>

      <Section eyebrow="What this framework refuses to do" className="mt-24">
        <ul className="grid max-w-4xl gap-px bg-border sm:grid-cols-3">
          {[
            "Treat satisfaction as proof of learning.",
            "Treat confidence as proof of competence.",
            "Treat correlation as proof of causation.",
          ].map((t) => (
            <li
              key={t}
              className="bg-[var(--surface)] p-6 text-[15px] leading-relaxed text-foreground/85"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Link
            to="/studio"
            className="inline-flex min-h-11 items-center bg-[var(--navy)] px-5 py-3 text-[15px] font-medium text-[var(--surface)] transition-colors hover:bg-[var(--teal)]"
          >
            Work through your decision
          </Link>
        </div>
      </Section>
      <NextStage stage="framework" />
    </div>
  );
}
