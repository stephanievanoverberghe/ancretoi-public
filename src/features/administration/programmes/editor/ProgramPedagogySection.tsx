import type { UseFieldArrayReturn, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Copy, Film, GripVertical, MoveDown, MoveUp, Plus, Trash2 } from 'lucide-react';
import type { ProgramEditorMode, ProgramFormShape } from './program-editor.types';
import { providerFromUrl } from './program-editor.utils';
import { Badge, Button, Card, Help, IconButton, InputPill, Label, SelectPill, TextareaSoft } from './ProgramFormUi';
import ProgramVideoThumb from './ProgramVideoThumb';

type ProgramPedagogySectionProps = {
    mode: ProgramEditorMode;
    idPrefix: string;
    register: UseFormRegister<ProgramFormShape>;
    watch: UseFormWatch<ProgramFormShape>;
    days: UseFieldArrayReturn<ProgramFormShape, 'days', 'id'>;
    activeDay: number;
    onActiveDayChange: (index: number) => void;
    onAddDay: () => void;
    onDuplicateDay: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemoveDay: (index: number) => void;
};

export default function ProgramPedagogySection({
    mode,
    idPrefix,
    register,
    watch,
    days,
    activeDay,
    onActiveDayChange,
    onAddDay,
    onDuplicateDay,
    onMoveUp,
    onMoveDown,
    onRemoveDay,
}: ProgramPedagogySectionProps) {
    const activeVideoUrl = activeDay >= 0 && activeDay < days.fields.length ? ((watch(`days.${activeDay}.videoUrl` as const) as string) || '') : '';
    const activeTitle = activeDay >= 0 && activeDay < days.fields.length ? ((watch(`days.${activeDay}.title` as const) as string) || `J${activeDay + 1} — titre`) : '';
    const activeDescription = activeDay >= 0 && activeDay < days.fields.length ? ((watch(`days.${activeDay}.description` as const) as string) || 'Aperçu de la description…') : '';
    const dayFieldId = (field: string) => `${idPrefix}-day-${activeDay + 1}-${field}`;
    const videoHelpId = dayFieldId('video-help');
    const mantraCountId = dayFieldId('mantra-count');

    return (
        <Card>
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold">Pédagogie</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {mode === 'edit' ? 'Statut par jour, actions rapides et preview.' : 'Onglets par jour. Actions rapides et preview intégrée.'}
                    </p>
                </div>
            </div>

            {days.fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground text-center">
                    Aucun jour pour l’instant.
                    <div className="mt-3">
                        <Button variant="secondary" onClick={onAddDay}>
                            <Plus className="h-4 w-4" /> Ajouter le J1
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-[260px,1fr] gap-4">
                    <aside className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Jours</div>
                            <button type="button" onClick={onAddDay} className="inline-flex items-center gap-1 text-xs rounded-md border px-2 py-1 hover:bg-surface-muted" title="Ajouter un jour" aria-label="Ajouter un jour">
                                <Plus className="h-3.5 w-3.5" /> Ajouter
                            </button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {days.fields.map((field, index) => {
                                const active = index === activeDay;
                                return (
                                    <li key={field.id}>
                                        <button
                                            type="button"
                                            onClick={() => onActiveDayChange(index)}
                                            aria-pressed={active}
                                            aria-label={`Sélectionner le jour ${index + 1}`}
                                            className={[
                                                'w-full rounded-lg px-3 py-2 text-left text-sm motion-safe:transition border',
                                                active ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20' : 'bg-background hover:bg-surface-muted border-border',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground/75 shrink-0" />
                                                    <span className="truncate">
                                                        J{index + 1} — {(watch(`days.${index}.title` as const) as string) || 'titre'}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                        {active && (
                                            <div className="mt-1 flex items-center gap-1.5 px-1.5" role="group" aria-label={`Actions du jour ${index + 1}`}>
                                                <IconButton onClick={() => onDuplicateDay(index)} title="Dupliquer" aria-label={`Dupliquer le jour ${index + 1}`}>
                                                    <Copy className="h-4 w-4" />
                                                </IconButton>
                                                <IconButton onClick={() => onMoveUp(index)} title="Monter" aria-label={`Monter le jour ${index + 1}`} disabled={index === 0}>
                                                    <MoveUp className="h-4 w-4" />
                                                </IconButton>
                                                <IconButton onClick={() => onMoveDown(index)} title="Descendre" aria-label={`Descendre le jour ${index + 1}`} disabled={index === days.fields.length - 1}>
                                                    <MoveDown className="h-4 w-4" />
                                                </IconButton>
                                                <IconButton onClick={() => onRemoveDay(index)} title="Supprimer" aria-label={`Supprimer le jour ${index + 1}`}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </IconButton>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <section className="rounded-2xl border border-border bg-card p-4">
                        {activeDay >= 0 && activeDay < days.fields.length && (
                            <div className="grid md:grid-cols-[1fr,300px] gap-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">Jour {activeDay + 1}</div>
                                        <div className="flex items-center gap-2">
                                            <Badge>Édition</Badge>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <Label htmlFor={dayFieldId('title')} required>Titre du jour</Label>
                                        <InputPill id={dayFieldId('title')} aria-required="true" {...register(`days.${activeDay}.title` as const, { required: true })} placeholder={`J${activeDay + 1} — titre`} />
                                    </div>

                                    <div className={mode === 'edit' ? 'mt-4 grid gap-3 md:grid-cols-3' : 'mt-4'}>
                                        <div className={mode === 'edit' ? 'md:col-span-2' : undefined}>
                                            <Label htmlFor={dayFieldId('video-url')} required>URL vidéo (YouTube / Vimeo / MP4)</Label>
                                            <InputPill
                                                id={dayFieldId('video-url')}
                                                aria-required="true"
                                                aria-describedby={videoHelpId}
                                                {...register(`days.${activeDay}.videoUrl` as const, { required: true })}
                                                placeholder="https://youtu.be/... | https://vimeo.com/... | https://cdn/.../video.mp4"
                                                inputMode="url"
                                            />
                                            <Help id={videoHelpId}>Colle une URL http(s) valide. Un badge de source s’affiche automatiquement.</Help>
                                            <div className="mt-2">
                                                <Badge>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Film className="h-3.5 w-3.5" />
                                                        {providerFromUrl(activeVideoUrl) || 'Lien'}
                                                    </span>
                                                </Badge>
                                            </div>
                                        </div>
                                        {mode === 'edit' ? (
                                            <div>
                                                <Label htmlFor={dayFieldId('status')}>Statut du jour</Label>
                                                <SelectPill id={dayFieldId('status')} {...register(`days.${activeDay}.status` as const)}>
                                                    <option value="draft">Brouillon</option>
                                                    <option value="published">Publié</option>
                                                </SelectPill>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 grid md:grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor={dayFieldId('mantra')}>Mantra</Label>
                                            <InputPill id={dayFieldId('mantra')} aria-describedby={mantraCountId} {...register(`days.${activeDay}.mantra` as const)} placeholder="Une phrase ancrante" maxLength={80} />
                                            <p id={mantraCountId} className="mt-1 text-[10px] text-muted-foreground/75">{((watch(`days.${activeDay}.mantra` as const) as string) || '').length}/80</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor={dayFieldId('description')}>Description (courte)</Label>
                                            <TextareaSoft id={dayFieldId('description')} {...register(`days.${activeDay}.description` as const)} placeholder="2–3 phrases sous la vidéo" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-card p-4">
                                    <div className="rounded-2xl">
                                        <div className="relative h-full w-full overflow-hidden rounded-2xl">
                                            <ProgramVideoThumb url={activeVideoUrl} />
                                        </div>
                                        <div className="mt-2 space-y-1 p-2">
                                            <div className="truncate text-sm font-medium text-foreground">{activeTitle}</div>
                                            <div className="line-clamp-2 text-xs text-muted-foreground">{activeDescription}</div>
                                            <div className="mt-1 text-[11px] text-muted-foreground">Source: {providerFromUrl(activeVideoUrl) || 'Lien'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </Card>
    );
}
