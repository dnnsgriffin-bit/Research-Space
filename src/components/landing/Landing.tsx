import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeroChain } from "./HeroChain";
import { GuidedDemo } from "./GuidedDemo";
import { PERSONAL_SITE } from "./ProductChrome";
import {
  DEFAULT_ANSWERS,
  barriersByLink,
  buildCheckBrief,
  chainStates,
} from "@/lib/evidence-check";
import { BriefChain } from "@/components/check/BriefChain";

/**
 * Evidence Studio product landing page. Presentation only: it never reads or writes
 * Studio data. The live pieces (hero chain, guided demo, sample brief) run the real
 * rules engine on example inputs, which are labeled as examples.
 */

const PAPERS = [
  {
    finding:
      "Across 34 studies, satisfaction-style reactions were only weakly related to learning and on-the-job behavior.",
    cite: "Alliger et al. (1997), Personnel Psychology",
    href: "https://doi.org/10.1111/j.1744-6570.1997.tb00911.x",
  },
  {
    finding:
      "In a longitudinal study, reactions were generally unrelated to later job behavior; transfer climate predicted it.",
    cite: "Warr, Allan & Birdi (1999), J. Occupational & Organizational Psychology",
    href: "https://doi.org/10.1348/096317999166725",
  },
  {
    finding:
      "Organizational training showed medium-to-large average effects on learning, behavior and results criteria.",
    cite: "Arthur et al. (2003), Journal of Applied Psychology",
    href: "https://doi.org/10.1037/0021-9010.88.2.234",
  },
  {
    finding:
      "Across 89 studies, a supportive work environment was among the predictors positively related to transfer.",
    cite: "Blume et al. (2010), Journal of Management",
    href: "https://doi.org/10.1177/0149206309352880",
  },
  {
    finding:
      "A review identified opportunity to perform, supervisor support and follow-up as consistent work-environment factors in transfer.",
    cite: "Grossman & Salas (2011), Int. Journal of Training and Development",
    href: "https://doi.org/10.1111/j.1468-2419.2011.00373.x",
  },
  {
    finding:
      "In one meta-analysis, peer, supervisor and organizational support together accounted for about 32% of the variance in transfer in the regression model.",
    cite: "Hughes et al. (2020), Human Factors",
    href: "https://pubmed.ncbi.nlm.nih.gov/31136198/",
  },
];

const CLAIMS = [
  { claim: "The program improved coaching.", truth: "Managers completed it and rated it highly." },
  { claim: "Training drove the sales increase.", truth: "Sales rose in the same quarter." },
  {
    claim: "Our people are more capable now.",
    truth: "Participants say they feel more confident.",
  },
];

const AUDIENCES = [
  {
    who: "L&D practitioners",
    ask: "“My stakeholder wants to know if it worked.”",
    get: "Honest wording for today’s report and a small plan for next time.",
  },
  {
    who: "L&D and talent leaders",
    ask: "“Do we scale this, fix it, or stop it?”",
    get: "A suggested next decision, with the evidence and its limits side by side.",
  },
  {
    who: "Executives and finance",
    ask: "“What are we actually getting for this spend?”",
    get: "A one-page answer that separates what happened from what was assumed.",
  },
  {
    who: "Consultants and evaluators",
    ask: "“I need the client to see the gap themselves.”",
    get: "A visual way to walk from completion data to a credible test.",
  },
];

const COMPARE: [string, string, string][] = [
  ["The question", "How many people finished?", "What can we honestly claim, and what next?"],
  ["What it needs", "Integrations and clean data", "Two minutes and what you already know"],
  ["What you get", "Charts and completion rates", "A decision brief in plain language"],
  ["The workplace", "Not considered", "Four research-backed barrier checks"],
  ["Limits", "Rarely stated", "Stated on every link"],
];

