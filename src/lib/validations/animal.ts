import { z } from "zod";

/**
 * Zod Validation Schema for Animal Creation
 * 
 * This schema validates all input fields for creating an animal record.
 * It is used by:
 * 1. Frontend form validation (with react-hook-form)
 * 2. Backend API validation (POST /api/animals)
 * 
 * Field definitions match the Prisma Animal model exactly.
 * 
 * @see prisma/schema.prisma - Animal model
 */

/**
 * Complete Animal Schema (includes farmId)
 * Used for API validation where farmId is provided
 */
export const animalSchema = z.object({
  // Required Fields
  
  /**
   * Tag ID - Unique identifier within the farm
   * Must be unique per farm (enforced at database level)
   */
  tagId: z
    .string({ message: "หมายเลขแท็กต้องระบุ" })
    .min(1, "หมายเลขแท็กต้องระบุ")
    .max(255, "หมายเลขแท็กต้องไม่เกิน 255 ตัวอักษร"),

  /**
   * Animal Type - Species classification
   * Must be one of the predefined types
   */
  type: z.enum(
    [
      "WATER_BUFFALO",
      "SWAMP_BUFFALO",
      "CATTLE",
      "GOAT",
      "PIG",
      "CHICKEN",
    ],
    { message: "กรุณาเลือกประเภทสัตว์" }
  ),

  /**
   * Farm ID - Association with farm
   * UUID format required
   */
  farmId: z
    .string({ message: "Farm ID ต้องระบุ" })
    .uuid("Farm ID ต้องเป็น UUID"),

  // Optional Fields with Constraints

  /**
   * Animal Name - Friendly name for the animal
   * Optional, can be null
   */
  name: z
    .string()
    .max(255, "ชื่อกระบือต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Gender - Male, Female, or Unknown
   * Defaults to FEMALE if not specified
   */
  gender: z
    .enum(["MALE", "FEMALE", "UNKNOWN"], { message: "กรุณาเลือกเพศ" })
    .default("FEMALE"),

  /**
   * Birth Date - When the animal was born
   * Accepts Date object or string that can be coerced to Date
   */
  birthDate: z.coerce.date().optional().nullable(),

  /**
   * Color - Physical description of the animal's color
   * Free text field, optional
   */
  color: z
    .string()
    .max(255, "สีต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Weight in Kilograms - Must be positive number
   * Stored as Decimal(8,2) in database
   */
  weightKg: z
    .number({ message: "น้ำหนักต้องเป็นตัวเลข" })
    .positive("น้ำหนักต้องมากกว่า 0")
    .optional()
    .nullable(),

  /**
   * Height in Centimeters - Must be positive integer
   * Stored as Int in database
   */
  heightCm: z
    .number({ message: "ส่วนสูงต้องเป็นตัวเลข" })
    .int("ส่วนสูงต้องเป็นจำนวนเต็ม")
    .positive("ส่วนสูงต้องมากกว่า 0")
    .optional()
    .nullable(),

  /**
   * Mother's Tag ID - Reference to mother animal
   * Should match another animal's tagId in the same farm
   */
  motherTag: z
    .string()
    .max(255, "หมายเลขแม่ต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Father's Tag ID - Reference to father animal
   * Should match another animal's tagId in the same farm
   */
  fatherTag: z
    .string()
    .max(255, "หมายเลขพ่อต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Genome Information - Genetic data or notes
   * Free text field for any genetic information
   */
  genome: z.string().optional().nullable(),
});

/**
 * Form Input Schema (excludes farmId)
 * Used for frontend forms where farmId is auto-populated from context
 */
export const createAnimalFormSchema = animalSchema.omit({ farmId: true });

/**
 * Update Animal Schema
 * Used for updating existing animal records (PUT /api/animals/[id])
 * 
 * Editable Fields:
 * - name, color, weightKg, heightCm, motherTag, fatherTag, genome
 * 
 * Read-Only Fields (cannot be updated after creation):
 * - tagId, type, gender, birthDate, status, farmId
 */
export const updateAnimalSchema = z.object({
  /**
   * Animal Name - Friendly name for the animal
   * Optional, can be null
   */
  name: z
    .string()
    .max(255, "ชื่อกระบือต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Color - Physical description of the animal's color
   * Free text field, optional
   */
  color: z
    .string()
    .max(255, "สีต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Weight in Kilograms - Must be positive number
   * Stored as Decimal(8,2) in database
   */
  weightKg: z
    .number({ message: "น้ำหนักต้องเป็นตัวเลข" })
    .positive("น้ำหนักต้องมากกว่า 0")
    .optional()
    .nullable(),

  /**
   * Height in Centimeters - Must be positive integer
   * Stored as Int in database
   */
  heightCm: z
    .number({ message: "ส่วนสูงต้องเป็นตัวเลข" })
    .int("ส่วนสูงต้องเป็นจำนวนเต็ม")
    .positive("ส่วนสูงต้องมากกว่า 0")
    .optional()
    .nullable(),

  /**
   * Mother's Tag ID - Reference to mother animal
   * Should match another animal's tagId in the same farm
   */
  motherTag: z
    .string()
    .max(255, "หมายเลขแม่ต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Father's Tag ID - Reference to father animal
   * Should match another animal's tagId in the same farm
   */
  fatherTag: z
    .string()
    .max(255, "หมายเลขพ่อต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable(),

  /**
   * Genome Information - Genetic data or notes
   * Free text field for any genetic information
   */
  genome: z.string().optional().nullable(),
});

/**
 * TypeScript type inferred from the complete animal schema
 * Use this for API endpoints and database operations
 */
export type AnimalInput = z.infer<typeof animalSchema>;

/**
 * TypeScript type for form inputs (without farmId)
 * Use this for frontend forms where farmId comes from context
 */
export type CreateAnimalFormInput = z.infer<typeof createAnimalFormSchema>;

/**
 * TypeScript type for update form inputs
 * Use this for EditAnimalForm component
 */
export type UpdateAnimalFormInput = z.infer<typeof updateAnimalSchema>;

/**
 * Example Usage:
 * 
 * // Frontend Form Validation
 * import { createAnimalFormSchema, CreateAnimalFormInput } from '@/lib/validations/animal';
 * 
 * const form = useForm<CreateAnimalFormInput>({
 *   resolver: zodResolver(createAnimalFormSchema),
 * });
 * 
 * // Backend API Validation
 * import { animalSchema, AnimalInput } from '@/lib/validations/animal';
 * 
 * const validatedData = animalSchema.parse(requestBody);
 */
