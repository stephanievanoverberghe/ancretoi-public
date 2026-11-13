import { getHomeLearnerResume } from '@/server/apprentissage/espace-pages.service';
import { getUserState } from '@/server/apprentissage/user-state';

import { HomeBenefits, HomeFaq, HomeFinalCta, HomeFounder, HomeHero, HomeHowItWorks, HomeLearningExperience, HomeProgramTeasers, HomeTrust } from './sections';

export async function HomePage() {
    const { isAuthed, hasActiveProgram } = await getUserState();
    const resume = hasActiveProgram ? await getHomeLearnerResume() : null;

    return (
        <>
            <HomeHero isAuthed={isAuthed} hasActiveProgram={hasActiveProgram} resume={resume} />
            <HomeBenefits />
            <HomeProgramTeasers />
            <HomeHowItWorks />
            <HomeLearningExperience />
            <HomeFounder />
            <HomeTrust />
            <HomeFaq />
            <HomeFinalCta hasActiveProgram={hasActiveProgram} />
        </>
    );
}
