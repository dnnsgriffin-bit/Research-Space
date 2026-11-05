export type ChainState = "measured" | "assumed" | "unknown";

export type ChainNode = {
  id: string;
  label: string;
  short: string;
  description: string;
};

export const CHAIN: ChainNode[] = [
  {
    id: "intervention",
    label: "Intervention",
    short: "What we deliver",
    description: "The designed experience: instruction, practice, support, reinforcement.",
  },
  {
    id: "mechanism",
    label: "Mechanism",
    short: "Why it should work",
    description: "The learning-science reason the intervention could change anything at all.",
  },
  {
    id: "learning",
    label: "Learning",
    short: "What was acquired",
    description: "Durable knowledge and skill, demonstrated rather than self-reported.",
  },
  {
    id: "opportunity",
    label: "Opportunity to apply",
    short: "Is there a chance?",
    description: "Whether the work environment actually provides occasions to perform the task.",
  },
  {
    id: "transfer",
    label: "Transfer",
    short: "Applied at work",
    description: "Observable change in how the work is performed after the intervention.",
  },
  {
    id: "performance",
    label: "Performance",
    short: "Quality of work",
    description: "Change in the quality, speed, consistency or judgment of the work output.",
  },
  {
    id: "outcome",
    label: "Business outcome",
    short: "Organizational result",
    description: "The organizational condition the work was meant to move.",
  },
];

export type EvidenceLabelKind = "evidence" | "model" | "user" | "hypothesis";

export const EVIDENCE_LABELS: Record<EvidenceLabelKind, { text: string; meaning: string }> = {
  evidence: {
    text: "Entered evidence",
    meaning:
      "Supported by evidence entered into this assessment. Its strength still depends on source and design quality.",
  },
  model: {
    text: "Model assumption",
    meaning: "A reasonable assumption used to compare scenarios.",
  },
  user: {
    text: "User assumption",
    meaning: "Something entered by the practitioner that has not been independently verified.",
  },
  hypothesis: {
    text: "Hypothesis",
    meaning: "A plausible explanation worth investigating but not yet evidence.",
  },
};

export type Direction =
  | "much-stronger"
  | "stronger"
  | "slightly-stronger"
  | "similar"
  | "tradeoff"
  | "weaker"
  | "unknown"
  | "insufficient";

export const DIRECTION_TEXT: Record<Direction, string> = {
  "much-stronger": "Much stronger",
  stronger: "Stronger",
  "slightly-stronger": "Slightly stronger",
  similar: "Similar",
  tradeoff: "Tradeoff",
  weaker: "Weaker",
  unknown: "Unknown",
  insufficient: "Insufficient evidence",
};

/* ---------------------------------- 1. Learner context --------------------- */

export type Profile = {
  id: string;
  name: string;
  role: string;
  tenure: string;
  priorKnowledge: number;
  skillLevel: number;
  taskComplexity: number;
  motivation: number;
  confidence: number;
  timeAvailable: number;
  workload: number;
  managerSupport: number;
  practiceOpportunity: number;
  taskFrequency: string;
  constraints: string;
  note: string;
};

export const emptyProfile = (id: string): Profile => ({
  id,
  name: "",
  role: "",
  tenure: "1–3 years",
  priorKnowledge: 3,
  skillLevel: 3,
  taskComplexity: 3,
  motivation: 3,
  confidence: 3,
  timeAvailable: 3,
  workload: 3,
  managerSupport: 3,
  practiceOpportunity: 3,
  taskFrequency: "Monthly",
  constraints: "",
  note: "",
});

export const EXAMPLE_PROFILE: Profile = {
  ...emptyProfile("example"),
  name: "Experienced but constrained",
  role: "New people manager",
  tenure: "3–5 years",
  priorKnowledge: 4,
  skillLevel: 3,
  taskComplexity: 4,
  motivation: 4,
  confidence: 3,
  timeAvailable: 2,
  workload: 5,
  managerSupport: 2,
  practiceOpportunity: 2,
  taskFrequency: "Quarterly",
  constraints: "Shared devices on-shift; learning time is not protected in the schedule.",
  note: "Strong prior knowledge and motivation, but limited protected learning time and inconsistent manager reinforcement.",
};

