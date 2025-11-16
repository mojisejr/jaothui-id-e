"use client";

/**
 * CreateActivityForm Component - Jaothui ID-Trace System
 * 
 * Activity creation form with react-hook-form and Zod validation.
 * Follows CreateAnimalForm pattern for consistency.
 * 
 * Features:
 * - Real-time validation with inline error messages
 * - 4 main form fields (title, description, activityDate, dueDate)
 * - Mobile-first responsive design (320px minimum)
 * - Elderly-friendly (44px touch targets)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @see Issue #154, Context Issue #150
 * @see /src/lib/validations/activity.ts - Validation schema
 * @see /src/app/api/activities/route.ts - API endpoint
 */

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createActivityFormSchema,
  CreateActivityFormInput,
} from "@/lib/validations/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Component Props
 */
export interface CreateActivityFormProps {
  /** Animal ID for activity association */
  animalId: string;
  /** Success callback with created activity data */
  onSuccess?: (activity: any) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** External loading state */
  isLoading?: boolean;
}

export function CreateActivityForm({
  animalId,
  onSuccess,
  onCancel,
  isLoading: externalLoading,
}: CreateActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const isLoading = externalLoading || isSubmitting;

  /**
   * Initialize react-hook-form with Zod validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createActivityFormSchema),
    defaultValues: {
      animalId: animalId,
      title: "",
      description: null,
      activityDate: "" as any,
      dueDate: "" as any,
      status: "PENDING" as const,
    },
  });

  /**
   * Form submission handler
   * Posts data to /api/activities
   */
  const onSubmit: SubmitHandler<CreateActivityFormInput> = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Prepare payload
      const payload = {
        ...data,
        animalId,
        // Convert empty strings to null for optional fields
        description: data.description || null,
        dueDate: data.dueDate || null,
        // Ensure dates are properly formatted
        activityDate: data.activityDate,
      };

      // POST to API endpoint
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "ไม่สามารถเพิ่มกิจกรรมได้"
        );
      }

      const result = await response.json();

      // Reset form on success
      reset();

      // Call success callback
      onSuccess?.(result.data.activity);
    } catch (err) {
      console.error("Activity creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเพิ่มกิจกรรม กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    reset();
    setError("");
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          เพิ่มกิจกรรม
        </CardTitle>
        <CardDescription className="text-center">
          บันทึกกิจกรรมสำหรับกระบือ
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Activity Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              ข้อมูลกิจกรรม
            </h3>

            {/* Title (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                หัวข้อกิจกรรม
              </label>
              <Input
                id="title"
                type="text"
                placeholder="กรอกหัวข้อกิจกรรม"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                className="h-12 text-base"
                {...register("title")}
              />
              {errors.title && (
                <p
                  id="title-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                รายละเอียด
              </label>
              <textarea
                id="description"
                placeholder="กรอกรายละเอียดกิจกรรม (ถ้ามี)"
                disabled={isLoading}
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                className="flex min-h-[120px] w-full rounded-md border border-input bg-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p
                  id="description-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Activity Date (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="activityDate"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                วันที่กิจกรรม
              </label>
              <Input
                id="activityDate"
                type="date"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.activityDate}
                aria-describedby={
                  errors.activityDate ? "activityDate-error" : undefined
                }
                className="h-12 text-base"
                {...register("activityDate")}
              />
              {errors.activityDate && (
                <p
                  id="activityDate-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.activityDate.message}
                </p>
              )}
            </div>

            {/* Due Date (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="dueDate"
                className="text-sm font-medium text-foreground"
              >
                วันครบกำหนด
              </label>
              <Input
                id="dueDate"
                type="date"
                disabled={isLoading}
                aria-invalid={!!errors.dueDate}
                aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                className="h-12 text-base"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p
                  id="dueDate-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-medium"
              aria-label="ยืนยันเพิ่มกิจกรรม"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังบันทึกข้อมูล...
                </span>
              ) : (
                "ยืนยันเพิ่มกิจกรรม"
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-12 text-base font-medium"
              aria-label="ยกเลิก"
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
