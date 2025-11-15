/**
 * ProfileCard Component - Jaothui ID-Trace System
 * 
 * Displays farm identity information with large avatar and farm details.
 * 
 * Features:
 * - Large 120px × 120px rounded square avatar (centered)
 * - Farm name display (20px, Bold)
 * - Province display (16px, Medium)
 * - Inline editing with click-to-edit functionality
 * - First-time user setup flow with guidance
 * - Session integration for user avatar
 * - Mobile-first responsive design
 * - Age-optimized for 30+ users
 * - Accessibility compliant (WCAG AA)
 * - Real API integration with /api/farm
 * 
 * Design Specifications:
 * - Avatar: 120px × 120px rounded square frame
 * - Farm Name: Editable (20px, Bold)
 * - Province: Editable (16px, Medium)
 * - Layout: All content centered within card
 * - Background: Green card matching design spec
 * 
 * Data Sources:
 * - Avatar: Real user avatar from session.user.avatarUrl (or placeholder)
 * - Farm info: Real API from /api/farm endpoint
 * 
 * @route Used in /profile page
 */

import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Farm Interface
 * Matches Prisma schema for API integration
 */
export interface Farm {
  id: string;
  name: string;
  province: string | null;
  ownerId: string;
  code: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * ProfileCard Props
 */
export interface ProfileCardProps {
  /** Farm information to display */
  farm: Farm;
  /** User avatar URL (from session or placeholder) */
  userAvatar?: string;
  /** Callback when farm is updated */
  onFarmUpdate?: (updatedFarm: Farm) => void;
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
  onFarmUpdate,
  className = "",
}: ProfileCardProps) {
  const displayAvatar = userAvatar || "/thuiLogo.png";

  // Editing state management
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(farm.name);
  const [editedProvince, setEditedProvince] = React.useState(farm.province || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Detect first-time user (using Prisma default values)
  const isFirstTimeUser = farm.name === "ฟาร์มของฉัน" && farm.province === "ไม่ระบุ";
  const [showFirstTimeGuidance, setShowFirstTimeGuidance] = React.useState(isFirstTimeUser);

  /**
   * Update local state when farm prop changes
   */
  React.useEffect(() => {
    setEditedName(farm.name);
    setEditedProvince(farm.province || "");
    setShowFirstTimeGuidance(farm.name === "ฟาร์มของฉัน" && farm.province === "ไม่ระบุ");
  }, [farm]);

  /**
   * Handle edit mode activation
   */
  const handleStartEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  /**
   * Handle cancel editing
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(farm.name);
    setEditedProvince(farm.province || "");
    setSaveError(null);
    if (isFirstTimeUser) {
      setShowFirstTimeGuidance(true);
    }
  };

  /**
   * Handle save farm changes
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate input
      if (!editedName.trim()) {
        setSaveError("กรุณาระบุชื่อฟาร์ม");
        return;
      }

      if (!editedProvince.trim()) {
        setSaveError("กรุณาระบุจังหวัด");
        return;
      }

      // Call API to update farm
      const response = await fetch('/api/farm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName.trim(),
          province: editedProvince.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update parent component
        if (onFarmUpdate) {
          onFarmUpdate(data.farm);
        }
        setIsEditing(false);
        setShowFirstTimeGuidance(false);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Failed to save farm data:', error);
      setSaveError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className={`${className} shadow-none`}
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
          <div className="w-full h-full rounded-xl overflow-hidden bg-muted border-2 border-border">
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

        {/* First-Time User Guidance */}
        {showFirstTimeGuidance && !isEditing && (
          <div className="w-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎉 ยินดีต้อนรับสู่ระบบ ID-Trace!
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
              กรุณาตั้งชื่อฟาร์มและระบุจังหวัดของคุณ
            </p>
            <Button
              onClick={handleStartEdit}
              className="w-full min-h-[44px]"
              aria-label="ตั้งค่าข้อมูลฟาร์ม"
            >
              ตั้งค่าข้อมูลฟาร์ม
            </Button>
          </div>
        )}

        {/* Farm Information Section */}
        <div className="flex flex-col items-center space-y-4 w-full">
          {isEditing ? (
            // Edit Mode
            <>
              <div className="w-full space-y-3">
                {/* Farm Name Input */}
                <div className="space-y-1">
                  <label
                    htmlFor="farm-name"
                    className="text-sm font-medium text-foreground block text-center"
                  >
                    ชื่อฟาร์ม
                  </label>
                  <Input
                    id="farm-name"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="ระบุชื่อฟาร์ม"
                    className="text-center min-h-[44px]"
                    aria-label="ชื่อฟาร์ม"
                    disabled={isSaving}
                  />
                </div>

                {/* Province Input */}
                <div className="space-y-1">
                  <label
                    htmlFor="farm-province"
                    className="text-sm font-medium text-foreground block text-center"
                  >
                    จังหวัด
                  </label>
                  <Input
                    id="farm-province"
                    type="text"
                    value={editedProvince}
                    onChange={(e) => setEditedProvince(e.target.value)}
                    placeholder="ระบุจังหวัด"
                    className="text-center min-h-[44px]"
                    aria-label="จังหวัด"
                    disabled={isSaving}
                  />
                </div>

                {/* Error Message */}
                {saveError && (
                  <p className="text-sm text-destructive text-center" role="alert">
                    {saveError}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 min-h-[44px]"
                    aria-label="บันทึกข้อมูลฟาร์ม"
                  >
                    {isSaving ? (
                      <>
                        <span
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"
                          role="status"
                        />
                        กำลังบันทึก...
                      </>
                    ) : (
                      "บันทึก"
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={isSaving}
                    className="flex-1 min-h-[44px]"
                    aria-label="ยกเลิกการแก้ไข"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Display Mode
            <>
              {/* Farm Name */}
              <h2
                className="text-[20px] font-bold text-foreground text-center leading-tight cursor-pointer hover:text-primary transition-colors"
                aria-label={`ชื่อฟาร์ม: ${farm.name}`}
                onClick={handleStartEdit}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStartEdit();
                  }
                }}
              >
                {farm.name}
              </h2>

              {/* Province */}
              {farm.province && (
                <p
                  className="text-[16px] font-medium text-muted-foreground text-center cursor-pointer hover:text-primary transition-colors"
                  aria-label={`จังหวัด: ${farm.province}`}
                  onClick={handleStartEdit}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStartEdit();
                    }
                  }}
                >
                  {farm.province}
                </p>
              )}

              {/* Edit Hint */}
              {!showFirstTimeGuidance && (
                <p className="text-xs text-muted-foreground text-center">
                  คลิกเพื่อแก้ไขข้อมูลฟาร์ม
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
