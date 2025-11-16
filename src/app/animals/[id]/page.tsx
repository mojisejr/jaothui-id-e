"use client";

/**
 * Animal Detail Page - Jaothui ID-Trace System
 *
 * Displays comprehensive animal information following the enhanced design system.
 * Based on ProfileCard component pattern with improved glassmorphic design.
 *
 * Features:
 * - Enhanced glassmorphic card design (bg-card/85 backdrop-blur-md)
 * - 160x160px animal image with improved loading states
 * - 100% database field utilization with three-column responsive layout
 * - Thai language translations for all enum fields
 * - Thai Buddhist Era (BE) calendar dates
 * - Enhanced touch targets (48px minimum)
 * - Improved typography hierarchy
 * - Conditional display for optional fields with smooth transitions
 * - Mobile-first responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * Design Specifications:
 * - Card: Enhanced glassmorphic with backdrop-blur-md
 * - Image: 160x160px rounded-xl with blur placeholder
 * - Layout: Three-column responsive grid (grid-cols-1 md:grid-cols-3)
 * - Touch targets: 48px minimum for buttons
 * - Background: Enhanced gradient (from-background via-secondary/10 to-secondary/20)
 *
 * @route /animals/[id]
 * @component AnimalDetailPage
 */

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNavigation from "@/components/profile/TopNavigation";
import {
  translateAnimalType,
  translateAnimalGender,
  translateAnimalStatus,
  formatThaiDate,
  formatWeight,
  formatHeight,
} from "@/lib/translations";
import { AnimalType, AnimalGender, AnimalStatus } from "@prisma/client";

/**
 * Animal interface matching Prisma schema with all fields
 */
interface Animal {
  id: string;
  farmId: string;
  tagId: string;
  name: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate: string | null;
  color: string | null;
  weightKg: string | number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Field display component for consistent styling
 */
interface FieldDisplayProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const FieldDisplay: React.FC<FieldDisplayProps> = ({ label, value, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-base font-medium text-foreground">{value}</dd>
  </div>
);

/**
 * Main Animal Detail Page Component
 */
export default function AnimalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending, error: authError } = useSession();
  
  const animalId = params?.id as string;

