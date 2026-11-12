/**
 * Deterministic reasoning engine for the Studio.
 *
 * Every output here is produced by transparent rules over the state the
 * practitioner entered. Nothing is fetched, inferred by a model, or estimated
 * numerically beyond what the rules can justify.
 */

import {
  ALTERNATIVE_CAUSES,
  EVIDENCE_DESIGNS,
  MEASURE_META,
  MEASURES,
  MECHANISMS,
  PILOT_DESIGNS,
  componentDef,
  type CauseId,
  type EvidenceState,
  type PilotDesignId,
  type PlacedComponent,
  type Pilot,
  type Profile,
} from "./studio-data";

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

/** The reasoning trail behind any single judgment the Studio makes. */
export type Judgment = {
  title: string;
  evidenceUsed: string[];
  assumption: string;
  rule: string;
  uncertainty: string;
  wouldChange: string;
};

export type Snapshot = {
  profiles: Profile[];
  measured: string[];
  evidence: EvidenceState;
  scenarios: { A: PlacedComponent[]; B: PlacedComponent[]; C: PlacedComponent[] };
  pilot: Pilot;
  brief: { businessQuestion: string; keyTradeoff: string; decisionNow: string };
};

const has = (list: string[], id: string) => list.includes(id);
const hasComp = (list: PlacedComponent[], id: string) => list.some((c) => c.refId === id);

const measureLabel = (id: string) => MEASURES.find((m) => m.id === id)?.label ?? id;

