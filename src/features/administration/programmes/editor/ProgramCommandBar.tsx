import type { UseFormRegisterReturn } from 'react-hook-form';
import { AdminSaveStatus, type AdminSaveState } from '../../shared';
import type { ProgramEditorMode, ProgramEditorTab } from './program-editor.types';
import { cls } from './program-editor.utils';
import { Button, SelectPill } from './ProgramFormUi';

type ProgramCommandBarProps = {
    mode: ProgramEditorMode;
    idPrefix: string;
    title: string;
    statusField: UseFormRegisterReturn;
    saving: boolean;
    completion: number;
    saveState: AdminSaveState;
    tab: ProgramEditorTab;
    onTabChange: (tab: ProgramEditorTab) => void;
};

const tabs: readonly ProgramEditorTab[] = ['identite', 'marketing', 'pedago', 'seo'];

const copy = {
    create: {
        eyebrow: 'Nouveau programme',
        idle: 'Créer',
        pending: 'Création…',
        mobileIdle: 'Créer le programme',
    },
    edit: {
        eyebrow: 'Éditer le programme',
        idle: 'Enregistrer',
        pending: 'Enregistrement…',
        mobileIdle: 'Enregistrer le programme',
    },
} satisfies Record<ProgramEditorMode, Record<string, string>>;

export default function ProgramCommandBar({ mode, idPrefix, title, statusField, saving, completion, saveState, tab, onTabChange }: ProgramCommandBarProps) {
    const labels = copy[mode];

    return (
        <div className="sticky top-16 z-30 -mx-1 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{labels.eyebrow}</div>
                    <div className="truncate font-semibold">{title || 'Sans titre'}</div>
                </div>
                <div className="flex items-center gap-2">
                    <SelectPill id={`${idPrefix}-status`} aria-label="Statut du programme" {...statusField}>
                        <option value="draft">Brouillon</option>
                        <option value="preflight">Pré-vol</option>
                        <option value="published">Publié</option>
                    </SelectPill>
                    <Button type="submit" disabled={saving} className="hidden sm:inline-flex">
                        {saving ? labels.pending : labels.idle}
                    </Button>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent motion-safe:transition-[width]" style={{ width: `${completion}%` }} />
                </div>
                <div className="text-xs tabular-nums text-muted-foreground">{completion}%</div>
                <AdminSaveStatus state={saveState} className={saveState === 'dirty' ? 'border border-warning/45 bg-warning/10 text-foreground' : undefined} />
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface-muted p-1 text-sm">
                <div className="flex min-w-max gap-1 sm:grid sm:min-w-0 sm:grid-cols-4" role="group" aria-label="Sections du formulaire">
                    {tabs.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onTabChange(key)}
                            aria-pressed={tab === key}
                            className={cls('min-h-10 rounded-lg px-3 py-2 motion-safe:transition sm:w-full', tab === key ? 'bg-surface text-primary shadow ring-1 ring-border' : 'cursor-pointer text-muted-foreground hover:bg-surface hover:text-foreground')}
                        >
                            {key === 'identite' ? 'Identité' : key.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <Button type="submit" disabled={saving} className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 shadow-elevated sm:hidden">
                {saving ? labels.pending : labels.mobileIdle}
            </Button>
        </div>
    );
}
