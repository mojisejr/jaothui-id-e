/**
 * AnimalDetailCard Component - Jaothui ID-Trace System
 * 
 * Enhanced animal detail display component based on ProfileCard glassmorphic design.
 * 
 * Features:
 * - Enhanced glassmorphic design (bg-card/85 backdrop-blur-md)
 * - 160x160px animal image with blur placeholder and loading states
 * - Three-column responsive grid layout for comprehensive field display
 * - Thai translation utilities integration with memoization
 * - Enhanced navigation buttons with improved ghost styling
 * - 48px minimum touch targets for accessibility
 * - Improved typography hierarchy
 * - Conditional display for optional fields
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * 
 * Design Specifications:
 * - Card: Enhanced glassmorphic with backdrop-blur-md
 * - Image: 160x160px rounded-xl with blur placeholder
 * - Layout: Three-column responsive grid (grid-cols-1 md:grid-cols-2)
 * - Touch targets: 48px minimum for buttons
 * - Background: Gradient matching ProfileCard pattern
 * 
 * @framework Next.js 14 (App Router)
 * @language TypeScript (strict mode)
 */

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { translateAnimalData } from "@/lib/animal-translations";
import { ArrowLeft, Edit, Calendar, Weight, Ruler } from "lucide-react";
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
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimalDetailCard Component
 * 
 * @param props - Component props
 * @returns Enhanced animal detail card with comprehensive information display
 */
export function AnimalDetailCard({ 
  animal, 
  className 
}: AnimalDetailCardProps): React.ReactElement {
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
  
  return (
    <Card 
      className={cn(
        "w-full max-w-md shadow-lg border-border/50 bg-card/85 backdrop-blur-md transition-all duration-300 hover:shadow-xl",
        className
      )}
      role="region"
      aria-label="ข้อมูลกระบือ"
    >
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-7">
        {/* Enhanced Animal Image - 160x160px with blur placeholder */}
        <div 
          className="w-40 h-40 rounded-xl overflow-hidden bg-muted/50 border-2 border-border/50 relative group hover:border-border transition-colors duration-200"
          role="img"
          aria-label={`รูป${animal.name || 'กระบือ'}`}
        >
          {animal.imageUrl ? (
            <Image
              src={animal.imageUrl}
              alt={animal.name || 'ไม่ระบุชื่อ'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="160px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA="
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-muted/30 transition-colors duration-200 group-hover:bg-muted/40">
              🐃
            </div>
          )}
        </div>

        {/* Enhanced Animal Name - Improved Typography */}
        <div className="text-center space-y-2">
          <h2 className="text-[20px] font-bold text-foreground text-center leading-tight tracking-tight">
            {animal.name || 'ไม่ระบุชื่อ'}
          </h2>
          <p className="text-base font-medium text-muted-foreground text-center leading-relaxed">
            {animal.tagId || 'ไม่ระบุหมายเลขแท็ก'}
          </p>
        </div>

        {/* Enhanced Three-Column Grid for Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full space-y-0">
          {/* Basic Information Row */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">🏷️</span>
              ประเภท
            </p>
            <p className="text-base font-medium">{translatedAnimal.typeTranslated}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">♂️/♀️</span>
              เพศ
            </p>
            <p className="text-base font-medium">{translatedAnimal.genderTranslated}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">📊</span>
              สถานะ
            </p>
            <p className="text-base font-medium">{translatedAnimal.statusTranslated}</p>
          </div>
          
          {/* Age and Date Information */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              อายุ/วันเกิด
            </p>
            <p className="text-base font-medium">{translatedAnimal.ageFormatted}</p>
            <p className="text-sm text-muted-foreground">{translatedAnimal.birthDateThai}</p>
          </div>

          {/* Optional Fields with Enhanced Conditional Display */}
          {animal.color && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">🎨</span>
                สี
              </p>
              <p className="text-base font-medium">{animal.color}</p>
            </div>
          )}
          
          {animal.weightKg && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Weight className="w-4 h-4" />
                น้ำหนัก
              </p>
              <p className="text-base font-medium">{translatedAnimal.weightFormatted}</p>
            </div>
          )}

          {animal.heightCm && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                ส่วนสูง
              </p>
              <p className="text-base font-medium">{translatedAnimal.heightFormatted}</p>
            </div>
          )}

          {/* Parent Information */}
          {animal.motherTag && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-pink-20 flex items-center justify-center text-xs">👩</span>
                หมายเลขแท็กแม่
              </p>
              <p className="text-base font-medium">{animal.motherTag}</p>
            </div>
          )}

          {animal.fatherTag && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-20 flex items-center justify-center text-xs">👨</span>
                หมายเลขแท็กพ่อ
              </p>
              <p className="text-base font-medium">{animal.fatherTag}</p>
            </div>
          )}
        </div>

        {/* Enhanced Navigation Buttons - Improved Ghost style */}
        <div className="flex gap-4 justify-center w-full pt-2">
          <Link href="/profile" className="flex-1">
            <Button 
              variant="ghost" 
              className="w-full min-h-[48px] hover:bg-accent/80 hover:border-accent-foreground/25 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="กลับสู่หน้าหลัก"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับสู่หน้าหลัก
            </Button>
          </Link>
          
          <Link href={`/animals/${animal.id}/edit`} className="flex-1">
            <Button 
              variant="ghost" 
              className="w-full min-h-[48px] hover:bg-accent/80 hover:border-accent-foreground/25 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="แก้ไขข้อมูล"
            >
              <Edit className="w-4 h-4 mr-2" />
              แก้ไขข้อมูล
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnimalDetailCard;
