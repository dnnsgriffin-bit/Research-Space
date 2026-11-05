import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, StageRibbon, NextStage } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the framework — Evidence Studio" },
      {
        name: "description",
        content:
          "How learning strategy, research design and measurement support better organizational decisions in Evidence Studio.",
      },
      { property: "og:title", content: "About the framework — Evidence Studio" },
      {
        property: "og:description",
        content:
          "How learning strategy, research design and measurement support better organizational decisions in Evidence Studio.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-8">
      <StageRibbon stage="about" />
      <Section className="pt-16 sm:pt-24">
        <p className="label-xs text-[var(--teal)]">About the framework</p>
        <h1 className="editorial mt-6 max-w-4xl">
          A studio for better questions, built on research practice.
        </h1>
        <div className="measure mt-10 space-y-6 text-[17px] leading-relaxed text-foreground/85">
          <p>
            Evidence Studio explores how learning strategy, research design and measurement can
            support better organizational decisions. Dennis Griffin, Ed.D., created it as an
            interactive demonstration of his approach to evidence-conscious practice.
          </p>
          <p>
            It is a thinking instrument rather than a prediction engine. Nothing in it estimates an
            effect size, forecasts an outcome, or scores a program. It structures what is known,
            marks what is assumed, and makes the missing evidence visible before money is committed.
          </p>
        </div>
      </Section>

      <Section className="mt-20">
        <div className="grid gap-px bg-border lg:grid-cols-3">
          <div className="bg-[var(--surface)] p-8">
            <p className="label-xs text-muted-foreground">Created by</p>
            <p className="mt-3 text-[19px] text-[var(--navy)]">Dennis Griffin, Ed.D.</p>
            <p className="mt-3 text-[14px] leading-relaxed text-foreground/80">
              Learning Strategy · Research &amp; Experience Insights · Measurement &amp; Analytics
            </p>
            <a
              href="https://www.dennisrgriffin.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center text-[14px] font-medium text-[var(--teal)] underline underline-offset-4"
            >
              Learn more about Dennis
            </a>
          </div>
          <div className="bg-[var(--surface)] p-8 lg:col-span-2">
            <p className="label-xs text-muted-foreground">What this product is an application of</p>
            <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed text-foreground/85 sm:grid-cols-2">
              <li className="border-t border-border pt-3">
                Learning science and instructional research
              </li>
              <li className="border-t border-border pt-3">Experiment and study design</li>
              <li className="border-t border-border pt-3">
                Measurement strategy and evidence quality
              </li>
              <li className="border-t border-border pt-3">
                Evidence-based organizational decision making
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="Responsible use" className="mt-20">
        <ul className="grid max-w-5xl gap-px bg-border sm:grid-cols-2">
          {[
            {
              t: "No fabricated effects",
              d: "Comparisons are directional and explained. The studio never states that a design will improve a result by a specific percentage.",
            },
            {
              t: "Structured scenarios, not people",
              d: "Learner profiles are structured scenarios used to examine context. They are not predictions of individual human behavior.",
            },
            {
              t: "Fictional demonstration data",
              d: "The worked example uses an invented organization and aggregated figures. No real company or personal information appears.",
            },
            {
              t: "Claims stay bounded",
              d: "A pilot is only described as causal when the design supports that conclusion, and open questions are stated alongside recommendations.",
            },
          ].map((x) => (
            <li key={x.t} className="bg-[var(--surface)] p-7">
              <p className="text-[16px] text-[var(--navy)]">{x.t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">{x.d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Link
            to="/example"
            className="inline-flex min-h-11 items-center border border-[var(--navy)] px-5 py-3 text-[15px] font-medium text-[var(--navy)] transition-colors hover:bg-[var(--navy)] hover:text-[var(--surface)]"
          >
            Explore the worked example
          </Link>
        </div>
      </Section>
      <NextStage stage="about" />
    </div>
  );
}
