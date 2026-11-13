import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cls } from './program-editor.utils';

const fieldIdFromName = (name: string | undefined) => name?.replace(/[^a-zA-Z0-9_-]+/g, '-');

export const Label = ({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {children}
        {required && (
            <>
                {' '}
                <span className="text-brand-700" aria-hidden="true">
                    *
                </span>
                <span className="sr-only"> obligatoire</span>
            </>
        )}
    </label>
);

export const Help = ({ children, id }: { children: ReactNode; id?: string }) => (
    <p id={id} className="mt-1 text-[11px] text-muted-foreground">
        {children}
    </p>
);

export function InputPill(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className, type, id, name, ...rest } = props;
    return (
        <input
            {...rest}
            id={id ?? fieldIdFromName(name)}
            name={name}
            type={type}
            className={cls(
                'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                type === 'number' && '[-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                className
            )}
        />
    );
}

export function TextareaSoft(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const { className, id, name, ...rest } = props;
    return (
        <textarea
            {...rest}
            id={id ?? fieldIdFromName(name)}
            name={name}
            className={cls(
                'w-full min-h-[96px] rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                className
            )}
        />
    );
}

export function SelectPill(props: SelectHTMLAttributes<HTMLSelectElement>) {
    const { className, id, name, ...rest } = props;
    return (
        <div className="relative">
            <select
                {...rest}
                id={id ?? fieldIdFromName(name)}
                name={name}
                className={cls(
                    'w-full appearance-none rounded-xl border border-input bg-background py-2 pl-3 pr-8 text-sm text-foreground shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                    className
                )}
            />
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
    const { variant = 'primary', className, ...rest } = props;
    const map = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'border border-border bg-surface-muted text-foreground hover:bg-muted',
        ghost: 'border border-border bg-background text-foreground hover:bg-surface-muted',
    } as const;
    return <button {...rest} className={cls('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm', map[variant], className)} />;
}

export const Card = ({ children }: { children: ReactNode }) => <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft md:p-5">{children}</section>;

export const Badge = ({ children }: { children: ReactNode }) => (
    <span className="inline-flex items-center rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] text-muted-foreground">{children}</span>
);

export function IconButton({ onClick, title, children, className, disabled, 'aria-label': ariaLabel }: ButtonHTMLAttributes<HTMLButtonElement> & { title?: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={ariaLabel ?? title}
            type="button"
            disabled={disabled}
            className={cls(
                'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-surface-muted hover:text-foreground disabled:opacity-40',
                className
            )}
        >
            {children}
        </button>
    );
}
