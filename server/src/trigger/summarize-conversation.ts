import { task } from "@trigger.dev/sdk";

import { summarizeConversationById } from "../services/conversation-memory.services.js";

export const summarizeConversation = task({
    id: "summarize-conversation",
    retry: { maxAttempts: 2 },
    run: async (payload: { conversationId: string; userId: string }) => {
        const { conversationId, userId } = payload;

        await summarizeConversationById(conversationId, userId);

        return { conversationId, status: "SUMMARIZED" };
    },
});
