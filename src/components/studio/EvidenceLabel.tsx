import { EVIDENCE_LABELS, type EvidenceLabelKind } from "@/lib/studio-data";

const dotClass: Record<EvidenceLabelKind, string> = {
  evidence: "bg-[var(--evidence)]",
  model: "bg-[var(--teal)]",
  user: "bg-[var(--stone)]",
  hypothesis: "bg-[var(--signal)]",
};

export function EvidenceLabel({
  kind,
  className = "",
}: {
  kind: EvidenceLabelKind;
  className?: string;
}) {
  const meta = EVIDENCE_LABELS[kind];
  return (
    <span
      title={meta.meaning}
      className={`inline-flex items-center gap-1.5 label-xs text-muted-foreground ${className}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dotClass[kind]}`} />
      {meta.text}
      <span className="sr-only"> — {meta.meaning}</span>
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {(Object.keys(EVIDENCE_LABELS) as EvidenceLabelKind[]).map((k) => (
        <div key={k} className="border-t border-border pt-3">
          <dt>
            <EvidenceLabel kind={k} />
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-foreground/80">
            {EVIDENCE_LABELS[k].meaning}
          </dd>
        </div>
      ))}
    </dl>
  );
}
