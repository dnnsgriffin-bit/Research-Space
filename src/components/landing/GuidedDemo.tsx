import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CHAIN,
  DEFAULT_ANSWERS,
  buildCheckBrief,
  chainStates,
  claimReach,
  reachMessage,
} from "@/lib/evidence-check";
import { GENERIC_PROVENANCE } from "@/lib/chain-provenance";

/* --------------------------------------------------------------------------
 * A guided, scroll-driven walkthrough of the Evidence Check.
 * The mock is drawn at a fixed design size (W x H) and scaled to fit, so the
 * scripted cursor always lands on the right control at any screen width.
 * Every label and sentence comes from the real engine and content files.
 * ------------------------------------------------------------------------ */

const W = 1000;
const H = 600;
const NODE_X = CHAIN.map((_, i) => 80 + i * 140);
const NODE_Y = 74;

const CHIPS = [
  { id: "completion", label: "Completion", kp: "Participation", x: 56, y: 262 },
  { id: "satisfaction", label: "Satisfaction survey", kp: "Kirkpatrick L1", x: 266, y: 262 },
  { id: "knowledge", label: "Quiz score", kp: "Kirkpatrick L2", x: 56, y: 330 },
  { id: "behavior", label: "Observed on the job", kp: "Kirkpatrick L3", x: 266, y: 330 },
  { id: "output", label: "Work quality", kp: "Kirkpatrick L4", x: 56, y: 398 },
  { id: "business", label: "Business metric", kp: "Kirkpatrick L4", x: 266, y: 398 },
];
const chip = (id: string) => CHIPS.find((c) => c.id === id)!;
const center = (c: { x: number; y: number }): [number, number] => [c.x + 90, c.y + 24];

const MEASURED_FINAL = ["completion", "satisfaction", "business"];
const MANAGER_NO_X = 640;
const MANAGER_NO_Y = 330;
const COPY_XY: [number, number] = [118, 540];

/** Mobile crops, in design pixels, one per scene. */
const FOCUS = [
  { x: 24, y: 40, w: 470, h: 450 },
  { x: 0, y: 30, w: 1000, h: 470 },
  { x: 24, y: 170, w: 560, h: 470 },
  { x: 500, y: 180, w: 480, h: 320 },
  { x: 540, y: 200, w: 440, h: 380 },
];

const FINAL_REACH = reachMessage(chainStates(MEASURED_FINAL));
const FINAL_BRIEF = buildCheckBrief(MEASURED_FINAL, { ...DEFAULT_ANSWERS, manager: "no" });

/** The essential outcome of each step as plain text: readable on phones and by screen readers. */
const RESULTS = [
  "Completion, a satisfaction survey and a business metric are ticked. Intervention and Business outcome light up: 2 of 7 links are observed.",
  `${FINAL_REACH.lead}${FINAL_REACH.link}. ${FINAL_REACH.note}`,
  `Transfer is unknown. ${GENERIC_PROVENANCE["transfer"]!.notEstablished[0]} Suggested next evidence: ${GENERIC_PROVENANCE["transfer"]!.nextEvidence[0]}`,
  "Manager support is answered No, so a reported barrier is marked on Transfer, to be verified before any decision.",
  `The example brief reads: “${FINAL_BRIEF.headline}” Suggested next decision: ${FINAL_BRIEF.decision}`,
];

type Step = { at: number; cursor?: [number, number]; click?: boolean };

/** Timed scripts, one per scene. `k` = number of steps completed. */
const SCRIPTS: Step[][] = [
  [
    { at: 500, cursor: center(chip("completion")) },
    { at: 1050, click: true },
    { at: 1650, cursor: center(chip("satisfaction")) },
    { at: 2150, click: true },
    { at: 2850, cursor: center(chip("business")) },
    { at: 3350, click: true },
    { at: 4100, cursor: [760, 470] },
  ],
  [{ at: 300, cursor: [820, 500] }],
  [
    { at: 500, cursor: [NODE_X[4]!, NODE_Y] },
    { at: 1100, click: true },
    { at: 1700, cursor: [900, 540] },
  ],
  [
    { at: 500, cursor: [MANAGER_NO_X, MANAGER_NO_Y] },
    { at: 1100, click: true },
    { at: 1800, cursor: [NODE_X[4]! + 30, NODE_Y + 40] },
  ],
  [
    { at: 500, cursor: COPY_XY },
    { at: 1050, click: true },
    { at: 1700, cursor: [700, 560] },
  ],
];

const HEAD_BASE = "The furthest measured link is ";

