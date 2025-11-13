"use client";

/**
 * Home Page - Jaothui ID-Trace System
 *
 * Automatically redirects logged-in users to /profile page.
 * Shows hero section with login button for non-authenticated users.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/ui/HeroSection";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  /**
   * Redirect logged-in users to profile page
   */
  React.useEffect(() => {
    if (session) {
      router.push("/profile");
    }
  }, [session, router]);

  /**
   * Show loading state while checking session
   */
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  /**
   * If user is logged in, show loading while redirecting
   */
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  /**
   * Show hero section for non-logged-in users
   */
  return (
    <main>
      <HeroSection />
    </main>
  );
}
