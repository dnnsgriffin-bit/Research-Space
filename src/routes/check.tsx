import { createFileRoute, Link } from "@tanstack/react-router";
import { EvidenceCheck } from "@/components/check/EvidenceCheck";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Evidence Check — Evidence Studio" },
      {
        name: "description",
        content:
          "Tick what you measured and see how far an honest claim about your training can go, what could be getting in the way, and a suggested next step for evidence.",
      },
      {
        property: "og:title",
        content: "Evidence Studio — Training was completed. Did work change?",
      },
      {
        property: "og:description",
        content:
          "A two-minute evidence check for corporate learning and L&D leaders. Leave with a brief you can defend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckPage,
});

const DOORS = [
  {
    to: "/example" as const,
    title: "Follow a worked example",
    text: "One fictional program, Northstar Services, followed from a reassuring completion report to a defensible next step.",
    go: "Read the case",
  },
  {
    to: "/studio" as const,
    title: "Plan the next test",
    text: "Compare an alternative design, plan a pilot that could change your mind, and build a fuller decision brief.",
    go: "Open the Studio",
  },
  {
    to: "/framework" as const,
    title: "Understand the chain",
    text: "Why completion and satisfaction can’t show that work changed, and what each of the seven links needs.",
    go: "See the framework",
  },
];

const FINDINGS = [
  {
    text: "Satisfaction-style reactions were only weakly related to learning and on-the-job behavior, so a high rating can’t stand in for either.",
    sources: [
      {
        label: "Alliger et al. (1997)",
        href: "https://doi.org/10.1111/j.1744-6570.1997.tb00911.x",
      },
      { label: "Warr, Allan & Birdi (1999)", href: "https://doi.org/10.1348/096317999166725" },
    ],
  },
  {
    text: "Organizational training showed medium-to-large average effects on learning, behavior and results. The risk is concluding from the wrong evidence, not that training can’t work.",
    sources: [
      { label: "Arthur et al. (2003)", href: "https://doi.org/10.1037/0021-9010.88.2.234" },
    ],
  },
  {
    text: "Work-environment factors such as supervisor and peer support and the opportunity to perform are consistently related to transfer. That’s why the check asks about them.",
    sources: [
      { label: "Blume et al. (2010)", href: "https://doi.org/10.1177/0149206309352880" },
      {
        label: "Grossman & Salas (2011)",
        href: "https://doi.org/10.1111/j.1468-2419.2011.00373.x",
      },
      { label: "Hughes et al. (2020)", href: "https://pubmed.ncbi.nlm.nih.gov/31136198/" },
    ],
  },
  {
    text: "Prototype design choices, not research findings: the order of suggested next steps, the wording of the brief, and Kirkpatrick levels shown as a rough cross-reference.",
    sources: [],
  },
];

function CheckPage() {
  return (
    <div className="ec-page">
      <EvidenceCheck />
      <div className="ec">
        <section className="ec-wrap ec-section" aria-labelledby="deeper-title">
          <span className="ec-label">Go deeper</span>
          <h2 id="deeper-title">When two minutes isn’t enough</h2>
          <div className="ec-deeper">
            {DOORS.map((d) => (
              <Link key={d.to} to={d.to} className="ec-door">
                <span className="ec-door-title">{d.title}</span>
                <span className="ec-door-text">{d.text}</span>
                <span className="ec-door-go">{d.go} →</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="ec-wrap ec-section" aria-labelledby="research-title">
          <span className="ec-label">Why these rules</span>
          <h2 id="research-title">The research behind the rules</h2>
          <div className="ec-research">
            {FINDINGS.map((f) => (
              <div key={f.text} className="ec-finding">
                <p>{f.text}</p>
                {f.sources.length > 0 && (
                  <cite>
                    {f.sources.map((src, k) => (
                      <span key={src.href}>
                        {k > 0 && " · "}
                        <a href={src.href} target="_blank" rel="noopener">
                          {src.label} ↗
                        </a>
                      </span>
                    ))}
                  </cite>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
