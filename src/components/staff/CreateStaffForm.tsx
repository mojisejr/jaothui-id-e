"use client";

/**
 * CreateStaffForm Component - Jaothui ID-Trace System
 * 
 * Complete staff creation form with react-hook-form and Zod validation.
 * Follows CreateAnimalForm patterns for consistency.
 * 
 * Features:
 * - Real-time validation with inline error messages
 * - 5 form fields: username, password, firstName, lastName, email (optional)
 * - Mobile-first responsive design (320px minimum)
 * - Elderly-friendly (44px touch targets)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @see CreateAnimalForm.tsx - UI pattern reference
 * @see /src/lib/validations/staff.ts - Validation schema
 * @see /src/app/api/users/staff/route.ts - Backend API
 */

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, StaffInput } from "@/lib/validations/staff";
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
export interface CreateStaffFormProps {
  /** Success callback with created staff data */
  onSuccess?: (staff: any) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** External loading state */
  isLoading?: boolean;
}

export function CreateStaffForm({
  onSuccess,
  onCancel,
  isLoading: externalLoading,
}: CreateStaffFormProps) {
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
  } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: null,
    },
  });

  /**
   * Form submission handler
   * Posts data to /api/users/staff
   */
  const onSubmit: SubmitHandler<StaffInput> = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Prepare payload
      const payload = {
        ...data,
        // Convert empty string to null for optional email
        email: data.email || null,
      };

      // POST to API endpoint
      const response = await fetch("/api/users/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "ไม่สามารถเพิ่มพนักงานได้"
        );
      }

      const result = await response.json();

      // Reset form on success
      reset();

      // Call success callback
      onSuccess?.(result.data);
    } catch (err) {
      console.error("Staff creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเพิ่มพนักงาน กรุณาลองใหม่อีกครั้ง"
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
          เพิ่มพนักงานในระบบ
        </CardTitle>
        <CardDescription className="text-center">
          โปรดกรอกข้อมูลให้ครบถ้วน
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

          {/* Form Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              ข้อมูลพนักงาน
            </h3>

            {/* Username (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                ชื่อผู้ใช้
              </label>
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้ (a-z, 0-9, -, _)"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
                className="h-12 text-base"
                {...register("username")}
              />
              {errors.username && (
                <p
                  id="username-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                รหัสผ่าน
              </label>
              <Input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-12 text-base"
                {...register("password")}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* First Name (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                ชื่อ
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="กรอกชื่อ"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                className="h-12 text-base"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                นามสกุล
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="กรอกนามสกุล"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                className="h-12 text-base"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                อีเมล
              </label>
              <Input
                id="email"
                type="email"
                placeholder="กรอกอีเมล (ถ้ามี)"
                disabled={isLoading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-12 text-base"
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.email.message}
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
              aria-label="ยืนยันเพิ่มพนักงาน"
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
                "ยืนยันเพิ่มพนักงาน"
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
