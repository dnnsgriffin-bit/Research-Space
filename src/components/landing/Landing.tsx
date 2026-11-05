import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Product landing page for Evidence Studio. Presentation only: it reads no Studio or
 * Evidence Check state, and every screenshot shows the real tool with example inputs.
 */

const STEPS = [
  {
    kicker: "01 · Tick what you measured",
    title: "Start from the data you already have",
    text: "Pick a common situation or tick your own measures: completion, a quiz, a manager observation, a business metric. Each one is tagged with its Kirkpatrick level, so nothing needs translating.",
    img: "/landing/chain.webp",
    alt: "Evidence Check with the “We trained, and the numbers went up” starting point selected. Intervention and Business outcome are lit; the links between them are dark.",
  },
  {
    kicker: "02 · See how far the claim reaches",
    title: "The chain lights up only where something was observed",
    text: "Seven links run from the program to the business result. Measured links glow, assumptions stay hazy, and gaps stay dark. Select any link to see what it can’t establish and what to collect next.",
    img: "/landing/inspect.webp",
    alt: "The measures picker beside the evidence inspector for the Transfer link, showing its limitations and the next evidence to collect.",
  },
  {
    kicker: "03 · Check the work conditions",
    title: "Find out if training was ever the problem",
    text: "Four research-backed questions about opportunity, manager support, time and tools. A “No” marks the link it blocks, because the strongest course can’t beat a workplace that won’t let people use it.",
    img: "/landing/conditions.webp",
    alt: "Four work-condition questions. Manager support is answered No and highlighted in coral.",
  },
  {
    kicker: "04 · Leave with a brief",
    title: "A decision your leaders can act on",
    text: "What you can say, what you can’t say yet, the cheapest next evidence, and the question that could prove you wrong. Copy it into an email or download it in one click.",
    img: "/landing/brief.webp",
    alt: "A decision brief headed “A business number moved. Nothing yet links it to the training,” with a suggested next decision for leaders.",
  },
];

const CLAIMS = [
  { claim: "The program improved coaching.", truth: "Managers completed it and rated it highly." },
  {
    claim: "Training drove the sales increase.",
    truth: "Sales rose in the same quarter as the training.",
  },
  {
    claim: "Our people are more capable now.",
    truth: "Participants say they feel more confident.",
  },
];

const PERSONAS = [
  {
    who: "L&D practitioners",
    need: "“My stakeholder wants to know if it worked.”",
    gets: "Honest wording for today’s report, and a small measurement plan for next time.",
  },
  {
    who: "L&D and talent leaders",
    need: "“Should we scale this, fix it or stop it?”",
    gets: "A suggested next decision with the evidence and its limits side by side.",
  },
  {
    who: "Consultants and evaluators",
    need: "“I need clients to see the gap themselves.”",
    gets: "A shared, visual way to walk a client from completion data to a real test.",
  },
];

const COMPARE: [string, string, string][] = [
  [
    "Question it answers",
    "How many people finished?",
    "What can we honestly claim, and what next?",
  ],
  ["What it needs", "An LMS integration and clean data", "Two minutes and what you already know"],
  ["What you get", "Charts", "A decision brief in plain language"],
  ["Work environment", "Not considered", "Four research-backed barrier checks"],
  ["Limits", "Rarely stated", "Stated on every link"],
];

const PLANS = [
  {
    name: "Evidence Check",
    price: "Free",
    status: "Available now",
    blurb: "The two-minute check for one program.",
    features: [
      "Seven-link evidence chain",
      "Work-condition barrier check",
      "Decision brief: copy or download",
      "No sign-up; nothing leaves your browser",
    ],
    cta: true,
  },
  {
    name: "Evidence Plan",
    price: "Coming soon",
    status: "In development",
    blurb: "Everything you need to run the next test.",
    features: [
      "Observation rubric builder",
      "Survey item bank by chain link",
      "Six-week pilot plan template",
      "Branded PDF brief",
    ],
    cta: false,
  },
  {
    name: "Team",
    price: "Coming soon",
    status: "Planned",
    blurb: "For L&D functions reviewing a portfolio.",
    features: [
      "Shared briefs across programs",
      "Portfolio view of evidence gaps",
      "Workshop facilitation kit",
      "Priority support",
    ],
    cta: false,
  },
];

