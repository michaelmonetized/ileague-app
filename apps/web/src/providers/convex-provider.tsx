"use client";

import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { convex } from "@/lib/convex";

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
