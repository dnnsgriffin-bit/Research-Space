import {
  CHAIN,
  MEASURES,
  componentDef,
  type ChainState,
  type Direction,
  type EvidenceLabelKind,
  type PlacedComponent,
  type Profile,
} from "./studio-data";
import { listPhrase, type Judgment } from "./studio-engine";

export type Dimension = { id: string; label: string; invert?: boolean };

/** The eleven dimensions the sandbox compares. */
export const DIMENSIONS: Dimension[] = [
  { id: "retention", label: "Retention support" },
  { id: "authenticity", label: "Practice authenticity" },
  { id: "feedback", label: "Feedback quality" },
  { id: "transfer", label: "Transfer opportunity" },
  { id: "support", label: "Performance support" },
  { id: "learnerBurden", label: "Learner burden", invert: true },
  { id: "managerBurden", label: "Manager burden", invert: true },
  { id: "complexity", label: "Implementation complexity", invert: true },
  { id: "scalability", label: "Scalability" },
  { id: "measurement", label: "Measurement quality" },
  { id: "confidence", label: "Evidence confidence" },
];

export type ScenarioMetrics = Record<string, number> & {
  totalMinutes: number;
  span: number;
  distinctDays: number;
};

const has = (list: PlacedComponent[], id: string) => list.some((c) => c.refId === id);
const count = (list: PlacedComponent[], id: string) => list.filter((c) => c.refId === id).length;

const PRACTICE_IDS = ["retrieval", "scenario", "sim", "feedback", "peer"];

export function scoreScenario(components: PlacedComponent[]): ScenarioMetrics {
  const totalMinutes = components.reduce((s, c) => s + (c.minutes || 0), 0);
  const days = components.map((c) => c.day);
  const span = days.length ? Math.max(...days) - Math.min(...days) : 0;
  const distinctDays = new Set(days).size;

  const practiceComponents = components.filter((c) => c.practice || PRACTICE_IDS.includes(c.refId));
  const managerComponents = components.filter((c) => c.managerInvolved || c.refId === "coaching");
  const measureComponents = components.filter((c) =>
    ["assessment", "observation"].includes(c.refId),
  );

  const retention =
    (distinctDays >= 4 ? 3 : distinctDays === 3 ? 2 : distinctDays === 2 ? 1 : 0) +
    count(components, "retrieval") * 1.5 +
    (span >= 14 ? 1 : 0) +
    (has(components, "nudge") ? 0.5 : 0);

  const authenticity =
    (has(components, "sim") ? 3 : 0) +
    (has(components, "scenario") ? 2 : 0) +
    (has(components, "peer") ? 1 : 0) +
    (has(components, "worked") ? 0.5 : 0);

  const feedback =
    (has(components, "feedback") ? 3 : 0) +
    (has(components, "coaching") ? 1.5 : 0) +
    (has(components, "peer") ? 1 : 0) +
    (has(components, "scenario") ? 0.5 : 0);

  const transfer =
    (has(components, "coaching") ? 1.5 : 0) +
    (has(components, "peer") ? 1.5 : 0) +
    (has(components, "scenario") ? 1 : 0) +
    (has(components, "jobaid") || has(components, "support") ? 1 : 0) +
    (span >= 14 ? 1 : 0) +
    (has(components, "nudge") ? 0.5 : 0);

  const support =
    (has(components, "jobaid") ? 2 : 0) +
    (has(components, "support") ? 2.5 : 0) +
    (has(components, "nudge") ? 0.5 : 0);

  const learnerBurden = totalMinutes / 30 + components.length * 0.2;
  const managerBurden = managerComponents.reduce((s, c) => s + Math.max(1, c.minutes / 20), 0);
  const complexity =
    components.length * 0.7 +
    (has(components, "sim") ? 3 : 0) +
    managerComponents.length * 1.2 +
    (has(components, "ilt") ? 1 : 0);
  const scalability =
    9 -
    Math.min(
      7,
      managerComponents.length * 1.5 +
        (has(components, "ilt") ? 2.5 : 0) +
        (has(components, "sim") ? 2 : 0),
    );
  const measurement =
    measureComponents.length * 1.5 +
    (components.some((c) => c.refId === "assessment" && c.day >= 21) ? 1.5 : 0) +
    (has(components, "scenario") ? 0.5 : 0);
  const confidence = Math.min(7, measurement * 1.2 + (practiceComponents.length ? 1 : 0));

  return {
    retention,
    authenticity,
    feedback,
    transfer,
    support,
    learnerBurden,
    managerBurden,
    complexity,
    scalability,
    measurement,
    confidence,
    totalMinutes,
    span,
    distinctDays,
  } as ScenarioMetrics;
}