export const SCALE_FIELDS: {
  key: keyof Profile;
  label: string;
  low: string;
  high: string;
}[] = [
  { key: "priorKnowledge", label: "Prior knowledge", low: "None", high: "Extensive" },
  { key: "skillLevel", label: "Current skill level", low: "Novice", high: "Expert" },
  { key: "taskComplexity", label: "Task complexity", low: "Simple", high: "Highly complex" },
  { key: "motivation", label: "Motivation", low: "Low", high: "High" },
  { key: "confidence", label: "Confidence", low: "Low", high: "High" },
  { key: "timeAvailable", label: "Time available to learn", low: "None", high: "Protected" },
  { key: "workload", label: "Workload", low: "Light", high: "Saturated" },
  { key: "managerSupport", label: "Manager support", low: "Absent", high: "Active" },
  { key: "practiceOpportunity", label: "Opportunity to practice", low: "Rare", high: "Frequent" },
];

/* ---------------------------------- 2. Intervention ------------------------ */

export type ComponentKind = "instruction" | "practice" | "support" | "reinforcement" | "measure";

export type ComponentDef = {
  id: string;
  name: string;
  kind: ComponentKind;
  rationale: string;
};

export const COMPONENT_LIBRARY: ComponentDef[] = [
  {
    id: "ilt",
    name: "Instructor-led workshop",
    kind: "instruction",
    rationale: "Concentrated exposure with live questioning.",
  },
  {
    id: "vilt",
    name: "Virtual workshop",
    kind: "instruction",
    rationale: "Distributed exposure with lower travel cost.",
  },
  {
    id: "selfpaced",
    name: "Self-paced module",
    kind: "instruction",
    rationale: "Flexible exposure; depends on learner time.",
  },
  {
    id: "micro",
    name: "Microlearning",
    kind: "instruction",
    rationale: "Short exposure that fits inside the workday.",
  },
  {
    id: "retrieval",
    name: "Retrieval practice",
    kind: "practice",
    rationale: "Effortful recall supports durable memory.",
  },
  {
    id: "worked",
    name: "Worked example",
    kind: "instruction",
    rationale: "Reduces cognitive load for novices.",
  },
  {
    id: "scenario",
    name: "Scenario practice",
    kind: "practice",
    rationale: "Practice conditions resemble performance conditions.",
  },
  {
    id: "sim",
    name: "Simulation",
    kind: "practice",
    rationale: "High-fidelity rehearsal of the real task.",
  },
  {
    id: "feedback",
    name: "Practice with feedback",
    kind: "practice",
    rationale: "Corrective information during practice shapes accuracy.",
  },
  {
    id: "jobaid",
    name: "Job aid",
    kind: "support",
    rationale: "Moves load from memory to the environment.",
  },
  {
    id: "reflection",
    name: "Reflection",
    kind: "practice",
    rationale: "Supports sense-making and planning to apply.",
  },
  {
    id: "peer",
    name: "Peer practice",
    kind: "practice",
    rationale: "Distributes reinforcement beyond the manager.",
  },
  {
    id: "coaching",
    name: "Manager coaching",
    kind: "reinforcement",
    rationale: "Signals priority and creates accountability.",
  },
  {
    id: "support",
    name: "Performance support",
    kind: "support",
    rationale: "Available at the moment of need.",
  },
  {
    id: "assessment",
    name: "Follow-up assessment",
    kind: "measure",
    rationale: "Creates delayed evidence of retention.",
  },
  {
    id: "nudge",
    name: "Reinforcement nudge",
    kind: "reinforcement",
    rationale: "Spaces attention across weeks.",
  },
];

export type PlacedComponent = {
  uid: string;
  refId: string;
  day: number;
  minutes: number;
  frequency: string;
  spacing: string;
  managerInvolved: boolean;
  practice: boolean;
};

export const componentDef = (refId: string): ComponentDef =>
  COMPONENT_LIBRARY.find((c) => c.id === refId) ?? {
    id: refId,
    name: refId,
    kind: "instruction",
    rationale: "",
  };

const place = (
  refId: string,
  day: number,
  minutes: number,
  extra: Partial<PlacedComponent> = {},
): PlacedComponent => ({
  uid: `${refId}-${day}-${Math.random().toString(36).slice(2, 7)}`,
  refId,
  day,
  minutes,
  frequency: "Once",
  spacing: day === 0 ? "Single exposure" : "Spaced",
  managerInvolved: false,
  practice: false,
  ...extra,
});

export const makePlacement = place;

/* ---------------------------------- 3. Scenarios --------------------------- */

export type ScenarioKey = "A" | "B" | "C";

