"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;
export type ChatModelId = (typeof CHAT_MODELS)[number];

export const CHAT_MODEL_LABELS: Record<ChatModelId, string> = {
    "gpt-4o-mini": "GPT-4o mini",
    "gpt-4o": "GPT-4o",
};

type WorkspaceChatPrefs = {
    model: ChatModelId;
    webSearch: boolean;
};

type ChatPreferencesState = {
    byWorkspace: Record<string, Partial<WorkspaceChatPrefs>>;
    setModel: (workspaceId: string, model: ChatModelId) => void;
    setWebSearch: (workspaceId: string, enabled: boolean) => void;
};

function resolveModel(model?: string): ChatModelId {
    if (model && CHAT_MODELS.includes(model as ChatModelId)) {
        return model as ChatModelId;
    }

    return "gpt-4o-mini";
}

export const useChatPreferences = create<ChatPreferencesState>()(
    persist(
        (set) => ({
            byWorkspace: {},
            setModel: (workspaceId, model) =>
                set((state) => ({
                    byWorkspace: {
                        ...state.byWorkspace,
                        [workspaceId]: {
                            ...state.byWorkspace[workspaceId],
                            model,
                        },
                    },
                })),
            setWebSearch: (workspaceId, webSearch) =>
                set((state) => ({
                    byWorkspace: {
                        ...state.byWorkspace,
                        [workspaceId]: {
                            ...state.byWorkspace[workspaceId],
                            webSearch,
                        },
                    },
                })),
        }),
        {
            name: "chaibook-chat-preferences",
            // Rehydrate after mount so server and first client render match
            // (otherwise React throws away the server HTML on mismatch).
            skipHydration: true,
        },
    ),
);

/**
 * Subscribes to this workspace's preferences, so components re-render when
 * the model or web-search toggle changes.
 */
export function useWorkspaceChatPrefs(
    workspaceId: string,
    defaultModel?: string,
): WorkspaceChatPrefs {
    const stored = useChatPreferences((state) => state.byWorkspace[workspaceId]);

    useEffect(() => {
        if (!useChatPreferences.persist.hasHydrated()) {
            void useChatPreferences.persist.rehydrate();
        }
    }, []);

    return {
        model: resolveModel(stored?.model ?? defaultModel),
        webSearch: stored?.webSearch ?? false,
    };
}
