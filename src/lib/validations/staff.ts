import { z } from "zod";

/**
 * Zod Validation Schema for Staff Creation
 * 
 * This schema validates all input fields for creating a staff account.
 * It is used by:
 * 1. Frontend form validation (with react-hook-form)
 * 2. Backend API validation (POST /api/users/staff)
 * 
 * Field definitions match the API requirements and User model.
 * 
 * @see /src/app/api/users/staff/route.ts - API endpoint
 * @see prisma/schema.prisma - User model
 */

/**
 * Staff Creation Schema
 * Used for creating new staff accounts
 */
export const staffSchema = z.object({
  /**
   * Username - Unique identifier for staff login
   * Must be unique across all users (enforced at database level)
   */
  username: z
    .string({ message: "ชื่อผู้ใช้ต้องระบุ" })
    .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(50, "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข - หรือ _ เท่านั้น"
    ),

  /**
   * Password - Secure password for authentication
   * Will be hashed using Argon2 before storage
   */
  password: z
    .string({ message: "รหัสผ่านต้องระบุ" })
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร"),

  /**
   * First Name - Staff member's first name
   * Thai or English characters allowed
   */
  firstName: z
    .string({ message: "ชื่อต้องระบุ" })
    .min(1, "ชื่อต้องระบุ")
    .max(255, "ชื่อต้องไม่เกิน 255 ตัวอักษร"),

  /**
   * Last Name - Staff member's last name
   * Thai or English characters allowed
   */
  lastName: z
    .string({ message: "นามสกุลต้องระบุ" })
    .min(1, "นามสกุลต้องระบุ")
    .max(255, "นามสกุลต้องไม่เกิน 255 ตัวอักษร"),

  /**
   * Email - Optional email for staff account
   * Valid email format required if provided
   */
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .optional()
    .nullable(),
});

/**
 * TypeScript type inferred from the staff schema
 * Use this for form inputs and API operations
 */
export type StaffInput = z.infer<typeof staffSchema>;

/**
 * Example Usage:
 * 
 * // Frontend Form Validation
 * import { staffSchema, StaffInput } from '@/lib/validations/staff';
 * 
 * const form = useForm<StaffInput>({
 *   resolver: zodResolver(staffSchema),
 * });
 * 
 * // Backend API Validation
 * import { staffSchema, StaffInput } from '@/lib/validations/staff';
 * 
 * const validatedData = staffSchema.parse(requestBody);
 */
