import type { APIRoute } from 'astro';
import { insertAuditEvent, updateUserName } from '../../../../../lib/db';
import { requireAdminUser } from '../../../../../lib/request-auth';

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
    const name = String(formData.get('name') ?? '');

    await updateUserName(userId, name || null);
    await insertAuditEvent('user.name.updated', admin.id, userId, { name });

    return context.redirect(`/admin/users/${userId}?notice=name_saved`);
};
