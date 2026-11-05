/**
 * Evidence Check — the two-minute homepage tool.
 *
 * Pure, deterministic rules. No UI, no storage, and no connection to the Studio store:
 * the visitor's Studio inputs are never read or written here.
 *
 * Chain states come from the same `chainStates()` used by the Studio, so both views
 * always agree about what a set of measures can support.
 */
import { CHAIN, MEASURES, type ChainState } from "./studio-data";
import { chainStates } from "./studio-logic";
import { listPhrase } from "./studio-engine";
import { GENERIC_PROVENANCE } from "./chain-provenance";

export { chainStates };

export type Answer = "yes" | "no" | "unsure";

export const TIERS: { tier: string; kirkpatrick: string }[] = [
  { tier: "Participation", kirkpatrick: "Not a Kirkpatrick level" },
  { tier: "Reaction", kirkpatrick: "Kirkpatrick L1" },
  { tier: "Learning", kirkpatrick: "Kirkpatrick L2" },
  { tier: "Transfer", kirkpatrick: "Kirkpatrick L3" },
  { tier: "Performance", kirkpatrick: "Kirkpatrick L4" },
  { tier: "Outcome", kirkpatrick: "Kirkpatrick L4" },
];

/** Plain-language examples shown under each measure. */
export const MEASURE_EXAMPLES: Record<string, string> = {
  attendance: "Who showed up",
  completion: "LMS completion rate",
  satisfaction: "End-of-course survey",
  confidence: "“I feel ready” self-rating",
  knowledge: "Quiz or test score",
  skill: "Role-play or task scored to a rubric",
  behavior: "Observed use on the job",
  usage: "System or tool logs",
  observation: "Manager checks chances to apply",
  output: "Quality or error rates",
  performance: "Performance ratings or KPIs",
  business: "Sales, retention, safety, NPS",
};

export type Preset = { id: string; label: string; measured: string[]; note: string };

/** Typical starting patterns. Not data about any organization. */
export const PRESETS: Preset[] = [
  {
    id: "smile",
    label: "Completion + satisfaction survey",
    measured: ["attendance", "completion", "satisfaction"],
    note: "The most common training report.",
  },
  {
    id: "confidence",
    label: "…plus a confidence rating",
    measured: ["attendance", "completion", "satisfaction", "confidence"],
    note: "Common in leadership and manager programs.",
  },
  {
    id: "quiz",
    label: "Completion + a quiz",
    measured: ["completion", "knowledge"],
    note: "Typical for compliance and product training.",
  },
  {
    id: "numbers",
    label: "“We trained, and the numbers went up”",
    measured: ["completion", "satisfaction", "business"],
    note: "In this example, a business metric was reported to have risen. Watch what the chain says about the links in between.",
  },
  {
    id: "blank",
    label: "Blank slate",
    measured: [],
    note: "Start from nothing and tick what you have.",
  },
];

export function matchPreset(measured: string[]): string | null {
  const hit = PRESETS.find(
    (p) => p.measured.length === measured.length && p.measured.every((m) => measured.includes(m)),
  );
  return hit ? hit.id : null;
}

export type Condition = {
  id: string;
  question: string;
  why: string;
  /** Phrase used when the answer is "no". */
  barrier: string;
  /** Chain links this condition can block. */
  links: string[];
};

/** Work-environment conditions with consistent support in the transfer literature. */
export const CONDITIONS: Condition[] = [
  {
    id: "opportunity",
    question: "Did people get regular chances to use it at work?",
    why: "No occasion to perform means no transfer, whatever was learned.",
    barrier: "too few chances to use the skill",
    links: ["opportunity"],
  },
  {
    id: "manager",
    question: "Did managers expect and support its use?",
    why: "Supervisor support is one of the strongest environmental predictors of transfer.",
    barrier: "weak manager support",
    links: ["transfer"],
  },
  {
    id: "time",
    question: "Was there time to apply it in the normal workload?",
    why: "Lack of time is the barrier trainees name most often.",
    barrier: "no time in the workload",
    links: ["opportunity"],
  },
  {
    id: "tools",
    question: "Did processes, tools and incentives allow the new way of working?",
    why: "A workflow or incentive can cancel out a new skill.",
    barrier: "processes, tools or incentives working against it",
    links: ["transfer", "performance"],
  },
];

