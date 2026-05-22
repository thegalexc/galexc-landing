export type PortalRoleKey = 'admin';
export type PortalUserStatus = 'active' | 'suspended';

export interface PortalUser {
    id: string;
    email: string;
    normalizedEmail: string;
    emailKey: string;
    name: string | null;
    status: PortalUserStatus;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    roles: PortalRoleKey[];
    submissionCount: number;
}
