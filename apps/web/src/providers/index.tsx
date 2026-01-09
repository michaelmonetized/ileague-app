"use client";

import { ReactNode, Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./convex-provider";
import { PostHogProvider } from "./posthog-provider";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
        variables: {
          colorPrimary: "oklch(65% 0.25 275)",
          colorBackground: "oklch(99% 0.005 275)",
          colorInputBackground: "oklch(99% 0.005 275)",
          colorInputText: "oklch(15% 0.01 275)",
          borderRadius: "0.5rem",
        },
      }}
    >
      <ConvexClientProvider>
        <Suspense fallback={null}>
          <PostHogProvider>
            {children}
            <Toaster />
          </PostHogProvider>
        </Suspense>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
