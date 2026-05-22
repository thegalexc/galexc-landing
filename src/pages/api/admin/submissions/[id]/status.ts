import type { APIRoute } from 'astro';
import {
    getWaitlistEntryById,
    insertAuditEvent,
    updateWaitlistEntryStatus,
    type WaitlistEntryStatus,
} from '../../../../../lib/db';
import { requireAdminUser } from '../../../../../lib/request-auth';

function toStatus(value: FormDataEntryValue | null): WaitlistEntryStatus | null {
    return value === 'pending' || value === 'approved' || value === 'rejected'
        ? value
        : null;
}

export const POST: APIRoute = async (context) => {
    const admin = await requireAdminUser(context);
    if (admin instanceof Response) {
        return admin;
    }

    const entryId = context.params.id;
    if (!entryId) {
        return context.redirect('/admin/submissions?error=Missing%20submission%20id');
    }

    const formData = await context.request.formData();
    const status = toStatus(formData.get('status'));
    if (!status) {
        return context.redirect('/admin/submissions?error=Invalid%20submission%20status');
    }

    const entry = await getWaitlistEntryById(entryId);
    if (!entry) {
        return context.redirect('/admin/submissions?error=Submission%20not%20found');
    }

    await updateWaitlistEntryStatus(entryId, status);
    await insertAuditEvent('submission.status.updated', admin.id, entry.userId, {
        submissionId: entryId,
        status,
    });

    return context.redirect(`/admin/submissions?notice=submission_${status}`);
};
