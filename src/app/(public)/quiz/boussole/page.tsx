import type { Metadata } from 'next';
import { BoussoleQuizPage } from '@/features/public/quiz';

export const metadata: Metadata = {
    title: 'Quiz Boussole',
    description: 'Cinq questions rapides pour trouver le programme Ancre-toi qui correspond a ton besoin du moment.',
    alternates: { canonical: '/quiz/boussole' },
    openGraph: {
        title: 'Quiz Boussole - Ancre-toi',
        description: 'Cinq questions rapides pour trouver le programme Ancre-toi qui correspond a ton besoin du moment.',
        url: '/quiz/boussole',
    },
};

export default function QuizBoussoleRoutePage() {
    return <BoussoleQuizPage />;
}
