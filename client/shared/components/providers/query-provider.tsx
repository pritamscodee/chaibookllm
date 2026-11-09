"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Serve cached data instantly when switching tabs instead
                        // of refetching every list on every mount.
                        staleTime: 30_000,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;
