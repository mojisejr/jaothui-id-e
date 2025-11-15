"use client";

/**
 * CreateAnimalForm Component - Jaothui ID-Trace System
 * 
 * Complete animal creation form with react-hook-form and Zod validation.
 * Matches ASCII UI mockup from Issue #79 with 3 main sections.
 * 
 * Features:
 * - Real-time validation with inline error messages
 * - 10 form fields organized in 3 logical sections
 * - Mobile-first responsive design (320px minimum)
 * - Elderly-friendly (44px touch targets)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @see Issue #106, Context Issue #79
 * @see /src/lib/validations/animal.ts - Validation schema
 */

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAnimalFormSchema,
} from "@/lib/validations/animal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";

// Infer the type directly from the schema
type CreateAnimalFormInput = z.infer<typeof createAnimalFormSchema>;

/**
 * Component Props
 */
export interface CreateAnimalFormProps {
  /** Farm ID from session context */
  farmId: string;
  /** Success callback with created animal data */
  onSuccess?: (animal: any) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** External loading state */
  isLoading?: boolean;
}

/**
 * Animal Type Options for dropdown
 */
const ANIMAL_TYPES = [
  { value: "WATER_BUFFALO", label: "กระบือน้ำ" },
  { value: "SWAMP_BUFFALO", label: "กระบือลุ่มน้ำ" },
  { value: "CATTLE", label: "โค" },
  { value: "GOAT", label: "แพะ" },
  { value: "PIG", label: "หมู" },
  { value: "CHICKEN", label: "ไก่" },
] as const;

/**
 * Gender Options for radio buttons
 */
const GENDER_OPTIONS = [
  { value: "MALE", label: "ผู้" },
  { value: "FEMALE", label: "เมีย" },
  { value: "UNKNOWN", label: "ไม่ทราบ" },
] as const;

