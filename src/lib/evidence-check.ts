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
    note: "A business metric moved. Watch what the chain says about the links in between.",
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
  observedCount: number;
  /** Number of links from the start before the first unknown link. */
  litFromStart: number;
};

export function claimReach(states: Record<string, ChainState>): Reach {
  const ids = CHAIN.map((n) => n.id);
  let furthest = -1;
  ids.forEach((id, i) => {
    if (states[id] === "measured") furthest = i;
  });
  const firstGap = ids.findIndex((id) => states[id] === "unknown");
  return {
    furthest,
    firstGap,
    brokenBefore:
      furthest >= 0 ? ids.slice(0, furthest).filter((id) => states[id] === "unknown") : [],
    observedCount: ids.filter((id) => states[id] === "measured").length,
    litFromStart: firstGap === -1 ? ids.length : firstGap,
  };
}

export type CheckBrief = {
  headline: string;
  decision: string;
  canSay: string[];
  cannotSay: string[];
  nextEvidence: { link: string | null; text: string }[];
  question: string;
  answer: string;
};

export function buildCheckBrief(measured: string[], answers: Record<string, Answer>): CheckBrief {
  const st = chainStates(measured);
  const canSay: string[] = [];
  const cannotSay: string[] = [];

  if (measured.includes("attendance") || measured.includes("completion"))
    canSay.push("People attended or completed the program.");
  if (measured.includes("satisfaction"))
    canSay.push("Participants rated the experience (a reaction, not a learning measure).");
  if (measured.includes("confidence") && st["learning"] !== "measured")
    canSay.push(
      "Participants reported feeling more confident (self-report, not demonstrated skill).",
    );
  if (st["learning"] === "measured") canSay.push("Knowledge or skill was assessed.");
  if (st["opportunity"] === "measured")
    canSay.push("Managers checked whether people had chances to apply it.");
  if (st["transfer"] === "measured") canSay.push("Use on the job was observed or recorded.");
  if (st["performance"] === "measured") canSay.push("Work output or performance was recorded.");
  if (st["outcome"] === "measured")
    canSay.push("A business metric was tracked over the same period.");

  if (st["learning"] !== "measured") cannotSay.push("That people learned the skill.");
  if (st["transfer"] !== "measured") cannotSay.push("That people use it on the job.");
  if (st["performance"] !== "measured") cannotSay.push("That the quality of work improved.");
  cannotSay.push(
    st["outcome"] === "measured" || st["performance"] === "measured"
      ? "That the program caused the change. Measured links show what happened, not why."
      : "Any ROI or business impact.",
  );

  const target = ["learning", "transfer", "opportunity", "performance", "outcome"].find(
    (id) => st[id] !== "measured",
  );
  const nextEvidence: CheckBrief["nextEvidence"] = [];
  if (target)
    nextEvidence.push({
      link: linkLabel(target),
      text: GENERIC_PROVENANCE[target]!.nextEvidence[0]!,
    });
  if (target !== "transfer" && st["transfer"] !== "measured")
    nextEvidence.push({ link: "Transfer", text: GENERIC_PROVENANCE["transfer"]!.nextEvidence[0]! });
  if (!target)
    nextEvidence.push({
      link: null,
      text: "Add a comparison: a group or period without the program, so a change has a reference point.",
    });

  const no = CONDITIONS.filter((c) => answers[c.id] === "no").map((c) => c.barrier);
  const unsure = CONDITIONS.filter((c) => answers[c.id] === "unsure");

  let question: string;
  let answer: string;
  if (no.length) {
    question = `What if ${no[0]} is the real constraint, not the training?`;
    answer = `You reported ${listPhrase(no)}. More training won’t fix that. Check it before you scale, redesign or cut the program.`;
  } else if (st["outcome"] === "measured" && st["transfer"] !== "measured") {
    question = "What else moved the number during the same period?";
    answer =
      "The metric changed, but nothing shows people did anything differently. Pricing, staffing, seasonality or a new tool could explain it.";
  } else if (st["transfer"] !== "measured") {
    question = "What if people learned it but never used it on the job?";
    answer =
      "Nothing yet separates a learning problem from a transfer problem. One structured observation of real work would.";
  } else {
    question = "What else changed during the same period?";
    answer =
      "Staffing, tools, incentives and seasonality all move at once. Without a comparison group, a before-and-after change can’t be credited to the program.";
  }
  if (!no.length && unsure.length)
    answer += ` You weren’t sure about ${unsure.length} work condition${unsure.length > 1 ? "s" : ""}; each is a competing explanation worth a quick check.`;

  let headline: string;
  if (st["transfer"] === "measured" && st["learning"] === "measured")
    headline = "You can describe change on the job. You can’t yet say the training caused it.";
  else if (st["outcome"] === "measured" && st["transfer"] !== "measured")
    headline = "A business number moved. Nothing yet links it to the training.";
  else if (st["learning"] === "measured")
    headline = "You can say people learned. You can’t yet say work changed.";
  else if (canSay.length)
    headline = "You can report participation and reactions. You can’t yet say anything changed.";
  else headline = "No measures selected. There’s nothing to claim yet.";

  let decision: string;
  if (no.length) decision = "Fix the work conditions before investing more in training.";
  else if (st["learning"] !== "measured" && st["transfer"] !== "measured")
    decision =
      "Hold off on scaling. Run a small check of learning and on-the-job use first, typically 4–8 weeks.";
  else if (st["transfer"] !== "measured")
    decision = "Learning is shown. Check on-the-job use before you scale.";
  else if (st["performance"] !== "measured" && st["outcome"] !== "measured")
    decision =
      "Behavior change is observed. Connect it to a work metric before claiming business impact.";
  else
    decision =
      "Evidence runs along the chain. To credit the program, compare with a group or period without it.";

  return { headline, decision, canSay, cannotSay, nextEvidence, question, answer };
}

export function briefAsText(b: CheckBrief): string {
  return [
    "TRAINING EVIDENCE BRIEF",
    "",
    b.headline,
    "",
    `Suggested next decision: ${b.decision}`,
    "",
    "What we can say:",
    ...b.canSay.map((x) => `- ${x}`),
    "",
    "What we can't say yet:",
    ...b.cannotSay.map((x) => `- ${x}`),
    "",
    "Cheapest next evidence:",
    ...b.nextEvidence.map((x) => `- ${x.link ? `${x.link}: ` : ""}${x.text}`),
    "",
    "What would make this wrong?",
    b.question,
    b.answer,
    "",
    "Rule-based suggestions from Evidence Studio; practitioner judgment applies.",
  ].join("\n");
}

export { MEASURES, CHAIN };
