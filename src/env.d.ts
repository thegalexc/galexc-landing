/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        authenticatedUser: import('./types/portal').PortalUser | null;
        adminUser: import('./types/portal').PortalUser | null;
    }
}