export const DEFAULT_ANSWERS: Record<string, Answer> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, "unsure" as Answer]),
);

/** Barriers reported by the visitor, keyed by chain link. Barriers never change evidence states. */
export function barriersByLink(answers: Record<string, Answer>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of CONDITIONS) {
    if (answers[c.id] !== "no") continue;
    for (const link of c.links) (out[link] ??= []).push(c.barrier);
  }
  return out;
}

export const linkLabel = (id: string) => CHAIN.find((n) => n.id === id)?.label ?? id;

export type Reach = {
  /** Index of the furthest measured link, or -1. */
  furthest: number;
  /** Index of the first unknown link, or -1. */
  firstGap: number;
  /** Unknown links that sit before the furthest measured link. */
  brokenBefore: string[];
  /** Assumed links that sit before the furthest measured link. */
  assumedBefore: string[];
  observedCount: number;
  /** Links from the start up to (not including) the first unknown link. */
  litFromStart: number;
  /** Consecutive measured links from the start. */
  measuredRun: number;
};

export function claimReach(states: Record<string, ChainState>): Reach {
  const ids = CHAIN.map((n) => n.id);
  let furthest = -1;
  ids.forEach((id, i) => {
    if (states[id] === "measured") furthest = i;
  });
  const firstGap = ids.findIndex((id) => states[id] === "unknown");
  const firstUnmeasured = ids.findIndex((id) => states[id] !== "measured");
  const before = furthest >= 0 ? ids.slice(0, furthest) : [];
  return {
    furthest,
    firstGap,
    brokenBefore: before.filter((id) => states[id] === "unknown"),
    assumedBefore: before.filter((id) => states[id] === "assumed"),
    observedCount: ids.filter((id) => states[id] === "measured").length,
    litFromStart: firstGap === -1 ? ids.length : firstGap,
    measuredRun: firstUnmeasured === -1 ? ids.length : firstUnmeasured,
  };
}

export type ReachMessage = {
  /** Lead-in before the emphasized link name, e.g. "The furthest measured link is ". */
  lead: string;
  /** The furthest measured link, or null when nothing is measured. */
  link: string | null;
  note: string;
  tone: "warn" | "info";
};

/**
 * One wording for the claim-reach readout, shared by the tool, the hero and the demo.
 * It names the furthest measured link and, separately, the state of the links before it,
 * so a lit outcome is never read as a supported connection.
 */
export function reachMessage(states: Record<string, ChainState>): ReachMessage {
  const r = claimReach(states);
  if (r.furthest < 0)
    return {
      lead: "Nothing observed yet.",
      link: null,
      note: "Tick the measures you have. A link lights up only where something was observed.",
      tone: "info",
    };
  const far = CHAIN[r.furthest]!.label;
  const are = (n: number) => (n > 1 ? "are" : "is");
  if (r.brokenBefore.length)
    return {
      lead: "The furthest measured link is ",
      link: far,
      note: `${listPhrase(r.brokenBefore.map(linkLabel))} ${are(r.brokenBefore.length)} unknown, so nothing selected links the training to ${far === "Business outcome" ? "the business outcome" : far.toLowerCase()}.`,
      tone: "warn",
    };
  const parts: string[] = [];
  if (r.assumedBefore.length)
    parts.push(
      `${listPhrase(r.assumedBefore.map(linkLabel))} ${are(r.assumedBefore.length)} assumed, not observed.`,
    );
  if (r.firstGap > r.furthest)
    parts.push(`Beyond ${far}, ${CHAIN[r.firstGap]!.label} has no evidence yet.`);
  parts.push("Measured means recorded, not caused by the program.");
  return { lead: "The furthest measured link is ", link: far, note: parts.join(" "), tone: "info" };
}

/* ---------------------------- Input provenance ---------------------------- */

export type InputOrigin =
  | { kind: "example"; presetId: string }
  | { kind: "edited-example"; presetId: string }
  | { kind: "own" };

export function provenanceLabel(origin: InputOrigin): string {
  if (origin.kind === "own") return "Your own selections.";
  const label = PRESETS.find((p) => p.id === origin.presetId)?.label ?? "example";
  return origin.kind === "example"
    ? `Example inputs: ${label}. Illustrative, not real data.`
    : `Example inputs (${label}), edited. Illustrative, not real data.`;
}