export type Scenario = {
  key: ScenarioKey;
  name: string;
  enabled: boolean;
  components: PlacedComponent[];
};

export const DEMO_SCENARIO_A: PlacedComponent[] = [place("vilt", 1, 120)];

export const DEMO_SCENARIO_B: PlacedComponent[] = [
  place("vilt", 1, 60),
  place("retrieval", 4, 10, { spacing: "Spaced" }),
  place("scenario", 7, 45, { practice: true }),
  place("jobaid", 7, 5),
  place("retrieval", 10, 10, { spacing: "Spaced" }),
  place("peer", 14, 45, { practice: true }),
];

export const DEMO_SCENARIO_C: PlacedComponent[] = [
  place("jobaid", 1, 5),
  place("micro", 1, 15),
  place("nudge", 21, 5),
];

/* ---------------------------------- 4. Measurement ------------------------- */

export const MEASURES: { id: string; label: string; tier: string; chain: string }[] = [
  { id: "attendance", label: "Attendance", tier: "Participation", chain: "intervention" },
  { id: "completion", label: "Completion", tier: "Participation", chain: "intervention" },
  { id: "satisfaction", label: "Satisfaction", tier: "Reaction", chain: "intervention" },
  { id: "confidence", label: "Confidence", tier: "Reaction", chain: "learning" },
  { id: "knowledge", label: "Knowledge", tier: "Learning", chain: "learning" },
  { id: "skill", label: "Skill demonstration", tier: "Learning", chain: "learning" },
  { id: "behavior", label: "Behavior", tier: "Transfer", chain: "transfer" },
  { id: "usage", label: "System usage", tier: "Transfer", chain: "transfer" },
  { id: "observation", label: "Manager observation", tier: "Transfer", chain: "opportunity" },
  { id: "output", label: "Work output", tier: "Performance", chain: "performance" },
  { id: "performance", label: "Performance", tier: "Performance", chain: "performance" },
  { id: "business", label: "Business outcome", tier: "Outcome", chain: "outcome" },
];

export const DEMO_MEASURED = ["attendance", "completion", "satisfaction", "confidence"];

/* ---------------------------------- 5. Pilot ------------------------------- */

export type Pilot = {
  population: string;
  cohort: string;
  condition: string;
  comparison: string;
  baseline: string;
  immediate: string;
  delayed: string;
  transfer: string;
  performance: string;
  timing: string;
  expectation: string;
  observation: string;
  calibration: string;
  nextExperiment: string;
};

export const emptyPilot: Pilot = {
  population: "",
  cohort: "",
  condition: "",
  comparison: "",
  baseline: "",
  immediate: "",
  delayed: "",
  transfer: "",
  performance: "",
  timing: "90 days",
  expectation: "",
  observation: "",
  calibration: "",
  nextExperiment: "",
};

export const DEMO_PILOT: Pilot = {
  population: "New people managers, first 18 months in role",
  cohort: "Two cohorts of 24, matched on function and span of control",
  condition: "Spaced design: short workshop, retrieval, scenario practice, manager coaching",
  comparison: "Current design: single half-day workshop with self-paced follow-up",
  baseline: "Coded sample of pre-program performance conversations (anonymized)",
  immediate: "Scenario-based skill demonstration scored against a shared rubric",
  delayed: "Repeat skill demonstration at day 45",
  transfer: "Employee-reported conversation quality and frequency at day 60",
  performance: "Rubric-scored quality of documented performance conversations",
  timing: "90 days",
  expectation: "Manager coaching should improve transfer.",
  observation: "Managers participated inconsistently.",
  calibration:
    "The mechanism may be sound, but implementation capacity became the limiting condition.",
  nextExperiment: "Test structured peer reinforcement against manager-dependent reinforcement.",
};

/* ---------------------------------- 6. Brief ------------------------------- */

export type Brief = {
  businessQuestion: string;
  keyTradeoff: string;
  decisionNow: string;
};

export const DEMO_BRIEF: Brief = {
  businessQuestion:
    "Should we scale the performance-conversation program to all people managers next quarter?",
  keyTradeoff:
    "The spaced design asks more of managers' calendars in exchange for stronger conditions for transfer.",
  decisionNow:
    "Approve a two-cohort pilot rather than an organization-wide rollout, and fund the measurement instead of more content.",
};

export const DEMO_CONTEXT = {
  company: "Northstar Services",
  audience: "First-line managers",
  problem:
    "First-line managers complete performance conversation training, but employees continue to report inconsistent coaching quality.",
};

