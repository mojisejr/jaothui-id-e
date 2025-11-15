"use client";

/**
 * Animal Creation Page - Jaothui ID-Trace System
 *
 * Complete page for creating new animal records with comprehensive form.
 *
 * Features:
 * - Protected route (authentication required)
 * - Integration with CreateAnimalForm component
 * - Farm validation and auto-creation if needed
 * - Success/error feedback via window.alert()
 * - Navigation back to profile page
 * - Mobile-first responsive design
 * - Loading and error states
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * Design Principles:
 * - Mobile-first (375px minimum viewport)
 * - Elderly-friendly (clear feedback, simple navigation)
 * - Thai language native
 * - Component-based architecture
 *
 * @route /animals/create
 * @component CreateAnimalPage
 * @see Issue #79, Task 1.4
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CreateAnimalForm } from "@/components/animals/CreateAnimalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function CreateAnimalPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [farmId, setFarmId] = React.useState<string | null>(null);
  const [isLoadingFarm, setIsLoadingFarm] = React.useState(true);
  const [farmError, setFarmError] = React.useState<string | null>(null);

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  /**
   * Fetch or create farm when user is authenticated
   */
  React.useEffect(() => {
    const fetchOrCreateFarm = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        setIsLoadingFarm(true);
        setFarmError(null);

        // Try to get existing farm
        const response = await fetch("/api/farm");

        if (response.ok) {
          const data = await response.json();
          setFarmId(data.farm.id);
        } else if (response.status === 404) {
          // Farm doesn't exist, create one
          const createResponse = await fetch("/api/farm", {
            method: "POST",
          });

          if (createResponse.ok) {
            const data = await createResponse.json();
            setFarmId(data.farm.id);
          } else {
            const errorData = await createResponse.json();
            setFarmError(errorData.error || "ไม่สามารถสร้างฟาร์มได้");
          }
        } else {
          const errorData = await response.json();
          setFarmError(errorData.error || "ไม่สามารถโหลดข้อมูลฟาร์มได้");
        }
      } catch (error) {
        console.error("Failed to fetch/create farm:", error);
        setFarmError("เกิดข้อผิดพลาดในการโหลดข้อมูลฟาร์ม");
      } finally {
        setIsLoadingFarm(false);
      }
    };

    fetchOrCreateFarm();
  }, [session]);

  /**
   * Handle form submission success
   */
  const handleSuccess = (animal: any) => {
    // Show success message via alert (toast system not available)
    window.alert("บันทึกข้อมูลกระบือสำเร็จแล้ว");

    // Redirect to profile page
    router.push("/profile");
  };

  /**
   * Handle form submission error
   */
  const handleError = (error: Error) => {
    // Show error message via alert
    window.alert(`ข้อผิดพลาด: ${error.message}`);
  };

  /**
   * Handle cancel action - navigate back
   */
  const handleCancel = () => {
    router.back();
  };

  /**
   * Loading state while checking authentication
   */
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
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
   * Not authenticated - return null (redirect will happen via useEffect)
   */
  if (!session) {
    return null;
  }

  /**
   * Loading farm data
   */
  if (isLoadingFarm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
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
          <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลฟาร์ม...</p>
        </div>
      </div>
    );
  }

  /**
   * Farm error state
   */
  if (farmError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>{farmError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              aria-label="ลองใหม่"
            >
              ลองใหม่
            </Button>
            <Button
              onClick={() => router.push("/profile")}
              variant="ghost"
              className="w-full"
              aria-label="กลับไปหน้าหลัก"
            >
              กลับไปหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Missing farmId (should not happen after farm creation)
   */
  if (!farmId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">ไม่พบฟาร์ม</CardTitle>
            <CardDescription>
              ไม่พบข้อมูลฟาร์ม กรุณาลองใหม่อีกครั้ง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/profile")}
              className="w-full"
              aria-label="กลับไปหน้าหลัก"
            >
              กลับไปหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Main page content - render form
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <main className="pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Form Component */}
          <CreateAnimalForm
            farmId={farmId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />

          {/* Back Button - Ghost Style */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/profile")}
              className="text-muted-foreground hover:text-foreground min-h-[44px]"
              aria-label="กลับไปหน้าหลัก"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าหลัก
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
