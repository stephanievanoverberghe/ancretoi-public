import type { Metadata } from 'next';
import { ContactPage } from '@/features/public/contact';

export const metadata: Metadata = {
    title: 'Contact',
    description: "Contacter Ancre-toi pour une question, un souci d'acces ou une demande simple.",
    alternates: { canonical: '/contact' },
};

export default function ContactRoutePage() {
    return <ContactPage />;
}