import { cache } from "react";
import { headers } from "next/headers";
import type { Workspace } from "./types";
import { API_URL as apiUrl } from "@/shared/lib/server-env";

// cache() dedupes the call between the workspace layout and its page within a
// single request, so the API is hit once instead of once per segment.
export const getWorkspaceOrNull = cache(
    async (id: string): Promise<Workspace | null> => {
        const requestHeaders = await headers();
        const cookie = requestHeaders.get("cookie") ?? "";

        const response = await fetch(`${apiUrl}/api/workspaces/${id}`, {
            headers: { cookie },
            cache: "no-store",
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch workspace");
        }

        return response.json() as Promise<Workspace>;
    },
);
