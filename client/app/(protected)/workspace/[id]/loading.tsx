import { Skeleton } from "@/components/ui/skeleton";

// Rendered instantly inside the persistent workspace shell while a tab loads.
export default function WorkspaceTabLoading() {
    return (
        <div
            className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6"
            aria-busy="true"
        >
            <span className="sr-only">Loading…</span>
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full rounded-md" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
            </div>
        </div>
    );
}