export const DEMO_KNOWN = [
  "93% training completion",
  "4.5 / 5 satisfaction",
  "Managers report higher confidence after the workshop",
];

export const DEMO_UNKNOWN = [
  "Observed conversation quality",
  "Whether managers use the framework consistently",
  "The relationship between training participation and employee outcomes",
];

export const DEMO_EVIDENCE: EvidenceState = {
  designs: ["admin", "survey"],
  recency: "current",
  sampleFit: "representative",
  consistency: "untested",
  claim: "The training worked — completion is high and satisfaction proved it.",
  causes: ["knowledge", "expectations", "managersupport"],
  causeNote:
    "Employees describe inconsistent coaching, but nobody has checked whether managers know what a good conversation looks like or whether they are expected to hold them.",
};

export const DEMO_PROFILES: Profile[] = [
  { ...EXAMPLE_PROFILE, id: "p1" },
  {
    ...emptyProfile("p2"),
    name: "New to the role, high motivation",
    role: "First-time manager, field operations",
    tenure: "Under 1 year",
    priorKnowledge: 2,
    skillLevel: 2,
    taskComplexity: 4,
    motivation: 5,
    confidence: 2,
    timeAvailable: 3,
    workload: 4,
    managerSupport: 3,
    practiceOpportunity: 3,
    taskFrequency: "Monthly",
    constraints: "Distributed sites; limited quiet space for practice conversations.",
    note: "Motivated and available, but low prior experience with difficult conversations.",
  },
];

/* ---------------------------------- 7. Evidence quality -------------------- */

/** What each measure is actually direct evidence *of*. */
export const MEASURE_META: Record<
  string,
  {
    /** 0-3: how directly the measure assesses the construct rather than a proxy. */
    directness: number;
    /** Plain-language statement of what the measure licenses. */
    licenses: string;
    /** The claim this measure is routinely, and wrongly, stretched into. */
    overreach: string;
  }
> = {
  attendance: {
    directness: 0,
    licenses: "who showed up",
    overreach: "that anything was learned",
  },
  completion: {
    directness: 0,
    licenses: "who finished the experience",
    overreach: "that capability changed",
  },
  satisfaction: {
    directness: 1,
    licenses: "how participants reacted to the experience",
    overreach: "that the experience was effective",
  },
  confidence: {
    directness: 1,
    licenses: "how capable participants believe they are",
    overreach: "that they are in fact capable",
  },
  knowledge: {
    directness: 2,
    licenses: "what participants can recall or recognize",
    overreach: "that they will act differently at work",
  },
  skill: {
    directness: 3,
    licenses: "what participants can do in the assessment setting",
    overreach: "that the same performance occurs in the workflow",
  },
  behavior: {
    directness: 3,
    licenses: "what participants actually do at work",
    overreach: "that the program caused the behavior",
  },
  usage: {
    directness: 2,
    licenses: "whether the supporting system is being used",
    overreach: "that the work is being done well",
  },
  observation: {
    directness: 2,
    licenses: "what a manager reports seeing",
    overreach: "an unbiased measure of quality",
  },
  output: {
    directness: 2,
    licenses: "what the work product looks like",
    overreach: "the reason the work product looks that way",
  },
  performance: {
    directness: 3,
    licenses: "how performance is trending",
    overreach: "attribution of that trend to the program",
  },
  business: {
    directness: 3,
    licenses: "how the business indicator moved",
    overreach: "that the program moved it",
  },
};

export type EvidenceDesignId =
  | "admin"
  | "survey"
  | "interviews"
  | "systemdata"
  | "observation"
  | "prepost"
  | "comparison"
  | "randomized";

