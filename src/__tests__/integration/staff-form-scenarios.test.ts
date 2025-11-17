/**
 * Staff Form Integration Tests - Real-World Scenarios
 * 
 * Tests that validate the complete flow from user input to API submission,
 * demonstrating how the form handles various edge cases in practice.
 * 
 * @see /src/components/staff/CreateStaffForm.tsx
 * @see /src/lib/validations/staff.ts
 */

import { staffSchema } from "@/lib/validations/staff";

describe("Staff Form - Real-World Integration Scenarios", () => {
  describe("Scenario 1: Valid staff creation with email", () => {
    it("should accept clean input with all fields", () => {
      const formData = {
        username: "staff_001",
        password: "securePass123",
        firstName: "สมชาย",
        lastName: "ใจดี",
        email: "somchai@example.com",
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_001");
      expect(result.email).toBe("somchai@example.com");
      expect(result.firstName).toBe("สมชาย");
      expect(result.lastName).toBe("ใจดี");
    });
  });

  describe("Scenario 2: Staff creation without email (truly optional)", () => {
    it("should accept form submission with no email field", () => {
      const formData = {
        username: "staff_002",
        password: "securePass123",
        firstName: "มานี",
        lastName: "รักษา",
        // email field omitted
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_002");
      expect(result.email).toBeUndefined();
    });

    it("should accept form submission with empty email string", () => {
      const formData = {
        username: "staff_003",
        password: "securePass123",
        firstName: "สมศรี",
        lastName: "ดีงาม",
        email: "", // Empty string from form input
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_003");
      expect(result.email).toBeNull(); // Converted to null
    });

    it("should accept form submission with whitespace-only email", () => {
      const formData = {
        username: "staff_004",
        password: "securePass123",
        firstName: "นิด",
        lastName: "น้อย",
        email: "   ", // User left field with spaces
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_004");
      expect(result.email).toBeNull(); // Converted to null
    });
  });

  describe("Scenario 3: Mobile user with copy-paste issues", () => {
    it("should handle username copied from mobile with hidden characters", () => {
      const formData = {
        username: "\u200Bstaff\u200B_\u200B005\uFEFF", // Mobile copy-paste artifacts
        password: "securePass123",
        firstName: "สมบูรณ์",
        lastName: "ทองดี",
        email: "somboon@example.com",
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_005"); // Clean username
      expect(result.email).toBe("somboon@example.com");
    });

    it("should handle email copied with extra whitespace", () => {
      const formData = {
        username: "staff_006",
        password: "securePass123",
        firstName: "ประเสริฐ",
        lastName: "มั่นคง",
        email: "  prasert@example.com  ", // Whitespace from copy-paste
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_006");
      expect(result.email).toBe("prasert@example.com"); // Trimmed
    });
  });

  describe("Scenario 4: Thai user with IME input", () => {
    it("should handle username with accidentally typed Thai characters", () => {
      const formData = {
        username: "staffผู้ใช้_007", // Mixed Thai-English from IME
        password: "securePass123",
        firstName: "วิชัย",
        lastName: "สุขสันต์",
        email: null,
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("staff_007"); // Thai chars removed
      expect(result.email).toBeNull();
    });

    it("should handle Thai user entering valid English username", () => {
      const formData = {
        username: "  STAFF_008  ", // Extra spaces from Thai keyboard
        password: "securePass123",
        firstName: "สุรชัย",
        lastName: "พรหมแก้ว",
        email: "",
      };

      const result = staffSchema.parse(formData);

      expect(result.username).toBe("STAFF_008"); // Uppercase preserved, spaces trimmed
      expect(result.email).toBeNull();
    });
  });

  describe("Scenario 5: User mistakes and corrections", () => {
    it("should reject username with special characters and show Thai error", () => {
      const formData = {
        username: "staff@#$",
        password: "securePass123",
        firstName: "Test",
        lastName: "User",
      };

      try {
        staffSchema.parse(formData);
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "อนุญาตเฉพาะ a-z, A-Z, 0-9, -, _ เท่านั้น"
        );
        // Verify error message is user-friendly
        expect(error.issues[0].message).not.toContain("regex");
        expect(error.issues[0].message).not.toContain("/^");
      }
    });

    it("should reject invalid email and show Thai error", () => {
      const formData = {
        username: "staff_009",
        password: "securePass123",
        firstName: "Test",
        lastName: "User",
        email: "invalid-email",
      };

      try {
        staffSchema.parse(formData);
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
      }
    });

    it("should reject username that's too short after sanitization", () => {
      const formData = {
        username: "ab", // Only 2 characters
        password: "securePass123",
        firstName: "Test",
        lastName: "User",
      };

      try {
        staffSchema.parse(formData);
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"
        );
      }
    });
  });

  describe("Scenario 6: Edge case - All Thai username becomes empty", () => {
    it("should reject username that becomes empty after sanitization", () => {
      const formData = {
        username: "ผู้ใช้งาน", // All Thai characters
        password: "securePass123",
        firstName: "Test",
        lastName: "User",
      };

      try {
        staffSchema.parse(formData);
        fail("Should have thrown validation error");
      } catch (error: any) {
        // After sanitization, username becomes empty, fails min length
        expect(error.issues[0].message).toContain("ชื่อผู้ใช้");
      }
    });
  });

  describe("Scenario 7: Mixed valid and invalid fields", () => {
    it("should show multiple validation errors clearly", () => {
      const formData = {
        username: "ab", // Too short
        password: "123", // Too short
        firstName: "", // Empty
        lastName: "User",
        email: "invalid", // Invalid format
      };

      try {
        staffSchema.parse(formData);
        fail("Should have thrown validation error");
      } catch (error: any) {
        // Should have multiple errors
        expect(error.issues.length).toBeGreaterThan(1);
        
        // All errors should be in Thai
        error.issues.forEach((issue: any) => {
          expect(issue.message).toMatch(/[ก-๙]/); // Contains Thai characters
        });
      }
    });
  });

  describe("Scenario 8: API request payload preparation", () => {
    it("should prepare correct payload for API submission with email", () => {
      const formData = {
        username: "  staff_010  ",
        password: "securePass123",
        firstName: "  สมชาย  ",
        lastName: "  ใจดี  ",
        email: "  somchai@example.com  ",
      };

      const result = staffSchema.parse(formData);

      // Verify sanitized data ready for API
      const apiPayload = {
        username: result.username,
        password: result.password,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      };

      expect(apiPayload).toEqual({
        username: "staff_010",
        password: "securePass123",
        firstName: "สมชาย",
        lastName: "ใจดี",
        email: "somchai@example.com",
      });
    });

    it("should prepare correct payload for API submission without email", () => {
      const formData = {
        username: "staff_011",
        password: "securePass123",
        firstName: "มานี",
        lastName: "รักษา",
        email: "   ", // Whitespace only
      };

      const result = staffSchema.parse(formData);

      const apiPayload = {
        username: result.username,
        password: result.password,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
      };

      expect(apiPayload).toEqual({
        username: "staff_011",
        password: "securePass123",
        firstName: "มานี",
        lastName: "รักษา",
        email: null, // Properly converted to null
      });
    });
  });
});
