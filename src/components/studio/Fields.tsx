import { useId, type ReactNode } from "react";

export function FieldShell({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string | undefined;
  htmlFor?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label-xs block text-[var(--navy)]">
        {label}
      </label>
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full min-h-11 border border-border bg-[var(--surface)] px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:border-[var(--teal)] focus:outline-none";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function ScaleField({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  const id = useId();
  return (
    <div className="border-t border-border py-4">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label-xs text-[var(--navy)]">
          {label}
        </label>
        <span className="text-[13px] tabular-nums text-muted-foreground">{value} / 5</span>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        id={id}
        className="mt-3 grid grid-cols-5 gap-px bg-border"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label}: ${n} of 5${n === 1 ? ` (${low})` : n === 5 ? ` (${high})` : ""}`}
              onClick={() => onChange(n)}
              className={`min-h-11 text-[13px] tabular-nums transition-colors ${
                active
                  ? "bg-[var(--navy)] text-[var(--surface)]"
                  : "bg-[var(--surface)] text-muted-foreground hover:bg-[var(--background)]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