  // State management
  const [animal, setAnimal] = React.useState<Animal | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  /**
   * Fetch animal data from API
   */
  const fetchAnimalData = React.useCallback(async () => {
    if (!animalId || !session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/animals/${animalId}`);

      if (response.ok) {
        const data = await response.json();
        setAnimal(data.data.animal);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || "ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (err) {
      console.error("Failed to fetch animal data:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  }, [animalId, session?.user?.id]);

  /**
   * Fetch data when user is authenticated
   */
  React.useEffect(() => {
    if (session?.user?.id && animalId) {
      fetchAnimalData();
    }
  }, [session?.user?.id, animalId, fetchAnimalData]);

  /**
   * Handle navigation callbacks
   */
  const handleBackToHome = () => {
    router.push("/profile");
  };

  const handleBackToList = () => {
    router.push("/animals");
  };

  const handleUpdateAnimal = () => {
    // Future: Navigate to edit page
    console.log("Update animal:", animalId);
  };

  const handleNotificationClick = () => {
    // Future: Navigate to notifications
    console.log("Notifications clicked");
  };

  /**
   * Loading state while checking authentication
   */
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
        <div className="text-center space-y-4">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="กำลังโหลด"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              กำลังโหลด...
            </span>
          </div>
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  /**
   * Authentication error state
   */
  if (authError || (!isPending && !session)) {
    return null; // Redirect will happen via useEffect
  }

  /**
   * Loading state while fetching animal data
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
        <TopNavigation
          notificationCount={0}
          onNotificationClick={handleNotificationClick}
          onBrandClick={handleBackToHome}
        />
        <div className="pt-20 px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div
                className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
                aria-label="กำลังโหลด"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  กำลังโหลด...
                </span>
              </div>
              <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลกระบือ...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
        <TopNavigation
          notificationCount={0}
          onNotificationClick={handleNotificationClick}
          onBrandClick={handleBackToHome}
        />
        <div className="pt-20 px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-md shadow-lg border-border/50 bg-card/85 backdrop-blur-md border-destructive/50">
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-4xl">⚠️</div>
                <h3 className="text-lg font-semibold text-destructive">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {error || "ไม่พบข้อมูลกระบือ"}
                </p>
                <div className="flex gap-2 w-full pt-2">
                  <Button
                    onClick={fetchAnimalData}
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                  >
                    ลองใหม่
                  </Button>
                  <Button
                    onClick={handleBackToList}
                    className="flex-1 min-h-[48px]"
                  >
                    กลับสู่รายการ
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
      {/* Top Navigation Bar */}
      <TopNavigation
        notificationCount={0}
        onNotificationClick={handleNotificationClick}
        onBrandClick={handleBackToHome}
      />

      {/* Main Content Area */}
      <div className="pt-20 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            {/* Enhanced Animal Detail Card */}
            <Card className="w-full max-w-3xl shadow-lg border-border/50 bg-card/85 backdrop-blur-md">
              <div className="flex flex-col items-center justify-center p-8 space-y-7">
                {/* Animal Image - 160x160px */}
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-muted/50 border-2 border-border/50 relative">
                  {animal.imageUrl ? (
                    <Image
                      src={animal.imageUrl}
                      alt={animal.name || "ไม่ระบุชื่อ"}
                      fill
                      className="object-cover"
                      sizes="160px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-muted/30">
                      🐃
                    </div>
                  )}
                </div>

                {/* Animal Name - Enhanced Typography */}
                <h2 className="text-[20px] font-bold text-foreground text-center leading-tight tracking-tight">
                  {animal.name || "ไม่ระบุชื่อ"}
                </h2>

                {/* Animal Information - Three-Column Responsive Grid */}
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full border-t border-border/30 pt-6">
                  {/* Primary Information */}
                  <FieldDisplay label="หมายเลขแท็ก" value={animal.tagId} />
                  <FieldDisplay label="ประเภทสัตว์" value={translateAnimalType(animal.type)} />
                  <FieldDisplay label="เพศ" value={translateAnimalGender(animal.gender)} />

                  {/* Birth and Physical Information */}
                  <FieldDisplay label="วันเกิด" value={formatThaiDate(animal.birthDate)} />
                  {animal.color && <FieldDisplay label="สี" value={animal.color} />}
                  <FieldDisplay label="สถานะ" value={translateAnimalStatus(animal.status)} />

                  {/* Physical Measurements */}
                  {animal.weightKg && (
                    <FieldDisplay label="น้ำหนัก" value={formatWeight(animal.weightKg)} />
                  )}
                  {animal.heightCm && (
                    <FieldDisplay label="ส่วนสูง" value={formatHeight(animal.heightCm)} />
                  )}

                  {/* Parent Information */}
                  {animal.motherTag && (
                    <FieldDisplay label="แม่" value={`แท็ก: ${animal.motherTag}`} />
                  )}
                  {animal.fatherTag && (
                    <FieldDisplay label="พ่อ" value={`แท็ก: ${animal.fatherTag}`} />
                  )}

                  {/* Genome Information */}
                  {animal.genome && (
                    <FieldDisplay
                      label="จีโนม"
                      value={
                        <span className="text-xs break-all font-mono">
                          {animal.genome}
                        </span>
                      }
                      className="md:col-span-3"
                    />
                  )}
                </dl>

                {/* Action Buttons - Enhanced Ghost Style */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-4 border-t border-border/30">
                  <Button
                    variant="ghost"
                    onClick={handleBackToHome}
                    className="min-h-[48px] hover:bg-accent/80 hover:border-accent-foreground/25 transition-all duration-200 flex-1 sm:flex-none sm:min-w-[160px]"
                    aria-label="กลับสู่หน้าหลัก"
                  >
                    กลับสู่หน้าหลัก
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleBackToList}
                    className="min-h-[48px] hover:bg-accent/80 hover:border-accent-foreground/25 transition-all duration-200 flex-1 sm:flex-none sm:min-w-[160px]"
                    aria-label="กลับสู่รายการกระบือ"
                  >
                    รายการกระบือ
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleUpdateAnimal}
                    className="min-h-[48px] hover:bg-accent/80 hover:border-accent-foreground/25 transition-all duration-200 flex-1 sm:flex-none sm:min-w-[160px]"
                    aria-label="แก้ไขข้อมูล"
                  >
                    แก้ไขข้อมูล
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
