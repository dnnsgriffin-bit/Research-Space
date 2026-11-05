import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, CircleDashed, CircleHelp, X } from "lucide-react";
import { CHAIN, type ChainState } from "@/lib/studio-data";
import { GENERIC_PROVENANCE, type ProvenanceSet } from "@/lib/chain-provenance";

const STATE_META: Record<ChainState, { text: string; color: string; Icon: typeof CheckCircle2 }> = {
  measured: { text: "Measured", color: "var(--state-measured)", Icon: CheckCircle2 },
  assumed: { text: "Assumed", color: "var(--state-assumed)", Icon: CircleDashed },
  unknown: { text: "Unknown", color: "var(--state-unknown)", Icon: CircleHelp },
};

export function StateMark({ state, className = "" }: { state: ChainState; className?: string }) {
  const meta = STATE_META[state];
  const Icon = meta.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 label-xs ${className}`}
      style={{ color: meta.color }}
    >
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {meta.text}
    </span>
  );
}

/**
 * The signature interaction: the seven-link evidence chain, where every link is a
 * keyboard-accessible button that opens a contextual Evidence Inspector.
 */
export function EvidenceChain({
  states,
  provenance = GENERIC_PROVENANCE,
  title = "The learning evidence chain",
  intro,
  initialSelected,
  knownLabel = "What this link means",
}: {
  states: Record<string, ChainState>;
  provenance?: ProvenanceSet | undefined;
  title?: string | undefined;
  intro?: string | undefined;
  initialSelected?: string | null | undefined;
  knownLabel?: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    initialSelected === undefined ? "transfer" : initialSelected,
  );
  const hasInteracted = useRef(false);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  const close = useCallback(() => {
    const id = selected;
    setSelected(null);
    if (id) buttonRefs.current[id]?.focus();
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    if (hasInteracted.current) panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, close]);

  const node = selected ? CHAIN.find((n) => n.id === selected) : null;
  const detail = selected ? provenance[selected] : undefined;

  return (
    <section aria-label={title}>
      {intro && (
        <p className="measure mb-5 text-[15px] leading-relaxed text-foreground/80">{intro}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <ol className="chain-spine border border-border bg-[var(--surface)]">
          {CHAIN.map((n, i) => {
            const state = states[n.id] ?? "unknown";
            const meta = STATE_META[state];
            const isSelected = selected === n.id;
            return (
              <li key={n.id} className="min-w-0">
                <button
                  type="button"
                  ref={(el) => {
                    buttonRefs.current[n.id] = el;
                  }}
                  onClick={() => {
                    hasInteracted.current = true;
                    setSelected(n.id);
                  }}
                  aria-expanded={isSelected}
                  aria-controls={panelId}
                  className={`state-transition flex h-full w-full min-w-0 items-center gap-4 border-l-[3px] px-4 py-3 text-left ${
                    isSelected
                      ? "bg-[var(--tint-navy)]"
                      : "bg-[var(--surface)] hover:bg-[var(--tint-navy)]"
                  }`}
                  style={{ borderLeftColor: isSelected ? meta.color : "transparent" }}
                >
                  <span className="chain-index label-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--background)] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[15px] font-semibold leading-snug text-[var(--navy)]">
                      {n.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                      {n.short}
                    </span>
                  </span>
                  <StateMark state={state} />
                </button>
              </li>
            );
          })}
        </ol>

        <div
          id={panelId}
          role="region"
          aria-live="polite"
          aria-label="Evidence inspector"
          className="min-w-0 lg:sticky lg:top-24"
        >
          {node && detail && (
            <div
              key={selected}
              ref={panelRef}
              tabIndex={-1}
              className="inspector-enter border border-border bg-[var(--surface)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="label-xs text-[var(--teal)]">Evidence inspector</p>
                  <h3 className="mt-2 text-[1.35rem] leading-snug">{node.label}</h3>
                  <p className="measure mt-1.5 text-[14px] leading-relaxed text-foreground/80">
                    {node.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StateMark state={states[node.id] ?? "unknown"} />
                  <button
                    type="button"
                    onClick={close}
                    className="state-transition inline-flex min-h-9 items-center gap-1.5 border border-border px-2.5 py-1.5 text-[13px] text-[var(--navy)] hover:bg-[var(--tint-navy)]"
                  >
                    <X aria-hidden className="h-3.5 w-3.5" />
                    Close
                  </button>
                </div>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-2">
                <Block title={knownLabel}>
                  <p>{detail.known}</p>
                </Block>
                <Block title="Source / provenance">
                  <p>{detail.provenance}</p>
                </Block>
                <Block title="Limitations">
                  <List items={detail.limitations} />
                </Block>
                <Block title="What this does NOT establish" tone="caution">
                  <List items={detail.notEstablished} />
                </Block>
                <Block title="Next evidence to collect" tone="accent" wide>
                  <List items={detail.nextEvidence} />
                </Block>
              </div>
            </div>
          )}
          {!node && (
            <div className="border border-dashed border-border p-6 sm:p-8">
              <CircleHelp aria-hidden className="h-6 w-6 text-[var(--teal)]" />
              <h3 className="mt-4 text-xl">Where does the claim need support?</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Select a link to inspect its evidence, limitations and next test. An unknown link is
                an invitation to investigate.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        Measured means observed, not caused by the program. Completion and reaction do not
        establish learning or transfer. Self-assessments are not independently verified.
      </p>
    </section>
  );
}

function Block({
  title,
  children,
  tone = "plain",
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "plain" | "caution" | "accent";
  wide?: boolean;
}) {
  const color =
    tone === "caution" ? "var(--signal)" : tone === "accent" ? "var(--teal)" : "var(--navy)";
  return (
    <section className={`bg-[var(--surface)] p-5 sm:p-6 ${wide ? "md:col-span-2" : ""}`}>
      <h4 className="label-xs" style={{ color }}>
        {title}
      </h4>
      <div className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span aria-hidden className="mt-2 h-px w-2.5 shrink-0 bg-[var(--stone)]" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Compact read-only stack, used inside the brief and print output. */
export function ChainStack({ states }: { states: Record<string, ChainState> }) {
  return (
    <ol>
      {CHAIN.map((node) => (
        <li
          key={node.id}
          className="flex items-center justify-between gap-4 border-t border-border py-2.5 last:border-b"
        >
          <span className="text-[14px] text-[var(--navy)]">{node.label}</span>
          <StateMark state={states[node.id] ?? "unknown"} />
        </li>
      ))}
    </ol>
  );
}
