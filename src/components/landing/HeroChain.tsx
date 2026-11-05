import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CHAIN, PRESETS, chainStates, reachMessage } from "@/lib/evidence-check";

const SCENES = PRESETS.filter((p) => p.id !== "blank");
const CYCLE_MS = 5200;

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
 * The landing-page hero instrument. It runs the real Evidence Check engine on the
 * typical starting patterns, cycling on its own until the visitor picks one.
 */
export function HeroChain() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(3); // open on "We trained, and the numbers went up"
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scene = SCENES[index]!;
  const states = useMemo(() => chainStates(scene.measured), [scene]);
  const msg = useMemo(() => reachMessage(states), [states]);

  useEffect(() => {
    if (!auto || paused || reduced) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [index, auto, paused, reduced]);

  const pick = (i: number) => {
    setAuto(false);
    setIndex(i);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : SCENES.length - 1)) % SCENES.length;
    pick(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className="hc"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hc-top">
        <div className="hc-live-row">
          <p className="hc-live">
            <span aria-hidden className={`hc-dot ${auto && !reduced ? "playing" : ""}`} /> Live
            engine · example situations
          </p>
          {!reduced && (
            <button
              type="button"
              className="hc-pause"
              aria-pressed={!auto}
              onClick={() => setAuto((a) => !a)}
            >
              {auto ? "Pause auto-play" : "Resume auto-play"}
            </button>
          )}
        </div>
        <div
          className="hc-tabs"
          role="tablist"
          aria-label="Example training reports"
          onKeyDown={onKey}
        >
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`hc-tab-${s.id}`}
              aria-selected={i === index}
              aria-controls="hc-panel"
              tabIndex={i === index ? 0 : -1}
              className="hc-tab"
              onClick={() => pick(i)}
            >
              {s.label.replace(/[“”]/g, "")}
              {i === index && auto && !reduced && (
                <span
                  key={`${index}-${paused}`}
                  className={`hc-progress ${paused ? "paused" : ""}`}
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        id="hc-panel"
        role="tabpanel"
        aria-labelledby={`hc-tab-${scene.id}`}
        className="hc-panel"
      >
        <ol className="hc-chain" aria-label="Evidence chain for this situation">
          {CHAIN.map((n, i) => {
            const s = states[n.id]!;
            const prev = i ? states[CHAIN[i - 1]!.id] : null;
            const lit = prev === "measured" && s === "measured";
            const haze = !lit && prev !== null && prev !== "unknown" && s !== "unknown";
            return (
              <li
                key={n.id}
                className={`hc-link ${s} ${lit ? "lit" : ""} ${haze ? "haze" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="hc-seg" aria-hidden />
                <span className="hc-node" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="hc-name">{n.label}</span>
                <span className="hc-state">{s}</span>
              </li>
            );
          })}
        </ol>
        {/* Announce changes only when the visitor chose them, never during auto-play. */}
        <div className="hc-read" aria-live={auto && !reduced ? "off" : "polite"}>
          <p className="hc-reach" key={scene.id}>
            {msg.lead}
            {msg.link && (
              <>
                <em>{msg.link}</em>.
              </>
            )}{" "}
            <span className={`hc-verdict ${msg.tone === "warn" ? "warn" : ""}`}>{msg.note}</span>
          </p>
          <Link to="/check" className="hc-open">
            Run it on your program <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
