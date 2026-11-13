'use server';

import { revalidatePath } from 'next/cache';

import {
    archiveAdminLearner,
    getAdminLearnerLegacyUserDetail,
    hardDeleteAdminLearnerLegacy,
    restoreAdminLearner,
    setAdminLearnerLimits,
    setAdminLearnerRoleLegacy,
    suspendAdminLearner,
    unsuspendAdminLearner,
} from '@/server/administration/apprenants.service';

export async function setRole(formData: FormData) {
    await setAdminLearnerRoleLegacy(formData);
    revalidatePath('/administration/apprenants');
}

export async function getUserDetail(formData: FormData) {
    return getAdminLearnerLegacyUserDetail(formData);
}

export async function archiveUser(formData: FormData) {
    await archiveAdminLearner(formData);
    revalidatePath('/administration/apprenants');
}

export async function restoreUser(formData: FormData) {
    await restoreAdminLearner(formData);
    revalidatePath('/administration/apprenants');
}

export async function suspendUser(formData: FormData) {
    await suspendAdminLearner(formData);
    revalidatePath('/administration/apprenants');
}

export async function unsuspendUser(formData: FormData) {
    await unsuspendAdminLearner(formData);
    revalidatePath('/administration/apprenants');
}

export async function hardDeleteUser(formData: FormData) {
    await hardDeleteAdminLearnerLegacy(formData);
    revalidatePath('/administration/apprenants');
}

export async function setUserLimits(formData: FormData) {
    await setAdminLearnerLimits(formData);
    revalidatePath('/administration/apprenants');
}
