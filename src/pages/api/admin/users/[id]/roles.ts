import type { APIRoute } from 'astro';
import {
    grantRole,
    insertAuditEvent,
    revokeRole,
} from '../../../../../lib/db';
import { requireAdminUser } from '../../../../../lib/request-auth';

function toAction(value: FormDataEntryValue | null): 'grant' | 'revoke' | null {
    return value === 'grant' || value === 'revoke' ? value : null;
}

function toRole(value: FormDataEntryValue | null): 'admin' | null {
    return value === 'admin' ? value : null;
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
    const action = toAction(formData.get('action'));
    const role = toRole(formData.get('role'));

    if (!action || !role) {
        return context.redirect(`/admin/users/${userId}?error=Invalid%20role%20action`);
    }

    try {
        const changed =
            action === 'grant'
                ? await grantRole(userId, role, admin.id)
                : await revokeRole(userId, role, admin.id);

        if (changed) {
            await insertAuditEvent(
                action === 'grant' ? 'role.granted' : 'role.revoked',
                admin.id,
                userId,
                { role },
            );
        }

        return context.redirect(
            `/admin/users/${userId}?notice=${action === 'grant' ? 'role_granted' : 'role_revoked'}`,
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update role.';
        return context.redirect(`/admin/users/${userId}?error=${encodeURIComponent(message)}`);
    }
};
