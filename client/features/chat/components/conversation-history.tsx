"use client";

import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { CheckIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Conversation } from "../lib/types";

type ConversationHistoryProps = {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    deletingId?: string | null;
};

export function ConversationHistory({
    conversations,
    activeId,
    onSelect,
    onDelete,
    deletingId,
}: ConversationHistoryProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button variant="ghost" size="sm" className="text-muted-foreground" />
                }
            >
                <HistoryIcon strokeWidth={1.75} />
                <span className="hidden sm:inline">History</span>
                {conversations.length > 0 ? (
                    <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums">
                        {conversations.length}
                    </span>
                ) : null}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 gap-0 p-1.5">
                {conversations.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No past chats yet. Your conversations will show up here.
                    </p>
                ) : (
                    <ul className="max-h-80 overflow-y-auto overscroll-contain">
                        {conversations.map((conversation) => {
                            const isActive = conversation.id === activeId;

                            return (
                                <li key={conversation.id} className="group/row relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelect(conversation.id);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-lg py-2 pr-10 pl-2.5 text-left text-sm transition-colors duration-100 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                            isActive && "bg-muted",
                                        )}
                                    >
                                        <span className="flex size-4 shrink-0 items-center justify-center">
                                            {isActive ? (
                                                <CheckIcon className="size-3.5" strokeWidth={2} />
                                            ) : null}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-medium">
                                                {conversation.title ?? "Untitled chat"}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {formatDistanceToNowStrict(
                                                    new Date(conversation.updatedAt),
                                                    { addSuffix: true },
                                                )}
                                            </span>
                                        </span>
                                    </button>
                                    {/* Revealed instantly on row hover/focus; always visible on touch. */}
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`Delete “${conversation.title ?? "Untitled chat"}”`}
                                        disabled={deletingId === conversation.id}
                                        onClick={() => onDelete(conversation.id)}
                                        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-destructive [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 [@media(hover:hover)]:group-focus-within/row:opacity-100"
                                    >
                                        <Trash2Icon strokeWidth={1.75} />
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </PopoverContent>
        </Popover>
    );
}
