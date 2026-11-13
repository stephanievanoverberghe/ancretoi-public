import { expect, test } from '@playwright/test';

import { learnerNavigationIcons } from '../../src/components/layout/app/learner-navigation.icons';
import { isLearnerNavigationActive } from '../../src/components/layout/app/learner-navigation.utils';
import {
    learnerMobilePrimaryHrefs,
    learnerMoreHrefs,
    learnerNavigationItems,
} from '../../src/config/navigation';

test.describe('Invariants de navigation apprenant', () => {
    test('chaque destination possède une icône et les groupes mobiles restent cohérents', ({}, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-390',
            'Cet invariant statique est exécuté une seule fois.',
        );
        const registeredIcons = new Set(Object.keys(learnerNavigationIcons));
        const navigationHrefs = new Set(learnerNavigationItems.map((item) => item.href));
        const mobileHrefs = [...learnerMobilePrimaryHrefs, ...learnerMoreHrefs];
        const mobileHrefSet = new Set<string>(mobileHrefs);

        for (const item of learnerNavigationItems) {
            expect(registeredIcons.has(item.icon), `Icône absente pour ${item.href}`).toBe(true);
        }

        for (const href of mobileHrefs) {
            expect(navigationHrefs.has(href), `Destination mobile absente : ${href}`).toBe(true);
        }

        for (const href of navigationHrefs) {
            expect(mobileHrefSet.has(href), `Destination non classée sur mobile : ${href}`).toBe(true);
        }

        expect(new Set(mobileHrefs).size, 'Une destination mobile ne doit apparaître qu’une fois').toBe(
            mobileHrefs.length,
        );

        const journal = learnerNavigationItems.find((item) => item.href === '/espace/journal');
        expect(journal, 'La navigation doit contenir le journal').toBeDefined();
        expect(isLearnerNavigationActive('/espace/notes', journal!)).toBe(true);
    });
});
