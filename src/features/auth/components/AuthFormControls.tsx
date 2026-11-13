import type { ComponentType, InputHTMLAttributes } from 'react';
import { CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';

import { Button, Field, FieldDescription, FieldError, FieldLabel, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

type IconProps = { className?: string };

export interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: ComponentType<IconProps>;
    error?: string;
    description?: string;
}

/** Champ texte auth avec label, icône et association accessible description/erreur. */
export function AuthTextField({ label, icon: Icon, error, description, id, className, ...props }: AuthTextFieldProps) {
    const descriptionId = description && id ? `${id}-description` : undefined;
    const errorId = error && id ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <Field>
            <FieldLabel htmlFor={id} required={props.required}>
                {label}
            </FieldLabel>
            <div className="relative">
                {Icon ? (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}
                <Input id={id} className={cn(Icon && 'pl-9', className)} invalid={!!error} aria-describedby={describedBy} {...props} />
            </div>
            {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
            {error ? <FieldError id={errorId}>{error}</FieldError> : null}
        </Field>
    );
}

export interface AuthPasswordFieldProps extends Omit<AuthTextFieldProps, 'type'> {
    visible: boolean;
    onToggleVisible: () => void;
}

/** Champ mot de passe auth avec bascule d'affichage intégrée. */
export function AuthPasswordField({ visible, onToggleVisible, className, ...props }: AuthPasswordFieldProps) {
    return (
        <div className="relative">
            <AuthTextField type={visible ? 'text' : 'password'} className={cn('pr-14', className)} {...props} />
            <button
                type="button"
                onClick={onToggleVisible}
                className="absolute right-2 top-8 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
                {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
        </div>
    );
}

/** Indicateur visuel et vocal de la robustesse du mot de passe. */
export function PasswordStrength({ score, label, percent, barClass }: { score: number; label: string; percent: number; barClass: string }) {
    return (
        <div role="status" aria-live="polite" aria-atomic="true">
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-label="Force du mot de passe"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={label}
            >
                <div className={cn('h-full rounded-full transition-all', barClass)} style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Force : {label}</p>
            <span className="sr-only">Score du mot de passe : {score + 1} sur 5.</span>
        </div>
    );
}

/** Liste les critères de mot de passe avec état validé/non validé. */
export function PasswordChecklist({ items }: { items: readonly { ok: boolean; label: string }[] }) {
    return (
        <ul className="grid gap-2 text-xs sm:grid-cols-2" aria-label="Critères du mot de passe">
            {items.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                    {item.ok ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className={item.ok ? 'text-success' : 'text-muted-foreground'}>{item.label}</span>
                </li>
            ))}
        </ul>
    );
}

type AuthSubmitButtonProps = {
    pending: boolean;
    pendingLabel: string;
    children: string;
    disabled: boolean;
    sticky?: boolean;
};

/** Bouton submit partagé par les panneaux auth avec état de chargement cohérent. */
export function AuthSubmitButton({ pending, pendingLabel, children, disabled, sticky = false }: AuthSubmitButtonProps) {
    const button = (
        <Button type="submit" size="lg" className="w-full" loading={pending} loadingLabel={pendingLabel} disabled={disabled}>
            {pending ? pendingLabel : children}
        </Button>
    );

    if (sticky) {
        return (
            <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-surface/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-16px_32px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:px-6 sm:pb-6 sm:pt-5">
                {button}
            </div>
        );
    }

    return (
        button
    );
}