/** Editing an example keeps its example status; own selections stay your own. */
export function originAfterEdit(origin: InputOrigin): InputOrigin {
  return origin.kind === "example" ? { kind: "edited-example", presetId: origin.presetId } : origin;
}

/* --------------------------------- Brief --------------------------------- */

export type CheckBrief = {
  headline: string;
  decision: string;
  canSay: string[];
  /** Reminder that selections are measures, not results. */
  resultsNote: string;
  cannotSay: string[];
  nextEvidence: { link: string | null; addresses: string | null; text: string }[];
  question: string;
  answer: string;
};

const ADDRESSES: Record<string, string> = {
  learning: "whether people learned the skill",
  transfer: "whether people use it on the job",
  opportunity: "whether people had real chances to apply it",
  performance: "whether the quality of work changed",
  outcome: "whether the business result moved, and why",
};

/**
 * The decision brief. Selections say which measures exist; they carry no results,
 * baselines or comparisons. Every sentence is worded so it stays true when quoted alone.
 */
export function buildCheckBrief(measured: string[], answers: Record<string, Answer>): CheckBrief {
  const st = chainStates(measured);
  const learningM = st["learning"] === "measured";
  const transferM = st["transfer"] === "measured";
  const perfM = st["performance"] === "measured";
  const outM = st["outcome"] === "measured";

  const canSay: string[] = [];
  if (measured.includes("attendance") || measured.includes("completion"))
    canSay.push("Participation was recorded (attendance or completion).");
  if (measured.includes("satisfaction"))
    canSay.push("Participants’ reactions were collected (a satisfaction survey).");
  if (measured.includes("confidence"))
    canSay.push(
      "Participants rated their own confidence (a self-rating, not a demonstrated skill).",
    );
  if (learningM) canSay.push("Knowledge or skill was assessed.");
  if (st["opportunity"] === "measured")
    canSay.push("Managers recorded whether people had chances to apply it.");
  if (transferM) canSay.push("Workplace use was observed or recorded.");
  if (perfM) canSay.push("Work output or performance was tracked.");
  if (outM) canSay.push("A business metric was tracked.");

  const cannotSay: string[] = [];
  cannotSay.push(
    learningM
      ? "Whether knowledge or skill changed. That needs scores compared with a baseline."
      : "That people learned the skill.",
  );
  cannotSay.push(
    transferM
      ? "Whether on-the-job behavior changed. That needs a before-and-after or comparison group."
      : "That people use it on the job.",
  );
  if (outM || perfM)
    cannotSay.push(
      "Whether the metric moved, or why. Tracking a metric doesn’t show its direction or the program’s contribution.",
    );
  else cannotSay.push("That the quality of work improved, or any ROI or business impact.");
  cannotSay.push(
    "That the program caused any change. That needs a comparison design and a look at other explanations.",
  );

  const no = CONDITIONS.filter((c) => answers[c.id] === "no").map((c) => c.barrier);
  const unsure = CONDITIONS.filter((c) => answers[c.id] === "unsure");

  const nextEvidence: CheckBrief["nextEvidence"] = [];
  if (no.length)
    nextEvidence.push({
      link: "Reported barrier",
      addresses: "whether it is real and how widespread it is",
      text: `Ask managers and a few participants whether ${no[0]} limited their use of the skill.`,
    });
  const target = ["learning", "transfer", "opportunity", "performance", "outcome"].find(
    (id) => st[id] !== "measured",
  );
  if (target)
    nextEvidence.push({
      link: linkLabel(target),
      addresses: ADDRESSES[target] ?? null,
      text: GENERIC_PROVENANCE[target]!.nextEvidence[0]!,
    });
  if (target !== "transfer" && !transferM)
    nextEvidence.push({
      link: "Transfer",
      addresses: ADDRESSES["transfer"]!,
      text: GENERIC_PROVENANCE["transfer"]!.nextEvidence[0]!,
    });
  if (!target)
    nextEvidence.push({
      link: null,
      addresses: "whether the program contributed",
      text: "Compare results with a group or period without the program, so any change has a reference point.",
    });

  let question: string;
  let answer: string;
  if (no.length) {
    question = `What if ${no[0]} is the real constraint?`;
    answer = `You reported ${listPhrase(no)}. If that’s confirmed, it can limit whether people use what they learned, and more training alone is unlikely to change it. Verify it before you scale, redesign or stop the program.`;
  } else if ((outM || perfM) && !transferM) {
    question = "What else could explain the metric?";
    answer =
      "Nothing selected shows people did anything differently. Pricing, staffing, seasonality or a new tool could also move it.";
  } else if (!transferM) {
    question = "What if people learned it but never used it on the job?";
    answer =
      "Nothing yet separates a learning problem from a transfer problem. One structured observation of real work would.";
  } else {
    question = "What else changed during the same period?";
    answer =
      "Staffing, tools, incentives and seasonality all move at once. Without a comparison group, a before-and-after change can’t be credited to the program.";
  }
  if (!no.length && unsure.length)
    answer += ` You weren’t sure about ${unsure.length} work condition${unsure.length > 1 ? "s" : ""}; each is a competing explanation worth checking.`;

  let headline: string;
  if (!canSay.length) headline = "No measures selected. There’s nothing to claim yet.";
  else if ((outM || perfM) && !transferM)
    headline = `${outM ? "A business metric" : "Work performance"} is tracked. Nothing selected links it to the training.`;
  else if (learningM && transferM)
    headline =
      "Learning and workplace use were measured. Whether they changed, and why, is still open.";
  else if (transferM)
    headline =
      "Workplace use was recorded. What was learned, and whether anything changed, is still open.";
  else if (learningM)
    headline = "Knowledge or skill was assessed. Whether work changed is still unknown.";
  else headline = "You can report participation and reactions. You can’t yet say anything changed.";

  let decision: string;
  if (no.length)
    decision =
      "Verify the reported barrier with managers and a few participants before deciding to scale, redesign or stop the program.";
  else if (!learningM && !transferM)
    decision =
      "Hold off on scaling. A small check of learning and workplace use would show whether the program is doing its job. Time the workplace check for when people have had real chances to use the skill.";
  else if (!transferM)
    decision =
      "Check workplace use before scaling, once people have had real chances to apply the skill.";
  else if (!perfM && !outM)
    decision =
      "Collect results for the measures you have, then connect workplace use to a work measure before claiming business impact.";
  else
    decision =
      "Collect results with a baseline or comparison group, and weigh other explanations, before crediting the program.";

  const resultsNote =
    "These confirm which measures exist, not their results. To report a result, add the values and compare them with a baseline or a group that didn’t take part.";

  return { headline, decision, canSay, resultsNote, cannotSay, nextEvidence, question, answer };
}

