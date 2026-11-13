import { Accessibility, Cookie, Database, KeyRound, Palette, Shield, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert, LinkButton, TabsContent } from '@/components/ui';
import { legalRoutes, publicRoutes } from '@/config/routes';
import type { AccountProfile } from '@/server/auth/account-profile';

import { AccountSection } from './AccountSection';
import AccessibilityPrefsClient from './AccessibilityPrefsClient';
import AvatarUploadClient from './AvatarUploadClient';
import CookieBannerTrigger from './CookiesBanner';
import CookieQuickPrefsClient from './CookieQuickPrefsClient';
import DangerZoneClient from './DangerZoneClient';
import DataExportClient from './DataExportClient';
import PasswordChangeClient from './PasswordChangeClient';
import ThemeLivePreview from './ThemeLivePreview';
import UpdatePrefsClient from './UpdatePrefsClient';
import { AccountTabsRootClient } from './AccountTabsRootClient';

function AccountTextLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <LinkButton href={href} variant="tertiary" size="sm" className="min-h-10 w-full justify-start sm:w-fit">
            {children}
        </LinkButton>
    );
}

export function AccountSettingsTabs({ user }: { user: AccountProfile }) {
    const theme = user.theme ?? 'system';

    return (
        <AccountTabsRootClient>
            <TabsContent value="profil">
                <div className="grid min-w-0 gap-6 xl:max-w-5xl">
                    <AccountSection
                        icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
                        title="Identité"
                        description="Ton avatar et ton nom affiché sont utilisés dans l’espace apprenant."
                    >
                        <AvatarUploadClient initialAvatarUrl={user.avatarUrl ?? null} initialName={user.name ?? ''} />
                        <p className="break-all rounded-2xl bg-surface-muted p-4 text-sm text-muted-foreground">
                            Adresse de connexion : <span className="font-medium text-foreground">{user.email}</span>
                        </p>
                    </AccountSection>
                </div>
            </TabsContent>

            <TabsContent value="preferences">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <AccountSection
                        icon={<Palette className="h-5 w-5" aria-hidden="true" />}
                        title="Thème et e-mails"
                        description="Choisis ton mode d’affichage et les messages que tu souhaites recevoir."
                    >
                        <UpdatePrefsClient
                            initial={{
                                theme,
                                marketing: Boolean(user.marketing),
                                productUpdates: Boolean(user.productUpdates),
                            }}
                        />
                        <ThemeLivePreview />
                    </AccountSection>

                    <AccountSection
                        icon={<Accessibility className="h-5 w-5" aria-hidden="true" />}
                        title="Confort de lecture"
                        description="Ces réglages restent enregistrés sur cet appareil."
                    >
                        <AccessibilityPrefsClient />
                    </AccountSection>
                </div>
            </TabsContent>

            <TabsContent value="securite">
                <div className="grid min-w-0 gap-6 xl:max-w-5xl">
                    <AccountSection
                        icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
                        title="Mot de passe"
                        description="Gère le mot de passe utilisé pour te connecter avec ton adresse e-mail."
                    >
                        {user.hasPassword ? (
                            <PasswordChangeClient />
                        ) : (
                            <Alert variant="info" title="Aucun mot de passe à modifier">
                                Ce compte utilise un autre mode de connexion. Les réglages de sécurité disponibles apparaîtront ici lorsqu’ils seront actifs.
                            </Alert>
                        )}
                    </AccountSection>
                </div>
            </TabsContent>

            <TabsContent value="donnees">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="grid content-start gap-6">
                        <AccountSection
                            icon={<Database className="h-5 w-5" aria-hidden="true" />}
                            title="Exporter mes paramètres"
                            description="Récupère une copie des réglages actuellement associés à ton compte."
                        >
                            <DataExportClient />
                        </AccountSection>

                        <AccountSection
                            icon={<Cookie className="h-5 w-5" aria-hidden="true" />}
                            title="Cookies et consentement"
                            description="Ajuste les préférences essentielles de confidentialité sur cet appareil."
                        >
                            <CookieQuickPrefsClient />
                            <div className="flex flex-wrap gap-2">
                                <CookieBannerTrigger />
                                <AccountTextLink href={legalRoutes.confidentialite}>Confidentialité</AccountTextLink>
                            </div>
                        </AccountSection>
                    </div>

                    <div className="grid content-start gap-6">
                        <AccountSection icon={<Shield className="h-5 w-5" aria-hidden="true" />} title="Aide et cadre" description="Les liens utiles pour comprendre ou modifier tes choix.">
                            <div className="grid gap-2">
                                <AccountTextLink href={publicRoutes.aide}>Centre d’aide</AccountTextLink>
                                <AccountTextLink href={legalRoutes.cookies}>Politique cookies</AccountTextLink>
                            </div>
                        </AccountSection>

                        <DangerZoneClient email={user.email} />
                    </div>
                </div>
            </TabsContent>
        </AccountTabsRootClient>
    );
}
