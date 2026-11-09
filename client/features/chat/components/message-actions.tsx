"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Icon cross-fade per better-ui: scale 0.25→1, opacity 0→1, blur 4px→0,
// 300ms cubic-bezier(0.2, 0, 0, 1). Both icons stay in the DOM. Under reduced
// motion only the opacity changes.
const iconBase =
    "absolute inset-0 m-auto size-3.5 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity";
const iconShown = "scale-100 opacity-100 blur-none";
const iconHidden = "scale-25 opacity-0 blur-[4px] motion-reduce:scale-100 motion-reduce:blur-none";

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timeout.current) clearTimeout(timeout.current);
    }, []);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), 1600);
    }

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => void handleCopy()}
                        aria-label={copied ? "Copied" : "Copy answer"}
                        className="relative text-muted-foreground hover:text-foreground"
                    />
                }
            >
                <CopyIcon
                    strokeWidth={1.75}
                    className={cn(iconBase, copied ? iconHidden : iconShown)}
                />
                <CheckIcon
                    strokeWidth={2}
                    className={cn(iconBase, copied ? iconShown : iconHidden)}
                />
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
        </Tooltip>
    );
}

type MessageActionsProps = {
    text: string;
    onRegenerate?: () => void;
    className?: string;
};

export function MessageActions({
    text,
    onRegenerate,
    className,
}: MessageActionsProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            <CopyButton text={text} />
            {onRegenerate ? (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={onRegenerate}
                                aria-label="Regenerate answer"
                                className="text-muted-foreground hover:text-foreground"
                            />
                        }
                    >
                        <RotateCcwIcon strokeWidth={1.75} className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Regenerate</TooltipContent>
                </Tooltip>
            ) : null}
        </div>
    );
}

export function ThinkingIndicator() {
    return (
        <div className="flex h-6 items-center gap-1" role="status">
            <span className="sr-only">Thinking…</span>
            {[0, 150, 300].map((delay) => (
                <span
                    key={delay}
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </div>
    );
}
