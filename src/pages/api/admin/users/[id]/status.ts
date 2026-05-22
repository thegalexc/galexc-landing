import type { APIRoute } from 'astro';
import { insertAuditEvent, updateUserStatus } from '../../../../../lib/db';
import type { PortalUserStatus } from '../../../../../types/portal';
import { requireAdminUser } from '../../../../../lib/request-auth';

function toStatus(value: FormDataEntryValue | null): PortalUserStatus | null {
    return value === 'active' || value === 'suspended' ? value : null;
}

export const POST: APIRoute = async (context) => {
    const admin = await requireAdminUser(context);
    if (admin instanceof Response) {
        return admin;
    }

    const userId = context.params.id;
    if (!userId) {
        return context.redirect('/admin/users?error=Missing%20user%20id');
    }

    const formData = await context.request.formData();
    const status = toStatus(formData.get('status'));
    if (!status) {
        return context.redirect(`/admin/users/${userId}?error=Invalid%20status`);
    }

    try {
        await updateUserStatus(userId, status, admin.id);
        await insertAuditEvent(
            status === 'suspended' ? 'user.suspended' : 'user.unsuspended',
            admin.id,
            userId,
            { status },
        );
        return context.redirect(
            `/admin/users/${userId}?notice=${status === 'suspended' ? 'user_suspended' : 'user_unsuspended'}`,
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update user status.';
        return context.redirect(`/admin/users/${userId}?error=${encodeURIComponent(message)}`);
    }
};
