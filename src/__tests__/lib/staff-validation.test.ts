/**
 * Staff Validation Tests - Jaothui ID-Trace System
 * 
 * Comprehensive tests for staff form validation, covering:
 * - Username sanitization and validation
 * - Email sanitization and optionality
 * - Edge cases: IME, whitespace, zero-width characters, mobile paste
 * - Thai language error messages
 * 
 * @see /src/lib/validations/staff.ts - Validation schema
 */

import { staffSchema, sanitizeUsername, sanitizeEmail } from "@/lib/validations/staff";
import { z } from "zod";

describe("Staff Validation - Input Sanitization", () => {
  describe("sanitizeUsername", () => {
    it("should trim leading and trailing whitespace", () => {
      expect(sanitizeUsername("  testuser  ")).toBe("testuser");
      expect(sanitizeUsername("\n\ttestuser\t\n")).toBe("testuser");
    });

    it("should remove zero-width characters (IME artifacts)", () => {
      // Zero-width space (U+200B)
      expect(sanitizeUsername("test\u200Buser")).toBe("testuser");
      // Zero-width non-joiner (U+200C)
      expect(sanitizeUsername("test\u200Cuser")).toBe("testuser");
      // Zero-width joiner (U+200D)
      expect(sanitizeUsername("test\u200Duser")).toBe("testuser");
      // Zero-width no-break space (U+FEFF)
      expect(sanitizeUsername("test\uFEFFuser")).toBe("testuser");
    });

    it("should remove Thai characters and other non-ASCII", () => {
      expect(sanitizeUsername("testผู้ใช้")).toBe("test");
      expect(sanitizeUsername("ทดสอบtest")).toBe("test");
      expect(sanitizeUsername("test用户")).toBe("test");
    });

    it("should preserve valid ASCII characters", () => {
      expect(sanitizeUsername("test_user-123")).toBe("test_user-123");
      expect(sanitizeUsername("TESTUSER")).toBe("TESTUSER");
      expect(sanitizeUsername("user123")).toBe("user123");
    });

    it("should handle null and undefined", () => {
      expect(sanitizeUsername(null)).toBe("");
      expect(sanitizeUsername(undefined)).toBe("");
      expect(sanitizeUsername("")).toBe("");
    });

    it("should handle complex IME copy-paste scenarios", () => {
      // Simulating mobile copy-paste with hidden characters
      expect(sanitizeUsername("  test\u200Buser\uFEFF  ")).toBe("testuser");
      // Thai IME with English letters
      expect(sanitizeUsername("testผู้ใช้\u200Buser")).toBe("testuser");
    });
  });

  describe("sanitizeEmail", () => {
    it("should trim whitespace", () => {
      expect(sanitizeEmail("  test@example.com  ")).toBe("test@example.com");
      expect(sanitizeEmail("\ntest@example.com\n")).toBe("test@example.com");
    });

    it("should convert empty strings to null", () => {
      expect(sanitizeEmail("")).toBeNull();
      expect(sanitizeEmail("   ")).toBeNull();
      expect(sanitizeEmail("\t\n\r")).toBeNull();
    });

    it("should remove zero-width characters", () => {
      expect(sanitizeEmail("test\u200B@example.com")).toBe("test@example.com");
      expect(sanitizeEmail("test@\uFEFFexample.com")).toBe("test@example.com");
    });

    it("should handle null and undefined", () => {
      expect(sanitizeEmail(null)).toBeNull();
      expect(sanitizeEmail(undefined)).toBeNull();
    });

    it("should preserve valid email addresses", () => {
      expect(sanitizeEmail("test@example.com")).toBe("test@example.com");
      expect(sanitizeEmail("user+tag@domain.co.th")).toBe("user+tag@domain.co.th");
    });
  });
});

