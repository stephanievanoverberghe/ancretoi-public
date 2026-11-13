import { FaqBlock } from '@/components/marketing';
import { methodeContent } from '@/content/methode';

export function MethodeFaqSection() {
    return <FaqBlock id="faq" eyebrow={methodeContent.faq.eyebrow} title={methodeContent.faq.title} items={methodeContent.faq.items} />;
}
