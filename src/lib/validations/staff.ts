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
 * Input Sanitization Utilities
 * Prevents "string pattern does not match" errors by cleaning user input
 */

/**
 * Sanitizes username input by:
 * - Removing leading/trailing whitespace
 * - Removing zero-width characters (IME artifacts, zero-width spaces)
 * - Converting to ASCII-safe characters only
 */
export function sanitizeUsername(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .trim()
    // Remove zero-width characters common in IME and copy-paste
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove any non-ASCII printable characters
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

/**
 * Sanitizes email input by:
 * - Removing leading/trailing whitespace
 * - Converting blank/whitespace-only strings to null
 * - Removing zero-width characters
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  
  const cleaned = input
    .trim()
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  
  // Convert empty string to null
  return cleaned === '' ? null : cleaned;
}

/**
 * Staff Creation Schema
 * Used for creating new staff accounts
 */
export const staffSchema = z.object({
  /**
   * Username - Unique identifier for staff login
   * Must be unique across all users (enforced at database level)
   * Only allows: a-z, A-Z, 0-9, hyphen (-), and underscore (_)
   */
  username: z
    .string({ message: "ชื่อผู้ใช้ต้องระบุ" })
    .min(1, "ชื่อผู้ใช้ต้องระบุ")
    .transform(sanitizeUsername)
    .pipe(
      z
        .string()
        .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
        .max(50, "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร")
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          "อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น"
        )
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
    .max(255, "ชื่อต้องไม่เกิน 255 ตัวอักษร")
    .transform((val) => val.trim()),

  /**
   * Last Name - Staff member's last name
   * Thai or English characters allowed
   */
  lastName: z
    .string({ message: "นามสกุลต้องระบุ" })
    .min(1, "นามสกุลต้องระบุ")
    .max(255, "นามสกุลต้องไม่เกิน 255 ตัวอักษร")
    .transform((val) => val.trim()),

  /**
   * Email - Optional email for staff account
   * Valid email format required if provided
   * Blank or whitespace-only input is converted to null
   */
  email: z
    .string()
    .transform(sanitizeEmail)
    .nullable()
    .refine(
      (val) => {
        // If null or empty, it's valid (optional field)
        if (val === null || val === '') return true;
        // Otherwise, must be valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      },
      { message: "รูปแบบอีเมลไม่ถูกต้อง" }
    )
    .optional(),
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
