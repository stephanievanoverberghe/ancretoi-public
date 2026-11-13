import { getButtonClassName } from '@/components/ui/actions/button.styles';

type GoogleAuthButtonProps = {
    nextPath?: string;
    label?: string;
    mode?: 'login' | 'register';
};

/**
 * Déclenche le flux OAuth Google côté serveur en conservant la destination
 * interne et le mode de modale attendu au retour.
 */
export function GoogleAuthButton({ nextPath = '/espace', label = 'Se connecter avec Google', mode = 'login' }: GoogleAuthButtonProps) {
    const href = `/api/auth/google/start?next=${encodeURIComponent(nextPath)}&mode=${mode}`;

    return (
        <a
            href={href}
            className={getButtonClassName({
                variant: 'secondary',
                size: 'lg',
                className: 'w-full rounded-full bg-surface text-foreground shadow-soft hover:text-foreground',
            })}
        >
            <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[conic-gradient(#4285f4_0_25%,#34a853_0_50%,#fbbc05_0_75%,#ea4335_0)] p-[2px]"
            >
                <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-surface text-xs font-bold text-foreground">G</span>
            </span>
            {label}
        </a>
    );
}