export const listPhrase = (items: string[]): string => {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0]!;
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]!}`;
};

/* -------------------------------------------------------------------------- */
/* 1. Evidence confidence model                                               */
/* -------------------------------------------------------------------------- */

export type Rating = "Weak" | "Partial" | "Adequate" | "Strong";
export type ConfidenceLevel = "LOW CONFIDENCE" | "MODERATE CONFIDENCE" | "STRONG CONFIDENCE";

const RATING_BY_SCORE: Rating[] = ["Weak", "Partial", "Adequate", "Strong"];
const rate = (score: number): Rating => RATING_BY_SCORE[Math.max(0, Math.min(3, score))]!;

export type ConfidenceDimension = {
  id: string;
  label: string;
  question: string;
  rating: Rating;
  why: string;
};

export type ConfidenceResult = {
  level: ConfidenceLevel;
  headline: string;
  dimensions: ConfidenceDimension[];
  limiting: ConfidenceDimension[];
  judgment: Judgment;
};

const maxDirectness = (measured: string[]) =>
  measured.reduce((max, id) => Math.max(max, MEASURE_META[id]?.directness ?? 0), 0);

const maxDesignStrength = (designs: string[]) =>
  designs.reduce(
    (max, id) => Math.max(max, EVIDENCE_DESIGNS.find((d) => d.id === id)?.strength ?? 0),
    0,
  );

export function evidenceConfidence(snap: Snapshot): ConfidenceResult {
  const { measured, evidence } = snap;
  const designs = evidence.designs;
  const directness = maxDirectness(measured);
  const strength = maxDesignStrength(designs);

  /* Relevance — does the evidence address the decision being made? */
  const decisionIsScale = /scale|roll ?out|expand|invest|continue|fund/i.test(
    snap.brief.businessQuestion || "",
  );
  const hasDownstream = ["behavior", "usage", "output", "performance", "business"].some((m) =>
    has(measured, m),
  );
  const relevanceScore = !measured.length
    ? 0
    : hasDownstream
      ? 3
      : has(measured, "skill") || has(measured, "knowledge")
        ? 2
        : 1;
  const relevance: ConfidenceDimension = {
    id: "relevance",
    label: "Relevance",
    question: "Does the evidence address the decision itself?",
    rating: rate(relevanceScore),
    why: !measured.length
      ? "No measures have been recorded, so nothing in the evidence base speaks to the decision."
      : hasDownstream
        ? "Measures reach the workplace behavior or results the decision is actually about."
        : relevanceScore === 2
          ? `The evidence addresses capability (${listPhrase(
              measured.filter((m) => ["knowledge", "skill"].includes(m)).map(measureLabel),
            )}), which is one step removed from the workplace question being decided.`
          : `The evidence describes delivery and reaction only${
              decisionIsScale ? ", while the decision is about scaling performance" : ""
            }.`,
  };

  /* Directness — construct or proxy? */
  const directTop = measured
    .slice()
    .sort((a, b) => (MEASURE_META[b]?.directness ?? 0) - (MEASURE_META[a]?.directness ?? 0))[0];
  const directness_: ConfidenceDimension = {
    id: "directness",
    label: "Directness",
    question: "Does the measure assess the construct, or a proxy for it?",
    rating: rate(directness),
    why: !measured.length
      ? "There is no measure to assess for directness."
      : directness >= 3
        ? `${measureLabel(directTop!)} is a direct observation rather than a proxy.`
        : directness === 2
          ? `${measureLabel(directTop!)} assesses the construct partially; it is closer to a proxy than to observed performance.`
          : `The strongest available measure is ${measureLabel(
              directTop!,
            )}, which is a self-report or an administrative proxy rather than the construct itself.`,
  };

  /* Design strength */
  const designStrength: ConfidenceDimension = {
    id: "design",
    label: "Design strength",
    question: "What kind of design produced the evidence?",
    rating: rate(strength >= 4 ? 3 : strength === 3 ? 2 : strength >= 1 ? 1 : 0),
    why: !designs.length
      ? "No study or data-collection design has been recorded."
      : listPhrase(designs.map((d) => EVIDENCE_DESIGNS.find((x) => x.id === d)?.label ?? d)) +
        ". " +
        (EVIDENCE_DESIGNS.find((d) => d.strength === strength && designs.includes(d.id))?.useful ??
          ""),
  };

  /* Triangulation */
  const families = new Set(
    designs.map((d) =>
      ["admin", "survey"].includes(d)
        ? "reported"
        : ["interviews"].includes(d)
          ? "qualitative"
          : ["systemdata", "observation"].includes(d)
            ? "observed"
            : "designed",
    ),
  );
  const triScore = families.size >= 3 ? 3 : families.size === 2 ? 2 : families.size === 1 ? 1 : 0;
  const triangulation: ConfidenceDimension = {
    id: "triangulation",
    label: "Triangulation",
    question: "Do multiple independent sources converge?",
    rating: rate(triScore),
    why:
      triScore === 0
        ? "No sources are recorded, so convergence cannot be assessed."
        : triScore === 1
          ? "All evidence comes from a single family of sources, so agreement between methods is untested."
          : `${families.size} independent families of evidence are present (${listPhrase([...families])}), which allows one to check the other.`,
  };

  /* Recency */
  const recencyScore =
    evidence.recency === "current"
      ? 3
      : evidence.recency === "aging"
        ? 2
        : evidence.recency === "stale"
          ? 0
          : 1;
  const recency: ConfidenceDimension = {
    id: "recency",
    label: "Recency",
    question: "Is the evidence current enough for this decision?",
    rating: rate(recencyScore),
    why:
      evidence.recency === "current"
        ? "Evidence was collected inside the current cycle and describes conditions as they are now."
        : evidence.recency === "aging"
          ? "Evidence is 6–18 months old; conditions may have shifted but the picture is probably still informative."
          : evidence.recency === "stale"
            ? "Evidence predates a material change, so it may describe an organization that no longer exists."
            : "The age of the evidence has not been recorded, which is itself a gap.",
  };

  /* Sample fit */
  const sampleScore =
    evidence.sampleFit === "representative"
      ? 3
      : evidence.sampleFit === "partial"
        ? 2
        : evidence.sampleFit === "mismatched"
          ? 0
          : 1;
  const sampleFit: ConfidenceDimension = {
    id: "sample",
    label: "Sample fit",
    question: "Does the evidence represent the relevant population?",
    rating: rate(sampleScore),
    why:
      evidence.sampleFit === "representative"
        ? "The people who supplied the evidence resemble the people the decision affects."
        : evidence.sampleFit === "partial"
          ? "Part of the population is represented; conclusions travel only as far as that segment."
          : evidence.sampleFit === "mismatched"
            ? "Evidence comes from a different population or context, so transferring it is an assumption."
            : "Who supplied the evidence has not been recorded.",
  };

  /* Consistency */
  const consistencyScore =
    evidence.consistency === "converging"
      ? 3
      : evidence.consistency === "mixed"
        ? 2
        : evidence.consistency === "conflicting"
          ? 0
          : 1;
  const consistency: ConfidenceDimension = {
    id: "consistency",
    label: "Consistency",
    question: "Are the sources telling compatible stories?",
    rating: rate(consistencyScore),
    why:
      evidence.consistency === "converging"
        ? "Sources agree, which raises confidence provided they are genuinely independent."
        : evidence.consistency === "mixed"
          ? "Sources partly agree; the disagreement is information, not noise to be averaged away."
          : evidence.consistency === "conflicting"
            ? "Sources contradict each other. Until the contradiction is explained, confidence cannot rise above moderate."
            : "Only one source exists, so consistency has never been tested.",
  };

  const dimensions = [
    relevance,
    directness_,
    designStrength,
    triangulation,
    recency,
    sampleFit,
    consistency,
  ];

  const total =
    relevanceScore +
    Math.min(3, directness) +
    (strength >= 4 ? 3 : strength === 3 ? 2 : strength >= 1 ? 1 : 0) +
    triScore +
    recencyScore +
    sampleScore +
    consistencyScore;

  let level: ConfidenceLevel = "LOW CONFIDENCE";
  if (total >= 15 && directness >= 2 && strength >= 3 && evidence.consistency !== "conflicting") {
    level = "STRONG CONFIDENCE";
  } else if (total >= 9 && directness >= 2 && strength >= 2) {
    level = "MODERATE CONFIDENCE";
  }
  if (!measured.length) level = "LOW CONFIDENCE";

  const limiting = dimensions.filter((d) => d.rating === "Weak" || d.rating === "Partial");

  const headline = !measured.length
    ? "No evidence has been entered, so no conclusion about this program is supportable."
    : level === "STRONG CONFIDENCE"
      ? "Multiple reasonably direct sources agree, produced by a design capable of supporting the claim."
      : level === "MODERATE CONFIDENCE"
        ? `The evidence supports a working conclusion, limited mainly by ${
            listPhrase(limiting.map((d) => d.label.toLowerCase())) || "the absence of a comparison"
          }.`
        : `Confidence is held down by ${listPhrase(limiting.map((d) => d.label.toLowerCase())) || "the thinness of the evidence base"}.`;

  return {
    level,
    headline,
    dimensions,
    limiting,
    judgment: {
      title: "How the confidence rating was made",
      evidenceUsed: [
        measured.length
          ? `Measures recorded: ${listPhrase(measured.map(measureLabel))}.`
          : "No measures recorded.",
        designs.length
          ? `Designs recorded: ${listPhrase(
              designs.map((d) => EVIDENCE_DESIGNS.find((x) => x.id === d)?.label ?? d),
            )}.`
          : "No data-collection design recorded.",
        `Recency: ${evidence.recency}. Sample fit: ${evidence.sampleFit}. Consistency: ${evidence.consistency}.`,
      ],
      assumption:
        "That the measures and designs recorded here describe the evidence base honestly and completely.",
      rule: "Seven dimensions are rated independently. Strong confidence requires a design of at least pre/post strength, a measure that is not purely a proxy, and no unexplained contradiction between sources. A conflicting source caps confidence at moderate.",
      uncertainty:
        "The rating describes the quality of the evidence, not the size of any effect. Strong confidence in a small or irrelevant finding is still a small or irrelevant finding.",
      wouldChange:
        "Adding a more direct measure, a comparison condition, or a second independent source would move this rating. So would explaining a contradiction between existing sources.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 2. Claim safety rules                                                      */
/* -------------------------------------------------------------------------- */

export type ClaimSafety = {
  canSay: string[];
  cannotSay: string[];
  wouldStrengthen: string[];
  judgment: Judgment;
};

export function claimSafety(snap: Snapshot): ClaimSafety {
  const m = snap.measured;
  const designs = snap.evidence.designs;
  const attribution = designs.includes("randomized")
    ? "randomized"
    : designs.includes("comparison")
      ? "comparison"
      : designs.includes("prepost")
        ? "prepost"
        : "none";

  const canSay: string[] = [];
  const cannotSay: string[] = [];
  const strengthen: string[] = [];

  if (has(m, "attendance") || has(m, "completion")) {
    canSay.push("You can describe participation: who attended and who completed the experience.");
    if (!has(m, "knowledge") && !has(m, "skill"))
      cannotSay.push("Completion and attendance do not establish that anything was learned.");
  }
  if (has(m, "satisfaction")) {
    canSay.push("You can describe participant reaction to the experience.");
    cannotSay.push("Satisfaction does not support any inference about skill improvement.");
  }
  if (has(m, "confidence")) {
    canSay.push("You can describe perceived confidence as participants reported it.");
    cannotSay.push(
      "Self-reported confidence is not demonstrated competence, and can move in the opposite direction to skill.",
    );
  }
  if (has(m, "knowledge")) {
    canSay.push("You can describe measured knowledge at the point of assessment.");
    if (!has(m, "behavior") && !has(m, "observation"))
      cannotSay.push("Measured knowledge does not establish that workplace behavior changed.");
  }
  if (has(m, "skill")) {
    canSay.push(
      "You can describe demonstrated performance in the assessment context, against whatever standard was used.",
    );
    if (!has(m, "behavior"))
      cannotSay.push(
        "Performance in an assessment is not workplace transfer; the two settings differ in cues, stakes and time pressure.",
      );
  }
  if (has(m, "behavior") || has(m, "usage") || has(m, "observation")) {
    canSay.push("You can describe observed behavioral application at work.");
    if (attribution === "none" || attribution === "prepost")
      cannotSay.push(
        "Observed behavior cannot be attributed to the program without a design that rules out other explanations.",
      );
  }
  if (has(m, "output") || has(m, "performance") || has(m, "business")) {
    canSay.push(
      "You can describe the performance or business indicators recorded; a change requires comparable observations over time.",
    );
    if (attribution !== "randomized" && attribution !== "comparison")
      cannotSay.push(
        "You cannot claim the program caused the business change; no comparison condition separates it from everything else that happened.",
      );
  }

  if (!m.length) {
    cannotSay.push(
      "With nothing measured, no claim about this program is supportable — including the claim that it did no harm.",
    );
    strengthen.push(
      "Start with one measure tied directly to the workplace behavior the program is meant to change.",
    );
  }

  /* What would strengthen the decision — ordered by marginal value. */
  if (m.length && !has(m, "skill") && !has(m, "knowledge"))
    strengthen.push(
      "Add a demonstrated measure of capability — a scored work sample or scenario — so learning is observed rather than reported.",
    );
  if (!has(m, "behavior") && !has(m, "observation"))
    strengthen.push(
      "Add a delayed behavioral measure linked to the intended workplace performance, collected 30–60 days after the experience.",
    );
  if (attribution === "none" && (has(m, "behavior") || has(m, "performance")))
    strengthen.push(
      "Add a comparison group, even a matched or phased one, so the observed change can be attributed rather than assumed.",
    );
  if (snap.evidence.consistency === "conflicting")
    strengthen.push(
      "Resolve the contradiction between sources before acting; a qualitative follow-up usually explains it faster than more survey data.",
    );
  if (snap.evidence.recency === "stale")
    strengthen.push("Refresh the evidence; it describes conditions that have since changed.");
  if (!snap.evidence.designs.includes("interviews") && snap.evidence.consistency !== "converging")
    strengthen.push(
      "Add a small qualitative strand to explain mechanism and context — why people do what they currently do.",
    );

  if (!canSay.length)
    canSay.push("Nothing yet. Select the measures that genuinely exist to see what they license.");
  if (!strengthen.length)
    strengthen.push(
      "The evidence base is unusually complete. The next highest-value step is replication in a second population rather than more measures in this one.",
    );

  return {
    canSay,
    cannotSay,
    wouldStrengthen: strengthen,
    judgment: {
      title: "How these three lists were produced",
      evidenceUsed: [
        m.length
          ? `Measures marked as existing: ${listPhrase(m.map(measureLabel))}.`
          : "No measures marked.",
        `Attribution design available: ${
          attribution === "none"
            ? "none"
            : PILOT_DESIGNS[
                attribution === "randomized"
                  ? "randomized"
                  : attribution === "comparison"
                    ? "matched"
                    : "prepost"
              ].label
        }.`,
      ],
      assumption:
        "That each selected measure was collected competently. The rules judge what a measure can license, not how well it was executed.",
      rule: "Each measure licenses claims at its own level and no higher. Causal language additionally requires a design that rules out rival explanations — pre/post alone does not.",
      uncertainty:
        "These rules are conservative by construction. A well-argued qualitative case can sometimes justify more than the rules allow; the burden of that argument sits with you.",
      wouldChange:
        "Adding a more direct measure moves statements from the second list to the first. Adding a comparison condition unlocks causal language.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 3. Causal claim check                                                      */
/* -------------------------------------------------------------------------- */

const CAUSAL_TERMS: { term: RegExp; word: string }[] = [
  { term: /\bcaus(ed|es|ing)?\b/i, word: "caused" },
  { term: /\bprove[dns]?\b/i, word: "proved" },
  { term: /\bresulted in\b/i, word: "resulted in" },
  { term: /\bROI\b/i, word: "ROI" },
  { term: /\btraining worked\b/i, word: "training worked" },
  { term: /\bdrove\b|\bdriven by\b/i, word: "drove" },
  { term: /\bimpact(ed)?\b/i, word: "impacted" },
  { term: /\bbecause of the (training|program)\b/i, word: "because of the program" },
];

export type CausalCheck = {
  triggered: boolean;
  phrases: string[];
  explanation: string;
  saferWording: string;
  judgment: Judgment;
};

export function causalClaimCheck(snap: Snapshot): CausalCheck {
  const text = [
    snap.evidence.claim,
    snap.brief.businessQuestion,
    snap.brief.decisionNow,
    snap.brief.keyTradeoff,
    snap.pilot.calibration,
    snap.pilot.observation,
  ]
    .filter(Boolean)
    .join(" \n ");

  const phrases = CAUSAL_TERMS.filter((t) => t.term.test(text)).map((t) => t.word);
  const designs = snap.evidence.designs;
  const supportsAttribution = designs.includes("randomized") || designs.includes("comparison");
  const hasOutcome = ["behavior", "performance", "business", "output"].some((x) =>
    has(snap.measured, x),
  );

  const triggered = phrases.length > 0 && !supportsAttribution;

  const explanation = !phrases.length
    ? "No causal language was detected in what you have written."
    : supportsAttribution
      ? "Causal language appears, and a comparison design is recorded. The claim is defensible to the extent that assignment was sound and attrition was low — state both when you make it."
      : hasOutcome
        ? "Causal language appears, but the recorded design has no comparison condition. An observed change after training is consistent with the training working, with seasonal variation, with a concurrent process change, and with the people most likely to improve being the ones who attended."
        : "Causal language appears, but the evidence does not even reach the outcome being claimed — the measures stop short of the behavior or result in question.";

  const safer = !phrases.length
    ? ""
    : hasOutcome
      ? "Prefer: “Performance improved over the period. The design does not allow us to separate the program's contribution from other changes.”"
      : "Prefer: “Participants completed the program and reported it favorably. We do not yet have evidence about performance.”";

  return {
    triggered,
    phrases,
    explanation,
    saferWording: safer,
    judgment: {
      title: "How the causal claim check works",
      evidenceUsed: [
        phrases.length
          ? `Language detected: ${listPhrase(phrases.map((p) => `“${p}”`))}.`
          : "No trigger language detected.",
        supportsAttribution
          ? "A comparison or randomized design is recorded."
          : "No comparison or randomized design is recorded.",
      ],
      assumption: "That the words you wrote reflect the claim you intend to make publicly.",
      rule: "Causal vocabulary is checked against the strongest recorded design. Attribution language requires a comparison condition; pre/post, satisfaction and completion never satisfy it.",
      uncertainty:
        "Word matching is literal. It cannot catch a causal claim phrased carefully, and it will occasionally flag a sentence that was already hedged.",
      wouldChange:
        "Recording a comparison group or randomized assignment, or rewriting the claim in descriptive terms, clears the flag.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 4. Is this even a learning problem?                                        */
/* -------------------------------------------------------------------------- */

export type LearningProblemLevel =
  "Likely" | "Possible" | "Unclear" | "Potentially not a learning problem";

export type LearningProblemResult = {
  level: LearningProblemLevel;
  statement: string;
  nonLearningCauses: string[];
  nextStep: string;
  judgment: Judgment;
};

export function learningProblemCheck(snap: Snapshot): LearningProblemResult {
  const selected = snap.evidence.causes as CauseId[];
  const nonLearning = ALTERNATIVE_CAUSES.filter((c) => selected.includes(c.id) && !c.learning);
  const knowledgeSelected = selected.includes("knowledge");
  const capabilityMeasured = has(snap.measured, "skill") || has(snap.measured, "knowledge");
  const behaviorMeasured = has(snap.measured, "behavior") || has(snap.measured, "observation");
  const lowPractice = snap.profiles.some((p) => p.practiceOpportunity <= 2);
  const lowManager = snap.profiles.some((p) => p.managerSupport <= 2);
  const highMotivation = snap.profiles.length
    ? snap.profiles.every((p) => p.motivation >= 4)
    : false;

  let level: LearningProblemLevel;
  let statement: string;
  let nextStep: string;

  if (!selected.length) {
    level = "Unclear";
    statement =
      "No alternative causes have been examined yet. Recommending instruction before ruling out the environment is the most common and most expensive error in this field.";
    nextStep =
      "Work through the alternative-cause checklist with someone who does the work daily, before scoping any program.";
  } else if (capabilityMeasured && !behaviorMeasured && nonLearning.length >= 1) {
    level = "Potentially not a learning problem";
    statement = `People appear to understand the procedure — capability is measured — yet ${listPhrase(
      nonLearning.map((c) => c.label.toLowerCase()),
    )} ${nonLearning.length > 1 ? "are" : "is"} flagged as constraining performance. When knowledge is present and behavior is absent, the environment is the more economical explanation.`;
    nextStep = `Investigate ${nonLearning[0]!.label.toLowerCase()} before investing in additional training. ${nonLearning[0]!.implication}`;
  } else if (nonLearning.length >= 2 && !knowledgeSelected) {
    level = "Potentially not a learning problem";
    statement = `Several non-learning constraints are flagged (${listPhrase(
      nonLearning.map((c) => c.label.toLowerCase()),
    )}) and no knowledge or skill gap has been identified. More instruction is unlikely to move a constraint that instruction does not touch.`;
    nextStep = `Start with a diagnostic study of ${nonLearning[0]!.label.toLowerCase()}. ${nonLearning[0]!.implication}`;
  } else if (nonLearning.length >= 1 && knowledgeSelected) {
    level = "Possible";
    statement = `A skill gap is plausible, but it is not alone: ${listPhrase(
      nonLearning.map((c) => c.label.toLowerCase()),
    )} ${nonLearning.length > 1 ? "are" : "is"} also flagged. A learning intervention may be necessary without being sufficient.`;
    nextStep =
      "Design for the skill gap, but treat the environmental constraints as delivery dependencies with named owners — not as risks to be noted and forgotten.";
  } else if (knowledgeSelected && !nonLearning.length) {
    level = capabilityMeasured ? "Likely" : "Possible";
    statement = capabilityMeasured
      ? "A knowledge or skill gap is identified and capability has been measured directly. Instruction is a defensible lever here."
      : "A knowledge or skill gap is identified, but capability has not been measured, so the gap is asserted rather than observed.";
    nextStep = capabilityMeasured
      ? "Proceed with design, and keep the capability measure in place so the gap can be shown to close."
      : "Measure current capability against the standard before building. A short work sample is usually enough.";
  } else {
    level = "Unclear";
    statement =
      "The causes flagged do not yet point clearly toward or away from a learning explanation.";
    nextStep = "Observe five instances of the task before deciding what kind of problem this is.";
  }

  /* Context evidence can override toward the environment. */
  if (lowPractice && level === "Likely") {
    level = "Possible";
    statement +=
      " Profiles also report few opportunities to practice, and instruction cannot create occasions the work does not provide.";
  }
  if (highMotivation && level === "Potentially not a learning problem") {
    statement +=
      " Reported motivation is high, which further weakens the “people do not care” explanation.";
  }
  if (lowManager && level !== "Potentially not a learning problem") {
    statement +=
      " Manager support is rated low, which is an environmental constraint in its own right.";
  }

  return {
    level,
    statement,
    nonLearningCauses: nonLearning.map((c) => c.label),
    nextStep,
    judgment: {
      title: "How learning-problem confidence was determined",
      evidenceUsed: [
        selected.length
          ? `Causes flagged: ${listPhrase(
              ALTERNATIVE_CAUSES.filter((c) => selected.includes(c.id)).map((c) => c.label),
            )}.`
          : "No causes flagged.",
        capabilityMeasured ? "Capability is measured." : "Capability is not measured.",
        behaviorMeasured
          ? "Workplace behavior is measured."
          : "Workplace behavior is not measured.",
        `Context ratings used: opportunity to practice${lowPractice ? " (low)" : ""}, manager support${lowManager ? " (low)" : ""}, motivation${highMotivation ? " (high)" : ""}.`,
      ],
      assumption:
        "That the causes you flagged were flagged on evidence rather than on habit or organizational politics.",
      rule: "Measured capability combined with absent behavior points away from a learning cause. Multiple environmental constraints with no identified skill gap point further away. A skill gap alongside constraints yields a necessary-but-not-sufficient reading.",
      uncertainty:
        "Cause checklists capture what has been considered, not what is true. The checklist is a prompt for investigation, not a diagnosis.",
      wouldChange:
        "Observing the work directly usually settles this faster than any additional survey. A single workflow observation can move this rating in either direction.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 5. Context sensitivity                                                     */
/* -------------------------------------------------------------------------- */

export type ContextFlag = {
  id: string;
  condition: string;
  implication: string;
  severity: "watch" | "constraint" | "blocker";
};

export function contextFlags(profiles: Profile[], components: PlacedComponent[]): ContextFlag[] {
  const flags: ContextFlag[] = [];
  if (!profiles.length) return flags;

  const any = (fn: (p: Profile) => boolean) => profiles.some(fn);
  const longSync = components.some((c) => c.minutes >= 90 && ["ilt", "vilt"].includes(c.refId));
  const managerDependent = components.some((c) => c.managerInvolved || c.refId === "coaching");
  const informationOnly = !components.some((c) =>
    ["retrieval", "scenario", "sim", "feedback", "peer"].includes(c.refId),
  );
  const hasSupport = components.some((c) => ["jobaid", "support"].includes(c.refId));
  const followUp = components.filter((c) => c.day > 1).length;

  if (any((p) => p.timeAvailable <= 2)) {
    flags.push({
      id: "time",
      condition: "Low available learning time",
      implication: longSync
        ? "A synchronous block of 90 minutes or more is likely to be difficult to schedule and easy to cancel. Shorter, distributed contacts are more feasible here."
        : "Time is scarce, so every minute of the design has to earn its place. Feasibility is a design criterion, not an afterthought.",
      severity: longSync ? "constraint" : "watch",
    });
  }
  if (any((p) => p.priorKnowledge >= 4)) {
    flags.push({
      id: "prior",
      condition: "High prior knowledge",
      implication:
        "Foundational content can probably be reduced. For experienced learners, worked examples add less and practice adds more.",
      severity: "watch",
    });
  }
  if (any((p) => p.practiceOpportunity <= 2)) {
    flags.push({
      id: "practice",
      condition: "Low opportunity to practice at work",
      implication:
        "Transfer is at risk regardless of instructional quality. Without occasions to perform, capability decays before it is used.",
      severity: "constraint",
    });
  }
  if (any((p) => p.managerSupport <= 2)) {
    flags.push({
      id: "manager",
      condition: "Low manager support",
      implication: managerDependent
        ? "The design depends on manager reinforcement while the context reports managers are not reinforcing. Confidence in any manager-dependent component should be reduced accordingly."
        : "Reinforcement will have to come from somewhere other than managers — peers, structured prompts, or the workflow itself.",
      severity: managerDependent ? "blocker" : "constraint",
    });
  }
  if (any((p) => p.taskComplexity >= 4)) {
    flags.push({
      id: "complexity",
      condition: "High task complexity",
      implication: informationOnly
        ? "Complex tasks are poorly served by information-only designs. Realistic practice, feedback and performance support carry more weight here."
        : "Complexity favors the practice and feedback already present in this design.",
      severity: informationOnly ? "constraint" : "watch",
    });
  }
  if (any((p) => ["Quarterly", "Rarely"].includes(p.taskFrequency))) {
    flags.push({
      id: "frequency",
      condition: "Infrequent task performance",
      implication: hasSupport
        ? "Forgetting between occasions is likely; the performance support in this design addresses that directly."
        : "Long gaps between performances make forgetting the default. Point-of-performance support is likely to matter more than additional instruction.",
      severity: hasSupport ? "watch" : "constraint",
    });
  }
  if (any((p) => p.motivation <= 2)) {
    flags.push({
      id: "motivation",
      condition: "Low motivation",
      implication:
        "More content does not resolve a motivation problem. Examine relevance, perceived usefulness, and what the organization actually rewards before adding instruction.",
      severity: "constraint",
    });
  }
  if (any((p) => p.workload >= 4)) {
    flags.push({
      id: "workload",
      condition: "High workload",
      implication:
        "Implementation feasibility is a design constraint here. A design that cannot be attended is not a better design, however well conceived.",
      severity: "constraint",
    });
  }
  if (components.length && followUp === 0) {
    flags.push({
      id: "single",
      condition: "Single instructional exposure",
      implication:
        "With no follow-up practice, the design relies on one exposure to produce durable change — the failure mode most consistently documented in workplace learning.",
      severity: "constraint",
    });
  }
  return flags;
}

/* -------------------------------------------------------------------------- */
/* 6. Mechanism analysis                                                      */
/* -------------------------------------------------------------------------- */

export type MechanismNote = {
  component: string;
  mechanism: string;
  caution: string;
};

export function mechanismNotes(components: PlacedComponent[]): MechanismNote[] {
  const seen = new Set<string>();
  const notes: MechanismNote[] = [];
  for (const c of components) {
    if (seen.has(c.refId)) continue;
    const m = MECHANISMS[c.refId];
    if (!m) continue;
    seen.add(c.refId);
    notes.push({
      component: componentDef(c.refId).name,
      mechanism: m.mechanism,
      caution: m.caution,
    });
  }
  const days = new Set(components.map((c) => c.day));
  if (days.size >= 3) {
    notes.unshift({
      component: "Spacing across the sequence",
      mechanism: "introduces distributed practice as a plausible advantage over massed exposure",
      caution:
        "The advantage depends on learners engaging with each contact, not merely on the calendar.",
    });
  }
  return notes;
}

/* -------------------------------------------------------------------------- */
/* 7. Pilot design recommendation                                             */
/* -------------------------------------------------------------------------- */

export type PilotRecommendation = {
  id: PilotDesignId;
  label: string;
  effort: "low" | "moderate" | "high";
  why: string;
};

export type PilotAdvice = {
  primary: PilotRecommendation;
  alternates: PilotRecommendation[];
  avoid: string;
  judgment: Judgment;
};

export function recommendPilot(snap: Snapshot): PilotAdvice {
  const lp = learningProblemCheck(snap);
  const m = snap.measured;
  const designs = snap.evidence.designs;
  const conflicting = snap.evidence.consistency === "conflicting";
  const techFlagged = snap.evidence.causes.some((c) =>
    ["technology", "usability", "access"].includes(c),
  );
  const workflowFlagged = snap.evidence.causes.some((c) =>
    ["workflow", "process", "staffing", "priorities"].includes(c),
  );
  const capability = has(m, "skill") || has(m, "knowledge");
  const behavior = has(m, "behavior") || has(m, "observation");
  const scaleDecision = /scale|roll ?out|expand|all\b/i.test(snap.brief.businessQuestion || "");

  const make = (id: PilotDesignId, why: string): PilotRecommendation => ({
    id,
    label: PILOT_DESIGNS[id].label,
    effort: PILOT_DESIGNS[id].effort,
    why,
  });

  const ranked: PilotRecommendation[] = [];

  if (techFlagged) {
    ranked.push(
      make(
        "usability",
        "Technology or access friction is flagged. Investigate the tool and workflow before deciding whether a training study is warranted; compare the actual effort and cost of each path.",
      ),
    );
  }
  if (workflowFlagged || lp.level === "Potentially not a learning problem") {
    ranked.push(
      make(
        "workflow",
        "The evidence points at least partly outside learning. Observing the actual sequence of work identifies where performance breaks down before anything is designed.",
      ),
    );
  }
  if (conflicting) {
    ranked.push(
      make(
        "qualitative",
        "Sources contradict each other. Interviews explain why two data streams disagree; more quantitative data usually deepens the puzzle rather than resolving it.",
      ),
    );
  }
  if (!m.length) {
    ranked.push(
      make(
        "qualitative",
        "Nothing is measured yet. A small diagnostic study establishes what the problem is before a measurement strategy is committed to.",
      ),
    );
  }
  if (lp.level === "Likely" || lp.level === "Possible") {
    if (!capability)
      ranked.push(
        make(
          "prepost",
          "A skill gap is plausible but unmeasured. Pre/post measurement establishes whether capability changes at all, which makes it a useful first step.",
        ),
      );
    if (capability && !behavior)
      ranked.push(
        make(
          "behavioral",
          "Capability is measured but workplace behavior is not. Observing behavior closes the gap the current evidence cannot reach.",
        ),
      );
    if (capability && !has(m, "skill"))
      ranked.push(
        make(
          "delayed",
          "Knowledge is measured at the event only. A delayed assessment shows whether anything survived past the day itself.",
        ),
      );
  }
  if (scaleDecision && behavior && !designs.includes("comparison")) {
    ranked.push(
      make(
        "phased",
        "A rollout is already planned, so the schedule itself can supply a comparison group at almost no additional cost.",
      ),
    );
    ranked.push(
      make(
        "matched",
        "A matched comparison would let you attribute the change rather than assume it, without withholding the program from anyone.",
      ),
    );
  }
  if (snap.scenarios.B.length && snap.scenarios.A.length && capability) {
    ranked.push(
      make(
        "abtest",
        "Two designs are specified and capability can already be measured, so a direct comparison between them is practical.",
      ),
    );
  }
  if (behavior && capability && designs.includes("comparison")) {
    ranked.push(
      make(
        "randomized",
        "The measurement base and a comparison condition already exist; randomization is the remaining step toward causal identification, and it is now proportionate.",
      ),
    );
  }
  if (!ranked.length) {
    ranked.push(
      make(
        "qualitative",
        "With the current evidence, understanding the problem is worth more than measuring the solution.",
      ),
    );
  }
  if (ranked.length < 3) {
    ranked.push(
      make(
        "mixed",
        "Pairing a small quantitative strand with interviews gives you both whether performance moved and why.",
      ),
    );
  }

  const seen = new Set<string>();
  const unique = ranked.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

  const avoid =
    lp.level === "Potentially not a learning problem"
      ? "A randomized trial of a training program would be a rigorous answer to the wrong question while the environmental constraint remains unexamined."
      : !m.length
        ? "Skip the controlled experiment for now. Randomizing before you know what to measure produces precise answers about nothing in particular."
        : "Match the design to the decision. A larger study is not automatically a better one, and delay has a cost too.";

  return {
    primary: unique[0]!,
    alternates: unique.slice(1, 4),
    avoid,
    judgment: {
      title: "How this pilot design was chosen",
      evidenceUsed: [
        `Learning-problem confidence: ${lp.level}.`,
        m.length
          ? `Measures available: ${listPhrase(m.map(measureLabel))}.`
          : "No measures available.",
        `Business question: ${snap.brief.businessQuestion || "not stated"}.`,
      ],
      assumption:
        "That the decision is genuinely open — that a result pointing the other way would change what happens next.",
      rule: "Designs are ranked by what the decision needs, not by methodological prestige. Diagnostic and qualitative designs rank first when the problem is unclear; comparison designs rank first only when attribution is what blocks the decision.",
      uncertainty:
        "The proportionality judgment depends on the cost of being wrong, which the Studio cannot see. A safety-critical decision justifies a stronger design than this ranking assumes.",
      wouldChange:
        "Stating a different business question, or resolving the learning-problem check, changes the ranking directly.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 8. Calibration engine                                                      */
/* -------------------------------------------------------------------------- */

export type CalibrationSection = {
  id: string;
  title: string;
  body: string;
  tone: "neutral" | "supported" | "challenge";
};

export type CalibrationResult = {
  status: "empty" | "partial" | "complete";
  sections: CalibrationSection[];
  judgment: Judgment;
};

const NEGATIVE =
  /\b(not|no |did ?n[o']t|inconsisten|fail|drop|declin|less|lower|without|missed|unable|struggl|abandon)/i;
const POSITIVE = /\b(improv|increas|higher|stronger|complet|achiev|exceed|gain|better)/i;
const IMPLEMENTATION =
  /\b(participat|attend|schedul|cancel|capacity|time|manager|complet|drop ?out|turnout|adopt)/i;
const SURPRISE = /\b(unexpected|surpris|did ?n[o']t expect|contrary|opposite|instead)/i;

export function calibration(snap: Snapshot): CalibrationResult {
  const { expectation, observation, comparison, calibration: note, nextExperiment } = snap.pilot;
  const sections: CalibrationSection[] = [];

  if (!expectation.trim() && !observation.trim()) {
    return {
      status: "empty",
      sections: [
        {
          id: "empty",
          title: "Nothing to calibrate yet",
          body: "Record what you expected before the pilot, then what you observed. Writing the expectation first is what makes the comparison honest — an expectation reconstructed afterwards always fits.",
          tone: "neutral",
        },
      ],
      judgment: calibrationJudgment(snap, []),
    };
  }

  const obs = observation || "";
  const contradicted = NEGATIVE.test(obs);
  const confirmed = POSITIVE.test(obs) && !contradicted;

  sections.push({
    id: "supported",
    title: "Supported expectations",
    body: confirmed
      ? `The observation is broadly consistent with what you expected: “${expectation.trim() || "not recorded"}”. Consistency is not confirmation — the same result would appear if something other than the intervention were responsible.`
      : "Nothing in the observation clearly supports the stated expectation. That is a finding, not a failure of the pilot.",
    tone: confirmed ? "supported" : "neutral",
  });

  sections.push({
    id: "unsupported",
    title: "Unsupported expectations",
    body: contradicted
      ? `The observation runs against the expectation. The expectation was: “${expectation.trim() || "not recorded"}”. Record it as unsupported and resist the temptation to reinterpret it into agreement — disconfirming evidence is the most valuable output a pilot produces.`
      : "No expectation has been clearly disconfirmed so far.",
    tone: contradicted ? "challenge" : "neutral",
  });

  sections.push({
    id: "surprises",
    title: "Surprises",
    body: SURPRISE.test(obs)
      ? "You have recorded something you did not anticipate. Surprises are the highest-information part of a pilot; write down what you now believe that you did not believe before."
      : "No surprise has been recorded. Worth asking whether the pilot was designed loosely enough to permit one — a pilot that can only confirm is not a test.",
    tone: SURPRISE.test(obs) ? "challenge" : "neutral",
  });

  sections.push({
    id: "implementation",
    title: "Implementation issues",
    body: IMPLEMENTATION.test(obs)
      ? "The observation refers to participation, scheduling or capacity. Before concluding anything about the design, separate “the mechanism did not work” from “the mechanism was never delivered as specified”. These require completely different responses."
      : "No implementation issue is described. Confirm that delivery matched the design before attributing the result to the design.",
    tone: IMPLEMENTATION.test(obs) ? "challenge" : "neutral",
  });

  const alternatives: string[] = [];
  if (!comparison.trim())
    alternatives.push(
      "no comparison condition exists, so maturation, seasonality and concurrent initiatives remain live explanations",
    );
  if (snap.evidence.sampleFit !== "representative")
    alternatives.push("the cohort may not represent the wider population");
  if (IMPLEMENTATION.test(obs))
    alternatives.push("variable delivery may explain the result more simply than the design does");
  if (snap.profiles.some((p) => p.managerSupport <= 2))
    alternatives.push(
      "weak manager support may have suppressed a mechanism that would otherwise work",
    );
  if (!alternatives.length)
    alternatives.push(
      "selection into the pilot, and the attention the pilot itself attracted, both remain plausible contributors",
    );

  sections.push({
    id: "alternatives",
    title: "Alternative explanations",
    body: `Before accepting your reading of this result: ${listPhrase(alternatives)}.`,
    tone: "challenge",
  });

  sections.push({
    id: "learned",
    title: "What we learned",
    body:
      note.trim() ||
      (contradicted
        ? "State plainly what you now believe that you did not believe before running this. If the answer is “nothing”, the pilot was not designed to be informative."
        : "Record the belief that changed, however small. Calibration is the point of the exercise."),
    tone: "neutral",
  });

  sections.push({
    id: "next",
    title: "Next experiment",
    body:
      nextExperiment.trim() ||
      (IMPLEMENTATION.test(obs)
        ? "Test the implementation dependency directly — instrument delivery before testing the mechanism again."
        : "Identify the single assumption that, if wrong, would most change the decision, and test that."),
    tone: "neutral",
  });

  return {
    status: expectation.trim() && observation.trim() ? "complete" : "partial",
    sections,
    judgment: calibrationJudgment(snap, sections),
  };
}

function calibrationJudgment(snap: Snapshot, _s: CalibrationSection[]): Judgment {
  return {
    title: "How the calibration reading was produced",
    evidenceUsed: [
      snap.pilot.expectation ? "Your recorded expectation." : "No expectation recorded.",
      snap.pilot.observation ? "Your recorded observation." : "No observation recorded.",
      snap.pilot.comparison
        ? "A comparison condition is described."
        : "No comparison condition is described.",
    ],
    assumption:
      "That the expectation was written before the result was known. If it was written afterwards, the comparison is decorative.",
    rule: "The observation text is read for direction, surprise and implementation language. Where the observation runs against the expectation, the result is recorded as unsupported rather than reinterpreted.",
    uncertainty:
      "This is a reading of your own words, not an analysis of your data. It cannot judge magnitude, and it will misread heavy irony or hedging.",
    wouldChange:
      "Recording a comparison condition removes several alternative explanations. Stating the expectation numerically makes the calibration sharper.",
  };
}

/* -------------------------------------------------------------------------- */
/* 9. Skeptical review                                                        */
/* -------------------------------------------------------------------------- */

export type SkepticalItem = {
  question: string;
  answer: string;
  consequence: string;
  test: string;
  risk: "high" | "moderate" | "low";
};

export function skepticalReview(snap: Snapshot): {
  items: SkepticalItem[];
  judgment: Judgment;
} {
  const conf = evidenceConfidence(snap);
  const lp = learningProblemCheck(snap);
  const flags = contextFlags(snap.profiles, snap.scenarios.B);
  const managerDependent =
    hasComp(snap.scenarios.B, "coaching") || snap.scenarios.B.some((c) => c.managerInvolved);
  const lowManager = snap.profiles.some((p) => p.managerSupport <= 2);
  const capability = has(snap.measured, "skill") || has(snap.measured, "knowledge");
  const behavior = has(snap.measured, "behavior") || has(snap.measured, "observation");
  const cheapest = snap.scenarios.C.length
    ? "Scenario C is specified. Compare its time, delivery requirements and actual costs with the recommended design."
    : "No lean alternative has been specified, so the recommended design has not been tested against a cheaper one.";

  const items: SkepticalItem[] = [
    {
      question: "What assumption is carrying this recommendation?",
      answer: managerDependent
        ? "That reinforcement happens as designed. Most of the expected benefit sits on that single assumption, and it is untested."
        : capability
          ? "That the measured capability gap is the binding constraint on performance, rather than one constraint among several."
          : "That a capability gap exists at all. Nothing in the current evidence demonstrates one.",
      consequence: managerDependent
        ? "If reinforcement is inconsistent, the alternative converges on the current design at higher cost and more schedule disruption."
        : "If the constraint sits elsewhere, the program will be delivered competently and change nothing.",
      test: managerDependent
        ? "Instrument reinforcement participation in the first cohort before committing to a wider rollout."
        : "Observe five instances of the task against a shared standard before scoping any build.",
      risk: managerDependent && lowManager ? "high" : "moderate",
    },
    {
      question: "What is the weakest piece of evidence here?",
      answer: conf.limiting.length
        ? `${conf.limiting[0]!.label}: ${conf.limiting[0]!.why}`
        : "No dimension is rated weak, which is unusual enough to warrant checking whether the ratings were entered optimistically.",
      consequence:
        "A recommendation is only as sound as the weakest link it rests on, and that weakness rarely appears in the summary slide.",
      test: "Strengthen that one dimension before the next decision gate, rather than adding breadth elsewhere.",
      risk:
        conf.level === "LOW CONFIDENCE"
          ? "high"
          : conf.level === "MODERATE CONFIDENCE"
            ? "moderate"
            : "low",
    },
    {
      question: "What alternative explanation fits the same data?",
      answer: behavior
        ? "The observed behavior may reflect who volunteered, what was measured, or the attention the initiative attracted, rather than the program itself."
        : "Reported satisfaction and confidence are consistent with a well-run event that changed nothing at work. Both patterns produce identical data.",
      consequence:
        "Acting on the wrong explanation costs the budget twice: once on the intervention, once on the credibility of the next one.",
      test: "Ask what evidence would look different under each explanation, then collect precisely that.",
      risk: "high",
    },
    {
      question: "Is there a cheaper intervention that would do most of the work?",
      answer: `${cheapest} A job aid, an in-workflow checklist or clearer expectations may address part of the gap. Their effects and costs still need to be tested here.`,
      consequence:
        "A full program scoped before cheaper options are ruled out is difficult to defend when results are questioned.",
      test: "Run a two-week job-aid trial with one team before committing to a build.",
      risk: snap.scenarios.C.length ? "moderate" : "high",
    },
    {
      question: "Is there a non-learning solution?",
      answer:
        lp.level === "Potentially not a learning problem"
          ? `${lp.statement} ${lp.nextStep}`
          : lp.nonLearningCauses.length
            ? `${listPhrase(lp.nonLearningCauses)} ${lp.nonLearningCauses.length > 1 ? "are" : "is"} flagged alongside the skill gap. Each is a candidate solution that does not require a curriculum.`
            : "No environmental cause has been examined. That absence is itself the finding worth acting on.",
      consequence:
        "Learning functions lose credibility fastest by solving environmental problems with instruction.",
      test: "Spend a day observing the work before spending a quarter designing for it.",
      risk: lp.level === "Potentially not a learning problem" ? "high" : "moderate",
    },
    {
      question: "What would make this recommendation wrong?",
      answer: flags.length
        ? `The recommendation assumes the flagged conditions can be worked around: ${listPhrase(
            flags.slice(0, 3).map((f) => f.condition.toLowerCase()),
          )}. If any one of them holds firm, the expected benefit does not materialise.`
        : "The recommendation would be wrong if the constraint on performance sits outside anything the design touches — and nothing entered so far rules that out.",
      consequence:
        "Naming the falsifier in advance is what separates a recommendation from an advocacy position.",
      test: "Write the disconfirming result down now, before the pilot, and agree what you will do if you see it.",
      risk: flags.some((f) => f.severity === "blocker") ? "high" : "moderate",
    },
    {
      question: "What decision should be delayed until better evidence exists?",
      answer:
        conf.level === "STRONG CONFIDENCE"
          ? "A stronger evidence design still does not reveal the result. Delay full rollout until observed results meet an agreed threshold and possible harms are reviewed."
          : "Full-population rollout, and any headline claim about performance impact. Neither is supportable on the current evidence, and both are expensive to retract.",
      consequence:
        "Delay has a cost, but a premature scale decision converts an uncertainty into a fixed commitment.",
      test: "Set the specific evidence threshold that would unlock the scale decision, and the date by which it will be checked.",
      risk: conf.level === "STRONG CONFIDENCE" ? "low" : "moderate",
    },
    {
      question: "What decision can reasonably be made now?",
      answer:
        lp.level === "Potentially not a learning problem"
          ? "Fund the diagnostic work. That decision is fully supported and does not depend on resolving the debate about the program."
          : snap.scenarios.B.length
            ? "Approve a bounded pilot of the alternative design with measurement attached. The comparison is specified well enough to be worth running."
            : "Commit to the diagnostic step only. No design has been specified in enough detail to approve.",
      consequence:
        "Paralysis is also a decision, and usually a worse one than a bounded, instrumented test.",
      test: "Name the owner, the cohort, the measures and the date on which the result gets reviewed.",
      risk: "low",
    },
  ];

  return {
    items,
    judgment: {
      title: "How the challenge was constructed",
      evidenceUsed: [
        `Evidence confidence: ${conf.level}.`,
        `Learning-problem confidence: ${lp.level}.`,
        flags.length
          ? `Context flags: ${listPhrase(flags.map((f) => f.condition))}.`
          : "No context flags.",
      ],
      assumption:
        "That the recommendation deserves to be attacked before it is presented rather than after.",
      rule: "Rule-based prompts are selected from the inputs you entered, including confidence ratings, flagged causes, context and design components. Some prompts are general; check each against your setting.",
      uncertainty:
        "A challenge session identifies what could be wrong, not what is wrong. Some objections will not apply in your organization.",
      wouldChange:
        "Closing the weakest evidence dimension, or specifying a lean alternative, removes several of these objections outright.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 10. Executive brief logic                                                  */
/* -------------------------------------------------------------------------- */

export type ExecutiveBrief = {
  decision: string;
  why: string;
  uncertainty: string;
  tradeoff: string;
  evidenceNeeded: string;
  doNotClaim: string;
  judgment: Judgment;
};

export function executiveBrief(
  snap: Snapshot,
  comparison: { label: string; direction: string; note: string }[],
): ExecutiveBrief {
  const conf = evidenceConfidence(snap);
  const lp = learningProblemCheck(snap);
  const safety = claimSafety(snap);
  const pilot = recommendPilot(snap);
  const flags = contextFlags(snap.profiles, snap.scenarios.B);
  const gains = comparison.filter((r) =>
    ["much-stronger", "stronger", "slightly-stronger"].includes(r.direction),
  );
  const costs = comparison.filter((r) => ["tradeoff", "weaker"].includes(r.direction));

  const decision =
    lp.level === "Potentially not a learning problem"
      ? "Investigate before designing. Do not fund additional training on the current evidence."
      : !snap.scenarios.B.length
        ? "Do not approve a rollout. No alternative design has been specified to compare against the current approach."
        : conf.level === "STRONG CONFIDENCE" && !costs.length
          ? "Review observed results against agreed success and harm criteria before deciding whether to scale. Evidence quality alone does not establish benefit."
          : "Pilot the alternative rather than scale immediately.";

  const why =
    lp.level === "Potentially not a learning problem"
      ? lp.statement
      : gains.length
        ? `The alternative design creates stronger opportunities for ${listPhrase(
            gains.slice(0, 3).map((g) => g.label.toLowerCase()),
          )}, but current evidence does not establish workplace transfer.`
        : "No design advantage has been established, and the current evidence does not reach workplace performance.";

  const blocker = flags.find((f) => f.severity === "blocker") ?? flags[0];
  const uncertainty = blocker
    ? `${blocker.condition}. ${blocker.implication}`
    : conf.limiting.length
      ? `${conf.limiting[0]!.label}. ${conf.limiting[0]!.why}`
      : "Whether the observed effect holds outside the pilot population.";

  const tradeoff =
    snap.brief.keyTradeoff.trim() ||
    (costs.length
      ? `${costs[0]!.label}: ${costs[0]!.note}`
      : "Every design choice costs something. If this one appears to cost nothing, the cost has not been located yet.");

  const evidenceNeeded = `${pilot.primary.label} — ${pilot.primary.why} ${
    safety.wouldStrengthen[0] ?? ""
  }`.trim();

  const doNotClaim = safety.cannotSay.length
    ? safety.cannotSay.slice(0, 2).join(" ")
    : "Do not extend the claim beyond the population and period the evidence covers.";

  return {
    decision,
    why,
    uncertainty,
    tradeoff,
    evidenceNeeded,
    doNotClaim,
    judgment: {
      title: "How the brief was assembled",
      evidenceUsed: [
        `Evidence confidence: ${conf.level}.`,
        `Learning-problem confidence: ${lp.level}.`,
        gains.length
          ? `Design advantages: ${listPhrase(gains.map((g) => g.label))}.`
          : "No design advantage established.",
        costs.length ? `Costs: ${listPhrase(costs.map((c) => c.label))}.` : "No cost identified.",
      ],
      assumption:
        "That the decision-maker needs the decision, its cost and its uncertainty — not the methodology behind them.",
      rule: "The decision follows the learning-problem check first, the specification of an alternative second, and confidence third. A recommendation with no identified cost is treated as incomplete rather than as good news.",
      uncertainty:
        "The brief reflects what you entered. It cannot see organizational appetite, timing pressure, or what has already been promised.",
      wouldChange:
        "Resolving the learning-problem check, or adding a measure that reaches workplace behavior, changes the recommended decision directly.",
    },
  };
}