export type Comparison = {
  id: string;
  label: string;
  direction: Direction;
  note: string;
  labelKind: EvidenceLabelKind;
};

/** Seven-band directional scale. Deltas are never presented as effect sizes. */
const band = (delta: number, invert = false): Direction => {
  const d = invert ? -delta : delta;
  if (d >= 3) return "much-stronger";
  if (d >= 1.4) return "stronger";
  if (d >= 0.5) return "slightly-stronger";
  if (d <= -1.4) return invert ? "tradeoff" : "weaker";
  if (d <= -0.5) return invert ? "tradeoff" : "weaker";
  return "similar";
};

function mechanismNote(
  id: string,
  a: ScenarioMetrics,
  b: ScenarioMetrics,
  base: PlacedComponent[],
  alt: PlacedComponent[],
  profiles: Profile[],
): string {
  const added = alt.filter((c) => !base.some((x) => x.refId === c.refId));
  const removed = base.filter((c) => !alt.some((x) => x.refId === c.refId));
  const addedNames = listPhrase([...new Set(added.map((c) => componentDef(c.refId).name))]);
  const removedNames = listPhrase([...new Set(removed.map((c) => componentDef(c.refId).name))]);
  const lowManager = profiles.some((p) => p.managerSupport <= 2);
  const lowTime = profiles.some((p) => p.timeAvailable <= 2);
  const highComplexity = profiles.some((p) => p.taskComplexity >= 4);
  const infrequent = profiles.some((p) => ["Quarterly", "Rarely"].includes(p.taskFrequency));

  switch (id) {
    case "retention":
      return b["retention"]! > a["retention"]!
        ? `Spacing across ${b["distinctDays"]} contacts with ${count(alt, "retrieval")} retrieval opportunity${count(alt, "retrieval") === 1 ? "" : "ies"} introduces distributed practice, which is directionally favorable over a single massed exposure.`
        : b["retention"]! < a["retention"]!
          ? "Exposure is more concentrated, so recall depends on one event and on whatever the learner does afterwards unaided."
          : "Both designs distribute exposure to a comparable degree, so neither creates a retention advantage.";
    case "authenticity":
      return b["authenticity"]! > a["authenticity"]!
        ? `${addedNames || "Practice components"} create opportunity to rehearse decisions under conditions that resemble performance${highComplexity ? ", which matters more given the high task complexity recorded" : ""}.`
        : b["authenticity"]! < a["authenticity"]!
          ? `Removing ${removedNames || "practice"} shifts weight back onto exposure; learners meet the real conditions for the first time at work.`
          : "Practice conditions resemble the job to a similar degree in both designs.";
    case "feedback":
      return b["feedback"]! > a["feedback"]!
        ? "Feedback is introduced during practice, creating opportunity to detect and correct errors before they are rehearsed into habit."
        : b["feedback"]! < a["feedback"]!
          ? "Fewer occasions to correct errors during practice; mistakes are more likely to be practiced than corrected."
          : "Neither design changes how errors get corrected.";
    case "transfer":
      return b["transfer"]! > a["transfer"]!
        ? `Reinforcement extends past the event${lowManager && (has(alt, "coaching") || alt.some((c) => c.managerInvolved)) ? ", though the recorded low manager support reduces confidence that this mechanism will actually operate" : ""}.`
        : b["transfer"]! < a["transfer"]!
          ? "Fewer structured occasions to apply the skill in the flow of work."
          : "Neither design changes the conditions for application at work.";
    case "support":
      return b["support"]! > a["support"]!
        ? `Performance support may reduce memory dependence at the point of performance${infrequent ? ", which matters because the task is performed infrequently" : ""}.`
        : b["support"]! < a["support"]!
          ? "Without an aid at the point of performance, the design relies on unaided recall."
          : "Point-of-performance support is comparable.";
    case "learnerBurden":
      return b["totalMinutes"]! > a["totalMinutes"]!
        ? `Total learner time rises from ${a["totalMinutes"]} to ${b["totalMinutes"]} minutes${lowTime ? ", against a context that already reports little protected learning time" : ""}.`
        : b["totalMinutes"]! < a["totalMinutes"]!
          ? `Total learner time falls from ${a["totalMinutes"]} to ${b["totalMinutes"]} minutes, distributed across shorter contacts.`
          : "Total learner time is unchanged.";
    case "managerBurden":
      return b["managerBurden"]! > a["managerBurden"]!
        ? `Manager time is required, which is a real cost and an implementation dependency${lowManager ? "; manager support is already rated low" : ""}.`
        : b["managerBurden"]! < a["managerBurden"]!
          ? "Less manager time is required, which reduces dependence on inconsistent reinforcement."
          : "Manager involvement is comparable.";
    case "complexity":
      return b["complexity"]! > a["complexity"]!
        ? "More components to build, schedule and coordinate, each of which can fail independently."
        : b["complexity"]! < a["complexity"]!
          ? "Fewer moving parts, so fewer opportunities for delivery to diverge from design."
          : "Implementation complexity is comparable.";
    case "scalability":
      return b["scalability"]! > a["scalability"]!
        ? "Fewer facilitator- and manager-dependent steps make wider rollout more plausible."
        : b["scalability"]! < a["scalability"]!
          ? "Facilitator or manager dependence limits how widely this can run without degrading."
          : "Scalability is comparable.";
    case "measurement":
      return b["measurement"]! > a["measurement"]!
        ? "Delayed and demonstrated measures create evidence the current design cannot produce."
        : b["measurement"]! < a["measurement"]!
          ? "Fewer measurement points, so conclusions will rest more heavily on assumption."
          : "Neither design produces more evidence than the other.";
    case "confidence":
      return b["confidence"]! > a["confidence"]!
        ? "This design would generate more of the evidence needed to judge whether it worked."
        : b["confidence"]! < a["confidence"]!
          ? "This design would leave the central question unanswered, whatever its instructional merits."
          : "Neither design changes what you would be able to conclude afterwards.";
    default:
      return "";
  }
}

