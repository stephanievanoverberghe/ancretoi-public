import { FaqBlock } from '@/components/marketing';
import { homeContent } from '@/content/home';

export function HomeFaq() {
    return <FaqBlock eyebrow={homeContent.faq.eyebrow} title={homeContent.faq.title} items={homeContent.faq.items} className="bg-background" />;
}
