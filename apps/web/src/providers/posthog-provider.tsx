"use client";

import { ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogClient.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

function PostHogIdentify() {
  const { user, isLoaded } = useUser();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (isLoaded && posthogClient) {
      if (user) {
        posthogClient.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          username: user.username,
        });
      } else {
        posthogClient.reset();
      }
    }
  }, [user, isLoaded, posthogClient]);

  return null;
}

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
