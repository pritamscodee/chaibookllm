import { cn } from "@/lib/utils";

type ChaibookLogoProps = {
    size?: "sm" | "lg";
    className?: string;
};

export function ChaibookLogo({ size = "sm", className }: ChaibookLogoProps) {
    const isLarge = size === "lg";

    return (
        <span
            className={cn(
                "flex items-center font-heading font-semibold tracking-tight",
                isLarge ? "gap-2.5 text-xl" : "gap-2 text-lg",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "flex items-center justify-center bg-primary text-primary-foreground shadow-sm",
                    isLarge ? "size-10 rounded-xl text-lg" : "size-8 rounded-md",
                )}
            >
                C
            </span>
            Chaibook
        </span>
    );
}
