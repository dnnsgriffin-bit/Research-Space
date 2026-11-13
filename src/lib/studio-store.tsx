import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_BRIEF,
  DEMO_CONTEXT,
  DEMO_MEASURED,
  DEMO_PILOT,
  DEMO_PROFILES,
  DEMO_SCENARIO_A,
  DEMO_SCENARIO_B,
  DEMO_SCENARIO_C,
  DEMO_EVIDENCE,
  emptyEvidence,
  emptyPilot,
  emptyProfile,
  EXAMPLE_PROFILE,
  type Brief,
  type EvidenceState,
  type PlacedComponent,
  type Pilot,
  type Profile,
  type Scenario,
  type ScenarioKey,
} from "./studio-data";
import type { Snapshot } from "./studio-engine";

export type StudioState = {
  demo: boolean;
  profiles: Profile[];
  scenarios: Record<ScenarioKey, Scenario>;
  measured: string[];
  evidence: EvidenceState;
  pilot: Pilot;
  brief: Brief;
  context: { company: string; audience: string; problem: string };
};

const blankState = (): StudioState => ({
  demo: false,
  profiles: [emptyProfile("p1")],
  scenarios: {
    A: { key: "A", name: "Current approach", enabled: true, components: [] },
    B: { key: "B", name: "Alternative approach", enabled: true, components: [] },
    C: { key: "C", name: "Lean alternative", enabled: false, components: [] },
  },
  measured: [],
  evidence: { ...emptyEvidence, designs: [], causes: [] },
  pilot: { ...emptyPilot },
  brief: { businessQuestion: "", keyTradeoff: "", decisionNow: "" },
  context: { company: "", audience: "", problem: "" },
});

export const demoState = (): StudioState => ({
  demo: true,
  profiles: DEMO_PROFILES.map((p) => ({ ...p })),
  scenarios: {
    A: { key: "A", name: "Current approach", enabled: true, components: [...DEMO_SCENARIO_A] },
    B: { key: "B", name: "Alternative approach", enabled: true, components: [...DEMO_SCENARIO_B] },
    C: { key: "C", name: "Lean alternative", enabled: true, components: [...DEMO_SCENARIO_C] },
  },
  measured: [...DEMO_MEASURED],
  evidence: {
    ...DEMO_EVIDENCE,
    designs: [...DEMO_EVIDENCE.designs],
    causes: [...DEMO_EVIDENCE.causes],
  },
  pilot: { ...DEMO_PILOT },
  brief: { ...DEMO_BRIEF },
  context: { ...DEMO_CONTEXT },
});

/*
 * Keeping work across visits. The Studio stays in this browser only: inputs are
 * written to localStorage on this device and never sent anywhere. Start over
 * clears them. If storage is blocked (private window, strict settings), the
 * Studio still works and simply forgets on refresh.
 */
const STORE_KEY = "evidence-studio:studio";
const STORE_VERSION = 1;

type Saved = { v: number; state: StudioState; step: number; savedAt: number };

/** Lays a saved state over a blank one, so a save from an older version still loads. */
function restore(raw: string | null): Saved | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (parsed.v !== STORE_VERSION || !parsed.state || typeof parsed.state !== "object")
      return null;
    const blank = blankState();
    const s = parsed.state as Partial<StudioState>;
    const state: StudioState = {
      ...blank,
      ...s,
      scenarios: { ...blank.scenarios, ...s.scenarios },
      evidence: { ...blank.evidence, ...s.evidence },
      pilot: { ...blank.pilot, ...s.pilot },
      brief: { ...blank.brief, ...s.brief },
      context: { ...blank.context, ...s.context },
      profiles: Array.isArray(s.profiles) && s.profiles.length ? s.profiles : blank.profiles,
      measured: Array.isArray(s.measured) ? s.measured : blank.measured,
    };
    const step = Number.isInteger(parsed.step) ? Math.min(Math.max(parsed.step!, 0), 5) : 0;
    return { v: STORE_VERSION, state, step, savedAt: Number(parsed.savedAt) || Date.now() };
  } catch {
    return null;
  }
}

