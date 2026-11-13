'use client';

import { Textarea } from '@/components/ui';

import type { LearnerFormField } from './lesson.types';

type LessonStructuredFieldsProps = {
  id: string;
  title: string;
  description: string;
  fields: LearnerFormField[];
  data: Record<string, string>;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
};

export function LessonStructuredFields({
  id,
  title,
  description,
  fields,
  data,
  disabled,
  onChange,
}: LessonStructuredFieldsProps) {
  const titleId = `${id}-title`;

  return (
    <section className="mt-5 border-t border-border pt-5" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-serif text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-4 grid gap-4">
        {fields.map((field) => {
          const value = data[field.key] ?? '';
          const inputId = `day-field-${field.key}`;

          return (
            <div key={field.key} className="grid gap-2">
              {field.groupTitle ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {field.groupTitle}
                </p>
              ) : null}
              <label htmlFor={inputId} className="text-sm font-medium text-foreground">
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-danger" aria-hidden="true">
                    *
                  </span>
                ) : null}
                {field.required ? <span className="sr-only"> (obligatoire)</span> : null}
              </label>
              <LessonStructuredFieldControl
                field={field}
                id={inputId}
                value={value}
                disabled={disabled}
                onChange={(nextValue) => onChange(field.key, nextValue)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LessonStructuredFieldControl({
  field,
  id,
  value,
  disabled,
  onChange,
}: {
  field: LearnerFormField;
  id: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  if (field.type === 'textarea') {
    return (
      <Textarea
        id={id}
        rows={4}
        disabled={disabled}
        required={field.required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        id={id}
        disabled={disabled}
        required={field.required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">Choisir…</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'slider') {
    const min = field.min ?? 0;
    const max = field.max ?? 10;
    const sliderValue = value || String(min);

    return (
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          disabled={disabled}
          min={min}
          max={max}
          value={sliderValue}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 flex-1 accent-[var(--primary)]"
        />
        <output
          htmlFor={id}
          className="min-w-10 rounded-lg bg-surface-muted px-2 py-1 text-center text-sm font-semibold tabular-nums text-foreground"
        >
          {sliderValue}
        </output>
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-required={field.required}
          checked={value === 'true'}
          onChange={(event) => onChange(String(event.target.checked))}
          className="size-5 accent-[var(--primary)]"
        />
        Oui
      </label>
    );
  }

  return (
    <input
      id={id}
      type="text"
      disabled={disabled}
      required={field.required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    />
  );
}
