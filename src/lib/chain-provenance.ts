import type { ChainState } from "./studio-data";

/**
 * Contextual content for the Evidence Inspector, one entry per chain link.
 *
 * Nothing here cites an external study. Where a figure appears it comes from the
 * fictional Northstar worked example and is labelled as such. The generic entries
 * describe what a link means and what it would take to establish it.
 */
export type NodeEvidence = {
  known: string;
  /** Where the statement above comes from. Always explicit about fictional provenance. */
  provenance: string;
  limitations: string[];
  notEstablished: string[];
  nextEvidence: string[];
};

export type ProvenanceSet = Record<string, NodeEvidence>;

/** Generic framework view — used on the landing page and the framework page. */
export const GENERIC_PROVENANCE: ProvenanceSet = {
  intervention: {
    known:
      "What was delivered can usually be recorded exactly: sessions, dates, who attended, how long it ran.",
    provenance:
      "Delivery records are administrative data. They describe the programme, not its effect.",
    limitations: [
      "Delivery records describe intent and logistics, not quality of the experience.",
      "Attendance is presence, not attention or effort.",
    ],
    notEstablished: [
      "That anything was learned.",
      "That the design was appropriate for the performance problem.",
    ],
    nextEvidence: [
      "A short description of the mechanism you expect to do the work.",
      "A quality check on delivery: was the design actually run as written?",
    ],
  },
  mechanism: {
    known:
      "The stated reason the design should change anything — retrieval, spacing, feedback, modelling, or practice under realistic conditions.",
    provenance:
      "A design rationale supplied by the practitioner, informed by general learning-science principles.",
    limitations: [
      "A principle holding in general does not mean it is operating in your programme.",
      "Mechanisms compete: a design can include several and evidence none of them individually.",
    ],
    notEstablished: [
      "That the mechanism fired for these learners in this context.",
      "That the mechanism is the reason for any observed change.",
    ],
    nextEvidence: [
      "An instrumented check on the mechanism itself, such as retrieval attempts or feedback episodes.",
      "A comparison design where the mechanism is the only thing that differs.",
    ],
  },
  learning: {
    known:
      "Durable knowledge or skill, demonstrated against a shared standard rather than self-reported.",
    provenance:
      "Established only by an assessment or observed demonstration you actually administer.",
    limitations: [
      "Post-only scores have no baseline, so any gain is inferred rather than measured.",
      "Self-rated confidence tracks comfort, not capability, and often moves in the wrong direction.",
      "Assessments written and scored by the programme team are not independently verified.",
    ],
    notEstablished: [
      "Completion or reaction data cannot establish learning.",
      "A high score immediately after a session cannot establish durability.",
    ],
    nextEvidence: [
      "A pre-measure, or a matched comparison group, so a change has a reference point.",
      "A delayed demonstration several weeks later against the same rubric.",
    ],
  },
  opportunity: {
    known: "Whether the daily work actually presents occasions to perform the task, and how often.",
    provenance:
      "Usually a practitioner estimate; it becomes evidence when task frequency is sampled from real work.",
    limitations: [
      "Estimated frequency is systematically optimistic.",
      "Opportunity varies widely between teams even within one population.",
    ],
    notEstablished: [
      "That people had a genuine chance to apply the skill.",
      "That a lack of change reflects a learning failure rather than no occasion to perform.",
    ],
    nextEvidence: [
      "A short work-sampling exercise counting real occasions over two to four weeks.",
      "Manager confirmation of how often the task appears in the role.",
    ],
  },
  transfer: {
    known:
      "Observable change in how the work is performed after the intervention — the link most often skipped.",
    provenance:
      "Established only by observation, structured work product review, or an independent report of behaviour.",
    limitations: [
      "Self-reported application is subject to recall and social-desirability bias.",
      "Observation by the programme team is not independent.",
      "Environmental support can move transfer with no change in learning at all.",
    ],
    notEstablished: [
      "Reaction or completion data cannot establish transfer.",
      "Even measured transfer is not proof that the intervention caused it.",
    ],
    nextEvidence: [
      "A small rubric-scored observation sample at 6–8 weeks in teams that did and did not take part.",
      "A review of work artefacts produced before and after.",
    ],
  },
  performance: {
    known: "Change in the quality, speed, consistency or judgement of the work output itself.",
    provenance: "Operational records and structured quality review, not programme-generated data.",
    limitations: [
      "Performance data is affected by staffing, tooling, incentives and seasonality at the same time.",
      "Aggregate metrics hide which teams actually moved.",
    ],
    notEstablished: [
      "That any movement is attributable to the intervention.",
      "That performance gains will persist once attention moves elsewhere.",
    ],
    nextEvidence: [
      "A pre-period baseline on the same metric.",
      "A comparison group that did not receive the intervention.",
    ],
  },
  outcome: {
    known:
      "The organizational condition the work was meant to move — retention, renewal, safety, throughput.",
    provenance: "Business systems of record, owned outside the learning function.",
    limitations: [
      "Business outcomes have many causes; a learning programme is rarely the largest one.",
      "The lag between intervention and outcome usually exceeds the measurement window.",
      "Financial return figures require cost and counterfactual assumptions that are rarely defensible.",
    ],
    notEstablished: [
      "Return on investment, in the absence of a credible counterfactual.",
      "That the programme caused the outcome, even when both moved together.",
    ],
    nextEvidence: [
      "A pre-registered outcome metric with an agreed measurement window and owner.",
      "A staged or matched rollout so some units serve as a comparison.",
    ],
  },
};

