"use client";

/**
 * ProfileCard Demo Page - Jaothui ID-Trace System
 * 
 * Demonstrates the ProfileCard component with mock data.
 * This page is for visual testing and development purposes only.
 * Does not require authentication.
 * 
 * @route /profile-demo (for development only)
 */

import * as React from "react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { mockFarm } from "@/lib/mock-data";

export default function ProfileCardDemo() {
  // Sample avatar URLs for testing different scenarios
  const [avatarOption, setAvatarOption] = React.useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            ProfileCard Component Demo
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual test for ProfileCard component
          </p>
        </div>

        {/* Avatar Options Selector */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <h2 className="font-semibold text-sm mb-2">Avatar Options:</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAvatarOption(undefined)}
              className={`px-3 py-1 text-xs rounded ${
                avatarOption === undefined
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setAvatarOption("/thuiLogo.png")}
              className={`px-3 py-1 text-xs rounded ${
                avatarOption === "/thuiLogo.png"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Logo
            </button>
          </div>
        </div>

        {/* ProfileCard with mock data */}
        <ProfileCard
          farm={{
            name: mockFarm.name,
            province: mockFarm.province,
          }}
          userAvatar={avatarOption}
        />

        {/* Component Info */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <h2 className="font-semibold text-sm mb-2">Component Specifications:</h2>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Avatar: 120px × 120px rounded square</li>
            <li>✓ Farm Name: {mockFarm.name} (20px, Bold)</li>
            <li>✓ Province: {mockFarm.province} (16px, Medium)</li>
            <li>✓ Accessibility: WCAG AA compliant</li>
            <li>✓ Design: Mobile-first, age-optimized (30+)</li>
            <li>✓ Session Integration: Avatar from session or placeholder</li>
            <li>✓ Mock Data: Schema-accurate farm information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