function readStore(): string | null {
  try {
    return window.localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

function writeStore(state: StudioState, step: number) {
  try {
    const isBlank = JSON.stringify(state) === JSON.stringify(blankState()) && step === 0;
    if (isBlank) window.localStorage.removeItem(STORE_KEY);
    else {
      const saved: Saved = { v: STORE_VERSION, state, step, savedAt: Date.now() };
      window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    }
  } catch {
    /* storage blocked or full: keep working in memory */
  }
}

type Ctx = {
  state: StudioState;
  /** When earlier work was brought back on this visit (ms since epoch), else null. */
  restoredAt: number | null;
  step: number;
  setStep: (n: number) => void;
  loadDemo: () => void;
  reset: () => void;
  addProfile: () => void;
  removeProfile: (id: string) => void;
  useExampleProfile: (id: string) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  addComponent: (key: ScenarioKey, refId: string) => void;
  removeComponent: (key: ScenarioKey, uid: string) => void;
  updateComponent: (key: ScenarioKey, uid: string, patch: Partial<PlacedComponent>) => void;
  moveComponent: (key: ScenarioKey, uid: string, dir: -1 | 1) => void;
  toggleScenario: (key: ScenarioKey) => void;
  copyScenario: (from: ScenarioKey, to: ScenarioKey) => void;
  toggleMeasure: (id: string) => void;
  updateEvidence: (patch: Partial<EvidenceState>) => void;
  toggleDesign: (id: EvidenceState["designs"][number]) => void;
  toggleCause: (id: string) => void;
  updatePilot: (patch: Partial<Pilot>) => void;
  updateBrief: (patch: Partial<Brief>) => void;
  updateContext: (patch: Partial<StudioState["context"]>) => void;
};

const StudioContext = createContext<Ctx | null>(null);

const sortComponents = (list: PlacedComponent[]) => [...list].sort((a, b) => a.day - b.day);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(blankState);
  const [step, setStep] = useState(0);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const loaded = useRef(false);

  // Bring back earlier work once, after the first render (the server has no storage).
  useEffect(() => {
    const saved = restore(readStore());
    if (saved) {
      setState(saved.state);
      setStep(saved.step);
      setRestoredAt(saved.savedAt);
    }
    loaded.current = true;
  }, []);

  // Save shortly after each change, not on every keystroke.
  useEffect(() => {
    if (!loaded.current) return;
    const t = window.setTimeout(() => writeStore(state, step), 400);
    return () => window.clearTimeout(t);
  }, [state, step]);

  const patchScenario = useCallback(
    (key: ScenarioKey, fn: (s: Scenario) => Scenario) =>
      setState((prev) => ({
        ...prev,
        scenarios: { ...prev.scenarios, [key]: fn(prev.scenarios[key]) },
      })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      restoredAt,
      step,
      setStep,
      loadDemo: () => {
        setState(demoState());
        setStep(0);
        setRestoredAt(null);
      },
      reset: () => {
        setState(blankState());
        setStep(0);
        setRestoredAt(null);
        try {
          window.localStorage.removeItem(STORE_KEY);
        } catch {
          /* nothing stored */
        }
      },
      addProfile: () =>
        setState((p) =>
          p.profiles.length >= 3
            ? p
            : { ...p, profiles: [...p.profiles, emptyProfile(`p${Date.now()}`)] },
        ),
      removeProfile: (id) =>
        setState((p) =>
          p.profiles.length <= 1 ? p : { ...p, profiles: p.profiles.filter((x) => x.id !== id) },
        ),
      useExampleProfile: (id) =>
        setState((p) => ({
          ...p,
          profiles: p.profiles.map((x) => (x.id === id ? { ...EXAMPLE_PROFILE, id } : x)),
        })),
      updateProfile: (id, patch) =>
        setState((p) => ({
          ...p,
          profiles: p.profiles.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      addComponent: (key, refId) =>
        patchScenario(key, (s) => {
          const lastDay = s.components.length ? Math.max(...s.components.map((c) => c.day)) : 0;
          return {
            ...s,
            components: [
              ...s.components,
              {
                uid: `${refId}-${Date.now()}-${Math.round(Math.random() * 999)}`,
                refId,
                day: lastDay ? lastDay + 7 : 1,
                minutes: 45,
                frequency: "Once",
                spacing: lastDay ? "Spaced" : "Single exposure",
                managerInvolved: refId === "coaching",
                practice: ["retrieval", "scenario", "sim", "feedback", "peer"].includes(refId),
              },
            ],
          };
        }),
      removeComponent: (key, uid) =>
        patchScenario(key, (s) => ({
          ...s,
          components: s.components.filter((c) => c.uid !== uid),
        })),
      updateComponent: (key, uid, patch) =>
        patchScenario(key, (s) => ({
          ...s,
          components: sortComponents(
            s.components.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
          ),
        })),
      moveComponent: (key, uid, direction) =>
        patchScenario(key, (s) => {
          const list = [...s.components];
          const i = list.findIndex((c) => c.uid === uid);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= list.length) return s;
          const a = list[i]!;
          const b = list[j]!;
          list[i] = { ...a, day: b.day };
          list[j] = { ...b, day: a.day };
          return { ...s, components: sortComponents(list) };
        }),
      toggleScenario: (key) => patchScenario(key, (s) => ({ ...s, enabled: !s.enabled })),
      copyScenario: (from, to) =>
        setState((p) => ({
          ...p,
          scenarios: {
            ...p.scenarios,
            [to]: {
              ...p.scenarios[to],
              enabled: true,
              components: p.scenarios[from].components.map((c) => ({
                ...c,
                uid: `${c.refId}-${Date.now()}-${Math.round(Math.random() * 999)}`,
              })),
            },
          },
        })),
      toggleMeasure: (id) =>
        setState((p) => ({
          ...p,
          measured: p.measured.includes(id)
            ? p.measured.filter((m) => m !== id)
            : [...p.measured, id],
        })),
      updateEvidence: (patch) => setState((p) => ({ ...p, evidence: { ...p.evidence, ...patch } })),
      toggleDesign: (id) =>
        setState((p) => ({
          ...p,
          evidence: {
            ...p.evidence,
            designs: p.evidence.designs.includes(id)
              ? p.evidence.designs.filter((d) => d !== id)
              : [...p.evidence.designs, id],
          },
        })),
      toggleCause: (id) =>
        setState((p) => ({
          ...p,
          evidence: {
            ...p.evidence,
            causes: p.evidence.causes.includes(id)
              ? p.evidence.causes.filter((c) => c !== id)
              : [...p.evidence.causes, id],
          },
        })),
      updatePilot: (patch) => setState((p) => ({ ...p, pilot: { ...p.pilot, ...patch } })),
      updateBrief: (patch) => setState((p) => ({ ...p, brief: { ...p.brief, ...patch } })),
      updateContext: (patch) => setState((p) => ({ ...p, context: { ...p.context, ...patch } })),
    }),
    [state, restoredAt, step, patchScenario],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

export const STEPS = [
  { id: 0, num: "1", name: "Learner context", headline: "Who has to perform differently?" },
  {
    id: 1,
    num: "2",
    name: "Intervention builder",
    headline: "What are you asking people to experience and practice?",
  },
  {
    id: 2,
    num: "3",
    name: "Experiment sandbox",
    headline: "What changes if we design it differently?",
  },
  {
    id: 3,
    num: "4",
    name: "Reality check",
    headline: "What does your evidence actually allow you to conclude?",
  },
  {
    id: 4,
    num: "5",
    name: "Pilot & calibration",
    headline: "Turn the assumption into something testable.",
  },
  {
    id: 5,
    num: "6",
    name: "Executive decision brief",
    headline: "From learning activity to decision evidence.",
  },
];

/** Adapts store state into the shape the reasoning engine expects. */
export function snapshotOf(state: StudioState): Snapshot {
  return {
    profiles: state.profiles,
    measured: state.measured,
    evidence: state.evidence,
    scenarios: {
      A: state.scenarios.A.components,
      B: state.scenarios.B.components,
      C: state.scenarios.C.enabled ? state.scenarios.C.components : [],
    },
    pilot: state.pilot,
    brief: state.brief,
  };
}

export function useSnapshot(): Snapshot {
  const { state } = useStudio();
  return snapshotOf(state);
}
