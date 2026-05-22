import type { PortalUser } from '../types/portal';

export function isAdminUser(user: PortalUser | null): boolean {
    return Boolean(user?.roles.includes('admin'));
}
