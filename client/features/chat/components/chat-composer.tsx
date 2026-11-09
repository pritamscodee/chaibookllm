"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpIcon, GlobeIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    CHAT_MODEL_LABELS,
    CHAT_MODELS,
    type ChatModelId,
} from "../stores/chat-preferences";

type ChatComposerProps = {
    onSubmit: (text: string) => void;
    onStop?: () => void;
    disabled?: boolean;
    isStreaming?: boolean;
    webSearchEnabled: boolean;
    onWebSearchChange: (enabled: boolean) => void;
    model: ChatModelId;
    onModelChange: (model: ChatModelId) => void;
    autoFocus?: boolean;
    placeholder?: string;
    className?: string;
};

export function ChatComposer({
    onSubmit,
    onStop,
    disabled = false,
    isStreaming = false,
    webSearchEnabled,
    onWebSearchChange,
    model,
    onModelChange,
    autoFocus = false,
    placeholder = "Ask anything about your sources…",
    className,
}: ChatComposerProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const canSend = input.trim().length > 0 && !disabled && !isStreaming;

    useEffect(() => {
        if (autoFocus) {
            textareaRef.current?.focus();
        }
    }, [autoFocus]);

    function submit() {
        const text = input.trim();
        if (!canSend) {
            return;
        }

        onSubmit(text);
        setInput("");
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            className={cn(
                // Outer radius 24px = inner control radius (16px) + padding (8px).
                "group/composer flex flex-col rounded-3xl border bg-card p-2 shadow-md transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
                className,
            )}
        >
            <label htmlFor="chat-composer-input" className="sr-only">
                Message
            </label>
            {/* Typing stays enabled while a reply streams; only sending waits. */}
            <textarea
                id="chat-composer-input"
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
                rows={1}
                disabled={disabled}
                className="field-sizing-content max-h-48 min-h-11 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
                onKeyDown={(event) => {
                    if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                    ) {
                        event.preventDefault();
                        submit();
                    }
                }}
            />

            <div className="flex items-center gap-1.5 pt-1">
                <Button
                    type="button"
                    size="sm"
                    variant={webSearchEnabled ? "secondary" : "ghost"}
                    aria-pressed={webSearchEnabled}
                    className="rounded-full transition-[background-color,scale] duration-150 ease-out active:scale-[0.96]"
                    onClick={() => onWebSearchChange(!webSearchEnabled)}
                >
                    <GlobeIcon strokeWidth={1.75} />
                    Web
                </Button>

                <Select
                    value={model}
                    onValueChange={(value) => onModelChange(value as ChatModelId)}
                >
                    <SelectTrigger
                        size="sm"
                        aria-label="Model"
                        className="w-auto gap-1 rounded-full border-transparent bg-transparent px-3 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CHAT_MODELS.map((id) => (
                            <SelectItem key={id} value={id}>
                                {CHAT_MODEL_LABELS[id]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                    <kbd className="font-sans">Enter</kbd> to send ·{" "}
                    <kbd className="font-sans">Shift + Enter</kbd> for a new line
                </span>

                {isStreaming ? (
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="ml-auto rounded-full transition-[background-color,scale] duration-150 ease-out active:scale-[0.96] sm:ml-2"
                        onClick={onStop}
                        aria-label="Stop generating"
                    >
                        <SquareIcon className="size-3.5 fill-current" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        size="icon"
                        className="ml-auto rounded-full transition-[background-color,scale,opacity] duration-150 ease-out enabled:active:scale-[0.96] sm:ml-2"
                        disabled={!canSend}
                        aria-label="Send message"
                    >
                        <ArrowUpIcon strokeWidth={2.25} />
                    </Button>
                )}
            </div>
        </form>
    );
}