export const EVIDENCE_DESIGNS: {
  id: EvidenceDesignId;
  label: string;
  strength: number;
  useful: string;
}[] = [
  {
    id: "admin",
    label: "Administrative records",
    strength: 1,
    useful: "Useful for participation and reach. Says nothing about capability.",
  },
  {
    id: "survey",
    label: "Descriptive survey",
    strength: 1,
    useful: "Useful for reported perceptions, not for demonstrated capability.",
  },
  {
    id: "interviews",
    label: "Qualitative interviews",
    strength: 2,
    useful:
      "Useful for mechanisms, context, experience and explanation — how and why, not how much.",
  },
  {
    id: "systemdata",
    label: "Behavioral / system data",
    strength: 2,
    useful: "Useful for observed behavior, though not for the reason behind it.",
  },
  {
    id: "observation",
    label: "Structured observation or work sample",
    strength: 3,
    useful: "Useful for observed quality of performance against a shared standard.",
  },
  {
    id: "prepost",
    label: "Pre/post assessment",
    strength: 3,
    useful:
      "Supports evidence of change, but maturation, selection and concurrent events remain alternative explanations.",
  },
  {
    id: "comparison",
    label: "Comparison group",
    strength: 4,
    useful: "A stronger basis for attribution, depending on how groups were formed.",
  },
  {
    id: "randomized",
    label: "Randomized assignment",
    strength: 5,
    useful: "Stronger causal identification when implemented well and when attrition is low.",
  },
];

export type Recency = "current" | "aging" | "stale" | "unknown";
export type SampleFit = "representative" | "partial" | "mismatched" | "unknown";
export type Consistency = "converging" | "mixed" | "conflicting" | "untested";

export const RECENCY_OPTIONS: { value: Recency; label: string }[] = [
  { value: "current", label: "Collected within the current cycle" },
  { value: "aging", label: "Collected 6–18 months ago" },
  { value: "stale", label: "Older than 18 months, or before a major change" },
  { value: "unknown", label: "Not known" },
];

export const SAMPLE_OPTIONS: { value: SampleFit; label: string }[] = [
  { value: "representative", label: "Reasonably represents the population of interest" },
  { value: "partial", label: "Covers part of the population only" },
  { value: "mismatched", label: "Drawn from a different population or context" },
  { value: "unknown", label: "Not known" },
];

export const CONSISTENCY_OPTIONS: { value: Consistency; label: string }[] = [
  { value: "converging", label: "Independent sources tell a compatible story" },
  { value: "mixed", label: "Sources are partly compatible" },
  { value: "conflicting", label: "Sources contradict each other" },
  { value: "untested", label: "Only one source exists, so convergence is untested" },
];

export type EvidenceState = {
  designs: EvidenceDesignId[];
  recency: Recency;
  sampleFit: SampleFit;
  consistency: Consistency;
  claim: string;
  causes: string[];
  causeNote: string;
};

export const emptyEvidence: EvidenceState = {
  designs: [],
  recency: "unknown",
  sampleFit: "unknown",
  consistency: "untested",
  claim: "",
  causes: [],
  causeNote: "",
};

/* -------------------- Alternative (non-learning) causes -------------------- */

export type CauseId =
  | "process"
  | "workflow"
  | "technology"
  | "access"
  | "incentives"
  | "priorities"
  | "expectations"
  | "managersupport"
  | "usability"
  | "policy"
  | "staffing"
  | "opportunity"
  | "knowledge";

export const ALTERNATIVE_CAUSES: {
  id: CauseId;
  label: string;
  learning: boolean;
  implication: string;
}[] = [
  {
    id: "process",
    label: "Unclear process",
    learning: false,
    implication: "Clarify and document the process before teaching it.",
  },
  {
    id: "workflow",
    label: "Poor workflow design",
    learning: false,
    implication: "Map the workflow; instruction cannot fix sequencing.",
  },
  {
    id: "technology",
    label: "Technology friction",
    learning: false,
    implication: "Remove the friction; training around a broken tool is expensive.",
  },
  {
    id: "access",
    label: "Lack of access",
    learning: false,
    implication: "Grant access first; capability is not the binding constraint.",
  },
  {
    id: "incentives",
    label: "Lack of incentives",
    learning: false,
    implication: "Examine what the last performance cycle actually rewarded.",
  },
  {
    id: "priorities",
    label: "Competing priorities",
    learning: false,
    implication: "Sequence the work; attention, not skill, is scarce.",
  },
  {
    id: "expectations",
    label: "Unclear expectations",
    learning: false,
    implication: "State the standard explicitly before training to it.",
  },
  {
    id: "managersupport",
    label: "Insufficient manager support",
    learning: false,
    implication: "Manager capacity is a design dependency, not a learner attribute.",
  },
  {
    id: "usability",
    label: "Poor tool usability",
    learning: false,
    implication: "A usability study is cheaper and faster than a curriculum.",
  },
  {
    id: "policy",
    label: "Policy constraints",
    learning: false,
    implication: "Policy sets the ceiling on what any program can achieve.",
  },
  {
    id: "staffing",
    label: "Inadequate staffing",
    learning: false,
    implication: "Capacity problems present as capability problems.",
  },
  {
    id: "opportunity",
    label: "No opportunity to perform",
    learning: false,
    implication: "Skill decays without occasions to use it.",
  },
  {
    id: "knowledge",
    label: "Genuine knowledge or skill gap",
    learning: true,
    implication: "This is the case where instruction is the right lever.",
  },
];