const LABEL_KIND: Record<string, EvidenceLabelKind> = {
  retention: "evidence",
  authenticity: "evidence",
  feedback: "evidence",
  transfer: "model",
  support: "model",
  learnerBurden: "user",
  managerBurden: "model",
  complexity: "user",
  scalability: "model",
  measurement: "evidence",
  confidence: "model",
};

export function compareScenarios(
  base: PlacedComponent[],
  alt: PlacedComponent[],
  profiles: Profile[] = [],
): Comparison[] {
  if (!alt.length || !base.length) {
    return DIMENSIONS.map((d) => ({
      id: d.id,
      label: d.label,
      direction: "insufficient" as Direction,
      note: !base.length
        ? "Scenario A has no components, so there is nothing to compare against."
        : "No components have been added to this scenario yet.",
      labelKind: "model" as EvidenceLabelKind,
    }));
  }

  const a = scoreScenario(base);
  const b = scoreScenario(alt);
  const lowManager = profiles.some((p) => p.managerSupport <= 2);
  const managerDependent = alt.some((c) => c.managerInvolved || c.refId === "coaching");

  return DIMENSIONS.map((d) => {
    let direction = band((b[d.id] ?? 0) - (a[d.id] ?? 0), d.invert);

    /* Context override: a mechanism that depends on absent conditions cannot be
       credited at full strength. */
    if (
      d.id === "transfer" &&
      managerDependent &&
      lowManager &&
      ["much-stronger", "stronger"].includes(direction)
    ) {
      direction = "slightly-stronger";
    }
    if (
      d.id === "transfer" &&
      managerDependent &&
      lowManager &&
      direction === "slightly-stronger"
    ) {
      direction = "tradeoff";
    }

    return {
      id: d.id,
      label: d.label,
      direction,
      labelKind: LABEL_KIND[d.id] ?? "model",
      note: mechanismNote(d.id, a, b, base, alt, profiles),
    };
  });
}

/* ------------------------------ Tradeoff engine ---------------------------- */

export type Tradeoff = { headline: string; explanation: string };

