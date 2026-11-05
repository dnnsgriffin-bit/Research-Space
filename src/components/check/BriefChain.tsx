import { CHAIN } from "@/lib/evidence-check";
import type { ChainState } from "@/lib/studio-data";

/**
 * The evidence chain drawn for paper: the cream brief, its printed PDF, and the
 * landing-page sample. Same meaning as the main chain, in ink instead of light:
 * filled = measured, dashed ring = assumed, dotted ring = unknown, "!" = reported barrier.
 * Every state is also written out, so the strip never relies on color alone.
 */
export function BriefChain({
  states,
  barriers = {},
}: {
  states: Record<string, ChainState>;
  barriers?: Record<string, string[]>;
}) {
  return (
    <figure className="bc">
      <ol className="bc-chain" aria-label="Evidence chain">
        {CHAIN.map((n, i) => {
          const s = states[n.id] ?? "unknown";
          const prev = i ? states[CHAIN[i - 1]!.id] : null;
          const seg =
            prev === "measured" && s === "measured"
              ? "lit"
              : prev && prev !== "unknown" && s !== "unknown"
                ? "haze"
                : "dark";
          const bar = barriers[n.id];
          return (
            <li key={n.id} className={`bc-link ${s} seg-${seg}`}>
              <span className="bc-seg" aria-hidden />
              <span className="bc-node" aria-hidden>
                {String(i + 1).padStart(2, "0")}
                {bar && <b className="bc-bang">!</b>}
              </span>
              <span className="bc-name">{n.label}</span>
              <span className="bc-state">
                {s}
                {bar && <span className="sr-only">, barrier reported</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="bc-cap">
        Filled: measured (recorded, not proof of cause) · Dashed: assumed · Dotted: unknown
        {Object.keys(barriers).length > 0 && " · !: reported barrier to verify"}
      </figcaption>
    </figure>
  );
}
