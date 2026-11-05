import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronDown } from "lucide-react";
import { componentDef, EVIDENCE_DESIGNS, MEASURES } from "@/lib/studio-data";
import { chainStates, compareScenarios, tradeoffs } from "@/lib/studio-logic";
import {
  evidenceConfidence,
  executiveBrief,
  learningProblemCheck,
  causalClaimCheck,
  claimSafety,
  skepticalReview,
} from "@/lib/studio-engine";
import { snapshotOf, useStudio } from "@/lib/studio-store";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { JudgmentNote } from "@/components/studio/JudgmentNote";
import { ChainStack } from "@/components/studio/ChainDiagram";
import { TextArea } from "@/components/studio/Fields";
import { transferConditions } from "@/lib/transfer";

const LEVEL_STYLE: Record<string, string> = {
  "LOW CONFIDENCE": "text-[var(--signal)]",
  "MODERATE CONFIDENCE": "text-[var(--teal)]",
  "STRONG CONFIDENCE": "text-[var(--evidence)]",
};

export function StepBrief() {
  const { state, updateBrief } = useStudio();
  const [openReview, setOpenReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const reviewTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (window.location.hash === "#skeptical-review") setOpenReview(true);
  }, []);
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = Array.from(
        document.querySelectorAll<HTMLDetailsElement>("details[data-print-expand]:not([open])"),
      );
      opened.forEach((detail) => {
        detail.open = true;
      });
    };
    const after = () => {
      opened.forEach((detail) => {
        detail.open = false;
      });
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  const snap = snapshotOf(state);

  const states = chainStates(state.measured);
  const rows = compareScenarios(
    state.scenarios.A.components,
    state.scenarios.B.components,
    state.profiles,
  );
  const brief = executiveBrief(snap, rows);
  const confidence = evidenceConfidence(snap);
  const problem = learningProblemCheck(snap);
  const transfer = transferConditions(state.profiles, state.scenarios.B.components);
  const causal = causalClaimCheck(snap);
  const safety = claimSafety(snap);
  const costs = tradeoffs(
    state.scenarios.A.components,
    state.scenarios.B.components,
    state.profiles,
  );

  const journey = state.scenarios.B.components
    .map((c) => `Day ${c.day}: ${componentDef(c.refId).name}`)
    .join(" · ");
  const current = state.scenarios.A.components
    .map((c) => `Day ${c.day}: ${componentDef(c.refId).name}`)
    .join(" · ");

  const briefText = [
    "EVIDENCE STUDIO — EXECUTIVE DECISION BRIEF",
    state.demo ? "Fictional worked example: Northstar Services" : "Practitioner working brief",
    "",
    `BUSINESS QUESTION\n${state.brief.businessQuestion || "Not yet stated."}`,
    `STUDIO SUGGESTION (RULE-BASED)\n${brief.decision}`,
    `PRACTITIONER DECISION (USER-ENTERED)\n${state.brief.decisionNow || "Not yet entered."}`,
    `WHY\n${brief.why}`,
    `BIGGEST UNCERTAINTY\n${brief.uncertainty}`,
    `TRADEOFF ACCEPTED\n${state.brief.keyTradeoff || brief.tradeoff}`,
    `EVIDENCE NEEDED\n${brief.evidenceNeeded}`,
    `WHAT NOT TO CLAIM\n${brief.doNotClaim}`,
    `CONFIDENCE\n${confidence.level}. ${confidence.headline}`,
    `\nBASIS AND LIMITATIONS\nSelected measures: ${state.measured.map((id) => MEASURES.find((m) => m.id === id)?.label ?? id).join(", ") || "None entered"}.`,
    `Selected evidence designs: ${state.evidence.designs.map((id) => EVIDENCE_DESIGNS.find((d) => d.id === id)?.label ?? id).join(", ") || "None entered"}.`,
    `Practitioner-entered context and ratings are assumptions until independently checked. ${brief.uncertainty}`,
    "Studio suggestions are rule-based planning guidance. The underlying records, results and costs have not been verified by this tool.",
    "",
    "WHAT THE EVIDENCE CAN SUPPORT",
    ...safety.canSay.slice(0, 3).map((item) => `- ${item}`),
    "",
    "WHAT IT CANNOT SUPPORT YET",
    ...(safety.cannotSay.length
      ? safety.cannotSay.slice(0, 3).map((item) => `- ${item}`)
      : ["- No additional overstatement identified from the selected measures."]),
    "",
    "RECOMMENDED NEXT EVIDENCE",
    ...safety.wouldStrengthen.slice(0, 3).map((item) => `- ${item}`),
    "",
    "Generated in Evidence Studio. Review and validate before use in a live decision.",
  ].join("\n");

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  const downloadBrief = () => {
    const blob = new Blob([briefText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = state.demo
      ? "northstar-evidence-studio-decision-brief.txt"
      : "evidence-studio-decision-brief.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const closeReview = () => {
    setOpenReview(false);
    window.requestAnimationFrame(() => reviewTrigger.current?.focus());
  };

  return (
    <div className="brief-workspace">
      <p className="measure text-[16px] leading-relaxed text-foreground/80">
        Start with the decision summary. Open the supporting analysis when you need the detail, and
        review the evidence before sharing the brief.
      </p>

      <div className="no-print mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyBrief}
          className="min-h-11 bg-[var(--navy)] px-5 py-2.5 text-[14px] font-medium text-[var(--surface)] transition-colors hover:bg-[var(--teal)]"
        >
          {copied ? "Copied" : "Copy the brief"}
        </button>
        <button
          type="button"
          onClick={downloadBrief}
          className="min-h-11 border border-[var(--navy)] px-5 py-2.5 text-[14px] font-medium text-[var(--navy)] transition-colors hover:bg-[var(--navy)] hover:text-[var(--surface)]"
        >
          Download .txt
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 border border-border px-5 py-2.5 text-[14px] font-medium text-[var(--navy)] transition-colors hover:bg-[var(--tint-navy)]"
        >
          Print the brief
        </button>
        <button
          ref={reviewTrigger}
          type="button"
          onClick={() => setOpenReview(true)}
          className="min-h-11 border border-[var(--signal)] px-5 py-2.5 text-[14px] font-medium text-[var(--signal)] transition-colors hover:bg-[var(--signal)] hover:text-[var(--surface)]"
        >
          Challenge This Recommendation
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Decision brief copied to the clipboard." : ""}
        </span>
      </div>

      {copyError && (
        <p role="alert" className="mt-3 text-sm text-[var(--signal)]">
          Clipboard access is unavailable. Use Download .txt to keep your brief.
        </p>
      )}
      <article className="decision-brief mt-8 border border-border bg-[var(--surface)]">
        <header className="border-b border-border p-7 sm:p-10">
          <p className="label-xs text-[var(--teal)]">Executive decision brief</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.demo
              ? "Fictional Northstar worked example · illustrative data"
              : "Practitioner working brief · inputs not independently verified"}
          </p>
          <h3 className="mt-4 text-2xl leading-snug sm:text-3xl">
            {state.brief.businessQuestion ||
              "State the business question this program is meant to answer."}
          </h3>
          <details className="disclosure no-print mt-4 max-w-2xl">
            <summary className="min-h-11 cursor-pointer py-3 text-sm text-[var(--teal)]">
              Edit the business question
            </summary>
            <TextArea
              label="Edit the question"
              rows={2}
              value={state.brief.businessQuestion}
              onChange={(v) => updateBrief({ businessQuestion: v })}
              placeholder="Should we scale this program next quarter?"
            />
          </details>
        </header>

        {/* ------------------------- the decision itself ---------------------- */}
        <div className="border-b border-border p-7 sm:p-10">
          <p className="label-xs text-[var(--navy)]">Studio suggestion · rule-based</p>
          <p className="mt-3 text-[20px] leading-snug text-[var(--navy)] sm:text-[24px]">
            {brief.decision}
          </p>

          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <PlainRow label="Why">{brief.why}</PlainRow>
            <PlainRow label="Biggest uncertainty">{brief.uncertainty}</PlainRow>
            <PlainRow label="Tradeoff accepted">
              {state.brief.keyTradeoff || brief.tradeoff}
            </PlainRow>
            <PlainRow label="Evidence needed">{brief.evidenceNeeded}</PlainRow>
            <PlainRow label="What not to claim">{brief.doNotClaim}</PlainRow>
            <PlainRow label="Confidence in the evidence">
              <span className={LEVEL_STYLE[confidence.level]}>{confidence.level}</span>.{" "}
              {confidence.headline}
            </PlainRow>
          </dl>
          <JudgmentNote judgment={brief.judgment} />
        </div>

        {causal.triggered && (
          <div className="border-b border-[var(--signal)] bg-[var(--background)] p-7 sm:p-10">
            <p className="label-xs text-[var(--signal)]">Causal claim check</p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {causal.explanation} {causal.saferWording}
            </p>
          </div>
        )}

        <details className="disclosure brief-analysis" data-print-expand>
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b border-border px-7 py-5 text-[var(--teal)] sm:px-10">
            <span>
              <span className="block font-semibold">Supporting analysis & your decision</span>
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                Context, alternatives, claim limits, tradeoffs and your editable recommendation
              </span>
            </span>
            <ChevronDown aria-hidden className="h-5 w-5 shrink-0" />
          </summary>
          <div className="disclosure-content grid gap-px bg-border sm:grid-cols-2">
            <BriefBlock title="Learner context" kind="user">
              {state.profiles.some((p) => p.name || p.role) ? (
                <ul className="space-y-3">
                  {state.profiles.map((p) => (
                    <li key={p.id}>
                      <span className="text-[var(--navy)]">{p.name || "Unnamed profile"}</span>
                      {p.role ? ` — ${p.role}.` : "."} {p.note}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No learner context has been described yet.</Empty>
              )}
            </BriefBlock>

            <BriefBlock title="Is this a learning problem?" kind="hypothesis">
              <span className="text-[var(--navy)]">{problem.level}.</span> {problem.statement}
            </BriefBlock>

            <BriefBlock title="Transfer risk" kind="model">
              <span className="text-[var(--navy)]">
                Weakest condition: {transfer.weakest.label} ({transfer.weakest.band}).
              </span>{" "}
              {transfer.summary} {transfer.observedNote}
            </BriefBlock>

            <BriefBlock title="Current strategy" kind="user">
              {current || <Empty>Scenario A is empty.</Empty>}
            </BriefBlock>

            <BriefBlock title="Alternative compared" kind="model">
              {journey || <Empty>Scenario B is empty.</Empty>}
            </BriefBlock>

            <BriefBlock title="What you can say today" kind="evidence">
              <ul className="space-y-2">
                {safety.canSay.slice(0, 3).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </BriefBlock>

            <BriefBlock title="What you cannot say yet" kind="hypothesis">
              {safety.cannotSay.length ? (
                <ul className="space-y-2">
                  {safety.cannotSay.slice(0, 3).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <Empty>Nothing is currently overstated by the selected measures.</Empty>
              )}
            </BriefBlock>

            <BriefBlock title="Tradeoffs" kind="model">
              <ul className="space-y-2">
                {costs.map((t) => (
                  <li key={t.headline}>
                    <span className="text-[var(--navy)]">{t.headline}.</span> {t.explanation}
                  </li>
                ))}
              </ul>
            </BriefBlock>

            <BriefBlock title="Key tradeoff, in your words" kind="user">
              <TextArea
                label="Your statement"
                rows={3}
                value={state.brief.keyTradeoff}
                onChange={(v) => updateBrief({ keyTradeoff: v })}
                placeholder={costs[0]?.headline ?? "State the cost of the recommended path."}
              />
            </BriefBlock>

            <BriefBlock title="Recommended next evidence" kind="model">
              <ul className="space-y-2">
                {safety.wouldStrengthen.slice(0, 3).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </BriefBlock>

            <BriefBlock title="Decision leaders can make now" kind="user">
              <TextArea
                label="Your statement"
                rows={3}
                value={state.brief.decisionNow}
                onChange={(v) => updateBrief({ decisionNow: v })}
                placeholder={brief.decision}
              />
            </BriefBlock>
          </div>
        </details>
        <details className="disclosure px-7 sm:px-10" data-print-expand>
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-5 text-sm font-semibold text-[var(--teal)]">
            Evidence chain at time of decision
            <ChevronDown aria-hidden className="h-4 w-4" />
          </summary>
          <div className="pb-6">
            <ChainStack states={states} />
          </div>
        </details>
      </article>

      {openReview && <SkepticalReview onClose={closeReview} />}
    </div>
  );
}

function PlainRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="label-xs text-[var(--navy)]">{label}</dt>
      <dd className="mt-2 text-[15px] leading-relaxed text-foreground/85">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function BriefBlock({
  title,
  kind,
  children,
}: {
  title: string;
  kind: "evidence" | "model" | "user" | "hypothesis";
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[var(--surface)] p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 className="label-xs text-[var(--navy)]">{title}</h4>
        <EvidenceLabel kind={kind} />
      </div>
      <div className="mt-3 text-[15px] leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

const RISK_STYLE = {
  high: "text-[var(--signal)]",
  moderate: "text-[var(--clay)]",
  low: "text-muted-foreground",
} as const;

function SkepticalReview({ onClose }: { onClose: () => void }) {
  const { state, setStep } = useStudio();
  const { items, judgment } = skepticalReview(snapshotOf(state));
  const priority = { high: 0, moderate: 1, low: 2 };
  const ordered = items
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => priority[a.risk] - priority[b.risk] || a.index - b.index);
  const count = ordered.filter((item) => item.risk === "high").length;
  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="review-overlay fixed inset-0 z-50 bg-[var(--navy)]/30" />
        <DialogPrimitive.Content
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="review-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-[var(--background)] shadow-xl"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-7">
            <div>
              <p className="label-xs text-[var(--signal)]">The Skeptical Review</p>
              <DialogPrimitive.Title className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
                The case against this recommendation.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-3 text-sm leading-relaxed text-foreground/80">
                {count
                  ? count + " high-risk questions to examine first. "
                  : "Examine the most consequential assumption first. "}
                These rule-based challenges guide your review; they are not a verdict.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="min-h-11 shrink-0 border border-border px-3 text-sm text-[var(--navy)]">
              Close
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
            <ol>
              {ordered.map((item, i) => (
                <li key={item.question} className="border-b border-border">
                  <details className="disclosure" open={i === 0}>
                    <summary className="flex cursor-pointer items-start justify-between gap-4 py-5">
                      <span>
                        <span className={"label-xs " + RISK_STYLE[item.risk]}>
                          {item.risk} risk
                        </span>
                        <span className="mt-2 block text-[17px] font-medium leading-snug text-[var(--navy)]">
                          {item.question}
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden
                        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                      />
                    </summary>
                    <div className="disclosure-content pb-6">
                      <dl className="space-y-4 text-sm leading-relaxed">
                        <div>
                          <dt className="label-xs text-[var(--signal)]">The challenge</dt>
                          <dd className="mt-2">{item.answer}</dd>
                        </div>
                        <div>
                          <dt className="label-xs text-[var(--navy)]">If this holds</dt>
                          <dd className="mt-2">{item.consequence}</dd>
                        </div>
                        <div className="border-l-2 border-[var(--teal)] bg-[var(--tint-teal)] p-4">
                          <dt className="label-xs text-[var(--teal)]">Next evidence to collect</dt>
                          <dd className="mt-2">{item.test}</dd>
                        </div>
                      </dl>
                      <div className="mt-4">
                        <EvidenceLabel kind="hypothesis" />
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <JudgmentNote judgment={judgment} />
            </div>
          </div>
          <div className="shrink-0 border-t border-border p-5 sm:px-7">
            <button
              type="button"
              onClick={() => {
                onClose();
                setStep(3);
              }}
              className="action-primary w-full justify-center"
            >
              Review the missing evidence →
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Returns to your Reality check with all inputs preserved.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
