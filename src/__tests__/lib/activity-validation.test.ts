/**
 * Activity Validation Schema Tests - Jaothui ID-Trace System
 * 
 * Comprehensive tests for activity validation schemas with Zod.
 * 
 * Tests cover:
 * - Complete activity schema validation (with farmId, createdBy)
 * - Form schema validation (without auto-populated fields)
 * - Required field validation
 * - Optional field validation
 * - Type coercion for dates
 * - Thai error messages
 * - TypeScript type inference
 */

import { describe, it, expect } from '@jest/globals';
import {
  activitySchema,
  createActivityFormSchema,
  ActivityInput,
  CreateActivityFormInput,
} from '../../lib/validations/activity';
import { z } from 'zod';

describe('Activity Validation Schema', () => {
  describe('activitySchema (Complete API Schema)', () => {
    it('should validate complete valid activity data', () => {
      const validData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ให้อาหาร',
        description: 'ให้อาหารเช้า 2 กิโลกรัม',
        activityDate: new Date('2023-11-15'),
        dueDate: new Date('2023-11-15'),
        status: 'PENDING' as const,
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = activitySchema.parse(validData);

      expect(result.farmId).toBe(validData.farmId);
      expect(result.animalId).toBe(validData.animalId);
      expect(result.title).toBe(validData.title);
      expect(result.description).toBe(validData.description);
      expect(result.activityDate).toEqual(validData.activityDate);
      expect(result.dueDate).toEqual(validData.dueDate);
      expect(result.status).toBe(validData.status);
      expect(result.createdBy).toBe(validData.createdBy);
    });

    it('should validate activity data with minimal required fields', () => {
      const minimalData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ตรวจสุขภาพ',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = activitySchema.parse(minimalData);

      expect(result.farmId).toBe(minimalData.farmId);
      expect(result.animalId).toBe(minimalData.animalId);
      expect(result.title).toBe(minimalData.title);
      expect(result.activityDate).toEqual(minimalData.activityDate);
      expect(result.createdBy).toBe(minimalData.createdBy);
      expect(result.status).toBe('PENDING'); // Default value
    });

    it('should coerce date strings to Date objects', () => {
      const dataWithStrings = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ให้วัคซีน',
        activityDate: '2023-11-15',
        dueDate: '2023-11-16',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = activitySchema.parse(dataWithStrings);

      expect(result.activityDate).toBeInstanceOf(Date);
      expect(result.dueDate).toBeInstanceOf(Date);
    });

    it('should accept all valid status values', () => {
      const statuses: Array<'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'> = [
        'PENDING',
        'COMPLETED',
        'CANCELLED',
        'OVERDUE',
      ];

      statuses.forEach((status) => {
        const data = {
          farmId: '550e8400-e29b-41d4-a716-446655440000',
          animalId: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Test Activity',
          activityDate: new Date('2023-11-15'),
          status,
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
        };

        const result = activitySchema.parse(data);
        expect(result.status).toBe(status);
      });
    });

    it('should accept null for optional fields', () => {
      const dataWithNulls = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        description: null,
        activityDate: new Date('2023-11-15'),
        dueDate: null,
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = activitySchema.parse(dataWithNulls);

      expect(result.description).toBeNull();
      expect(result.dueDate).toBeNull();
    });

    it('should reject missing farmId with Thai error message', () => {
      const invalidData = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const farmIdError = error.issues.find(issue => issue.path.includes('farmId'));
          expect(farmIdError?.message).toContain('Farm ID ต้องระบุ');
        }
      }
    });

    it('should reject invalid UUID format for farmId', () => {
      const invalidData = {
        farmId: 'invalid-uuid',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const farmIdError = error.issues.find(issue => issue.path.includes('farmId'));
          expect(farmIdError?.message).toContain('UUID');
        }
      }
    });

    it('should reject missing animalId with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const animalIdError = error.issues.find(issue => issue.path.includes('animalId'));
          expect(animalIdError?.message).toContain('Animal ID ต้องระบุ');
        }
      }
    });

    it('should reject invalid UUID format for animalId', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: 'not-a-uuid',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const animalIdError = error.issues.find(issue => issue.path.includes('animalId'));
          expect(animalIdError?.message).toContain('UUID');
        }
      }
    });

    it('should reject missing title with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const titleError = error.issues.find(issue => issue.path.includes('title'));
          expect(titleError?.message).toContain('หัวข้อต้องระบุ');
        }
      }
    });

    it('should reject empty title with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: '',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const titleError = error.issues.find(issue => issue.path.includes('title'));
          expect(titleError?.message).toContain('หัวข้อต้องระบุ');
        }
      }
    });

    it('should reject title longer than 255 characters', () => {
      const longTitle = 'ก'.repeat(256);
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: longTitle,
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const titleError = error.issues.find(issue => issue.path.includes('title'));
          expect(titleError?.message).toContain('255');
        }
      }
    });

    it('should reject missing activityDate with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const dateError = error.issues.find(issue => issue.path.includes('activityDate'));
          expect(dateError?.message).toContain('วันที่กิจกรรมต้องระบุ');
        }
      }
    });

    it('should reject invalid status value with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        status: 'INVALID_STATUS',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const statusError = error.issues.find(issue => issue.path.includes('status'));
          expect(statusError?.message).toContain('กรุณาเลือกสถานะ');
        }
      }
    });

    it('should reject missing createdBy with Thai error message', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const createdByError = error.issues.find(issue => issue.path.includes('createdBy'));
          expect(createdByError?.message).toContain('Created By ต้องระบุ');
        }
      }
    });

    it('should reject invalid UUID format for createdBy', () => {
      const invalidData = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test Activity',
        activityDate: new Date('2023-11-15'),
        createdBy: 'invalid-uuid',
      };

      expect(() => activitySchema.parse(invalidData)).toThrow();
      
      try {
        activitySchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const createdByError = error.issues.find(issue => issue.path.includes('createdBy'));
          expect(createdByError?.message).toContain('UUID');
        }
      }
    });
  });

  describe('createActivityFormSchema (Frontend Form Schema)', () => {
    it('should validate form data without farmId and createdBy', () => {
      const formData = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ให้อาหาร',
        description: 'ให้อาหารเช้า',
        activityDate: new Date('2023-11-15'),
        dueDate: new Date('2023-11-15'),
        status: 'PENDING' as const,
      };

      const result = createActivityFormSchema.parse(formData);

      expect(result.animalId).toBe(formData.animalId);
      expect(result.title).toBe(formData.title);
      expect(result.description).toBe(formData.description);
      expect(result.activityDate).toEqual(formData.activityDate);
      expect(result.dueDate).toEqual(formData.dueDate);
      expect(result.status).toBe(formData.status);
    });

    it('should validate minimal form data', () => {
      const minimalFormData = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        activityDate: new Date('2023-11-15'),
      };

      const result = createActivityFormSchema.parse(minimalFormData);

      expect(result.animalId).toBe(minimalFormData.animalId);
      expect(result.title).toBe(minimalFormData.title);
      expect(result.activityDate).toEqual(minimalFormData.activityDate);
      expect(result.status).toBe('PENDING'); // Default
    });

    it('should not require farmId in form schema', () => {
      const formData = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        activityDate: new Date('2023-11-15'),
      };

      // Should not throw because farmId is not required in form schema
      expect(() => createActivityFormSchema.parse(formData)).not.toThrow();
    });

    it('should not require createdBy in form schema', () => {
      const formData = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        activityDate: new Date('2023-11-15'),
      };

      // Should not throw because createdBy is not required in form schema
      expect(() => createActivityFormSchema.parse(formData)).not.toThrow();
    });

    it('should still validate required fields', () => {
      const invalidFormData = {
        title: 'Test',
        activityDate: new Date('2023-11-15'),
      };

      // Should throw because animalId is required
      expect(() => createActivityFormSchema.parse(invalidFormData)).toThrow();
    });
  });

  describe('TypeScript Type Inference', () => {
    it('should infer ActivityInput type correctly', () => {
      // This test validates type inference at compile time
      const activityInput: ActivityInput = {
        farmId: '550e8400-e29b-41d4-a716-446655440000',
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        activityDate: new Date('2023-11-15'),
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
        status: 'PENDING',
      };

      expect(activityInput.farmId).toBeDefined();
      expect(activityInput.animalId).toBeDefined();
      expect(activityInput.title).toBeDefined();
      expect(activityInput.createdBy).toBeDefined();
    });

    it('should infer CreateActivityFormInput type correctly', () => {
      // This test validates type inference at compile time
      const formInput: CreateActivityFormInput = {
        animalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        activityDate: new Date('2023-11-15'),
        status: 'PENDING',
      };

      expect(formInput.animalId).toBeDefined();
      expect(formInput.title).toBeDefined();
      // farmId and createdBy should not be in this type
    });
  });
});