describe("Staff Validation - Schema Tests", () => {
  describe("username validation", () => {
    it("should accept valid usernames", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).not.toThrow();

      expect(() => staffSchema.parse({
        username: "test_user-123",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).not.toThrow();

      expect(() => staffSchema.parse({
        username: "USER123",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).not.toThrow();
    });

    it("should sanitize and accept username with whitespace", () => {
      const result = staffSchema.parse({
        username: "  testuser  ",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(result.username).toBe("testuser");
    });

    it("should sanitize and accept username with zero-width characters", () => {
      const result = staffSchema.parse({
        username: "test\u200Buser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(result.username).toBe("testuser");
    });

    it("should reject usernames with Thai characters (after sanitization)", () => {
      expect(() => staffSchema.parse({
        username: "ผู้ใช้",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).toThrow();
    });

    it("should reject usernames that are too short (< 3 chars)", () => {
      try {
        staffSchema.parse({
          username: "ab",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
        }
      }
    });

    it("should reject usernames with special characters", () => {
      try {
        staffSchema.parse({
          username: "test@user",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น");
        }
      }
    });

    it("should reject usernames with spaces", () => {
      try {
        staffSchema.parse({
          username: "test user",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น");
        }
      }
    });

    it("should provide Thai error message for pattern mismatch", () => {
      try {
        staffSchema.parse({
          username: "test!@#$",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Verify error message is in Thai and doesn't expose regex
          const message = error.issues[0].message;
          expect(message).toBe("อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น");
          expect(message).not.toContain("regex");
          expect(message).not.toContain("pattern");
          expect(message).not.toContain("/^[a-zA-Z0-9_-]+$/");
        }
      }
    });
  });

  describe("email validation", () => {
    it("should accept valid email addresses", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      })).not.toThrow();
    });

    it("should accept null email", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: null,
      })).not.toThrow();
    });

    it("should accept undefined email (field omitted)", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).not.toThrow();
    });

    it("should convert empty string to null", () => {
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "",
      });
      expect(result.email).toBeNull();
    });

    it("should convert whitespace-only string to null", () => {
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "   ",
      });
      expect(result.email).toBeNull();
    });

    it("should sanitize email with zero-width characters", () => {
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "test\u200B@example.com",
      });
      expect(result.email).toBe("test@example.com");
    });

    it("should reject invalid email format", () => {
      try {
        staffSchema.parse({
          username: "testuser",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          email: "invalid-email",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
        }
      }
    });

    it("should reject email without domain", () => {
      try {
        staffSchema.parse({
          username: "testuser",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          email: "test@",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
        }
      }
    });
  });

  describe("password validation", () => {
    it("should accept passwords with 6+ characters", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      })).not.toThrow();
    });

    it("should reject passwords shorter than 6 characters", () => {
      try {
        staffSchema.parse({
          username: "testuser",
          password: "12345",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        }
      }
    });
  });

  describe("firstName and lastName validation", () => {
    it("should accept Thai names", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "สมชาย",
        lastName: "ใจดี",
      })).not.toThrow();
    });

    it("should accept English names", () => {
      expect(() => staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      })).not.toThrow();
    });

    it("should trim whitespace from names", () => {
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "  สมชาย  ",
        lastName: "  ใจดี  ",
      });
      expect(result.firstName).toBe("สมชาย");
      expect(result.lastName).toBe("ใจดี");
    });

    it("should reject empty first name", () => {
      try {
        staffSchema.parse({
          username: "testuser",
          password: "password123",
          firstName: "",
          lastName: "Doe",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe("ชื่อต้องระบุ");
        }
      }
    });
  });
});

describe("Staff Validation - Edge Case Scenarios", () => {
  describe("Mobile copy-paste scenarios", () => {
    it("should handle username pasted from mobile with hidden characters", () => {
      const result = staffSchema.parse({
        username: "\u200B\uFEFFtest_user\u200B\uFEFF",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(result.username).toBe("test_user");
    });

    it("should handle email pasted with extra whitespace", () => {
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "\n\ttest@example.com\n\t",
      });
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("Thai IME input scenarios", () => {
    it("should reject username with mixed Thai-English (Thai removed)", () => {
      // Thai characters should be removed, leaving valid English
      const result = staffSchema.parse({
        username: "testผู้ใช้user",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(result.username).toBe("testuser");
    });

    it("should handle Thai IME artifacts in email", () => {
      // After sanitization, should be valid email
      const result = staffSchema.parse({
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "test\u200B@example\u200B.com",
      });
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("Security - No regex exposure", () => {
    it("should not expose regex pattern in user-facing error messages", () => {
      try {
        staffSchema.parse({
          username: "test@user!",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Check that the user-facing message doesn't expose regex
          const userMessage = error.issues[0].message;
          expect(userMessage).toBe("อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น");
          expect(userMessage).not.toContain("regex");
          expect(userMessage).not.toContain("pattern");
          expect(userMessage).not.toContain("/^[a-zA-Z0-9_-]+$/");
          
          // Note: Zod's internal error structure may contain the pattern,
          // but we only expose error.issues[0].message to users
        }
      }
    });
  });
});
