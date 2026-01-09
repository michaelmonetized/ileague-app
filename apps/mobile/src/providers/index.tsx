import { ReactNode } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { PostHogProvider } from "posthog-react-native";
import { convex } from "@/lib/convex";
import { tokenCache } from "@/lib/clerk";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY!;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST!;

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <PostHogProvider
            apiKey={posthogApiKey}
            options={{
              host: posthogHost,
            }}
          >
            {children}
          </PostHogProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
