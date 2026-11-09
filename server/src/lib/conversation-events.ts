import { tasks } from "@trigger.dev/sdk";

import type { summarizeConversation } from "../trigger/summarize-conversation.js";

export async function enqueueConversationSummarize(input: {
    conversationId: string;
    userId: string;
}) {
    await tasks.trigger<typeof summarizeConversation>("summarize-conversation", input);
}
