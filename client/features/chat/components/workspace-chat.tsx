"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircleIcon,
    BookOpenTextIcon,
    DownloadIcon,
    EllipsisIcon,
    LightbulbIcon,
    ListChecksIcon,
    PlusIcon,
    SparklesIcon,
    Trash2Icon,
} from "lucide-react";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChaibookLogo } from "@/shared/components/chaibook-logo";
import {
    buildCitationMap,
    chatKeys,
    useConversationMessages,
    useConversations,
    useDeleteConversation,
} from "../hooks/use-conversations";
import { ChatMessageBody } from "./chat-message-body";
import { CitationSources } from "./citation-sources";
import { ChatComposer } from "./chat-composer";
import { ConversationHistory } from "./conversation-history";
import { MessageActions, ThinkingIndicator } from "./message-actions";
import type { ChatCitation } from "../lib/types";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import {
    useChatPreferences,
    useWorkspaceChatPrefs,
} from "../stores/chat-preferences";
import {
    downloadMarkdown,
    exportConversationMarkdown,
} from "../lib/export-chat";

type WorkspaceChatProps = {
    workspaceId: string;
    workspaceTitle?: string;
    defaultModel?: string;
};

const SUGGESTIONS = [
    {
        icon: BookOpenTextIcon,
        label: "Summarize the key ideas",
        prompt: "Summarize the key ideas across my sources in a few short sections.",
        tint: "bg-primary text-primary-foreground",
    },
    {
        icon: LightbulbIcon,
        label: "Explain the hardest concept",
        prompt: "What's the hardest concept in these sources? Explain it simply, with an example.",
        tint: "bg-secondary text-secondary-foreground",
    },
    {
        icon: ListChecksIcon,
        label: "Quiz me",
        prompt: "Ask me 5 questions to test my understanding of these sources, one at a time.",
        tint: "bg-accent text-accent-foreground",
    },
    {
        icon: SparklesIcon,
        label: "List the important terms",
        prompt: "List the most important terms and definitions from my sources.",
        tint: "bg-chart-4 text-primary-foreground",
    },
] as const;

function getMessageText(message: UIMessage) {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
}

