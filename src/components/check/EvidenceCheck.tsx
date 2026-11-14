import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CHAIN,
  CONDITIONS,
  DEFAULT_ANSWERS,
  MEASURES,
  MEASURE_EXAMPLES,
  PRESETS,
  TIERS,
  barriersByLink,
  briefAsText,
  buildCheckBrief,
  chainLine,
  chainStates,
  claimReach,
  linkLabel,
  originAfterEdit,
  EMPTY_VALUE,
  enteredResults,
  toNumber,
  type MeasureValue,
  provenanceLabel,
  reachMessage,
  type Answer,
  type CheckBrief,
  type InputOrigin,
} from "@/lib/evidence-check";
import { GENERIC_PROVENANCE } from "@/lib/chain-provenance";
import { BriefChain } from "./BriefChain";
import { CountUp } from "@/hooks/use-count-up";
import type { ChainState } from "@/lib/studio-data";
import { listPhrase } from "@/lib/studio-engine";

const pad = (n: number) => String(n).padStart(2, "0");

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * The homepage Evidence Check. All state is local to this component and is never
 * written to the Studio store, so trying it cannot overwrite a visitor's Studio work.
 */
/**
 * A small spark that flies from a control to the chain link it just changed, so cause and
 * effect read as one gesture even when the two are far apart. Decorative only: skipped
 * under reduced motion, when the link is off screen, and while the product film is captured.
 */
function flySpark(from: HTMLElement, to: HTMLElement | null | undefined, tone: "lamp" | "flag") {
  if (!to || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.documentElement.dataset["film"]) return;
  const a = from.getBoundingClientRect();
  const b = (to.querySelector(".ec-dot") ?? to).getBoundingClientRect();
  const x0 = a.left + Math.min(22, a.width / 2);
  const y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2;
  const y1 = b.top + b.height / 2;
  if (y1 < 0 || y1 > window.innerHeight || x1 < 0 || x1 > window.innerWidth) return;
  // A quadratic curve that lifts away from the control before it lands.
  const cx = x0 + (x1 - x0) * 0.2;
  const cy = Math.min(y0, y1) - 70;
  const steps = 14;
  const path = Array.from({ length: steps + 1 }, (_, i) => {
    const u = i / steps;
    const v = 1 - u;
    const x = v * v * x0 + 2 * v * u * cx + u * u * x1;
    const y = v * v * y0 + 2 * v * u * cy + u * u * y1;
    return { transform: `translate(${x}px, ${y}px) scale(${0.55 + 0.65 * Math.sin(Math.PI * u)})` };
  });
  // A head and two fainter followers make a short tail.
  [0, 45, 90].forEach((delay, i) => {
    const el = document.createElement("span");
    el.className = `ec-spark ${tone}${i ? " tail" : ""}`;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    const anim = el.animate(path, {
      duration: 480,
      delay,
      easing: "cubic-bezier(0.45, 0, 0.2, 1)",
      fill: "backwards",
    });
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  });
}

const START_HINT_KEY = "evidence-studio:check-start-hint";

