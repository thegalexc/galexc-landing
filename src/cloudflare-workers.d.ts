declare module 'cloudflare:workers' {
  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = Record<string, unknown>>(): Promise<T | null>;
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    run(): Promise<{ success?: boolean; meta?: { changes?: number } }>;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  }

  interface Env {
    DB?: D1Database;
    RATE_LIMIT?: KVNamespace;
    GALEXC_ADMIN_EMAILS?: string;
    TURNSTILE_SECRET?: string;
    TURNSTILE_SITE_KEY?: string;
    IP_HMAC_SECRET?: string;
    CF_ACCESS_TEAM_DOMAIN?: string;
  }

  export const env: Env;
}
