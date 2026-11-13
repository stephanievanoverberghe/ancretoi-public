'use client';

import { NewsletterReviewDialog } from './NewsletterReviewDialog';
import { NewsletterTestForm } from './NewsletterTestForm';
import { useNewsletterComposer } from './useNewsletterComposer';

export default function ComposeSendForm() {
    const controller = useNewsletterComposer();

    return (
        <>
            <NewsletterTestForm controller={controller} />
            <NewsletterReviewDialog controller={controller} />
        </>
    );
}