/**
 * Northstar Services worked example — fictional throughout.
 * Figures match the demonstration data used elsewhere in the project.
 */
export const NORTHSTAR_PROVENANCE: ProvenanceSet = {
  intervention: {
    known:
      "93% of invited first-line managers completed the performance-conversation workshop, and satisfaction averaged 4.5 of 5.",
    provenance:
      "Fictional sample data for Northstar Services — illustrative registration and end-of-session survey records. Not real organizational data.",
    limitations: [
      "Completion counts presence, not engagement.",
      "Satisfaction was collected immediately after the session, when recall of effort is lowest.",
    ],
    notEstablished: [
      "That managers learned the framework.",
      "That the workshop was the right response to the reported problem.",
    ],
    nextEvidence: [
      "A delivery-quality check confirming each cohort ran as designed.",
      "A short skill demonstration rather than a reaction survey.",
    ],
  },
  mechanism: {
    known:
      "The design assumes modelling plus a single guided practice round is enough to change how managers open a difficult conversation.",
    provenance: "Design rationale stated by the programme team in the fictional example.",
    limitations: [
      "A single massed practice round gives no spacing and no retrieval.",
      "No feedback loop exists after the session ends.",
    ],
    notEstablished: [
      "That the assumed mechanism operated for these managers.",
      "That a different mechanism would not have worked better at lower cost.",
    ],
    nextEvidence: [
      "Compare the current design against a spaced design where the only difference is timing.",
      "Instrument feedback episodes so the mechanism is observable.",
    ],
  },
  learning: {
    known:
      "Managers rate their own confidence higher after the session. No assessment or demonstration was administered.",
    provenance:
      "Fictional self-report item from the example's end-of-session survey. Self-assessments are not independently verified.",
    limitations: [
      "Confidence is a reaction measure, not a learning measure.",
      "There is no baseline and no delayed check.",
    ],
    notEstablished: [
      "That knowledge or skill changed.",
      "That any change would still be present weeks later.",
    ],
    nextEvidence: [
      "A scenario-based skill demonstration scored against a shared rubric.",
      "A repeat demonstration at day 45 to test durability.",
    ],
  },
  opportunity: {
    known:
      "Managers are expected to hold performance conversations, but frequency has not been sampled.",
    provenance:
      "Practitioner estimate inside the fictional example — an assumption, not a measure.",
    limitations: [
      "Span of control varies widely across the manager population.",
      "Some managers may have had no qualifying conversation in the window.",
    ],
    notEstablished: [
      "That every manager had a genuine occasion to apply the framework.",
      "That inconsistent coaching reflects skill rather than absent opportunity.",
    ],
    nextEvidence: [
      "Count qualifying conversations per manager over four weeks.",
      "Check whether the teams reporting poor coaching have managers with any opportunity at all.",
    ],
  },
  transfer: {
    known: "Nothing has been observed. Employees continue to report inconsistent coaching quality.",
    provenance:
      "Fictional employee-survey signal used as the presenting problem. It is an outcome complaint, not transfer evidence.",
    limitations: [
      "Employee perception is not a structured observation of behaviour.",
      "The reporting employees are not matched to trained managers.",
    ],
    notEstablished: [
      "That managers do or do not use the framework.",
      "That the programme failed — it has not been tested at this link.",
    ],
    nextEvidence: [
      "Rubric-score roughly twenty coaching conversations at week eight, in teams whose managers did and did not attend.",
      "Review documented conversation records against the same rubric.",
    ],
  },
  performance: {
    known: "No performance data has been connected to the programme.",
    provenance: "Absent by design in this illustrative example.",
    limitations: ["Any quality metric would be confounded by team composition and workload."],
    notEstablished: ["Any change in the quality of documented performance conversations."],
    nextEvidence: ["Score a pre-period sample of documented conversations to create a baseline."],
  },
  outcome: {
    known:
      "The organizational interest is consistent coaching quality across teams. No outcome measure is currently attributed to the programme.",
    provenance: "Stated business question in the fictional example.",
    limitations: [
      "Coaching quality is influenced by staffing, manager tenure and team churn.",
      "The measurement window is shorter than the plausible lag.",
    ],
    notEstablished: [
      "Any return on investment.",
      "That scaling the programme would move the outcome.",
    ],
    nextEvidence: [
      "Agree one outcome measure, an owner and a decision date before the next cohort runs.",
    ],
  },
};

/** Illustrative link states for the framework and landing views. */
export const ILLUSTRATIVE_STATES: Record<string, ChainState> = {
  intervention: "measured",
  mechanism: "assumed",
  learning: "unknown",
  opportunity: "assumed",
  transfer: "unknown",
  performance: "unknown",
  outcome: "unknown",
};
