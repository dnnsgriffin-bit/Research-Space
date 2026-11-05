/**
 * Transfer conditions.
 *
 * Deterministic, transparent derivation of the five environmental conditions
 * that most often decide whether learning is ever applied at work. Nothing here
 * is predictive: every band is produced by a fixed rule from inputs the user
 * already supplied, and every band names the input that drove it.
 */

import { componentDef, type PlacedComponent, type Profile } from "./studio-data";

export type TransferBand = "Weak" | "Fragile" | "Workable" | "Supported";

export type TransferCondition = {
  id: string;
  label: string;
  question: string;
  band: TransferBand;
  driver: string;
  /** The design move that would most plausibly improve this condition. */
  move: string;
  /** What that move costs. Every move costs something. */
  cost: string;
};

export type TransferReading = {
  conditions: TransferCondition[];
  weakest: TransferCondition;
  summary: string;
  /** Whether any post-event application evidence exists. */
  observedNote: string;
};

const BAND_ORDER: TransferBand[] = ["Weak", "Fragile", "Workable", "Supported"];

export const bandRank = (b: TransferBand) => BAND_ORDER.indexOf(b);

/** Fixed 1–5 scale to band, so the same input always yields the same band. */
const scaleBand = (n: number): TransferBand =>
  n <= 1.5 ? "Weak" : n <= 2.5 ? "Fragile" : n <= 3.75 ? "Workable" : "Supported";

const lift = (band: TransferBand, steps: number): TransferBand =>
  BAND_ORDER[Math.min(BAND_ORDER.length - 1, Math.max(0, bandRank(band) + steps))]!;

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 3);