/** Every recommendation must carry a cost. If the comparison shows none, one is derived. */
export function tradeoffs(
  base: PlacedComponent[],
  alt: PlacedComponent[],
  profiles: Profile[],
): Tradeoff[] {
  const rows = compareScenarios(base, alt, profiles);
  const gains = rows.filter((r) =>
    ["much-stronger", "stronger", "slightly-stronger"].includes(r.direction),
  );
  const costs = rows.filter((r) => ["tradeoff", "weaker"].includes(r.direction));
  const out: Tradeoff[] = costs.map((c) => ({
    headline: `${gains[0]?.label ?? "Design"} gain, ${c.label.toLowerCase()} cost`,
    explanation: c.note,
  }));

  if (out.length) return out;

  if (!alt.length || !base.length) {
    return [
      {
        headline: "No comparison yet",
        explanation:
          "Both scenarios need components before a tradeoff can be identified. A design with no identified cost has usually not been examined closely enough.",
      },
    ];
  }

  const a = scoreScenario(base);
  const b = scoreScenario(alt);
  const derived: Tradeoff =
    b["totalMinutes"]! > a["totalMinutes"]!
      ? {
          headline: "Stronger design, more learner time",
          explanation: `The alternative asks for ${b["totalMinutes"]! - a["totalMinutes"]!} additional minutes per learner. Time is the cost that is easiest to omit from a business case and hardest to recover.`,
        }
      : b["distinctDays"]! > a["distinctDays"]!
        ? {
            headline: "Stronger design, more scheduling dependency",
            explanation:
              "Distributing the design across more contacts improves the conditions for retention, but each additional contact is another opportunity for the schedule to win.",
          }
        : {
            headline: "No cost identified yet",
            explanation:
              "The comparison shows advantages with no offsetting cost, which is rarely true in practice. Look for the cost in coordination, attention or opportunity before presenting this.",
          };
  return [derived];
}

/* ------------------------------ Evidence chain ----------------------------- */

export function chainStates(measured: string[]): Record<string, ChainState> {
  const states: Record<string, ChainState> = {};
  for (const node of CHAIN) {
    const related = MEASURES.filter((m) => m.chain === node.id);
    const anyMeasured = related.some((m) => measured.includes(m.id));
    const strong = related.filter((m) => measured.includes(m.id));
    if (node.id === "learning") {
      const demonstrated = measured.includes("knowledge") || measured.includes("skill");
      states[node.id] = demonstrated
        ? "measured"
        : measured.includes("confidence")
          ? "assumed"
          : "unknown";
      continue;
    }
    if (node.id === "mechanism") {
      states[node.id] = "assumed";
      continue;
    }
    states[node.id] = anyMeasured ? (strong.length ? "measured" : "assumed") : "unknown";
  }
  return states;
}

export function evidenceStatement(measured: string[]): string {
  const s = chainStates(measured);
  const can: string[] = [];
  const cannot: string[] = [];
  if (measured.includes("completion") || measured.includes("attendance")) can.push("completed");
  if (measured.includes("satisfaction")) can.push("liked the program");
  if (s["learning"] === "measured") can.push("were assessed for knowledge or skill");
  else cannot.push("demonstrated learning");
  if (s["transfer"] === "measured") can.push("had workplace behavior observed");
  else cannot.push("changed workplace behavior");
  if (s["performance"] === "measured") can.push("had performance indicators recorded");
  else cannot.push("improved performance");

  if (!can.length)
    return "No measures have been selected yet. As entered, your measurement strategy cannot support any conclusion about this program.";

  const canText = listPhrase(can);
  if (!cannot.length)
    return `The selected measures can document whether people ${canText}. No result or improvement follows from selecting a measure; compare values over time and consider alternative explanations.`;
  return `The selected measures can document whether people ${canText}. They cannot yet establish whether people ${listPhrase(cannot)}.`;
}

export const comparisonJudgment = (
  base: PlacedComponent[],
  alt: PlacedComponent[],
  profiles: Profile[],
): Judgment => ({
  title: "How the comparison was made",
  evidenceUsed: [
    `Current approach: ${base.length ? listPhrase(base.map((c) => componentDef(c.refId).name)) : "empty"}.`,
    `Alternative: ${alt.length ? listPhrase(alt.map((c) => componentDef(c.refId).name)) : "empty"}.`,
    profiles.length
      ? `Learner context ratings from ${profiles.length} profile${profiles.length > 1 ? "s" : ""}.`
      : "No learner context entered.",
  ],
  assumption:
    "That each component is delivered as specified. The comparison judges designs, not delivery.",
  rule: "Each dimension is scored from the components present, their spacing and their duration, then expressed as a direction rather than a magnitude. Mechanisms that depend on absent conditions — manager reinforcement where manager support is low — are downgraded rather than credited in full.",
  uncertainty:
    "A design comparison cannot estimate effect size. No statement of the form “retention will increase by 23%” is supportable from design characteristics alone.",
  wouldChange:
    "Adding or removing a component, changing its spacing, or changing the learner-context ratings will change these directions.",
});