export function WorkspaceChat({
    workspaceId,
    workspaceTitle,
    defaultModel,
}: WorkspaceChatProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const askPrompt = searchParams.get("ask");
    const handledAskPrompt = useRef<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const chatPrefs = useWorkspaceChatPrefs(workspaceId, defaultModel);
    const setWebSearch = useChatPreferences((state) => state.setWebSearch);
    const setModel = useChatPreferences((state) => state.setModel);

    const { data: conversations = [] } = useConversations(workspaceId);
    const { data: storedMessages, isLoading: messagesLoading } =
        useConversationMessages(workspaceId, conversationId);
    const deleteConversation = useDeleteConversation(workspaceId);

    // Citations are stored server-side with each assistant message.
    const citationsByMessageId = useMemo<Record<string, ChatCitation[]>>(
        () => (storedMessages ? buildCitationMap(storedMessages) : {}),
        [storedMessages],
    );

    const activeConversation = conversations.find(
        (conversation) => conversation.id === conversationId,
    );

    const handleConversationId = useCallback(
        (id: string) => {
            setConversationId(id);
            void queryClient.invalidateQueries({
                queryKey: chatKeys(workspaceId).conversations(),
            });
        },
        [queryClient, workspaceId],
    );

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `/api/workspaces/${workspaceId}/chat`,
                credentials: "include",
                body: {
                    ...(conversationId ? { conversationId } : {}),
                    model: chatPrefs.model,
                    webSearch: chatPrefs.webSearch,
                },
                fetch: async (url, init) => {
                    const response = await fetch(url, {
                        ...init,
                        credentials: "include",
                    });

                    const newConversationId =
                        response.headers.get("X-Conversation-Id");
                    if (newConversationId && newConversationId !== conversationId) {
                        handleConversationId(newConversationId);
                    }

                    return response;
                },
            }),
        [
            workspaceId,
            conversationId,
            handleConversationId,
            chatPrefs.model,
            chatPrefs.webSearch,
        ],
    );

    const {
        messages,
        sendMessage,
        setMessages,
        status,
        error,
        stop,
        regenerate,
        clearError,
    } = useChat({ transport });

    const isStreaming = status === "streaming" || status === "submitted";
    const lastMessage = messages.at(-1);
    const showThinking = status === "submitted" && lastMessage?.role === "user";

    // Hydrate the thread from the server once it's not mid-stream.
    useEffect(() => {
        if (!conversationId) {
            return;
        }

        if (!storedMessages || isStreaming) {
            return;
        }

        setMessages(
            storedMessages.map((message) => ({
                id: message.id,
                role: message.role === "USER" ? "user" : "assistant",
                parts: [{ type: "text" as const, text: message.content }],
            })),
        );
    }, [conversationId, storedMessages, setMessages, isStreaming]);

    // After a reply finishes, refetch so citations (stored server-side) appear.
    useEffect(() => {
        if (status !== "ready" || !conversationId) {
            return;
        }

        void queryClient.invalidateQueries({
            queryKey: chatKeys(workspaceId).messages(conversationId),
        });
    }, [status, conversationId, queryClient, workspaceId]);

    useEffect(() => {
        if (
            !askPrompt ||
            status !== "ready" ||
            conversationId ||
            messages.length > 0 ||
            handledAskPrompt.current === askPrompt
        ) {
            return;
        }

        handledAskPrompt.current = askPrompt;
        void sendMessage({ text: askPrompt });
        router.replace(workspaceRoutes.detail(workspaceId));
    }, [
        askPrompt,
        status,
        conversationId,
        messages.length,
        sendMessage,
        router,
        workspaceId,
    ]);

    function handleNewChat() {
        if (isStreaming) {
            void stop();
        }
        setConversationId(null);
        setMessages([]);
        clearError();
    }

    function handleSelectConversation(id: string) {
        if (id === conversationId) {
            return;
        }
        if (isStreaming) {
            void stop();
        }
        // Clear immediately so the old thread doesn't linger while loading.
        setMessages([]);
        clearError();
        setConversationId(id);
    }

    async function handleDeleteConversation(id: string) {
        await deleteConversation.mutateAsync(id);
        if (id === conversationId) {
            handleNewChat();
        }
    }

    function handleExportChat() {
        if (messages.length === 0) {
            return;
        }

        const markdown = exportConversationMarkdown({
            conversation: activeConversation ?? null,
            messages,
            citationsByMessageId,
        });
        const slug =
            activeConversation?.title?.replace(/[^\w-]+/g, "-").toLowerCase() ??
            "chat";
        downloadMarkdown(markdown, `${slug}-${Date.now()}.md`);
    }

    function handleSend(text: string) {
        clearError();
        void sendMessage({ text });
    }

    const isLoadingThread =
        Boolean(conversationId) && messagesLoading && messages.length === 0;
    const isEmpty = !isLoadingThread && messages.length === 0;

    const composer = (
        <ChatComposer
            autoFocus
            isStreaming={isStreaming}
            onSubmit={handleSend}
            onStop={() => void stop()}
            webSearchEnabled={chatPrefs.webSearch}
            onWebSearchChange={(enabled) => setWebSearch(workspaceId, enabled)}
            model={chatPrefs.model}
            onModelChange={(model) => setModel(workspaceId, model)}
            placeholder={
                isEmpty
                    ? "Ask anything about your sources…"
                    : "Ask a follow-up…"
            }
        />
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Thread toolbar */}
            <div className="flex h-12 shrink-0 items-center gap-1 border-b px-3 sm:px-4">
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {activeConversation?.title ??
                        (conversationId ? "Untitled chat" : "New chat")}
                </p>

                <ConversationHistory
                    conversations={conversations}
                    activeId={conversationId}
                    onSelect={handleSelectConversation}
                    onDelete={(id) => void handleDeleteConversation(id)}
                    deletingId={
                        deleteConversation.isPending
                            ? deleteConversation.variables
                            : null
                    }
                />

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleNewChat}
                    disabled={messages.length === 0 && !conversationId}
                >
                    <PlusIcon strokeWidth={1.75} />
                    <span className="hidden sm:inline">New chat</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground"
                                aria-label="More chat actions"
                            />
                        }
                    >
                        <EllipsisIcon strokeWidth={1.75} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            disabled={messages.length === 0}
                            onClick={handleExportChat}
                        >
                            <DownloadIcon strokeWidth={1.75} />
                            Export as Markdown
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            disabled={!conversationId || deleteConversation.isPending}
                            onClick={() =>
                                conversationId &&
                                void handleDeleteConversation(conversationId)
                            }
                        >
                            <Trash2Icon strokeWidth={1.75} />
                            Delete chat
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isEmpty ? (
                /* Empty state: composer front and centre with starter prompts */
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
                    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
                        <div className="landing-enter flex flex-col items-center gap-3 text-center">
                            <ChaibookLogo size="lg" className="mb-1" />
                            <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                {workspaceTitle
                                    ? `What would you like to learn from ${workspaceTitle}?`
                                    : "What would you like to learn?"}
                            </h2>
                            <p className="max-w-md text-sm text-pretty text-muted-foreground">
                                Answers come from your sources, with numbered
                                citations you can hover to check.
                            </p>
                        </div>

                        <div className="landing-enter w-full [animation-delay:100ms]">
                            {composer}
                        </div>

                        <div className="landing-enter grid w-full gap-2 sm:grid-cols-2 [animation-delay:200ms]">
                            {SUGGESTIONS.map(({ icon: Icon, label, prompt, tint }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleSend(prompt)}
                                    className="group/suggestion flex items-center gap-3 rounded-2xl border bg-card p-3 text-left text-sm font-medium shadow-xs transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                                >
                                    <span
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                            tint,
                                        )}
                                    >
                                        <Icon className="size-4" strokeWidth={1.75} />
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <MessageScrollerProvider>
                        <MessageScroller className="min-h-0 flex-1">
                            <MessageScrollerViewport>
                                <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-8 px-4 py-8">
                                    {isLoadingThread ? (
                                        <div className="space-y-6" aria-busy="true">
                                            <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-11/12 rounded-md" />
                                                <Skeleton className="h-4 w-10/12 rounded-md" />
                                                <Skeleton className="h-4 w-7/12 rounded-md" />
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((message, messageIndex) => {
                                            const isUser = message.role === "user";
                                            const text = getMessageText(message);
                                            const citations =
                                                citationsByMessageId[message.id];
                                            const isLast =
                                                messageIndex === messages.length - 1;
                                            const isAnimating =
                                                !isUser && isStreaming && isLast;

                                            return (
                                                <MessageScrollerItem
                                                    key={message.id}
                                                    scrollAnchor={isUser}
                                                >
                                                    {isUser ? (
                                                        <div className="flex justify-end">
                                                            <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
                                                                {text}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="group/answer flex gap-3">
                                                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                                                <SparklesIcon className="size-3.5" strokeWidth={2} />
                                                            </span>
                                                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                                                <ChatMessageBody
                                                                    text={text}
                                                                    citations={citations}
                                                                    workspaceId={workspaceId}
                                                                    isAnimating={isAnimating}
                                                                />
                                                                {citations?.length ? (
                                                                    <CitationSources
                                                                        workspaceId={workspaceId}
                                                                        citations={citations}
                                                                    />
                                                                ) : null}
                                                                {!isAnimating && text ? (
                                                                    <MessageActions
                                                                        text={text}
                                                                        onRegenerate={
                                                                            isLast && !isStreaming
                                                                                ? () => void regenerate()
                                                                                : undefined
                                                                        }
                                                                        className="-ml-1.5"
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    )}
                                                </MessageScrollerItem>
                                            );
                                        })
                                    )}

                                    {showThinking ? (
                                        <MessageScrollerItem>
                                            <div className="flex gap-3">
                                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                                    <SparklesIcon className="size-3.5" strokeWidth={2} />
                                                </span>
                                                <ThinkingIndicator />
                                            </div>
                                        </MessageScrollerItem>
                                    ) : null}

                                    {error ? (
                                        <MessageScrollerItem>
                                            <div
                                                role="alert"
                                                className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-sm"
                                            >
                                                <AlertCircleIcon
                                                    className="mt-0.5 size-4 shrink-0 text-destructive"
                                                    strokeWidth={2}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-destructive">
                                                        That answer didn&apos;t come through
                                                    </p>
                                                    <p className="mt-0.5 text-muted-foreground">
                                                        {error.message || "Something went wrong. Try again."}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        clearError();
                                                        void regenerate();
                                                    }}
                                                >
                                                    Try again
                                                </Button>
                                            </div>
                                        </MessageScrollerItem>
                                    ) : null}
                                </MessageScrollerContent>
                            </MessageScrollerViewport>
                            <MessageScrollerButton direction="end" />
                        </MessageScroller>
                    </MessageScrollerProvider>

                    <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pt-2 pb-4">
                        <div className="mx-auto w-full max-w-3xl">{composer}</div>
                    </div>
                </>
            )}
        </div>
    );
}