export function transferConditions(
  profiles: Profile[],
  components: PlacedComponent[],
): TransferReading {
  const kinds = components.map((c) => componentDef(c.refId).kind);
  const refs = components.map((c) => c.refId);

  const practiceOpp = mean(profiles.map((p) => p.practiceOpportunity));
  const managerSupport = mean(profiles.map((p) => p.managerSupport));
  const workload = mean(profiles.map((p) => p.workload));
  const timeAvailable = mean(profiles.map((p) => p.timeAvailable));

  const lastDay = components.reduce((m, c) => Math.max(m, c.day), 0);
  const spacedCount = components.filter((c) => c.spacing !== "Single exposure").length;
  const hasSupport = kinds.includes("support");
  const hasReinforcement = kinds.includes("reinforcement") || refs.includes("coaching");
  const managerInvolved = components.some((c) => c.managerInvolved) || refs.includes("coaching");
  const hasPeer = refs.includes("peer");
  const authentic = refs.includes("scenario") || refs.includes("sim") || refs.includes("feedback");

  const conditions: TransferCondition[] = [];

  /* 1. Opportunity to apply --------------------------------------------- */
  {
    let band = scaleBand(practiceOpp);
    if (hasSupport) band = lift(band, 1);
    conditions.push({
      id: "opportunity",
      label: "Opportunity to apply",
      question: "Does the work actually ask for this skill often enough to keep it alive?",
      band,
      driver: `Opportunity to practice is rated ${practiceOpp.toFixed(1)} of 5${
        hasSupport ? "; a support asset is available at the moment of need" : ""
      }.`,
      move: "Place performance support where the task happens, and schedule the first real use inside two weeks.",
      cost: "Someone has to own and maintain the asset, and the first-use window has to be protected against operational priorities.",
    });
  }

  /* 2. Timing and proximity to real work --------------------------------- */
  {
    let band: TransferBand =
      lastDay >= 14 ? "Supported" : lastDay >= 7 ? "Workable" : lastDay >= 3 ? "Fragile" : "Weak";
    if (spacedCount === 0) band = "Weak";
    if (authentic) band = lift(band, 1);
    conditions.push({
      id: "timing",
      label: "Timing and proximity",
      question: "Is the design close enough to the real task, and does it extend past the event?",
      band,
      driver:
        components.length === 0
          ? "No components have been placed yet."
          : `The design spans ${lastDay} day${lastDay === 1 ? "" : "s"} with ${spacedCount} spaced element${
              spacedCount === 1 ? "" : "s"
            }${authentic ? " and practice under realistic conditions" : " and no authentic practice"}.`,
      move: "Move part of the content after the first real attempt so practice sits next to the work, not before it.",
      cost: "A longer arc is harder to schedule and harder to report as a single completion event.",
    });
  }

  /* 3. Manager reinforcement --------------------------------------------- */
  {
    let band = scaleBand(managerSupport);
    if (managerInvolved) band = lift(band, 1);
    if (managerSupport <= 2 && !managerInvolved) band = "Weak";
    conditions.push({
      id: "manager",
      label: "Manager reinforcement",
      question: "Will anyone with authority notice, ask about, or make room for the new behavior?",
      band,
      driver: `Manager support is rated ${managerSupport.toFixed(1)} of 5 and the design ${
        managerInvolved ? "includes a manager touchpoint" : "includes no manager touchpoint"
      }.`,
      move: "Give managers one short, scripted conversation tied to a specific observable, rather than a briefing pack.",
      cost: "It adds recurring manager time and makes the program dependent on manager follow-through you do not control.",
    });
  }

  /* 4. Workload headroom -------------------------------------------------- */
  {
    const headroom = (6 - workload + timeAvailable) / 2;
    const band = scaleBand(headroom);
    conditions.push({
      id: "headroom",
      label: "Workload headroom",
      question: "Is there room in the week to do the new thing badly before doing it well?",
      band,
      driver: `Workload is rated ${workload.toFixed(1)} of 5 against protected learning time of ${timeAvailable.toFixed(
        1,
      )} of 5.`,
      move: "Cut total required minutes and replace removed content with a job aid at the point of use.",
      cost: "Less exposure means slower initial fluency, and the design leans harder on the environment being ready.",
    });
  }

  /* 5. Social and peer support -------------------------------------------- */
  {
    let band: TransferBand = hasPeer ? "Workable" : "Fragile";
    if (hasPeer && hasReinforcement) band = "Supported";
    if (!hasPeer && !hasReinforcement) band = "Weak";
    conditions.push({
      id: "social",
      label: "Social and peer support",
      question: "Is anyone else practicing this at the same time, so it is not a solo act?",
      band,
      driver: `The design ${hasPeer ? "includes peer practice" : "has no peer element"} and ${
        hasReinforcement
          ? "includes reinforcement over time"
          : "has no reinforcement after the event"
      }.`,
      move: "Pair learners into a fortnightly practice partnership with one shared observable.",
      cost: "Peer practice consumes two calendars for every one it supports and its quality varies.",
    });
  }

  const weakest = conditions.reduce((w, c) => (bandRank(c.band) < bandRank(w.band) ? c : w));

  const summary =
    components.length === 0
      ? "No intervention has been designed yet, so transfer conditions cannot be read."
      : `The most likely break point is ${weakest.label.toLowerCase()} (${weakest.band.toLowerCase()}). ` +
        `Even a well-designed intervention will fail here if that condition does not change.`;

  return {
    conditions,
    weakest,
    summary,
    observedNote:
      "These are conditions, not results. They describe how plausible transfer is, not whether transfer happened.",
  };
}

/** Which measures, if any, would count as observed transfer. */
export const TRANSFER_MEASURES = ["behavior", "usage", "observation"] as const;

export function transferEvidenceStatus(measured: string[]) {
  const present = TRANSFER_MEASURES.filter((m) => measured.includes(m));
  return {
    present,
    observed: present.length > 0,
    statement: present.length
      ? "Some post-event application data exists, so transfer can be discussed as observed — carefully, and without attributing the change to the program alone."
      : "No post-event behavior, system usage or manager observation is recorded. Transfer is unmeasured: it can be designed for and argued for, but not claimed.",
  };
}
