import { Router } from "express";
import {
    chat,
    createConversation,
    deleteConversation,
    listConversationMessages,
    listConversations,
} from "../controllers/chat.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

// Mounted under /api/workspaces/:workspaceId (auth applied by workspaceRoutes)
export const chatRoutes = Router({ mergeParams: true });

chatRoutes.post("/chat", asyncHandler(chat));
chatRoutes.get("/conversations", asyncHandler(listConversations));
chatRoutes.post("/conversations", asyncHandler(createConversation));
chatRoutes.get(
    "/conversations/:conversationId/messages",
    asyncHandler(listConversationMessages),
);
chatRoutes.delete(
    "/conversations/:conversationId",
    asyncHandler(deleteConversation),
);