/* ------------------------------- Pilot designs ----------------------------- */

export type PilotDesignId =
  | "qualitative"
  | "workflow"
  | "usability"
  | "prepost"
  | "delayed"
  | "matched"
  | "phased"
  | "abtest"
  | "randomized"
  | "behavioral"
  | "mixed";

export const PILOT_DESIGNS: Record<
  PilotDesignId,
  { label: string; effort: "low" | "moderate" | "high"; answers: string }
> = {
  qualitative: {
    label: "Qualitative diagnostic study",
    effort: "low",
    answers: "why the current behavior makes sense to the people doing it",
  },
  workflow: {
    label: "Workflow observation",
    effort: "low",
    answers: "where in the actual sequence of work performance breaks down",
  },
  usability: {
    label: "Usability investigation",
    effort: "low",
    answers: "whether the tool, not the person, is the constraint",
  },
  prepost: {
    label: "Pre/post measurement",
    effort: "low",
    answers: "whether measured capability changed across the experience",
  },
  delayed: {
    label: "Delayed assessment",
    effort: "moderate",
    answers: "whether anything survived past the event itself",
  },
  matched: {
    label: "Matched comparison",
    effort: "moderate",
    answers: "how the trained group differs from a comparable untrained group",
  },
  phased: {
    label: "Phased rollout",
    effort: "moderate",
    answers: "the same question as a comparison group, using the rollout schedule",
  },
  abtest: {
    label: "A/B design comparison",
    effort: "moderate",
    answers: "which of two designs produces better results under similar conditions",
  },
  randomized: {
    label: "Randomized pilot",
    effort: "high",
    answers: "whether the intervention itself caused the difference",
  },
  behavioral: {
    label: "Behavioral observation",
    effort: "moderate",
    answers: "what people actually do at work, rather than what they report",
  },
  mixed: {
    label: "Mixed-method pilot",
    effort: "high",
    answers: "both whether performance changed and why it changed",
  },
};

/* ------------------------- Learning-design mechanisms ---------------------- */

export const MECHANISMS: Record<string, { mechanism: string; caution: string }> = {
  retrieval: {
    mechanism: "creates additional opportunity for active recall",
    caution: "Recall opportunity only helps if learners attempt it rather than review passively.",
  },
  scenario: {
    mechanism:
      "creates opportunity to practice decisions under conditions that resemble performance",
    caution: "Fidelity of the scenario determines how much of this advantage is real.",
  },
  sim: {
    mechanism: "creates rehearsal under representative conditions",
    caution: "High build cost; the fidelity claim needs checking against the real task.",
  },
  feedback: {
    mechanism: "creates opportunity to detect and correct errors during practice",
    caution: "Feedback quality varies with who gives it and against what standard.",
  },
  coaching: {
    mechanism: "introduces workplace reinforcement",
    caution:
      "Also introduces implementation dependency and manager burden; benefit is conditional on manager capacity.",
  },
  peer: {
    mechanism: "distributes reinforcement beyond a single manager",
    caution: "Peer accuracy is unverified unless a shared standard exists.",
  },
  jobaid: {
    mechanism: "may reduce memory dependence at the point of performance",
    caution: "Only if the aid is available where and when the task is performed.",
  },
  support: {
    mechanism: "may reduce memory dependence at the moment of need",
    caution: "Adoption at the point of performance is an assumption until observed.",
  },
  nudge: {
    mechanism: "distributes attention across weeks rather than a single event",
    caution: "Low-cost, but easily ignored; effect depends on relevance and timing.",
  },
  reflection: {
    mechanism: "creates opportunity for sense-making and planning to apply",
    caution: "Self-reported intention is not evidence of subsequent behavior.",
  },
  assessment: {
    mechanism: "creates delayed evidence rather than a learning benefit alone",
    caution: "Measurement is not an intervention; it tells you what happened.",
  },
  worked: {
    mechanism: "reduces extraneous load for learners with limited prior knowledge",
    caution: "Diminishes, and can reverse, as expertise increases.",
  },
};