const PLANS = [
  {
    name: "Prototype",
    price: "Free",
    note: "Available now",
    blurb: "The full Evidence Check, for one program at a time.",
    features: [
      "Seven-link evidence chain",
      "Work-condition barrier check",
      "Decision brief to copy or download",
      "No sign-up; nothing leaves your browser",
    ],
    cta: { kind: "app" as const, label: "Try the prototype" },
    featured: true,
  },
  {
    name: "Evidence Plan",
    price: "Founding pricing",
    note: "Planned",
    blurb: "Everything you need to run the next test.",
    features: [
      "Observation rubric builder",
      "Survey item bank for each link",
      "Six-week pilot plan template",
      "Branded PDF brief",
    ],
    cta: null,
    featured: false,
  },
  {
    name: "Teams & enterprise",
    price: "Let’s talk",
    note: "By conversation",
    blurb: "For L&D functions reviewing a portfolio of programs.",
    features: [
      "Facilitated evidence workshops",
      "Portfolio review of evidence gaps",
      "Rules tuned to your measures",
      "Guidance from a learning scientist",
    ],
    cta: { kind: "site" as const, label: "Start a conversation" },
    featured: false,
  },
];

const FAQ = [
  {
    q: "Does it calculate ROI or predict impact?",
    a: "No, on purpose. It shows what your evidence can support and what it can’t. The rules never claim a result your data doesn’t show.",
  },
  {
    q: "Is my information saved or shared?",
    a: "No. The Evidence Check runs entirely in your browser. Nothing you tick is stored or sent anywhere.",
  },
  {
    q: "Is this a finished product?",
    a: "It’s a working prototype. The core check is complete and free to use. Paid plans are being shaped with early users, and nothing is for sale yet.",
  },
  {
    q: "Do I need to know research methods?",
    a: "No. Every link explains itself in plain language, and Kirkpatrick levels are labeled for people who already use them.",
  },
  {
    q: "How is it different from Kirkpatrick or LTEM?",
    a: "Those are frameworks for planning evaluation. Evidence Studio applies that thinking to your program in minutes, adds the work environment, and ends with a decision.",
  },
];

function useInView<T extends HTMLElement>(threshold = 0.35) {
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
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function Claim({ claim, truth, i }: { claim: string; truth: string; i: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`l-claim ${inView ? "in" : ""}`}
      style={{ "--d": `${i * 180}ms` } as React.CSSProperties}
    >
      <p className="l-claim-x">
        <span className="l-strike">{claim}</span>
        <span className="sr-only"> (not supported by this evidence)</span>
      </p>
      <p className="l-claim-ok">
        <span>What the data supports</span>
        {truth}
      </p>
    </div>
  );
}

const SAMPLE_MEASURES = ["completion", "satisfaction", "business"];

