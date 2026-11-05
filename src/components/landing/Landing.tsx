import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeroChain } from "./HeroChain";
import { GuidedDemo } from "./GuidedDemo";
import { PERSONAL_SITE } from "./ProductChrome";
import { DEFAULT_ANSWERS, buildCheckBrief } from "@/lib/evidence-check";

/**
 * Evidence Studio product landing page. Presentation only: it never reads or writes
 * Studio data. The live pieces (hero chain, guided demo, sample brief) run the real
 * rules engine on example inputs, which are labeled as examples.
 */

const PAPERS = [
  {
    finding: "Satisfaction and “feel-good” reactions relate weakly to on-the-job behavior.",
    cite: "Alliger et al. (1997), Personnel Psychology",
    href: "https://consensus.app/papers/details/f5473c748d7c51fa8f0ca951d9d61952/",
  },
  {
    finding:
      "Reactions were generally unrelated to later job behavior; transfer climate predicted it.",
    cite: "Warr, Allan & Birdi (1999), J. Occupational & Organizational Psychology",
    href: "https://consensus.app/papers/details/0046cfdf47c258c7a0b02e1e0c84f69a/",
  },
  {
    finding: "Well-designed training works, with medium-to-large effects on behavior and results.",
    cite: "Arthur et al. (2003), Journal of Applied Psychology",
    href: "https://consensus.app/papers/details/281bf20e0b1c564988560bfa5b7dea5f/",
  },
  {
    finding: "A supportive work environment is among the strongest predictors of transfer.",
    cite: "Blume et al. (2010), Journal of Management",
    href: "https://consensus.app/papers/details/68f4fe1840045a3b830f8f2fc86ce1f8/",
  },
  {
    finding: "Opportunity to perform, supervisor support and follow-up matter most after training.",
    cite: "Grossman & Salas (2011), Int. Journal of Training and Development",
    href: "https://consensus.app/papers/details/734bcc29b2d75149baae30ca0d585a89/",
  },
  {
    finding: "Peer, supervisor and organizational support explain about a third of transfer.",
    cite: "Hughes et al. (2020), Human Factors",
    href: "https://consensus.app/papers/details/1e48779bb1555b11973b7d2111eb7f32/",
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
        <h3>{brief.headline}</h3>
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

function VideoDemo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="l-video">
      {playing ? (
        <video
          src="/demo/evidence-check-demo.mp4"
          poster="/demo/poster.webp"
          controls
          autoPlay
          playsInline
          aria-label="Walkthrough of the Evidence Check with on-screen captions"
        />
      ) : (
        <button type="button" className="l-video-poster" onClick={() => setPlaying(true)}>
          <img src="/demo/poster.webp" alt="" loading="lazy" />
          <span className="l-play" aria-hidden>
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
          <span className="l-video-label">
            <b>Watch the walkthrough</b>
            <span>About 45 seconds · captions on screen</span>
          </span>
        </button>
      )}
    </div>
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
        <p className="l-eyebrow">How it works</p>
        <h2 id="l-how" className="l-h2">
          Five moves. About two minutes.
          <br />
          <span className="dim">Scroll to watch one run.</span>
        </h2>
        <GuidedDemo />
      </section>

      {/* 4 · The output */}
      <section className="l-wrap l-sec" aria-labelledby="l-out">
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
                  <td>{a}</td>
                  <td className="us">{b}</td>
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
          Every rule traces back to research.
        </h2>
        <p className="l-sub">
          The engine is deliberately simple and transparent. Each rule reflects decades of
          peer-reviewed work on training evaluation and transfer.
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
        <p className="l-eyebrow">Pricing</p>
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
          <p className="l-eyebrow">Questions</p>
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
