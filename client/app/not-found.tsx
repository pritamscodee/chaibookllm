import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChaibookLogo } from "@/shared/components/chaibook-logo";

export default function NotFound() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
            <ChaibookLogo />
            <div className="space-y-2">
                <p className="font-mono text-sm text-muted-foreground">404</p>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    This page isn&apos;t on the menu
                </h1>
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">
                    The workspace or page you&apos;re looking for doesn&apos;t
                    exist, or you don&apos;t have access to it.
                </p>
            </div>
            <div className="flex gap-2">
                <Button nativeButton={false} render={<Link href="/dashboard" />}>
                    Go to dashboard
                </Button>
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/" />}
                >
                    Home
                </Button>
            </div>
        </main>
    );
}
