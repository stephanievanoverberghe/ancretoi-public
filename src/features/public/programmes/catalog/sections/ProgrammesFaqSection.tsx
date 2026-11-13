import { FaqBlock } from '@/components/marketing';
import { programmesContent } from '@/content/programmes';

export function ProgrammesFaqSection() {
    return <FaqBlock eyebrow={programmesContent.faq.eyebrow} title={programmesContent.faq.title} items={programmesContent.faq.items} className="bg-background" />;
}
