import type { Metadata } from "next";
import { requireAuth } from "@/features/auth";
import { MemorySettings } from "@/features/memory";

export const metadata: Metadata = { title: "Memory" };

export default async function MemorySettingsPage() {
    await requireAuth();

    return <MemorySettings />;
}
