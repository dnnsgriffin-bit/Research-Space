/**
 * Compatibility wrapper. The signature interaction now lives in EvidenceChain.tsx;
 * this keeps existing call sites working while ignoring the retired layout props.
 */
import { EvidenceChain, StateMark, ChainStack } from "./EvidenceChain";
import type { ChainState } from "@/lib/studio-data";
import type { ProvenanceSet } from "@/lib/chain-provenance";

export { StateMark, ChainStack };

export function ChainDiagram({
  states,
  provenance,
  intro,
  title,
}: {
  states: Record<string, ChainState>;
  provenance?: ProvenanceSet;
  intro?: string;
  title?: string;
  /** retired */
  compact?: boolean;
  /** retired */
  highlight?: string;
}) {
  return <EvidenceChain states={states} provenance={provenance} intro={intro} title={title} />;
}