export function CreateAnimalForm({
  farmId,
  onSuccess,
  onCancel,
  isLoading: externalLoading,
}: CreateAnimalFormProps) {
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
    resolver: zodResolver(createAnimalFormSchema),
    defaultValues: {
      tagId: "",
      type: "WATER_BUFFALO" as const,
      name: null,
      gender: "FEMALE" as const,
      birthDate: undefined,
      color: null,
      weightKg: undefined,
      heightCm: undefined,
      motherTag: null,
      fatherTag: null,
      genome: null,
    },
  });

  /**
   * Form submission handler
   * Posts data to /api/animals with farmId
   */
  const onSubmit: SubmitHandler<CreateAnimalFormInput> = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Add farmId to payload
      const payload = {
        ...data,
        farmId,
        // Convert empty strings to null for optional fields
        name: data.name || null,
        color: data.color || null,
        motherTag: data.motherTag || null,
        fatherTag: data.fatherTag || null,
        genome: data.genome || null,
        // Convert number inputs properly
        weightKg: data.weightKg ? Number(data.weightKg) : null,
        heightCm: data.heightCm ? Number(data.heightCm) : null,
      };

      // POST to API endpoint
      const response = await fetch("/api/animals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "ไม่สามารถเพิ่มข้อมูลกระบือได้"
        );
      }

      const result = await response.json();

      // Reset form on success
      reset();

      // Call success callback
      onSuccess?.(result.data.animal);
    } catch (err) {
      console.error("Animal creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเพิ่มข้อมูลกระบือ กรุณาลองใหม่อีกครั้ง"
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
          เพิ่มข้อมูลกระบือในระบบ
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

          {/* Section 1: ข้อมูลกระบือ (Basic Information) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              ข้อมูลกระบือ
            </h3>

            {/* Tag ID (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="tagId"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                หมายเลขแท็ก
              </label>
              <Input
                id="tagId"
                type="text"
                placeholder="กรอกหมายเลขแท็ก"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.tagId}
                aria-describedby={errors.tagId ? "tagId-error" : undefined}
                className="h-12 text-base"
                {...register("tagId")}
              />
              {errors.tagId && (
                <p
                  id="tagId-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.tagId.message}
                </p>
              )}
            </div>

            {/* Animal Name (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                ชื่อกระบือ
              </label>
              <Input
                id="name"
                type="text"
                placeholder="กรอกชื่อกระบือ (ถ้ามี)"
                disabled={isLoading}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="h-12 text-base"
                {...register("name")}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Animal Type (Required) */}
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-destructive">*</span>
                ประเภทสัตว์
              </label>
              <select
                id="type"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "type-error" : undefined}
                className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("type")}
              >
                {ANIMAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p
                  id="type-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Color (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="color"
                className="text-sm font-medium text-foreground"
              >
                สี
              </label>
              <Input
                id="color"
                type="text"
                placeholder="กรอกสีของกระบือ"
                disabled={isLoading}
                aria-invalid={!!errors.color}
                aria-describedby={errors.color ? "color-error" : undefined}
                className="h-12 text-base"
                {...register("color")}
              />
              {errors.color && (
                <p
                  id="color-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.color.message}
                </p>
              )}
            </div>

            {/* Birth Date (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="birthDate"
                className="text-sm font-medium text-foreground"
              >
                วันเดือนปีเกิด
              </label>
              <Input
                id="birthDate"
                type="date"
                disabled={isLoading}
                aria-invalid={!!errors.birthDate}
                aria-describedby={
                  errors.birthDate ? "birthDate-error" : undefined
                }
                className="h-12 text-base"
                {...register("birthDate")}
              />
              {errors.birthDate && (
                <p
                  id="birthDate-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            {/* Weight (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="weightKg"
                className="text-sm font-medium text-foreground"
              >
                น้ำหนัก (กก.)
              </label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                placeholder="กรอกน้ำหนักเป็นกิโลกรัม"
                disabled={isLoading}
                aria-invalid={!!errors.weightKg}
                aria-describedby={
                  errors.weightKg ? "weightKg-error" : undefined
                }
                className="h-12 text-base"
                {...register("weightKg", { valueAsNumber: true })}
              />
              {errors.weightKg && (
                <p
                  id="weightKg-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.weightKg.message}
                </p>
              )}
            </div>

            {/* Height (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="heightCm"
                className="text-sm font-medium text-foreground"
              >
                ส่วนสูง (ซม.)
              </label>
              <Input
                id="heightCm"
                type="number"
                placeholder="กรอกส่วนสูงเป็นเซนติเมตร"
                disabled={isLoading}
                aria-invalid={!!errors.heightCm}
                aria-describedby={
                  errors.heightCm ? "heightCm-error" : undefined
                }
                className="h-12 text-base"
                {...register("heightCm", { valueAsNumber: true })}
              />
              {errors.heightCm && (
                <p
                  id="heightCm-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.heightCm.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: เพศกระบือ (Gender) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              เพศกระบือ
            </h3>

            <div className="space-y-2">
              <div
                role="radiogroup"
                aria-label="เพศกระบือ"
                className="flex flex-wrap gap-4"
              >
                {GENDER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      disabled={isLoading}
                      className="w-5 h-5 text-primary border-border focus:ring-2 focus:ring-primary cursor-pointer"
                      {...register("gender")}
                    />
                    <span className="text-base text-foreground">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: พันธุกรรม (Genetics) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              พันธุกรรม
            </h3>

            {/* Mother Tag (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="motherTag"
                className="text-sm font-medium text-foreground"
              >
                ชื่อแม่พันธุ์
              </label>
              <Input
                id="motherTag"
                type="text"
                placeholder="กรอกหมายเลขแท็กของแม่"
                disabled={isLoading}
                aria-invalid={!!errors.motherTag}
                aria-describedby={
                  errors.motherTag ? "motherTag-error" : undefined
                }
                className="h-12 text-base"
                {...register("motherTag")}
              />
              {errors.motherTag && (
                <p
                  id="motherTag-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.motherTag.message}
                </p>
              )}
            </div>

            {/* Father Tag (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="fatherTag"
                className="text-sm font-medium text-foreground"
              >
                ชื่อพ่อพันธุ์
              </label>
              <Input
                id="fatherTag"
                type="text"
                placeholder="กรอกหมายเลขแท็กของพ่อ"
                disabled={isLoading}
                aria-invalid={!!errors.fatherTag}
                aria-describedby={
                  errors.fatherTag ? "fatherTag-error" : undefined
                }
                className="h-12 text-base"
                {...register("fatherTag")}
              />
              {errors.fatherTag && (
                <p
                  id="fatherTag-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.fatherTag.message}
                </p>
              )}
            </div>

            {/* Genome Information (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="genome"
                className="text-sm font-medium text-foreground"
              >
                ข้อมูลจีโนม
              </label>
              <Input
                id="genome"
                type="text"
                placeholder="กรอกข้อมูลจีโนม (ถ้ามี)"
                disabled={isLoading}
                aria-invalid={!!errors.genome}
                aria-describedby={errors.genome ? "genome-error" : undefined}
                className="h-12 text-base"
                {...register("genome")}
              />
              {errors.genome && (
                <p
                  id="genome-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.genome.message}
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
              aria-label="ยืนยันเพิ่มกระบือ"
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
                "ยืนยันเพิ่มกระบือ"
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
