'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { Badge, Button } from '@/components/ui';
import { authContent } from '@/content/auth';
import { cn } from '@/lib/cn';

import { AuthForgotPasswordPanel, AuthLoginPanel, AuthRegisterPanel } from './AuthPanels';

export type AuthDialogView = 'login' | 'register' | 'forgot';

type AuthDialogProps = {
    open: boolean;
    initialView: AuthDialogView;
    nextPath?: string;
    onOpenChange: (open: boolean) => void;
};

const viewContent = {
    login: {
        eyebrow: authContent.connexion.eyebrow,
        title: authContent.connexion.title,
        description: authContent.connexion.description,
    },
    register: {
        eyebrow: authContent.inscription.eyebrow,
        title: authContent.inscription.title,
        description: authContent.inscription.description,
    },
    forgot: {
        eyebrow: authContent.forgotPassword.eyebrow,
        title: authContent.forgotPassword.title,
        description: authContent.forgotPassword.description,
    },
} as const;

/**
 * Modale d'authentification publique unique : connexion, inscription et mot de
 * passe oublié partagent le même shell pour éviter les pages auth en doublon.
 */
export function AuthDialog({ open, initialView, nextPath = '/espace', onOpenChange }: AuthDialogProps) {
    const [view, setView] = useState<AuthDialogView>(initialView);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginNotice, setLoginNotice] = useState<string | undefined>();
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerNotice, setRegisterNotice] = useState<string | undefined>();
    const tabsId = useId();
    const tabRefs = useRef<Record<'login' | 'register', HTMLButtonElement | null>>({ login: null, register: null });
    const content = viewContent[view];

    useEffect(() => {
        if (!open) return;
        setView(initialView);
        setLoginEmail('');
        setLoginNotice(undefined);
        setRegisterEmail('');
        setRegisterNotice(undefined);
    }, [initialView, open]);

    function switchView(nextView: AuthDialogView) {
        setView(nextView);
        if (nextView !== 'register') {
            setRegisterNotice(undefined);
        }
        if (nextView !== 'login') {
            setLoginNotice(undefined);
        }
        if (nextView === 'register') {
            setRegisterEmail('');
        }
        if (nextView === 'login') {
            setLoginEmail('');
        }
    }

    function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: 'login' | 'register') {
        const tabs = ['login', 'register'] as const;
        const currentIndex = tabs.indexOf(current);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        const nextView = tabs[nextIndex];
        switchView(nextView);
        tabRefs.current[nextView]?.focus();
    }

    function handleMissingAccount(email: string) {
        setRegisterEmail(email);
        setRegisterNotice('Aucun compte n’est associé à cette adresse. Crée ton accès ici pour continuer.');
        setView('register');
    }

    function handleExistingAccount(email: string) {
        setLoginEmail(email);
        setLoginNotice('Un compte existe déjà avec cette adresse. Connecte-toi depuis cet écran pour continuer.');
        setView('login');
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-overlay backdrop-blur-sm data-[state=closed]:animate-none data-[state=open]:animate-none" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[34rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-elevated focus:outline-none sm:max-h-[min(92dvh,46rem)] sm:w-[calc(100vw-1.5rem)] sm:rounded-[1.75rem]">
                    <div className="shrink-0 border-b border-border bg-surface-muted/70 p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <Badge variant="outline" size="md" className="bg-background/70">
                                    {content.eyebrow}
                                </Badge>
                                <Dialog.Title className="mt-3 font-serif text-2xl leading-tight text-foreground sm:text-3xl">{content.title}</Dialog.Title>
                                <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.description}</Dialog.Description>
                            </div>
                            <Dialog.Close asChild>
                                <Button type="button" variant="ghost" size="icon" aria-label="Fermer la fenêtre d’authentification">
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </Button>
                            </Dialog.Close>
                        </div>

                        {view !== 'forgot' ? (
                            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background p-1" role="tablist" aria-label="Choisir le mode d’authentification">
                                <button
                                    type="button"
                                    ref={(node) => { tabRefs.current.login = node; }}
                                    id={`${tabsId}-login-tab`}
                                    role="tab"
                                    aria-selected={view === 'login'}
                                    aria-controls={`${tabsId}-panel`}
                                    tabIndex={view === 'login' ? 0 : -1}
                                    className={cn(
                                        'h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                        view === 'login' ? 'bg-surface text-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                    )}
                                    onClick={() => switchView('login')}
                                    onKeyDown={(event) => handleTabKeyDown(event, 'login')}
                                >
                                    Connexion
                                </button>
                                <button
                                    type="button"
                                    ref={(node) => { tabRefs.current.register = node; }}
                                    id={`${tabsId}-register-tab`}
                                    role="tab"
                                    aria-selected={view === 'register'}
                                    aria-controls={`${tabsId}-panel`}
                                    tabIndex={view === 'register' ? 0 : -1}
                                    className={cn(
                                        'h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                        view === 'register' ? 'bg-surface text-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                    )}
                                    onClick={() => switchView('register')}
                                    onKeyDown={(event) => handleTabKeyDown(event, 'register')}
                                >
                                    Inscription
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div
                        id={`${tabsId}-panel`}
                        role={view === 'forgot' ? undefined : 'tabpanel'}
                        aria-labelledby={view === 'forgot' ? undefined : `${tabsId}-${view}-tab`}
                        tabIndex={view === 'forgot' ? undefined : 0}
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scroll-pb-28 sm:p-6"
                    >
                        {view === 'login' ? (
                            <AuthLoginPanel
                                initialEmail={loginEmail}
                                notice={loginNotice}
                                nextPath={nextPath}
                                onForgotPassword={() => setView('forgot')}
                                onMissingAccount={handleMissingAccount}
                                compact
                            />
                        ) : null}
                        {view === 'register' ? <AuthRegisterPanel initialEmail={registerEmail} notice={registerNotice} onExistingAccount={handleExistingAccount} compact /> : null}
                        {view === 'forgot' ? (
                            <div className="grid gap-5">
                                <AuthForgotPasswordPanel compact />
                                <Button type="button" variant="tertiary" size="md" className="w-full" onClick={() => switchView('login')}>
                                    Retour à la connexion
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
