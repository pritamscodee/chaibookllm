import { cache } from "react";
import { headers } from "next/headers";
import { authClient } from "./auth-client";
import { API_URL as apiUrl } from "@/shared/lib/server-env";

export type Session = typeof authClient.$Infer.Session;

// Calls the auth server directly instead of looping back through this Next
// app's own /api rewrite (an extra hop), and is deduped per request.
export const getSession = cache(async (): Promise<Session | null> => {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${apiUrl}/api/auth/get-session`, {
        headers: { cookie },
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const data = (await response.json()) as Session | null;
    return data?.user ? data : null;
});