function SampleBrief() {
  const brief = useMemo(
    () =>
      buildCheckBrief(["completion", "satisfaction", "business"], {
        ...DEFAULT_ANSWERS,
        manager: "no",
      }),
    [],
  );
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className={`l-artifact ${inView ? "in" : ""}`}>
      <article className="l-paper" aria-label="Sample decision brief (example inputs)">
        <p className="l-paper-k">Training evidence brief · example</p>
        <p className="l-paper-prov">
          Example inputs: completion, a satisfaction survey, a tracked business metric, and manager
          support answered No. Illustrative, not real data.
        </p>
        <h3>{brief.headline}</h3>
        <BriefChain
          states={chainStates(SAMPLE_MEASURES)}
          barriers={barriersByLink({ ...DEFAULT_ANSWERS, manager: "no" })}
        />
        <div className="l-paper-dec">
          <span aria-hidden>→</span>
          <div>
            <p className="l-paper-k gold">Suggested next decision</p>
            <p>{brief.decision}</p>
          </div>
        </div>
        <div className="l-paper-cols">
          <div>
            <p className="l-paper-k">You can say</p>
            <ul>
              {brief.canSay.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="l-paper-note">{brief.resultsNote}</p>
          </div>
          <div>
            <p className="l-paper-k red">You can’t say yet</p>
            <ul>
              {brief.cannotSay.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="l-paper-q">
          <p className="l-paper-k red">What would make this wrong?</p>
          <p className="q">{brief.question}</p>
        </div>
      </article>
      <ol className="l-notes" aria-label="What the brief gives you">
        <li style={{ "--d": "200ms" } as React.CSSProperties}>
          <b>Plain-language claims</b> Wording you can put in a report without overreaching.
        </li>
        <li style={{ "--d": "380ms" } as React.CSSProperties}>
          <b>A decision for leaders</b> Scale, fix or test, with the reason stated.
        </li>
        <li style={{ "--d": "560ms" } as React.CSSProperties}>
          <b>The honest limits</b> What the evidence can’t show yet, named up front.
        </li>
        <li style={{ "--d": "740ms" } as React.CSSProperties}>
          <b>A built-in challenge</b> The one question that could prove the plan wrong.
        </li>
      </ol>
    </div>
  );
}

const VIDEO_STEPS = [
  "Opening: “Training was completed. Did work change?” Completion and satisfaction light only the first link of the evidence chain, while leaders ask about the later links. All inputs in the film are examples.",
  "Start from the report you already have. Choosing “Completion + satisfaction survey” lights only the first link.",
  "Tick what you actually measured. Adding a knowledge check and observed behavior lights Learning and Transfer.",
  "See how far an honest claim can reach, and open any link to see what it can’t prove yet.",
  "Have the numbers? Add them. The example types 78 and 64 for a knowledge check.",
  "Check the workplace. A “No” on manager support marks a barrier to verify before you blame the training.",
  "Leave with a brief your leaders can act on, with your numbers quoted back and their limits stated, then copy it with its example label.",
  "Closing: “Know what you can claim before someone asks.” Evidence Studio is free while it’s a prototype.",
];

function VideoDemo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Keyboard users keep their place: focus moves from the poster button into the player.
  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);
  return (
    <>
      <div className="l-video">
        {playing ? (
          <video
            ref={videoRef}
            src="/demo/evidence-studio-film.mp4"
            poster="/demo/film-poster.webp"
            controls
            autoPlay
            playsInline
            tabIndex={0}
            aria-label="Product film: a one-minute walkthrough of the Evidence Check with music and on-screen text. Captions are available, and a transcript follows the video."
            aria-describedby="l-video-transcript"
          >
            <track
              kind="captions"
              src="/demo/evidence-studio-film.vtt"
              srcLang="en"
              label="English"
            />
          </video>
        ) : (
          <button type="button" className="l-video-poster" onClick={() => setPlaying(true)}>
            <img src="/demo/film-poster.webp" alt="" loading="lazy" />
            <span className="l-play" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="l-video-label">
              <b>Watch the one-minute film</b>
              <span>Music and on-screen text · captions available · example inputs</span>
            </span>
          </button>
        )}
      </div>
      <details className="l-transcript" id="l-video-transcript">
        <summary>Read the film as text</summary>
        <ol>
          {VIDEO_STEPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </details>
    </>
  );
}

