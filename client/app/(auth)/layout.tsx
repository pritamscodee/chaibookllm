import { ModeToggle } from "@/components/ui/mode-toggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex items-center gap-2 self-center font-heading text-lg font-semibold tracking-tight">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        C
                    </span>
                    Chaibook
                </div>
                {children}
            </div>
        </div>
    );
}