const FAQ = [
  {
    q: "Does it calculate ROI or predict impact?",
    a: "No, on purpose. It shows what your evidence can support and what it can’t. Rule-based suggestions never claim a result the data doesn’t show.",
  },
  {
    q: "Is my information saved or shared?",
    a: "No. The Evidence Check runs entirely in your browser. Nothing you tick is stored or sent anywhere.",
  },
  {
    q: "What is it based on?",
    a: "Peer-reviewed research on training evaluation and transfer, including meta-analyses by Alliger et al. (1997), Arthur et al. (2003) and Blume et al. (2010). Sources are cited in the tool.",
  },
  {
    q: "Do I need to know research methods?",
    a: "No. Every link explains itself in plain language, and Kirkpatrick levels are labeled for people who already use them.",
  },
  {
    q: "Is the worked example real?",
    a: "No. Northstar Services is a fictional organization, clearly labeled, used to show the full process end to end.",
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

function ScrollStory() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["index"]));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp-story">
      <div className="lp-story-stage" aria-hidden>
        <div className="lp-frame">
          <div className="lp-frame-bar">
            <i />
            <i />
            <i />
            <span>evidence-studio · Evidence Check</span>
          </div>
          <div className="lp-frame-screen">
            {STEPS.map((s, i) => (
              <img
                key={s.img}
                src={s.img}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className={i === active ? "on" : ""}
              />
            ))}
          </div>
        </div>
        <ol className="lp-rail">
          {STEPS.map((s, i) => (
            <li key={s.img} className={i === active ? "on" : i < active ? "done" : ""} />
          ))}
        </ol>
      </div>
      <div className="lp-story-steps">
        {STEPS.map((s, i) => (
          <section
            key={s.img}
            data-index={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={`lp-step ${i === active ? "on" : ""}`}
            aria-labelledby={`lp-step-${i}`}
          >
            <p className="ec-label">{s.kicker}</p>
            <h3 id={`lp-step-${i}`}>{s.title}</h3>
            <p>{s.text}</p>
            <img src={s.img} alt={s.alt} loading="lazy" className="lp-step-img" />
          </section>
        ))}
      </div>
    </div>
  );
}

function ClaimCard({ claim, truth, index }: { claim: string; truth: string; index: number }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`lp-claim ${inView ? "in" : ""}`}
      style={{ "--d": `${index * 160}ms` } as React.CSSProperties}
    >
      <p className="lp-claim-x">
        <span className="lp-strike">{claim}</span>
        <span className="sr-only"> (not supported by this evidence)</span>
      </p>
      <p className="lp-claim-ok">
        <span className="ec-label">What the data supports</span>
        {truth}
      </p>
    </div>
  );
}

