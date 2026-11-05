import { createFileRoute, Link } from "@tanstack/react-router";
import { EvidenceCheck } from "@/components/check/EvidenceCheck";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evidence Studio — Training was completed. Did work change?" },
      {
        name: "description",
        content:
          "Tick what you measured and see how far an honest claim about your training can go, what could be getting in the way, and the cheapest evidence to collect next.",
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
  component: Home,
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
    text: "Reaction measures (satisfaction, “I feel confident”) relate weakly to on-the-job behavior; feel-good ratings least of all.",
    cite: "Alliger et al. (1997), Personnel Psychology, meta-analysis · Warr, Allan & Birdi (1999), J. Occupational & Organizational Psychology",
  },
  {
    text: "Well-designed training does work, with medium-to-large effects on learning, behavior and results. The problem is concluding from the wrong evidence.",
    cite: "Arthur et al. (2003), Journal of Applied Psychology, meta-analysis",
  },
  {
    text: "Whether learning gets used depends heavily on the work environment: manager and peer support, transfer climate and the chance to use the skill.",
    cite: "Blume et al. (2010), Journal of Management · Grossman & Salas (2011) · Hughes et al. (2020), Human Factors",
  },
  {
    text: "Few organizations measure behavior change or results; most stop at participation and reaction.",
    cite: "Brandon Hall Group data as reported by practitioner sources (date unclear; directional) · Thalheimer’s LTEM (2018)",
  },
];

function Home() {
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
          <h2 id="research-title">What the research says</h2>
          <div className="ec-research">
            {FINDINGS.map((f) => (
              <div key={f.cite} className="ec-finding">
                <p>{f.text}</p>
                <cite>{f.cite}</cite>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
