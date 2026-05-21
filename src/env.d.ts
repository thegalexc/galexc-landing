/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    adminUser: import('./types/admin').AdminUser | null;
  }
}
