"use client";

/**
 * EditAnimalForm Component - Jaothui ID-Trace System
 * 
 * Animal edit form with react-hook-form and Zod validation for updating buffalo information.
 * Displayed in the "แก้ไขข้อมูล" (Edit Information) tab of the animal panel.
 * 
 * Features:
 * - Pre-populated form with existing animal data
 * - Real-time validation with inline error messages
 * - Editable fields only (read-only fields displayed separately)
 * - Mobile-first responsive design (320px minimum)
 * - Elderly-friendly (48px touch targets)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * - Integration with PUT /api/animals/[id] endpoint
 * 
 * Editable Fields:
 * - name, color, weightKg, heightCm, motherTag, fatherTag, genome
 * 
 * Read-Only Fields (displayed but not editable):
 * - tagId, type, gender, birthDate, status
 * 
 * @see Issue #154, Context Issue #150
 * @see /src/lib/validations/animal.ts - Update validation schema
 * @see /src/app/api/animals/[id]/route.ts - PUT endpoint
 */

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAnimalSchema, UpdateAnimalFormInput } from "@/lib/validations/animal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { translateAnimalData } from "@/lib/animal-translations";
import { AnimalType, AnimalGender, AnimalStatus } from "@/types/animal";

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
  weightKg: number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Component Props
 */
export interface EditAnimalFormProps {
  /** Animal data to edit */
  animal: Animal;
  /** Success callback with updated animal data */
  onSuccess?: (animal: any) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** External loading state */
  isLoading?: boolean;
}

export function EditAnimalForm({
  animal,
  onSuccess,
  onCancel,
  isLoading: externalLoading,
}: EditAnimalFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const isLoading = externalLoading || isSubmitting;

  // Convert animal data for display
  const animalForDisplay = React.useMemo(() => ({
    ...animal,
    weightKg: animal.weightKg ? Number(animal.weightKg) : null,
  }), [animal]);

  // Translate animal data using memoized utilities
  const translatedAnimal = React.useMemo(
    () => translateAnimalData(animalForDisplay),
    [animalForDisplay]
  );

  /**
   * Initialize react-hook-form with Zod validation
   * Pre-populate with existing animal data
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateAnimalFormInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: {
      name: animal.name || "",
      color: animal.color || "",
      weightKg: animal.weightKg ? Number(animal.weightKg) : undefined,
      heightCm: animal.heightCm || undefined,
      motherTag: animal.motherTag || "",
      fatherTag: animal.fatherTag || "",
      genome: animal.genome || "",
    },
  });

  /**
   * Form submission handler
   * PUTs data to /api/animals/[id]
   */
  const onSubmit: SubmitHandler<UpdateAnimalFormInput> = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Prepare payload - convert empty strings to null for optional fields
      const payload = {
        name: data.name || null,
        color: data.color || null,
        weightKg: data.weightKg ? Number(data.weightKg) : null,
        heightCm: data.heightCm ? Number(data.heightCm) : null,
        motherTag: data.motherTag || null,
        fatherTag: data.fatherTag || null,
        genome: data.genome || null,
      };

      // PUT to API endpoint
      const response = await fetch(`/api/animals/${animal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "ไม่สามารถอัปเดตข้อมูลกระบือได้"
        );
      }

      const result = await response.json();

      // Call success callback
      onSuccess?.(result.data.animal);
    } catch (err) {
      console.error("Animal update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการอัปเดตข้อมูลกระบือ กรุณาลองใหม่อีกครั้ง"
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
          แก้ไขข้อมูลกระบือ
        </CardTitle>
        <CardDescription className="text-center">
          แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง
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

          {/* Read-Only Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              ข้อมูลที่ไม่สามารถแก้ไขได้
            </h3>

            {/* Tag ID (Read-Only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                🏷️ หมายเลขแท็ก
              </label>
              <div className="p-3 rounded-md bg-muted/30 border border-border text-foreground">
                {animal.tagId}
              </div>
            </div>

            {/* Type (Read-Only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                🏷️ ประเภท
              </label>
              <div className="p-3 rounded-md bg-muted/30 border border-border text-foreground">
                {translatedAnimal.typeTranslated}
              </div>
            </div>

            {/* Gender (Read-Only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                ♂️♀️ เพศ
              </label>
              <div className="p-3 rounded-md bg-muted/30 border border-border text-foreground">
                {translatedAnimal.genderTranslated}
              </div>
            </div>

            {/* Birth Date (Read-Only) */}
            {animal.birthDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  🎂 วันเกิด
                </label>
                <div className="p-3 rounded-md bg-muted/30 border border-border text-foreground">
                  {translatedAnimal.birthDateThai} ({translatedAnimal.ageFormatted})
                </div>
              </div>
            )}
          </div>

          {/* Editable Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              ข้อมูลที่สามารถแก้ไขได้
            </h3>

            {/* Animal Name (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">🐃</span>
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

            {/* Color (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="color"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">🎨</span>
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

            {/* Weight (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="weightKg"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">⚖️</span>
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

            {/* Height (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="heightCm"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">📏</span>
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

            {/* Mother Tag (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="motherTag"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">👩</span>
                หมายเลขแท็กแม่
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

            {/* Father Tag (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="fatherTag"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">👨</span>
                หมายเลขแท็กพ่อ
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

            {/* Genome Information (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="genome"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <span className="text-xl">🧬</span>
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
              aria-label="บันทึกการแก้ไข"
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
                "บันทึกการแก้ไข"
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