const EMAIL =
  "Here’s where the coaching program stands. We have completion, a satisfaction survey and a tracked business metric. Nothing yet shows whether managers coach differently, and they reported weak manager support, which we should check. I suggest verifying that and running a short observation before we decide whether to scale.";

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const u = () => setR(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return r;
}

function useTyping(text: string, start: boolean, speed = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) {
      setN(0);
      return;
    }
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, start, speed]);
  return text.slice(0, n);
}

export function DemoStage({
  scene,
  playing,
  label,
}: {
  scene: number;
  playing: boolean;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(600);
  const script = SCRIPTS[scene]!;
  const [k, setK] = useState(0);
  const [run, setRun] = useState(0);
  const [clickAt, setClickAt] = useState<[number, number] | null>(null);
  const [cursor, setCursor] = useState<[number, number]>([760, 470]);
  const end = reduced || !playing;
  // On narrow screens, zoom into the part of the mock that matters for this step.
  const f = cw < 640 ? FOCUS[scene]! : { x: 0, y: 0, w: W, h: H };
  const scale = cw / f.w;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setK(0);
    setClickAt(null);
    if (end) return;
    let cur: [number, number] = [760, 470];
    const timers = script.map((s, i) =>
      window.setTimeout(() => {
        if (s.cursor) {
          cur = s.cursor;
          setCursor(s.cursor);
        }
        if (s.click) setClickAt([...cur]);
        setK(i + 1);
      }, s.at),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [scene, end, run, script]);

  const kk = end ? script.length : k;

  // Derived state per scene.
  const measured =
    scene === 0 ? MEASURED_FINAL.filter((_, i) => kk >= [2, 4, 6][i]!) : MEASURED_FINAL;
  const managerNo = scene === 3 ? kk >= 2 : scene > 3;
  const answers = {
    ...DEFAULT_ANSWERS,
    manager: managerNo ? ("no" as const) : ("unsure" as const),
  };
  const states = useMemo(() => chainStates(measured), [measured.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const reach = claimReach(states);
  const brief = useMemo(
    () => buildCheckBrief(MEASURED_FINAL, { ...DEFAULT_ANSWERS, manager: "no" }),
    [],
  );
  const selectedTransfer = scene === 2 && kk >= 2;
  const copied = scene === 4 && kk >= 2;
  const composeOpen = scene === 4 && kk >= 3;

  const headline = `${HEAD_BASE}Business outcome.`;
  const typedHead = useTyping(headline, scene === 1 && !end, 26);
  const shownHead = scene === 1 && !end ? typedHead : headline;
  const headDone = shownHead.length === headline.length;
  const typedEmail = useTyping(EMAIL, composeOpen && !end, 18);
  const shownEmail = end && scene === 4 ? EMAIL : typedEmail;

  const t = GENERIC_PROVENANCE["transfer"]!;

  return (
    <div className="gd-stage">
      <div className="gd-chrome">
        <i />
        <i />
        <i />
        <span className="gd-url">evidence-studio · Evidence Check</span>
        {label && <span className="gd-steplabel">{label}</span>}
        {!reduced && playing && (
          <button type="button" className="gd-replay" onClick={() => setRun((r) => r + 1)}>
            ↻ Replay
          </button>
        )}
      </div>
      <div className="gd-fit" ref={wrapRef} style={{ height: f.h * scale }}>
        <div
          className={`gd-canvas scene-${scene} ${cw < 640 ? "narrow" : ""}`}
          style={{
            width: W,
            height: H,
            transform: `translate(${-f.x * scale}px, ${-f.y * scale}px) scale(${scale})`,
          }}
          aria-hidden
        >
          {/* Chain strip (all scenes except the brief) */}
          {scene !== 4 && (
            <div className="gd-chain">
              {CHAIN.map((n, i) => {
                const s = states[n.id]!;
                const prev = i ? states[CHAIN[i - 1]!.id] : null;
                return (
                  <div key={n.id} className={`gd-link ${s}`} style={{ left: NODE_X[i]! - 60 }}>
                    {i > 0 && (
                      <span
                        className={`gd-seg ${prev === "measured" && s === "measured" ? "lit" : prev !== "unknown" && s !== "unknown" ? "haze" : ""}`}
                      />
                    )}
                    <span
                      className={`gd-node ${selectedTransfer && n.id === "transfer" ? "sel" : ""}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                      {managerNo && n.id === "transfer" && <b className="gd-bang">!</b>}
                    </span>
                    <span className="gd-nname">{n.label}</span>
                    <span className="gd-nstate">{s}</span>
                  </div>
                );
              })}
              {scene === 1 && !end && <span key={run} className="gd-pulse assumed" />}
            </div>
          )}

          {/* Scene 0: measures */}
          {scene === 0 && (
            <>
              <div className="gd-panel" style={{ left: 36, top: 172, width: 450, height: 300 }}>
                <p className="gd-k">Step 1</p>
                <p className="gd-h">What did you measure?</p>
              </div>
              {CHIPS.map((c) => (
                <span
                  key={c.id}
                  className={`gd-chip ${measured.includes(c.id) ? "on" : ""}`}
                  style={{ left: c.x, top: c.y }}
                >
                  <i />
                  <span>
                    {c.label}
                    <small>{c.kp}</small>
                  </span>
                </span>
              ))}
              <div
                className="gd-panel gd-side"
                style={{ left: 516, top: 172, width: 448, height: 300 }}
              >
                <p className="gd-k">Claim reach</p>
                <p className="gd-big">
                  {reach.observedCount}
                  <span> of 7 links observed</span>
                </p>
                <p className="gd-p">
                  {reach.furthest >= 0
                    ? `Furthest measured link: ${CHAIN[reach.furthest]!.label}.`
                    : "Tick a measure to light the chain."}
                </p>
              </div>
            </>
          )}

          {/* Scene 1: reach */}
          {scene === 1 && (
            <div
              className="gd-panel gd-reach"
              style={{ left: 36, top: 190, width: 928, height: 300 }}
            >
              <p className="gd-k">Claim reach</p>
              <p className="gd-head">
                {shownHead.slice(0, HEAD_BASE.length)}
                {shownHead.length > HEAD_BASE.length && (
                  <em>{shownHead.slice(HEAD_BASE.length).replace(/\.$/, "")}</em>
                )}
                {headDone ? "." : <span className="gd-caret" />}
              </p>
              <p className={`gd-warn ${headDone ? "in" : ""}`}>{FINAL_REACH.note}</p>
              <div className={`gd-legend ${headDone ? "in" : ""}`}>
                <span>
                  <i className="m" />
                  Measured: observed, not proof of cause
                </span>
                <span>
                  <i className="a" />
                  Assumed
                </span>
                <span>
                  <i className="u" />
                  Unknown
                </span>
              </div>
            </div>
          )}

          {/* Scene 2: inspector */}
          {scene === 2 && (
            <div
              className={`gd-panel gd-insp ${selectedTransfer ? "in" : ""}`}
              style={{ left: 36, top: 186, width: 928, height: 360 }}
            >
              <div className="gd-insp-head">
                <div>
                  <p className="gd-k">Evidence inspector · 05 of 07</p>
                  <p className="gd-h">Transfer</p>
                </div>
                <span className="gd-badge">Unknown</span>
              </div>
              <div className="gd-cols">
                <div>
                  <p className="gd-k">What this link means</p>
                  <p className="gd-p">{t.known}</p>
                </div>
                <div>
                  <p className="gd-k coral">Does not establish</p>
                  <p className="gd-p">{t.notEstablished[0]}</p>
                </div>
              </div>
              <div className="gd-next">
                <p className="gd-k gold">Next evidence to collect</p>
                <p className="gd-p">{t.nextEvidence[0]}</p>
              </div>
            </div>
          )}
          {scene === 2 && !selectedTransfer && (
            <p className="gd-hint" style={{ left: 36, top: 300 }}>
              Select any link to see what it can and can’t establish.
            </p>
          )}

          {/* Scene 3: conditions */}
          {scene === 3 && (
            <>
              <div
                className="gd-panel gd-cond"
                style={{ left: 36, top: 196, width: 448, height: 200 }}
              >
                <p className="gd-q">Did people get regular chances to use it at work?</p>
                <p className="gd-p">No occasion to perform means no transfer.</p>
                <div className="gd-seg3" style={{ left: 22, top: 112 }}>
                  <span>Yes</span>
                  <span>No</span>
                  <span className="on">Not sure</span>
                </div>
              </div>
              <div
                className={`gd-panel gd-cond ${managerNo ? "no" : ""}`}
                style={{ left: 516, top: 196, width: 448, height: 200 }}
              >
                <p className="gd-q">Did managers expect and support its use?</p>
                <p className="gd-p">One of the strongest predictors of transfer.</p>
                <div className="gd-seg3" style={{ left: 22, top: 112 }}>
                  <span>Yes</span>
                  <span className={managerNo ? "on no" : ""}>No</span>
                  <span className={managerNo ? "" : "on"}>Not sure</span>
                </div>
              </div>
              <p
                className={`gd-barrier-note ${managerNo ? "in" : ""}`}
                style={{ left: 516, top: 420, width: 448 }}
              >
                <b>!</b> Reported barrier marked on Transfer, to verify. Weak manager support can
                limit whether people use what they learned.
              </p>
            </>
          )}

          {/* Scene 4: brief + email */}
          {scene === 4 && (
            <>
              <div className="gd-brief" style={{ left: 36, top: 28, width: 600, height: 548 }}>
                <p className="gd-k dark">Decision brief · example inputs</p>
                <p className="gd-bh">{brief.headline}</p>
                <div className="gd-dec">
                  <span>→</span>
                  <p>{brief.decision}</p>
                </div>
                <div className="gd-bcols">
                  <div>
                    <p className="gd-k dark">You can say</p>
                    <ul>
                      {brief.canSay.slice(0, 3).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="gd-k red">You can’t say yet</p>
                    <ul>
                      {brief.cannotSay.slice(0, 3).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span className={`gd-copy ${copied ? "done" : ""}`} style={{ left: 22, top: 492 }}>
                  {copied ? "Copied ✓" : "Copy brief"}
                </span>
              </div>
              <div
                className={`gd-mail ${composeOpen ? "in" : ""}`}
                style={{ left: 560, top: 214, width: 404, height: 352 }}
              >
                <p className="gd-mail-bar">New message · example</p>
                <p className="gd-mail-row">
                  <span>To</span> VP, Talent
                </p>
                <p className="gd-mail-row">
                  <span>Subject</span> Coaching program: what we can say
                </p>
                <p className="gd-mail-body">
                  {shownEmail}
                  {composeOpen && !end && shownEmail.length < EMAIL.length && (
                    <span className="gd-caret" />
                  )}
                </p>
              </div>
            </>
          )}

          {/* Cursor + click ripple */}
          {!end && (
            <>
              <span
                className="gd-cursor"
                style={{ transform: `translate(${cursor[0]}px, ${cursor[1]}px)` }}
              >
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path
                    d="M4 2.5 L4 19.5 L8.6 15.4 L11.6 22 L14.6 20.7 L11.7 14.2 L18 14.2 Z"
                    fill="#fff"
                    stroke="#111"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {clickAt && (
                <span
                  key={`${clickAt[0]}-${clickAt[1]}-${k}`}
                  className="gd-ripple"
                  style={{ left: clickAt[0], top: clickAt[1] }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    kicker: "Step 1",
    title: "Tick what you actually measured",
    text: "Start from a common situation or your own data. Each measure is tagged with its Kirkpatrick level, and each tick lights the link it truly speaks to. Here: completion, a satisfaction survey and a business metric.",
  },
  {
    kicker: "Step 2",
    title: "See how far the claim can reach",
    text: "A link lights up only where something was measured. In this example the business metric lights up because it was tracked, but four links in between are dark, so nothing selected connects the training to it.",
  },
  {
    kicker: "Step 3",
    title: "Open any gap to see what it can’t prove",
    text: "Every link explains what it means, what it can’t establish, and a suggested next step to close the gap. Transfer is the link organizations skip most often.",
  },
  {
    kicker: "Step 4",
    title: "Check whether the workplace is the real barrier",
    text: "Four research-backed questions about opportunity, manager support, time and tools. A “No” marks the link it could block as a reported barrier to verify, so a workplace problem isn’t mistaken for a training problem.",
  },
  {
    kicker: "Step 5",
    title: "Leave with a brief your leaders can act on",
    text: "What you can say, what you can’t say yet, a suggested next decision, and the question that could prove you wrong. Copy it, with its example label, straight into an email.",
  },
];

function useIsDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 981px)");
    const u = () => setD(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return d;
}

export function GuidedDemo() {
  const [active, setActive] = useState(0);
  const desktop = useIsDesktop();
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["index"]));
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="gd">
      <div className="gd-steps">
        {STEPS.map((s, i) => (
          <section
            key={s.title}
            data-index={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`gd-step ${active === i ? "on" : ""}`}
            aria-labelledby={`gd-t-${i}`}
          >
            <p className="gd-kick">
              <span>{String(i + 1).padStart(2, "0")}</span> {s.kicker}
            </p>
            <h3 id={`gd-t-${i}`}>{s.title}</h3>
            <p>{s.text}</p>
            <p className="gd-result">
              <span>What you’d see</span>
              {RESULTS[i]}
            </p>
            {!desktop && <DemoStage scene={i} playing={active === i} label={`${i + 1} / 5`} />}
          </section>
        ))}
      </div>
      {desktop && (
        <div className="gd-sticky">
          <DemoStage scene={active} playing label={`Step ${active + 1} of 5`} />
          <ol className="gd-dots" aria-hidden>
            {STEPS.map((s, i) => (
              <li key={s.title} className={i === active ? "on" : i < active ? "done" : ""} />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