/** The chain as one line of text, for copied and downloaded briefs. */
export function chainLine(
  states: Record<string, ChainState>,
  barriers: Record<string, string[]> = {},
): string {
  return CHAIN.map(
    (n, i) =>
      `${String(i + 1).padStart(2, "0")} ${n.label} (${states[n.id] ?? "unknown"}${barriers[n.id] ? ", barrier reported" : ""})`,
  ).join(" > ");
}

export function briefAsText(b: CheckBrief, provenance: string, chain?: string): string {
  return [
    "TRAINING EVIDENCE BRIEF",
    `Inputs: ${provenance}`,
    ...(chain ? [`Evidence chain: ${chain}`] : []),
    "",
    b.headline,
    "",
    `Suggested next decision: ${b.decision}`,
    "",
    "What we can say:",
    ...b.canSay.map((x) => `- ${x}`),
    `(${b.resultsNote})`,
    "",
    "What we can't say yet:",
    ...b.cannotSay.map((x) => `- ${x}`),
    "",
    "Suggested next evidence:",
    ...b.nextEvidence.map(
      (x) =>
        `- ${x.link ? `${x.link}` : "Next step"}${x.addresses ? ` (to find out ${x.addresses})` : ""}: ${x.text}`,
    ),
    "",
    "What would make this wrong?",
    b.question,
    b.answer,
    "",
    "Generated by Evidence Studio, a prototype. It describes which measures exist; it does not report results, predict impact or calculate ROI. Practitioner judgment applies.",
  ].join("\n");
}

export { MEASURES, CHAIN };
