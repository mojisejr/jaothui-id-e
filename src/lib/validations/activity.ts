import { z } from "zod";

/**
 * Zod Validation Schema for Activity Management
 * 
 * This schema validates all input fields for creating and managing activity records.
 * It is used by:
 * 1. Frontend form validation (with react-hook-form)
 * 2. Backend API validation (POST /api/activities)
 * 
 * Field definitions match the Prisma Activity model exactly.
 * 
 * @see prisma/schema.prisma - Activity model
 */

/**
 * Complete Activity Schema (includes farmId, animalId, createdBy)
 * Used for API validation where all fields are provided
 */
export const activitySchema = z.object({
  // Required Fields
  
  /**
   * Farm ID - Association with farm
   * UUID format required
   * Auto-populated from authenticated user's farm context
   */
  farmId: z
    .string({ message: "Farm ID ต้องระบุ" })
    .uuid("Farm ID ต้องเป็น UUID"),

  /**
   * Animal ID - Target animal for this activity
   * UUID format required
   * Must belong to the same farm as the activity
   */
  animalId: z
    .string({ message: "Animal ID ต้องระบุ" })
    .uuid("Animal ID ต้องเป็น UUID"),

  /**
   * Title - Brief description of the activity
   * Required field, max 255 characters
   */
  title: z
    .string({ message: "หัวข้อต้องระบุ" })
    .min(1, "หัวข้อต้องระบุ")
    .max(255, "หัวข้อต้องไม่เกิน 255 ตัวอักษร"),

  /**
   * Created By - User ID who created this activity
   * UUID format required
   * Auto-populated from authenticated user's session
   */
  createdBy: z
    .string({ message: "Created By ต้องระบุ" })
    .uuid("Created By ต้องเป็น UUID"),

  // Optional Fields with Constraints

  /**
   * Description - Detailed description of the activity
   * Optional, can be null
   * Free text field for additional context
   */
  description: z.string().optional().nullable(),

  /**
   * Activity Date - When the activity occurred or is scheduled
   * Required field for tracking when work was done
   * Accepts Date object or string that can be coerced to Date
   */
  activityDate: z.coerce.date({ message: "วันที่กิจกรรมต้องระบุ" }),

  /**
   * Due Date - Deadline for completing the activity
   * Optional field for scheduling
   * Accepts Date object or string that can be coerced to Date
   */
  dueDate: z.coerce.date().optional().nullable(),

  /**
   * Status - Current status of the activity
   * Defaults to PENDING if not specified
   * Must be one of: PENDING, COMPLETED, CANCELLED, OVERDUE
   */
  status: z
    .enum(["PENDING", "COMPLETED", "CANCELLED", "OVERDUE"], {
      message: "กรุณาเลือกสถานะ",
    })
    .default("PENDING"),
});

/**
 * Form Input Schema (excludes farmId, createdBy)
 * Used for frontend forms where farmId and createdBy are auto-populated from context
 * This schema focuses only on user-provided fields
 */
export const createActivityFormSchema = activitySchema.omit({
  farmId: true,
  createdBy: true,
});

/**
 * TypeScript type inferred from the complete activity schema
 * Use this for API endpoints and database operations
 */
export type ActivityInput = z.infer<typeof activitySchema>;

/**
 * TypeScript type for form inputs (without farmId and createdBy)
 * Use this for frontend forms where farmId and createdBy come from context
 */
export type CreateActivityFormInput = z.infer<typeof createActivityFormSchema>;

/**
 * Example Usage:
 * 
 * // Frontend Form Validation
 * import { createActivityFormSchema, CreateActivityFormInput } from '@/lib/validations/activity';
 * 
 * const form = useForm<CreateActivityFormInput>({
 *   resolver: zodResolver(createActivityFormSchema),
 * });
 * 
 * // Backend API Validation
 * import { activitySchema, ActivityInput } from '@/lib/validations/activity';
 * 
 * const validatedData = activitySchema.parse({
 *   ...requestBody,
 *   farmId: farm.id,
 *   createdBy: session.user.id,
 * });
 */
