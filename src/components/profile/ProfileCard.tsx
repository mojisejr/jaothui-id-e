/**
 * ProfileCard Component - Jaothui ID-Trace System
 * 
 * Displays farm identity information with large avatar and farm details.
 * 
 * Features:
 * - Large 120px × 120px rounded square avatar (centered)
 * - Farm name display (20px, Bold)
 * - Province display (16px, Medium)
 * - Session integration for user avatar
 * - Mobile-first responsive design
 * - Age-optimized for 30+ users
 * - Accessibility compliant (WCAG AA)
 * 
 * Design Specifications:
 * - Avatar: 120px × 120px rounded square frame
 * - Farm Name: ศรีวนาลัย (20px, Bold)
 * - Province: จังหวัดนครราชสีมา (16px, Medium)
 * - Layout: All content centered within card
 * - Background: Green card matching design spec
 * 
 * Data Sources:
 * - Avatar: Real user avatar from session.user.avatarUrl (or placeholder)
 * - Farm info: Mock data (to be replaced with real API)
 * 
 * @route Used in /profile page
 */

import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

/**
 * Farm Interface
 * Matches Prisma schema for future API integration
 */
export interface Farm {
  name: string;
  province: string | null;
}

/**
 * ProfileCard Props
 */
export interface ProfileCardProps {
  /** Farm information to display */
  farm: Farm;
  /** User avatar URL (from session or placeholder) */
  userAvatar?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProfileCard Component
 * 
 * @param props - Component props
 * @returns Farm profile card with avatar and farm details
 */
export function ProfileCard({
  farm,
  userAvatar,
  className = "",
}: ProfileCardProps) {
  const displayAvatar = userAvatar || "/thuiLogo.png";

  return (
    <Card
      className={`border-border bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm shadow ${className}`}
      role="region"
      aria-label="ข้อมูลฟาร์ม"
    >
      {/* Card Content Container */}
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        {/* Avatar Section */}
        <div
          className="relative flex-shrink-0"
          role="img"
          aria-label={`รูปประจำตัวฟาร์ม${farm.name}`}
        >
          {/* Avatar Container - 120px × 120px rounded square */}
          <div className="w-[120px] h-[120px] rounded-xl overflow-hidden bg-muted border-2 border-border shadow-md">
            <Image
              src={displayAvatar}
              alt={`รูปประจำตัวฟาร์ม${farm.name}`}
              width={120}
              height={120}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder on image load error
                const target = e.target as HTMLImageElement;
                target.src = "/thuiLogo.png";
              }}
            />
          </div>
        </div>

        {/* Farm Information Section */}
        <div className="flex flex-col items-center space-y-2 w-full">
          {/* Farm Name */}
          <h2
            className="text-[20px] font-bold text-foreground text-center leading-tight"
            aria-label={`ชื่อฟาร์ม: ${farm.name}`}
          >
            {farm.name}
          </h2>

          {/* Province */}
          {farm.province && (
            <p
              className="text-[16px] font-medium text-muted-foreground text-center"
              aria-label={`จังหวัด: ${farm.province}`}
            >
              {farm.province}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
