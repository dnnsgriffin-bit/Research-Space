import { SCALE_FIELDS, type Profile } from "@/lib/studio-data";
import { ScaleField, SelectField, TextArea, TextField } from "@/components/studio/Fields";
import { EvidenceLabel } from "@/components/studio/EvidenceLabel";
import { useStudio } from "@/lib/studio-store";
import { LearningProblemPanel } from "@/components/studio/LearningProblemPanel";

export function StepContext() {
  const {
    state,
    addProfile,
    removeProfile,
    updateProfile,
    useExampleProfile: applyExampleProfile,
    updateContext,
  } = useStudio();

  return (
    <div>
      <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="space-y-5">
          <p className="label-xs text-[var(--teal)]">Begin with the decision</p>
          <TextArea
            label="What is happening at work?"
            rows={3}
            value={state.context.problem}
            onChange={(v) => updateContext({ problem: v })}
            placeholder="Managers completed coaching training, but the quality of conversations still varies."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Organization or project"
              value={state.context.company}
              onChange={(v) => updateContext({ company: v })}
              placeholder="Your team or organization"
            />
            <TextField
              label="Who needs to act differently?"
              value={state.context.audience}
              onChange={(v) => updateContext({ audience: v })}
              placeholder="New people managers"
            />
          </div>
        </div>
        <aside className="border-t-2 border-[var(--teal)] bg-[var(--tint-teal)] p-6">
          <p className="label-xs text-[var(--teal)]">Your working question</p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-[1.5rem] leading-snug text-[var(--navy)]">
            {state.context.problem.trim() ||
              "What needs to change in the work — and what would count as evidence?"}
          </p>
          <p className="mt-5 text-[14px] leading-relaxed text-foreground/80">
            This is a decision workspace, not a diagnosis. Start with the observation, then
            challenge the possible cause below.
          </p>
        </aside>
      </div>

      <div className="mt-9">
        <LearningProblemPanel />
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <h2 className="text-[1.55rem] leading-tight">Now consider the people and conditions.</h2>
        <p className="measure mt-3 text-[15px] leading-relaxed text-foreground/80">
          Describe who must do something differently, what the task demands, and what the
          environment allows. These profiles are structured scenarios, not predictions of people.
        </p>
      </div>

      <div className="mt-6 border border-border bg-[var(--surface)] p-5">
        <p className="label-xs text-muted-foreground">How to read these profiles</p>
        <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">
          These profiles are structured scenarios used to examine how context may affect a learning
          strategy. They are not predictions of individual human behavior.
        </p>
        <p className="mt-3 text-[13px] text-muted-foreground">
          This tool does not use learning-style categories. It concentrates on task demands, prior
          knowledge, practice, support, and opportunity to apply.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {state.profiles.map((p, i) => (
          <ProfileCard
            key={p.id}
            profile={p}
            index={i}
            canRemove={state.profiles.length > 1}
            onRemove={() => removeProfile(p.id)}
            onExample={() => applyExampleProfile(p.id)}
            onChange={(patch) => updateProfile(p.id, patch)}
          />
        ))}
      </div>

      {state.profiles.length < 3 && (
        <button
          type="button"
          onClick={addProfile}
          className="mt-8 min-h-11 border border-border px-4 py-2.5 text-[14px] text-[var(--navy)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
        >
          + Add another profile ({state.profiles.length} of 3)
        </button>
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  index,
  canRemove,
  onRemove,
  onExample,
  onChange,
}: {
  profile: Profile;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onExample: () => void;
  onChange: (patch: Partial<Profile>) => void;
}) {
  return (
    <section className="border-t border-[var(--navy)] pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="label-xs text-[var(--navy)]">
          Profile {String(index + 1).padStart(2, "0")}
          {profile.name ? ` — ${profile.name}` : ""}
        </h3>
        <div className="flex gap-5">
          <button
            type="button"
            onClick={onExample}
            className="text-[13px] text-[var(--teal)] underline underline-offset-4"
          >
            Use example profile
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-[var(--signal)]"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <TextField
            label="Profile name"
            value={profile.name}
            onChange={(v) => onChange({ name: v })}
            placeholder="Experienced but constrained"
          />
          <TextField
            label="Role"
            value={profile.role}
            onChange={(v) => onChange({ role: v })}
            placeholder="New people manager"
          />
          <SelectField
            label="Tenure"
            value={profile.tenure}
            onChange={(v) => onChange({ tenure: v })}
            options={["Under 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"]}
          />
          <SelectField
            label="Frequency of task performance"
            value={profile.taskFrequency}
            onChange={(v) => onChange({ taskFrequency: v })}
            options={["Daily", "Weekly", "Monthly", "Quarterly", "Rarely"]}
          />
          <TextArea
            label="Environmental or access constraints"
            value={profile.constraints}
            onChange={(v) => onChange({ constraints: v })}
            placeholder="Shared devices, shift patterns, no protected time…"
          />
          <TextArea
            label="Summary note"
            value={profile.note}
            onChange={(v) => onChange({ note: v })}
            placeholder="One or two sentences a colleague could act on."
          />
          <EvidenceLabel kind="user" />
        </div>

        <div className="lg:pl-8">
          <p className="label-xs text-muted-foreground">Condition ratings</p>
          <div className="mt-1">
            {SCALE_FIELDS.map((f) => (
              <ScaleField
                key={String(f.key)}
                label={f.label}
                low={f.low}
                high={f.high}
                value={profile[f.key] as number}
                onChange={(v) => onChange({ [f.key]: v } as Partial<Profile>)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
