'use client';

import { useMemo, useState } from 'react';
import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import ProgramCommandBar from '../../editor/ProgramCommandBar';
import ProgramFormFeedback from '../../editor/ProgramFormFeedback';
import ProgramMarketingSection from '../../editor/ProgramMarketingSection';
import ProgramPedagogySection from '../../editor/ProgramPedagogySection';
import NewProgramIdentitySection from './NewProgramIdentitySection';
import NewProgramSeoSection from './NewProgramSeoSection';
import { DEFAULT } from './new-program-form.constants';
import type { DayBlock, NewProgramFormShape, TabKey } from './new-program-form.types';
import { slugify } from '../../editor/program-editor.utils';

export default function NewProgramForm() {
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [tab, setTab] = useState<TabKey>('identite');

    const { register, control, handleSubmit, watch, formState, setValue } = useForm<NewProgramFormShape>({
        defaultValues: DEFAULT,
        mode: 'onChange',
    });

    const days = useFieldArray({ control, name: 'days' });
    const benefits = useFieldArray({ control, name: 'marketing.benefits' });
    const faq = useFieldArray({ control, name: 'marketing.faq' });

    const all = watch();
    const completion = useMemo(() => {
        const checks = [!!all.slug?.trim(), !!all.title?.trim(), !!all.marketing.hero.title?.trim(), all.days.length > 0];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }, [all]);
    const saveState = saving ? 'saving' : err ? 'error' : toast ? 'saved' : formState.isDirty ? 'dirty' : 'clean';

    const [activeDay, setActiveDay] = useState<number>(0);

    const onTitleBlur = () => {
        const title = (watch('title') || '').trim();
        if (!title) return;
        const currentSlug = (watch('slug') || '').trim();
        if (!currentSlug) setValue('slug', slugify(title));
        if (!(watch('marketing.hero.title') || '').trim()) setValue('marketing.hero.title', title);
    };

    const addDay = () => {
        const nextIndex = days.fields.length + 1;
        days.append({ title: `J${nextIndex}`, videoUrl: '', status: 'draft' });
        setActiveDay(nextIndex - 1);
    };

    const duplicateDay = (index: number) => {
        const dayNum = index + 1;
        days.insert(index + 1, {
            title: `J${dayNum + 1}`,
            videoUrl: watch(`days.${index}.videoUrl`) || '',
            mantra: watch(`days.${index}.mantra`) || '',
            description: watch(`days.${index}.description`) || '',
            status: (watch(`days.${index}.status`) as DayBlock['status']) || 'draft',
        });
        setActiveDay(index + 1);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        days.move(index, index - 1);
        setActiveDay(index - 1);
    };

    const moveDown = (index: number) => {
        if (index >= days.fields.length - 1) return;
        days.move(index, index + 1);
        setActiveDay(index + 1);
    };

    const removeDay = (index: number) => {
        days.remove(index);
        setActiveDay((prev) => Math.max(0, Math.min(prev, days.fields.length - 2)));
    };

    const onSubmit: SubmitHandler<NewProgramFormShape> = async (values) => {
        try {
            setSaving(true);
            setErr(null);
            setToast(null);

            const payload = { ...values, slug: slugify(values.slug) };
            const response = await fetch('/api/admin/programs/create', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type') ?? '';
            const data: unknown = contentType.includes('application/json') ? await response.json() : await response.text();

            if (!response.ok) {
                const message =
                    typeof data === 'string'
                        ? data
                        : typeof data === 'object' && data && 'error' in (data as Record<string, unknown>) && typeof (data as Record<string, unknown>).error === 'string'
                        ? (data as { error: string }).error
                        : `Erreur HTTP ${response.status}`;
                throw new Error(message);
            }

            setToast('Formation créée ✅');
            setTimeout(() => setToast(null), 1000);
            window.location.assign(`/administration/programmes?created=1&slug=${encodeURIComponent(payload.slug)}`);
        } catch (error: unknown) {
            setErr(error instanceof Error ? error.message : 'save_failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24 sm:pb-0">
            <ProgramCommandBar
                mode="create"
                idPrefix="new-program"
                title={watch('title') || ''}
                statusField={register('status')}
                saving={saving}
                completion={completion}
                saveState={saveState}
                tab={tab}
                onTabChange={setTab}
            />

            {tab === 'identite' && <NewProgramIdentitySection register={register} onTitleBlur={onTitleBlur} />}

            {tab === 'marketing' && <ProgramMarketingSection idPrefix="new-program" register={register} benefits={benefits} faq={faq} />}

            {tab === 'pedago' && (
                <ProgramPedagogySection
                    mode="create"
                    idPrefix="new-program"
                    register={register}
                    watch={watch}
                    days={days}
                    activeDay={activeDay}
                    onActiveDayChange={setActiveDay}
                    onAddDay={addDay}
                    onDuplicateDay={duplicateDay}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onRemoveDay={removeDay}
                />
            )}

            {tab === 'seo' && <NewProgramSeoSection register={register} />}

            <ProgramFormFeedback error={err} toast={toast} />
        </form>
    );
}
