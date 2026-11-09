"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChaibookLogo } from "@/shared/components/chaibook-logo";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
            <ChaibookLogo />
            <div className="space-y-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Something spilled
                </h1>
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">
                    We hit an unexpected error loading this page. Try again, or
                    head back to your dashboard.
                </p>
                {error.digest ? (
                    <p className="font-mono text-xs text-muted-foreground">
                        Reference: {error.digest}
                    </p>
                ) : null}
            </div>
            <div className="flex gap-2">
                <Button onClick={reset}>Try again</Button>
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/dashboard" />}
                >
                    Go to dashboard
                </Button>
            </div>
        </main>
    );
}
