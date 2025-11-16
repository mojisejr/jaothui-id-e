"use client";

/**
 * AnimalDetailCard Component - Jaothui ID-Trace System
 * 
 * Mobile-first animal detail display component matching actual design specifications.
 * 
 * Features:
 * - TopNavigation integration (replaces PED/ART header)
 * - Single column vertical layout with information card
 * - Icon + Label + Description pattern for each field
 * - Thai translation utilities integration with memoization
 * - Conditional display for optional fields
 * - Update button inside card
 * - Bottom navigation buttons (Back to home, Animal list)
 * - 48px minimum touch targets for accessibility
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * 
 * Design Specifications:
 * - Layout: Single column vertical list (no grid)
 * - Card: Glassmorphic white card with subtle shadow
 * - Fields: Icon + Bold label + Light subtitle pattern
 * - Touch targets: 48px minimum for buttons
 * - Background: Clean gradient matching actual design
 * 
 * @framework Next.js 14 (App Router)
 * @language TypeScript (strict mode)
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { translateAnimalData } from "@/lib/animal-translations";
import { ArrowLeft, List, Calendar, Weight, Ruler, Edit3 } from "lucide-react";
import TopNavigation from "@/components/profile/TopNavigation";
import { AnimalType, AnimalGender, AnimalStatus, Prisma } from "@prisma/client";

/**
 * Animal interface matching Prisma schema
 */
export interface Animal {
  id: string;
  farmId: string;
  tagId: string;
  name: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate: string | Date | null;
  color: string | null;
  weightKg: Prisma.Decimal | number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * AnimalDetailCard Props
 */
export interface AnimalDetailCardProps {
  /** Animal information to display */
  animal: Animal;
  /** Notification count for TopNavigation */
  notificationCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimalDetailCard Component
 * 
 * @param props - Component props
 * @returns Single column animal detail card with comprehensive information display
 */
export function AnimalDetailCard({ 
  animal,
  notificationCount = 0,
  className 
}: AnimalDetailCardProps): React.ReactElement {
  const router = useRouter();
  
  // Convert Decimal to number for translation utilities
  const animalForTranslation = React.useMemo(() => ({
    ...animal,
    weightKg: animal.weightKg ? Number(animal.weightKg) : null,
  }), [animal]);

  // Translate animal data using memoized utilities
  const translatedAnimal = React.useMemo(
    () => translateAnimalData(animalForTranslation),
    [animalForTranslation]
  );

  // Handle notification click
  const handleNotificationClick = React.useCallback(() => {
    router.push('/animals?tab=notifications');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      {/* TopNavigation Integration */}
      <TopNavigation 
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content - Centered with padding for TopNavigation */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Information Card */}
          <Card 
            className={cn(
              "w-full shadow-xs border-border/50 bg-card/90 backdrop-blur-sm",
              className
            )}
            role="region"
            aria-label="ข้อมูลกระบือ"
          >
            <CardHeader className="pb-4">
              <h2 className="text-base font-medium text-muted-foreground flex items-center gap-2">
                <span className="text-lg">📋</span>
                information
              </h2>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Name */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">🐃</span>
                  {animal.name || 'ไม่ระบุชื่อ'}
                </p>
                <p className="text-sm text-muted-foreground pl-7">ชื่อกระบือ</p>
              </div>

              {/* Tag ID */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">🏷️</span>
                  {animal.tagId}
                </p>
                <p className="text-sm text-muted-foreground pl-7">หมายเลขแท็ก</p>
              </div>

              {/* Birth Date with Age */}
              {animal.birthDate && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {translatedAnimal.birthDateThai} ({translatedAnimal.ageFormatted})
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">วันเกิด</p>
                </div>
              )}

              {/* Gender */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">♂️♀️</span>
                  {translatedAnimal.genderTranslated}
                </p>
                <p className="text-sm text-muted-foreground pl-7">เพศ</p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {translatedAnimal.statusTranslated}
                </p>
                <p className="text-sm text-muted-foreground pl-7">สถานะ</p>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">🏷️</span>
                  {translatedAnimal.typeTranslated}
                </p>
                <p className="text-sm text-muted-foreground pl-7">ประเภท</p>
              </div>

              {/* Color - Optional */}
              {animal.color && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">🎨</span>
                    {animal.color}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">สี</p>
                </div>
              )}

              {/* Weight - Optional */}
              {animal.weightKg && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Weight className="w-5 h-5" />
                    {translatedAnimal.weightFormatted}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">น้ำหนัก</p>
                </div>
              )}

              {/* Height - Optional */}
              {animal.heightCm && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    {translatedAnimal.heightFormatted}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">ส่วนสูง</p>
                </div>
              )}

              {/* Mother Tag - Optional */}
              {animal.motherTag && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">👩</span>
                    {animal.motherTag}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">หมายเลขแท็กแม่</p>
                </div>
              )}

              {/* Father Tag - Optional */}
              {animal.fatherTag && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">👨</span>
                    {animal.fatherTag}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">หมายเลขแท็กพ่อ</p>
                </div>
              )}

              {/* Genome - Optional */}
              {animal.genome && (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">🧬</span>
                    {animal.genome}
                  </p>
                  <p className="text-sm text-muted-foreground pl-7">ข้อมูลจีโนม</p>
                </div>
              )}

              {/* Update Button - Inside Card */}
              <div className="pt-2">
                <Link href={`/animals/${animal.id}/edit`} className="block">
                  <Button 
                    className="w-full min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    aria-label="อัปเดทข้อมูลกระบือ"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    อัปเดทข้อมูลกระบือ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Navigation Buttons */}
          <div className="flex gap-4 w-full">
            <Link href="/profile" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full min-h-[48px] hover:bg-accent/80 transition-colors"
                aria-label="กลับสู่หน้าหลัก"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับสู่หน้าหลัก
              </Button>
            </Link>
            
            <Link href="/animals" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full min-h-[48px] hover:bg-accent/80 transition-colors"
                aria-label="ข้อมูลกระบือ"
              >
                <List className="w-4 h-4 mr-2" />
                ข้อมูลกระบือ
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnimalDetailCard;