export function Landing() {
  return (
    <div className="ec lp">
      {/* Hero */}
      <section className="ec-wrap lp-hero" aria-labelledby="lp-title">
        <div className="lp-hero-copy">
          <p className="lp-pill">
            <span className="lp-dotlive" aria-hidden /> Evidence Studio · free preview
          </p>
          <h1 id="lp-title">
            Before you report training impact, <em>check what you can prove.</em>
          </h1>
          <p className="lp-lede">
            A two-minute evidence check for L&amp;D teams. See which claims your data supports, what
            might be getting in the way, and the cheapest evidence to collect next. Leave with a
            brief your leaders can act on.
          </p>
          <div className="lp-ctas">
            <Link to="/check" className="lp-btn primary">
              Run a free check <span aria-hidden>→</span>
            </Link>
            <a href="#how" className="lp-btn ghost">
              See how it works
            </a>
          </div>
          <ul className="lp-trust">
            <li>No sign-up</li>
            <li>Nothing leaves your browser</li>
            <li>Built on peer-reviewed research</li>
          </ul>
        </div>
        <div className="lp-hero-visual" aria-hidden>
          <div className="lp-tilt">
            <div className="lp-frame">
              <div className="lp-frame-bar">
                <i />
                <i />
                <i />
                <span>evidence-studio · Evidence Check</span>
              </div>
              <div className="lp-frame-screen">
                <img src="/landing/chain.webp" alt="" className="on" />
              </div>
            </div>
            <span className="lp-float f1">
              <b>●</b> Measured ≠ caused
            </span>
            <span className="lp-float f2">
              <b className="coral">!</b> Barrier: manager support
            </span>
            <span className="lp-float f3">
              <b className="dark">○</b> 4 links still unknown
            </span>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="ec-wrap lp-section" aria-labelledby="lp-problem">
        <p className="ec-label">The problem</p>
        <h2 id="lp-problem" className="lp-h2">
          Most training reports claim more than their data can show.
        </h2>
        <p className="lp-sub">
          Completion and satisfaction are useful. They just can’t show that work changed, and
          research shows feel-good ratings relate only weakly to on-the-job behavior.
        </p>
        <div className="lp-claims">
          {CLAIMS.map((c, i) => (
            <ClaimCard key={c.claim} {...c} index={i} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="ec-wrap lp-section" aria-labelledby="lp-how">
        <p className="ec-label">How it works</p>
        <h2 id="lp-how" className="lp-h2">
          Four steps. About two minutes.
        </h2>
        <ScrollStory />
      </section>

      {/* Who it's for */}
      <section className="ec-wrap lp-section" aria-labelledby="lp-who">
        <p className="ec-label">Who it’s for</p>
        <h2 id="lp-who" className="lp-h2">
          Built for the people who get asked “did it work?”
        </h2>
        <div className="lp-personas">
          {PERSONAS.map((p) => (
            <article key={p.who} className="lp-persona">
              <h3>{p.who}</h3>
              <p className="lp-need">{p.need}</p>
              <p className="lp-gets">{p.gets}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Difference */}
      <section className="ec-wrap lp-section" aria-labelledby="lp-diff">
        <p className="ec-label">Why it’s different</p>
        <h2 id="lp-diff" className="lp-h2">
          Other tools help you look good. <em>This one helps you be right.</em>
        </h2>
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Comparison</span>
                </th>
                <th scope="col">Typical learning dashboards</th>
                <th scope="col" className="us">
                  Evidence Studio
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, a, b]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{a}</td>
                  <td className="us">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Research */}
      <section className="ec-wrap lp-section" aria-labelledby="lp-research">
        <p className="ec-label">Evidence-based by design</p>
        <h2 id="lp-research" className="lp-h2">
          Every rule traces back to research.
        </h2>
        <div className="lp-stats">
          <div>
            <b>Reactions</b>
            <span>relate weakly to job behavior</span>
            <cite>Alliger et al., 1997</cite>
          </div>
          <div>
            <b>Training works</b>
            <span>when designed well, with medium-to-large effects</span>
            <cite>Arthur et al., 2003</cite>
          </div>
          <div>
            <b>Environment</b>
            <span>strongly shapes whether learning gets used</span>
            <cite>Blume et al., 2010</cite>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="ec-wrap lp-section" id="pricing" aria-labelledby="lp-pricing">
        <p className="ec-label">Pricing</p>
        <h2 id="lp-pricing" className="lp-h2">
          Free while in preview.
        </h2>
        <p className="lp-sub">
          The Evidence Check is free. Paid plans are being designed with early users; nothing below
          is for sale yet.
        </p>
        <div className="lp-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`lp-plan ${p.cta ? "featured" : ""}`}>
              <p className="lp-status">{p.status}</p>
              <h3>{p.name}</h3>
              <p className="lp-price">{p.price}</p>
              <p className="lp-plan-blurb">{p.blurb}</p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {p.cta ? (
                <Link to="/check" className="lp-btn primary block">
                  Run a free check →
                </Link>
              ) : (
                <p className="lp-soon">Not available yet</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="ec-wrap lp-section lp-faq-wrap" aria-labelledby="lp-faq">
        <div>
          <p className="ec-label">Questions</p>
          <h2 id="lp-faq" className="lp-h2">
            Straight answers.
          </h2>
          <div className="lp-maker">
            <p className="ec-label">Made by</p>
            <p className="lp-maker-name">Dennis Griffin, Ed.D.</p>
            <p>
              Learning and development leader working across adult learning, performance consulting,
              measurement and UX.
            </p>
            <Link to="/about">About the creator →</Link>
          </div>
        </div>
        <div className="lp-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="ec-wrap lp-final" aria-labelledby="lp-final">
        <h2 id="lp-final">
          Training was completed. <em>Did work change?</em>
        </h2>
        <p>Find out what you can honestly say in about two minutes.</p>
        <Link to="/check" className="lp-btn primary">
          Run a free check <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
