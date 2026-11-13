import Link from 'next/link';

import { authRoutes } from '@/config/routes';
import { authContent } from '@/content/auth';

import { AuthFrame } from '../components/AuthFrame';
import {
    AuthForgotPasswordPanel,
    AuthLoginPanel,
    AuthRegisterPanel,
} from '../components/AuthPanels';

export type AuthAccessMode = 'login' | 'register' | 'forgot';

type AuthAccessPageProps = {
    mode: AuthAccessMode;
};

const pageContent = {
    login: authContent.connexion,
    register: authContent.inscription,
    forgot: authContent.forgotPassword,
} as const;

function AuthSwitchLink({ mode }: AuthAccessPageProps) {
    if (mode === 'register') {
        return (
            <p>
                {authContent.inscription.switchLabel}{' '}
                <Link
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                    href={authRoutes.connexion}
                >
                    {authContent.inscription.switchLink}
                </Link>
            </p>
        );
    }

    if (mode === 'forgot') {
        return (
            <p>
                {authContent.forgotPassword.switchLabel}{' '}
                <Link
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                    href={authRoutes.connexion}
                >
                    {authContent.forgotPassword.switchLink}
                </Link>
            </p>
        );
    }

    return (
        <p>
            {authContent.connexion.switchLabel}{' '}
            <Link
                className="font-semibold text-primary underline-offset-4 hover:underline"
                href={authRoutes.inscription}
            >
                {authContent.connexion.switchLink}
            </Link>
        </p>
    );
}

export function AuthAccessPage({ mode }: AuthAccessPageProps) {
    const content = pageContent[mode];

    return (
        <AuthFrame
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            footer={<AuthSwitchLink mode={mode} />}
        >
            {mode === 'login' ? <AuthLoginPanel /> : null}
            {mode === 'register' ? <AuthRegisterPanel /> : null}
            {mode === 'forgot' ? <AuthForgotPasswordPanel /> : null}
        </AuthFrame>
    );
}