export function Landing() {
  return (
    <div className="ec l">
      <div className="l-grain" aria-hidden />

      {/* 1 · Hero */}
      <section className="l-hero" aria-labelledby="l-title">
        <div className="l-wrap l-hero-copy">
          <p className="l-badge">
            <span className="l-badge-dot" aria-hidden />
            Prototype · early access is open
          </p>
          <h1 id="l-title">
            Training was completed.
            <br />
            <em>Did work change?</em>
          </h1>
          <p className="l-lede">
            Evidence Studio is a two-minute evidence check for learning teams. See what your data
            can honestly support, what the workplace may be blocking, and what to measure next,
            before anyone asks.
          </p>
          <div className="l-ctas">
            <Link to="/check" className="l-btn primary">
              Try the prototype <span aria-hidden>→</span>
            </Link>
            <a href="#sample-brief" className="l-btn ghost">
              See a sample brief
            </a>
            <a href="#demo" className="l-btn ghost">
              <span className="l-btn-play" aria-hidden>
                ▶
              </span>
              Watch the demo
            </a>
          </div>
        </div>
        <div className="l-wrap l-hero-instrument">
          <HeroChain />
        </div>
        <div className="l-wrap">
          <ul className="l-proof" aria-label="Why you can trust it">
            <li>
              <b>Built on peer-reviewed research</b> Alliger · Arthur · Blume · Warr
            </li>
            <li>
              <b>Kirkpatrick levels built in</b> No new jargon to learn
            </li>
            <li>
              <b>Private by design</b> No sign-up; nothing leaves your browser
            </li>
            <li>
              <b>Made by a learning scientist</b> Dennis Griffin, Ed.D.
            </li>
          </ul>
        </div>
      </section>

      {/* 2 · The question */}
      <section className="l-wrap l-sec" aria-labelledby="l-q">
        <p className="l-eyebrow">The question every learning leader gets</p>
        <h2 id="l-q" className="l-h2">
          “So, did the training work?”
          <br />
          <span className="dim">Completion data can’t answer that.</span>
        </h2>
        <p className="l-sub">
          Completion and satisfaction are useful, but research shows feel-good ratings relate only
          weakly to what people do at work. Here’s what typical reports claim, and what the data
          behind them actually supports.
        </p>
        <div className="l-claims">
          {CLAIMS.map((c, i) => (
            <Claim key={c.claim} {...c} i={i} />
          ))}
        </div>
      </section>

      {/* 3 · Guided demo */}
      <section id="how" className="l-wrap l-sec" aria-labelledby="l-how">
        <h2 id="l-how" className="l-h2">
          Five moves. About two minutes.
          <br />
          <span className="dim">Scroll to watch one run.</span>
        </h2>
        <GuidedDemo />
      </section>

      {/* 4 · The output */}
      <section id="sample-brief" className="l-wrap l-sec" aria-labelledby="l-out">
        <p className="l-eyebrow">What you walk away with</p>
        <h2 id="l-out" className="l-h2">
          One page your leaders will actually read.
        </h2>
        <p className="l-sub">
          Generated by the same rules you just watched, from example inputs: completion, a
          satisfaction survey, a business metric, and weak manager support.
        </p>
        <SampleBrief />
      </section>

      {/* 5 · Video */}
      <section id="demo" className="l-wrap l-sec" aria-labelledby="l-demo">
        <p className="l-eyebrow">See the real thing</p>
        <h2 id="l-demo" className="l-h2">
          Watch a full check, start to finish.
        </h2>
        <VideoDemo />
      </section>

      {/* 6 · Audiences */}
      <section className="l-wrap l-sec" aria-labelledby="l-who">
        <p className="l-eyebrow">Who it’s for</p>
        <h2 id="l-who" className="l-h2">
          For everyone who gets asked “did it work?”
        </h2>
        <div className="l-aud">
          {AUDIENCES.map((a) => (
            <article key={a.who} className="l-aud-card">
              <h3>{a.who}</h3>
              <p className="ask">{a.ask}</p>
              <p className="get">{a.get}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 7 · Difference */}
      <section className="l-wrap l-sec" aria-labelledby="l-diff">
        <p className="l-eyebrow">Why it’s different</p>
        <h2 id="l-diff" className="l-h2">
          Most tools help you look good.
          <br />
          <em>This one helps you be right.</em>
        </h2>
        <div className="l-table-wrap">
          <table className="l-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Compared on</span>
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
                  <td data-label="Typical learning dashboards">{a}</td>
                  <td className="us" data-label="Evidence Studio">
                    {b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8 · Science */}
      <section className="l-wrap l-sec" aria-labelledby="l-sci">
        <p className="l-eyebrow">Evidence-based by design</p>
        <h2 id="l-sci" className="l-h2">
          The research behind the rules.
        </h2>
        <p className="l-sub">
          The rules are deliberately simple and transparent. These studies shaped what the check
          looks for. Some details, such as the order of suggested next steps, are design choices for
          this prototype, not research findings. Kirkpatrick levels appear as a rough
          cross-reference.
        </p>
        <div className="l-papers">
          {PAPERS.map((p) => (
            <a key={p.cite} href={p.href} target="_blank" rel="noopener" className="l-paper-link">
              <p>{p.finding}</p>
              <span>
                {p.cite} <span aria-hidden>↗</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 9 · About */}
      <section id="about" className="l-wrap l-sec" aria-labelledby="l-about">
        <div className="l-about">
          <figure className="l-portrait">
            <img
              src="/about/dennis-griffin.webp"
              alt="Portrait of Dennis Griffin"
              width={800}
              height={636}
              loading="lazy"
            />
          </figure>
          <div className="l-about-copy">
            <p className="l-eyebrow">Made by a learning scientist</p>
            <h2 id="l-about" className="l-h2">
              Dennis Griffin, Ed.D.
            </h2>
            <p className="l-about-lede">
              A learning scientist, mixed-methods researcher and learning and development leader
              with more than 20 years of experience helping organizations understand what works,
              what doesn’t, and what to do next.
            </p>
            <p>
              His work spans learning and development, adult learning, UX research, measurement and
              evaluation, workforce development and organizational strategy. He has led research and
              learning work at Allstate and Nationwide, with further experience in healthcare and
              higher education.
            </p>
            <blockquote>“Make evidence useful, not just interesting.”</blockquote>
            <ul className="l-creds">
              <li>Ed.D., Leadership, Adult and Organizational Learning</li>
              <li>Ed.S., Adult Learning and Workforce Development</li>
              <li>
                Master’s degrees in Human Resources Management and in Training and Development
              </li>
              <li>Bachelor’s degree in Psychology</li>
            </ul>
            <a href={PERSONAL_SITE} target="_blank" rel="noopener" className="l-btn ghost">
              Visit DennisRGriffin.com <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10 · Pricing */}
      <section id="pricing" className="l-wrap l-sec" aria-labelledby="l-price">
        <h2 id="l-price" className="l-h2">
          Free while it’s a prototype.
        </h2>
        <p className="l-sub">
          Use the full Evidence Check today. Paid plans are being shaped with early users, and
          nothing below is for sale yet.
        </p>
        <div className="l-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`l-plan ${p.featured ? "featured" : ""}`}>
              <p className="l-plan-note">{p.note}</p>
              <h3>{p.name}</h3>
              <p className="l-plan-price">{p.price}</p>
              <p className="l-plan-blurb">{p.blurb}</p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {p.cta?.kind === "app" && (
                <Link to="/check" className="l-btn primary block">
                  {p.cta.label} <span aria-hidden>→</span>
                </Link>
              )}
              {p.cta?.kind === "site" && (
                <a
                  href={PERSONAL_SITE}
                  target="_blank"
                  rel="noopener"
                  className="l-btn ghost block"
                >
                  {p.cta.label} <span aria-hidden>↗</span>
                </a>
              )}
              {!p.cta && <p className="l-soon">Not available yet</p>}
            </article>
          ))}
        </div>
      </section>

      {/* 11 · FAQ */}
      <section className="l-wrap l-sec l-faq" aria-labelledby="l-faq">
        <div>
          <h2 id="l-faq" className="l-h2">
            Straight answers.
          </h2>
        </div>
        <div className="l-faq-list">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 12 · Final */}
      <section className="l-final" aria-labelledby="l-final">
        <div className="l-wrap">
          <h2 id="l-final">
            Know what you can claim
            <br />
            <em>before someone asks.</em>
          </h2>
          <p>Free, private, and about two minutes.</p>
          <Link to="/check" className="l-btn primary">
            Try the prototype <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