export function EvidenceCheck() {
  const [measured, setMeasured] = useState<string[]>(
    PRESETS.find((p) => p.id === "numbers")!.measured,
  );
  const [answers, setAnswers] = useState<Record<string, Answer>>(DEFAULT_ANSWERS);
  // Where the inputs came from, tracked separately from what they happen to match.
  const [origin, setOrigin] = useState<InputOrigin>({ kind: "example", presetId: "numbers" });
  const [selected, setSelected] = useState<string | null>(null);
  // One-time "start here" note for first visits; gone after the first change or "Got it".
  const [showStartHint, setShowStartHint] = useState(false);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(START_HINT_KEY) !== "done") setShowStartHint(true);
    } catch {
      setShowStartHint(true); // no storage: show it for this visit only
    }
  }, []);
  const doneStartHint = () => {
    setShowStartHint(false);
    try {
      window.localStorage.setItem(START_HINT_KEY, "done");
    } catch {
      /* storage blocked: it simply shows again next visit */
    }
  };
  const inspectorRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const states = useMemo(() => chainStates(measured), [measured]);
  const barriers = useMemo(() => barriersByLink(answers), [answers]);
  const reach = useMemo(() => claimReach(states), [states]);
  // Optional numbers typed in for ticked measures. Kept in memory only.
  const [values, setValues] = useState<Record<string, MeasureValue>>({});
  const brief = useMemo(
    () => buildCheckBrief(measured, answers, values),
    [measured, answers, values],
  );
  // Confirming typed numbers vouches for those numbers only. The selections keep their own
  // provenance (example or own), so example-derived measures stay labeled as examples.
  const [valuesConfirmed, setValuesConfirmed] = useState(false);
  const typed = useMemo(() => enteredResults(measured, values), [measured, values]);
  const provenance = provenanceLabel(
    origin,
    typed.length ? { labels: typed.map((r) => r.label), confirmed: valuesConfirmed } : undefined,
  );
  const setValue = (id: string, patch: Partial<MeasureValue>) => {
    setValues((v) => ({ ...v, [id]: { ...(v[id] ?? EMPTY_VALUE), ...patch } }));
    setValuesConfirmed(false); // a changed number needs confirming again
    setOrigin(originAfterEdit);
  };
  const toggleMeasure = (id: string, from?: HTMLElement) => {
    const next = measured.includes(id) ? measured.filter((x) => x !== id) : [...measured, id];
    // A tick that lights a new link sends a spark from the tick to that link.
    if (from) {
      const after = chainStates(next);
      for (const n of CHAIN)
        if (states[n.id] !== "measured" && after[n.id] === "measured")
          flySpark(from, nodeRefs.current[n.id], "lamp");
    }
    setMeasured(next);
    setOrigin(originAfterEdit);
    doneStartHint();
  };
  // A starting point is a fresh scenario: it replaces the measures and resets the answers.
  const pickPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setMeasured([...p.measured]);
    setAnswers(DEFAULT_ANSWERS);
    setValues({});
    setValuesConfirmed(false);
    setOrigin(id === "blank" ? { kind: "own" } : { kind: "example", presetId: id });
    doneStartHint();
  };

  const select = (id: string) => {
    setSelected((cur) => (cur === id ? null : id));
    requestAnimationFrame(() => {
      const el = inspectorRef.current;
      if (!el) return;
      const narrow = window.innerWidth <= 880;
      if (narrow) el.scrollIntoView({ block: "start" });
      el.focus({ preventScroll: !narrow });
    });
  };
  const close = () => {
    const was = selected;
    setSelected(null);
    if (was) nodeRefs.current[was]?.focus();
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div className="ec">
      <div className="l-grain" aria-hidden />
      <header className="ec-wrap ec-hero">
        <p className="ec-label">Evidence Check · for corporate learning &amp; L&amp;D leaders</p>
        <h1 className="ec-title">
          Training was completed. <em>Did work change?</em>
        </h1>
        <p className="ec-sub">
          Tick what you <b>actually measured</b>. The chain lights up only where something was
          observed, so you can see how far an honest claim can go.
        </p>

        <ol className="ec-how" aria-label="How it works, about two minutes">
          <li>
            <span className="ec-n">1</span>
            <span>
              <b>Tick your measures</b>Only data you already have.
            </span>
          </li>
          <li>
            <span className="ec-n">2</span>
            <span>
              <b>Check the work conditions</b>Four quick yes/no questions.
            </span>
          </li>
          <li>
            <span className="ec-n">3</span>
            <span>
              <b>Copy your brief</b>What you can say, and what to do next.
            </span>
          </li>
        </ol>
      </header>

      {/* The workbench: controls on the left, a pinned instrument on the right (wide screens).
          On narrow screens it is one column: starting points, chain, measures, conditions. */}
      <div className="ec-wrap ec-bench">
        <div className="ec-card ec-bench-presets">
          <Presets origin={origin} onPick={pickPreset} />
        </div>

        <div className="ec-bench-instrument">
          <ChainStage
            states={states}
            barriers={barriers}
            selected={selected}
            onSelect={select}
            nodeRefs={nodeRefs}
            reach={reach}
          />
          <Inspector
            ref={inspectorRef}
            id={selected}
            state={selected ? states[selected]! : "unknown"}
            barriers={selected ? barriers[selected] : undefined}
            onClose={close}
            brief={brief}
            origin={origin}
            provenance={provenance}
          />
        </div>

        <section className="ec-card ec-bench-measures" aria-labelledby="ec-measures-title">
          {showStartHint && (
            <div className="ec-start" role="note" aria-label="Start here">
              <p className="ec-start-k">Start here</p>
              <p>
                The ticks below are an example. Change them to match the data you actually have, or
                pick a starting point above. The chain and the brief update as you go.
              </p>
              <button type="button" className="ec-start-ok" onClick={doneStartHint}>
                Got it
              </button>
            </div>
          )}
          <p className="ec-label">Step 1</p>
          <h2 id="ec-measures-title">What did you measure?</h2>
          <p className="ec-hint">
            Tick only what you have data for, not what you plan to collect. Kirkpatrick levels are a
            rough cross-reference.
          </p>
          <MeasurePicker measured={measured} onToggle={toggleMeasure} />
          <ValueEntry
            measured={measured}
            values={values}
            onChange={setValue}
            isExample={origin.kind !== "own"}
            confirmed={valuesConfirmed}
            onConfirm={() => setValuesConfirmed(true)}
          />
        </section>

        <section className="ec-card ec-bench-conds" aria-labelledby="ec-cond-title">
          <p className="ec-label">Step 2</p>
          <h2 id="ec-cond-title">Before you credit or blame the training</h2>
          <p className="ec-hint">
            Work conditions predict whether people use what they learned. A “No” marks the affected
            link in the chain. “Not sure” is a fair answer.
          </p>
          <div className="ec-conds">
            {CONDITIONS.map((c) => (
              <ConditionCard
                key={c.id}
                id={c.id}
                question={c.question}
                why={c.why}
                links={c.links}
                value={answers[c.id] ?? "unsure"}
                onChange={(v, from) => {
                  // A new "No" sends a spark to each link it marks.
                  if (v === "no" && answers[c.id] !== "no" && from)
                    for (const link of c.links) flySpark(from, nodeRefs.current[link], "flag");
                  setAnswers((a) => ({ ...a, [c.id]: v }));
                  setOrigin(originAfterEdit);
                }}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="ec-wrap ec-section ec-brief-section" aria-labelledby="ec-brief-title">
        <span className="ec-label">Step 3</span>
        <h2 id="ec-brief-title">The claim you can defend today</h2>
        <Brief
          brief={brief}
          origin={origin}
          provenance={provenance}
          states={states}
          barriers={barriers}
        />
      </section>
    </div>
  );
}

function Presets({ origin, onPick }: { origin: InputOrigin; onPick: (id: string) => void }) {
  const labelId = useId();
  const active = origin.kind === "example" ? origin.presetId : origin.kind === "own" ? null : null;
  const preset = origin.kind !== "own" ? PRESETS.find((p) => p.id === origin.presetId) : null;
  return (
    <div className="ec-presets">
      <p className="ec-label" id={labelId}>
        Start from a common situation, or a blank slate
      </p>
      <div className="ec-preset-row" role="group" aria-labelledby={labelId}>
        {PRESETS.filter((p) => p.id !== "blank").map((p) => (
          <button
            key={p.id}
            type="button"
            className="ec-preset"
            aria-pressed={active === p.id}
            onClick={() => onPick(p.id)}
          >
            {p.label}
          </button>
        ))}
        <span className="ec-preset-sep" aria-hidden />
        <button type="button" className="ec-preset reset" onClick={() => onPick("blank")}>
          <span aria-hidden>↺ </span>Blank slate
        </button>
      </div>
      <p className="ec-note">
        {origin.kind === "example" && preset
          ? `${preset.note} Example inputs, not real data.`
          : origin.kind === "edited-example"
            ? "Example inputs, edited. Still illustrative, not real data."
            : "Your own selections."}{" "}
        Choosing a starting point replaces the measures and resets the work-condition answers.
      </p>
    </div>
  );
}

function ChainStage({
  states,
  barriers,
  selected,
  onSelect,
  nodeRefs,
  reach,
  children,
}: {
  children?: React.ReactNode;
  states: Record<string, ChainState>;
  barriers: Record<string, string[]>;
  selected: string | null;
  onSelect: (id: string) => void;
  nodeRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  reach: ReturnType<typeof claimReach>;
}) {
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const prevStates = useRef<Record<string, ChainState> | null>(null);
  const [changed, setChanged] = useState<Record<string, "ignite" | "dim">>({});
  const lastLit = useRef(-1);
  // Opening sequence: plays once on first load, then the chain behaves normally.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setIntro(false), 3400);
    return () => window.clearTimeout(t);
  }, []);

  // Mark links whose state just changed, so they can ignite or dim once.
  useLayoutEffect(() => {
    const prev = prevStates.current;
    prevStates.current = states;
    if (!prev) return;
    const next: Record<string, "ignite" | "dim"> = {};
    for (const n of CHAIN) {
      if (prev[n.id] !== "measured" && states[n.id] === "measured") next[n.id] = "ignite";
      if (prev[n.id] === "measured" && states[n.id] !== "measured") next[n.id] = "dim";
    }
    setChanged(next);
  }, [states]);

  // A line of light travels from the first link to the last link before the first gap.
  useEffect(() => {
    const stage = stageRef.current;
    const pulse = pulseRef.current;
    if (!stage || !pulse) return;
    const lit = reach.litFromStart;
    stage.style.setProperty("--ec-glow-x", `${10 + lit * 11}%`);
    if (reduced || window.innerWidth <= 880 || lit === lastLit.current || lit === 0) {
      lastLit.current = lit;
      return;
    }
    lastLit.current = lit;
    const dots = stage.querySelectorAll<HTMLElement>(".ec-dot");
    const first = dots[0];
    const last = dots[lit - 1];
    if (!first || !last) return;
    const s = stage.getBoundingClientRect();
    const a = first.getBoundingClientRect();
    const b = last.getBoundingClientRect();
    pulse.style.setProperty("--from", `${a.left - s.left}px`);
    pulse.style.setProperty("--to", `${b.right - s.left}px`);
    pulse.style.setProperty("--d", `${500 + lit * 130}ms`);
    // Gold only when every link on the path was measured; otherwise the path rests on an assumption.
    pulse.classList.toggle("assumed", reach.measuredRun < lit);
    pulse.style.top = `${a.top - s.top + a.height / 2 - 1}px`;
    const run = () => {
      pulse.classList.remove("run");
      void pulse.offsetWidth;
      pulse.classList.add("run");
    };
    if (first.closest(".intro")) {
      const t = window.setTimeout(run, 650);
      return () => window.clearTimeout(t);
    }
    run();
    return undefined;
  }, [reach.litFromStart, reach.measuredRun, reduced]);

  const msg = reachMessage(states);

  return (
    <div
      className={`ec-stage ${intro && !reduced ? "intro" : ""}`}
      ref={stageRef}
      aria-labelledby="ec-chain-title"
      onPointerDown={() => setIntro(false)}
      onKeyDown={() => setIntro(false)}
    >
      {children}
      <div className="ec-stage-top">
        <h2 id="ec-chain-title" className="ec-label">
          The evidence chain · select any link to inspect it
        </h2>
        <p className="ec-count">
          <b>
            <CountUp value={reach.observedCount} />
          </b>{" "}
          of 7 links observed
        </p>
      </div>
      <ol className="ec-chain">
        {CHAIN.map((n, i) => {
          const s = states[n.id]!;
          const prev = i ? states[CHAIN[i - 1]!.id] : null;
          const seg =
            prev === "measured" && s === "measured"
              ? "seg-lit"
              : prev && prev !== "unknown" && s !== "unknown"
                ? "seg-haze"
                : "seg-dark";
          const bar = barriers[n.id];
          return (
            <li
              key={n.id}
              className={`ec-link ${s} ${seg} ${changed[n.id] ?? ""}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="ec-seg" aria-hidden />
              <button
                type="button"
                className="ec-node"
                ref={(el) => {
                  nodeRefs.current[n.id] = el;
                }}
                aria-expanded={selected === n.id}
                aria-controls="ec-inspector"
                onClick={() => onSelect(n.id)}
              >
                <span className="ec-dot" aria-hidden>
                  {pad(i + 1)}
                </span>
                {bar && (
                  <span className="ec-barrier" aria-hidden>
                    !
                  </span>
                )}
                <span className="ec-txt">
                  <span className="ec-name">{n.label}</span>
                  <span className="ec-state">{s}</span>
                  {bar && <span className="ec-bnote">Barrier reported</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="ec-pulse" ref={pulseRef} aria-hidden />
      <div className="ec-ends">
        <span>← What the program delivered</span>
        <span>What the organization needed →</span>
      </div>
      <div className="ec-legend" aria-hidden>
        <span>
          <i className="m" />
          Measured: observed, not proof of cause
        </span>
        <span>
          <i className="a" />
          Assumed: believed, not observed
        </span>
        <span>
          <i className="u" />
          Unknown: no evidence either way
        </span>
        <span>
          <i className="b" />
          Barrier you reported
        </span>
      </div>
      <div className="ec-reach" role="status" aria-live="polite" aria-atomic="true">
        <span className="ec-label">Claim reach</span>
        <span className="ec-big">
          {msg.lead}
          {msg.link && (
            <>
              <em>{msg.link}</em>.
            </>
          )}
        </span>
        <p className={msg.tone === "warn" ? "ec-warn" : ""}>{msg.note}</p>
      </div>
    </div>
  );
}

function MeasurePicker({
  measured,
  onToggle,
}: {
  measured: string[];
  onToggle: (id: string, from?: HTMLElement) => void;
}) {
  return (
    <div>
      {TIERS.map(({ tier, kirkpatrick }) => {
        const items = MEASURES.filter((m) => m.tier === tier);
        if (!items.length) return null;
        return (
          <div className="ec-tier" key={tier}>
            <div className="ec-tier-head">
              <span className="ec-label">{tier}</span>
              <span className="ec-kp">{kirkpatrick}</span>
            </div>
            <div className="ec-chips">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="ec-chip"
                  aria-pressed={measured.includes(m.id)}
                  onClick={(e) => onToggle(m.id, e.currentTarget)}
                >
                  <span className="ec-tick" aria-hidden />
                  <span>
                    {m.label}
                    <span className="ec-ex">{MEASURE_EXAMPLES[m.id]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Optional numbers for the ticked measures. The brief quotes them back with their limits. */
function ValueEntry({
  measured,
  values,
  onChange,
  isExample,
  confirmed,
  onConfirm,
}: {
  measured: string[];
  values: Record<string, MeasureValue>;
  onChange: (id: string, patch: Partial<MeasureValue>) => void;
  /** True while the selections carry an example label. */
  isExample: boolean;
  /** The visitor has confirmed the typed numbers (and only those) as their own. */
  confirmed: boolean;
  onConfirm: () => void;
}) {
  const items = MEASURES.filter((m) => measured.includes(m.id));
  const filled = enteredResults(measured, values).length;
  return (
    <details className="ec-values">
      <summary>
        <span className="ec-values-t">Have the numbers? Add them</span>
        <span className="ec-values-n">
          {filled ? `${filled} of ${items.length} entered` : "Optional"}
        </span>
      </summary>
      {items.length === 0 ? (
        <p className="ec-hint">Tick a measure above to add its result.</p>
      ) : (
        <>
          <p className="ec-hint">
            Type a result and, if you have one, something to compare it with. The brief quotes your
            numbers back and says what the comparison can and can’t show. Nothing leaves your
            browser.
          </p>
          <ul className="ec-vlist">
            {items.map((m) => {
              const v = values[m.id] ?? EMPTY_VALUE;
              return (
                <li key={m.id} className="ec-vrow">
                  <fieldset>
                    <legend>{m.label}</legend>
                    <label>
                      <span>Result</span>
                      <input
                        inputMode="decimal"
                        placeholder="78"
                        value={v.now}
                        aria-invalid={v.now.trim() !== "" && toNumber(v.now) === null}
                        onChange={(e) => onChange(m.id, { now: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Compared with</span>
                      <input
                        inputMode="decimal"
                        placeholder="64"
                        value={v.ref}
                        aria-invalid={v.ref.trim() !== "" && toNumber(v.ref) === null}
                        onChange={(e) => onChange(m.id, { ref: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>That number is</span>
                      <select
                        value={v.refKind}
                        onChange={(e) =>
                          onChange(m.id, { refKind: e.target.value as MeasureValue["refKind"] })
                        }
                      >
                        <option value="before">Before the program</option>
                        <option value="group">A comparison group</option>
                      </select>
                    </label>
                    <label className="ec-vunit">
                      <span>Unit</span>
                      <input
                        maxLength={8}
                        value={v.unit}
                        onChange={(e) => onChange(m.id, { unit: e.target.value })}
                      />
                    </label>
                  </fieldset>
                </li>
              );
            })}
          </ul>
          {filled > 0 && isExample && !confirmed && (
            <p className="ec-own">
              <span>
                You started from an example. Confirming marks only these numbers as yours; the
                example selections stay labeled as examples. For a brief with all your own
                selections, start from Blank slate.
              </span>
              <button type="button" className="ec-own-btn" onClick={onConfirm}>
                These are my real numbers
              </button>
            </p>
          )}
          {filled > 0 && isExample && confirmed && (
            <p className="ec-own done" role="status">
              The brief marks these numbers as entered and confirmed by you. The example selections
              stay labeled as examples.
            </p>
          )}
          {filled > 0 && !isExample && (
            <p className="ec-own done" role="status">
              These numbers are part of your own run, and the brief says so.
            </p>
          )}
        </>
      )}
    </details>
  );
}

function Inspector({
  ref,
  id,
  state,
  barriers,
  onClose,
  brief,
  origin,
  provenance,
}: {
  ref: React.Ref<HTMLElement>;
  id: string | null;
  state: ChainState;
  barriers: string[] | undefined;
  onClose: () => void;
  brief: CheckBrief;
  origin: InputOrigin;
  provenance: string;
}) {
  const node = id ? CHAIN.find((n) => n.id === id) : null;
  const d = id ? GENERIC_PROVENANCE[id] : undefined;
  return (
    <section
      ref={ref}
      id="ec-inspector"
      className="ec-card"
      aria-label={node ? "Evidence inspector" : "Live brief"}
      tabIndex={-1}
    >
      {!node || !d ? (
        <LiveBrief brief={brief} origin={origin} provenance={provenance} />
      ) : (
        <div key={node.id} className="ec-enter">
          <div className="ec-insp-head">
            <div>
              <p className="ec-label">Evidence inspector · {pad(CHAIN.indexOf(node) + 1)} of 07</p>
              <h3>{node.label}</h3>
              <p className="ec-desc">{node.description}</p>
            </div>
            <div className="ec-insp-actions">
              <span className={`ec-badge ${state}`}>{state}</span>
              <button type="button" className="ec-close" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
          <div className="ec-insp-grid">
            {barriers && (
              <section className="bar">
                <h4>Barrier you reported</h4>
                <p>
                  You answered no for {listPhrase(barriers)}. If that’s confirmed, it can limit this
                  link even when the training itself was sound.
                </p>
              </section>
            )}
            <section>
              <h4>What this link means</h4>
              <p>{d.known}</p>
            </section>
            <section>
              <h4>Typical source</h4>
              <p>{d.provenance}</p>
            </section>
            <section>
              <h4>Limitations</h4>
              <List items={d.limitations} />
            </section>
            <section className="not">
              <h4>Does not establish</h4>
              <List items={d.notEstablished} />
            </section>
            <section className="wide">
              <h4>Next evidence to collect</h4>
              <List items={d.nextEvidence} />
            </section>
          </div>
        </div>
      )}
    </section>
  );
}

/** A compact, always-current view of the brief, shown while no link is open. */
function LiveBrief({
  brief,
  origin,
  provenance,
}: {
  brief: CheckBrief;
  origin: InputOrigin;
  provenance: string;
}) {
  const next = brief.nextEvidence[0];
  return (
    <div className="ec-live">
      <div className="ec-live-top">
        <p className="ec-label">Live brief · updates as you go</p>
        <p className="ec-live-hint">Select a link in the chain to inspect it.</p>
      </div>
      <p className={`ec-live-prov ${origin.kind === "own" ? "own" : ""}`}>{provenance}</p>
      <p key={brief.headline} className="ec-live-h ec-swap">
        {brief.headline}
      </p>
      <div className="ec-live-dec">
        <span className="ec-live-k">Suggested next decision</span>
        <p>{brief.decision}</p>
      </div>
      <dl className="ec-live-counts">
        <div>
          <dt>You can say</dt>
          <dd>
            <CountUp value={brief.canSay.length} />
          </dd>
        </div>
        <div>
          <dt>You can’t say yet</dt>
          <dd>
            <CountUp value={brief.cannotSay.length} />
          </dd>
        </div>
      </dl>
      {next && (
        <p className="ec-live-next">
          <span className="ec-live-k">Suggested next evidence</span>
          {next.link && <b>{next.link}: </b>}
          {next.text}
        </p>
      )}
      <a href="#ec-brief-title" className="ec-live-go">
        Read the full brief <span aria-hidden>↓</span>
      </a>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function ConditionCard({
  id,
  question,
  why,
  links,
  value,
  onChange,
}: {
  id: string;
  question: string;
  why: string;
  links: string[];
  value: Answer;
  onChange: (v: Answer, from?: HTMLElement) => void;
}) {
  const qid = `ec-q-${id}`;
  const opts: { v: Answer; label: string }[] = [
    { v: "yes", label: "Yes" },
    { v: "no", label: "No" },
    { v: "unsure", label: "Not sure" },
  ];
  return (
    <div className={`ec-cond ${value === "no" ? "is-no" : ""}`}>
      <p id={qid} className="ec-q">
        {question}
      </p>
      <p className="ec-why">{why}</p>
      <div className="ec-seg3" role="group" aria-labelledby={qid}>
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            data-v={o.v}
            aria-pressed={value === o.v}
            onClick={(e) => onChange(o.v, e.currentTarget)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="ec-hits">Affects: {links.map(linkLabel).join(", ")}</p>
    </div>
  );
}

function Brief({
  brief,
  origin,
  provenance,
  states,
  barriers,
}: {
  brief: ReturnType<typeof buildCheckBrief>;
  origin: InputOrigin;
  provenance: string;
  states: Record<string, ChainState>;
  barriers: Record<string, string[]>;
}) {
  const chain = chainLine(states, barriers);
  // Set on the client only, so the printed date never causes a hydration mismatch.
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    );
  }, []);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const text = briefAsText(brief, provenance, chain);
    try {
      await navigator.clipboard.writeText(text);
      setFallback(null);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2600);
    } catch {
      setFallback(text);
    }
  };
  const download = () => {
    const blob = new Blob([briefAsText(brief, provenance, chain)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "training-evidence-brief.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // "Open full page": the card grows from where it sits into a full ivory page, so the
  // move from the dark tool to the paper brief reads as one gesture. Only the plain paper
  // layer is scaled (transform); the text fades in on top, so type is never stretched.
  const cardRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const reduced = usePrefersReducedMotion();

  const flipFrom = (sheet: HTMLDialogElement) => {
    const card = cardRef.current;
    const bg = sheet.querySelector<HTMLElement>(".ec-sheet-bg");
    if (!card || !bg) return null;
    const a = card.getBoundingClientRect();
    const b = bg.getBoundingClientRect();
    return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  };

  const openPage = () => {
    const sheet = sheetRef.current;
    if (!sheet || sheet.open) return;
    sheet.showModal();
    const scroller = sheet.querySelector<HTMLElement>(".ec-sheet-scroll");
    scroller?.scrollTo(0, 0);
    if (reduced) return;
    const from = flipFrom(sheet);
    const bg = sheet.querySelector<HTMLElement>(".ec-sheet-bg");
    if (from && bg) {
      bg.animate([{ transform: from }, { transform: "none" }], {
        duration: 480,
        easing: SHEET_EASE,
      });
    }
    scroller?.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 320, delay: 220, easing: SHEET_EASE, fill: "backwards" },
    );
  };

  const closePage = () => {
    const sheet = sheetRef.current;
    if (!sheet || !sheet.open) return;
    if (reduced) return sheet.close();
    const from = flipFrom(sheet);
    const bg = sheet.querySelector<HTMLElement>(".ec-sheet-bg");
    const scroller = sheet.querySelector<HTMLElement>(".ec-sheet-scroll");
    const fade = scroller?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 160,
      fill: "forwards",
    });
    const finish = () => {
      sheet.close();
      bg?.getAnimations().forEach((x) => x.cancel());
      fade?.cancel();
    };
    if (!from || !bg) return finish();
    const shrink = bg.animate([{ transform: "none" }, { transform: from }], {
      duration: 380,
      delay: 100,
      easing: SHEET_EASE,
      fill: "forwards",
    });
    shrink.onfinish = finish;
  };

  const printBrief = () => {
    if (sheetRef.current?.open) {
      sheetRef.current.close();
      window.setTimeout(() => window.print(), 50);
    } else window.print();
  };

  const body = (
    <BriefBody
      brief={brief}
      origin={origin}
      provenance={provenance}
      states={states}
      barriers={barriers}
      today={today}
    />
  );
  const fine = (
    <p className="ec-fine">
      Rule-based suggestions. They describe which measures exist and what they can support, and
      quote any numbers as entered. They don’t verify results, predict impact or calculate ROI.
    </p>
  );

  return (
    <article className="ec-brief" id="ec-brief" ref={cardRef}>
      {body}
      <div className="ec-actions">
        <button type="button" className={`ec-btn ${copied ? "done" : ""}`} onClick={copy}>
          {copied ? "Copied ✓" : "Copy brief"}
        </button>
        <button type="button" className="ec-btn ghost" onClick={openPage} aria-haspopup="dialog">
          Open full page
        </button>
        <button type="button" className="ec-btn ghost" onClick={download}>
          Download .txt
        </button>
        <button type="button" className="ec-btn ghost" onClick={printBrief}>
          Save as PDF
        </button>
        <span className="ec-status" role="status" aria-live="polite">
          {copied ? "Brief copied. Paste it into an email or slide." : ""}
        </span>
      </div>
      {fallback && (
        <textarea
          className="ec-fallback"
          aria-label="Brief text to copy"
          readOnly
          value={fallback}
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
        />
      )}
      {fine}

      <dialog
        ref={sheetRef}
        className="ec-sheet"
        aria-label="Decision brief, full page"
        onCancel={(e) => {
          e.preventDefault();
          closePage();
        }}
      >
        <div className="ec-sheet-bg" aria-hidden />
        <div className="ec-sheet-scroll">
          <div className="ec-sheet-bar">
            <p className="ec-label">Evidence Studio · Decision brief{today ? ` · ${today}` : ""}</p>
            <div className="ec-sheet-tools">
              <button type="button" className={`ec-btn ${copied ? "done" : ""}`} onClick={copy}>
                {copied ? "Copied ✓" : "Copy brief"}
              </button>
              <button type="button" className="ec-btn ghost" onClick={printBrief}>
                Save as PDF
              </button>
              <button type="button" className="ec-btn ghost" onClick={closePage}>
                Close <span aria-hidden>×</span>
              </button>
            </div>
          </div>
          <div className="ec-brief ec-brief-page">
            {body}
            {fine}
          </div>
        </div>
      </dialog>
    </article>
  );
}

const SHEET_EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

function BriefBody({
  brief,
  origin,
  provenance,
  states,
  barriers,
  today,
}: {
  brief: ReturnType<typeof buildCheckBrief>;
  origin: InputOrigin;
  provenance: string;
  states: Record<string, ChainState>;
  barriers: Record<string, string[]>;
  today: string;
}) {
  return (
    <>
      <p className="ec-print-head" aria-hidden>
        Evidence Studio · Training evidence brief{today ? ` · ${today}` : ""}
      </p>
      <p className="ec-label">Decision brief</p>
      <p className={`ec-prov ${origin.kind === "own" ? "own" : ""}`}>{provenance}</p>
      <h3 key={brief.headline} className="ec-swap">
        {brief.headline}
      </h3>
      <BriefChain states={states} barriers={barriers} />
      <div className="ec-decision">
        <span className="ec-icon" aria-hidden>
          →
        </span>
        <div>
          <p className="ec-label">Suggested next decision · for leaders</p>
          <p className="ec-d">{brief.decision}</p>
          <p className="ec-s">Rule-based suggestion from your answers. Your judgment decides.</p>
        </div>
      </div>
      <div className="ec-bgrid">
        <section>
          <h4>You can say</h4>
          {brief.canSay.length ? <List items={brief.canSay} /> : <p>Nothing yet.</p>}
          {brief.results.length > 0 && (
            <div className="ec-results">
              <h5>Results as you entered them</h5>
              <List items={brief.results.map((r) => r.text)} />
            </div>
          )}
          {brief.canSay.length > 0 && <p className="ec-rnote">{brief.resultsNote}</p>}
        </section>
        <section className="no">
          <h4>You can’t say yet</h4>
          <List items={brief.cannotSay} />
        </section>
        <section className="full">
          <h4>Suggested next evidence</h4>
          <ul>
            {brief.nextEvidence.map((x) => (
              <li key={x.text}>
                {x.link && <b>{x.link}</b>}
                {x.addresses && <span className="ec-addr"> · to find out {x.addresses}</span>}
                {x.link || x.addresses ? ": " : ""}
                {x.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="ec-skeptic">
        <p className="ec-label">Skeptical review · what would make this wrong?</p>
        <p className="ec-sq">{brief.question}</p>
        <p className="ec-sa">{brief.answer}</p>
      </div>
    </>
  );
}
