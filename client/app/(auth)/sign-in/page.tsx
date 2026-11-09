import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm, unauth } from "@/features/auth";

export const metadata: Metadata = {
    title: "Sign in",
};

export default async function SignInPage() {
    await unauth();

    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
