"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ARTIFACT_TYPE_DESCRIPTIONS,
    ARTIFACT_TYPE_LABELS,
    ARTIFACT_TYPES,
} from "../lib/constants";
import { useCreateArtifact } from "../hooks/use-artifacts";
import { useSources } from "@/features/sources/hooks/use-sources";
import { sourceRoutes } from "@/features/sources/lib/routes";
import type { ArtifactType } from "../lib/types";

type GenerateArtifactDialogProps = {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function GenerateArtifactDialog({
    workspaceId,
    open,
    onOpenChange,
}: GenerateArtifactDialogProps) {
    const [type, setType] = useState<ArtifactType>("SUMMARY");
    const [title, setTitle] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const createArtifact = useCreateArtifact(workspaceId);
    const { data: readySources, isLoading: sourcesLoading } = useSources(
        workspaceId,
        { status: "READY" },
    );
    const hasReadySources = (readySources?.length ?? 0) > 0;

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setSubmitError(null);
        }
        onOpenChange(nextOpen);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSubmitError(null);

        try {
            await createArtifact.mutateAsync({
                type,
                title: title.trim() || undefined,
            });
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Could not start generation. Please try again.",
            );
            return;
        }

        setTitle("");
        handleOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <form onSubmit={(event) => void handleSubmit(event)}>
                    <DialogHeader>
                        <DialogTitle>Generate learning tool</DialogTitle>
                        <DialogDescription>
                            Uses all ready sources in this workspace. Generation
                            runs in the background.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {!sourcesLoading && !hasReadySources ? (
                            <Alert>
                                <AlertCircleIcon />
                                <AlertTitle>No ready sources yet</AlertTitle>
                                <AlertDescription>
                                    <p>
                                        Add a source and wait for it to finish
                                        processing before generating.{" "}
                                        <Link
                                            href={sourceRoutes.list(workspaceId)}
                                            className="font-medium underline underline-offset-4"
                                        >
                                            Go to sources
                                        </Link>
                                    </p>
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {submitError ? (
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>Generation failed</AlertTitle>
                                <AlertDescription>
                                    <p>{submitError}</p>
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="artifact-type">Type</Label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {ARTIFACT_TYPES.map((artifactType) => (
                                    <button
                                        key={artifactType}
                                        type="button"
                                        onClick={() => setType(artifactType)}
                                        className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                                            type === artifactType
                                                ? "border-primary bg-primary/10"
                                                : "hover:bg-muted/50"
                                        }`}
                                    >
                                        <p className="text-sm font-medium">
                                            {
                                                ARTIFACT_TYPE_LABELS[
                                                    artifactType
                                                ]
                                            }
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {
                                                ARTIFACT_TYPE_DESCRIPTIONS[
                                                    artifactType
                                                ]
                                            }
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="artifact-title">
                                Title (optional)
                            </Label>
                            <Input
                                id="artifact-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="Custom title"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                createArtifact.isPending ||
                                sourcesLoading ||
                                !hasReadySources
                            }
                        >
                            Generate
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
