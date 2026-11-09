// Server-only configuration. Never import this from a client component.

/** Base URL of the Express API (server/). Used for server-side fetches. */
export const API_URL = process.env.API_URL ?? "http://localhost:4040";
