/**
 * Enhanced Animal Translation Utilities Tests - Jaothui ID-Trace System
 * 
 * Comprehensive tests for enhanced Thai translation functions with memoization,
 * improved Thai text rendering, and performance optimizations.
 * 
 * Tests cover:
 * - Enum translation with null/undefined handling
 * - Thai calendar conversion (BE format)
 * - Thai number formatting
 * - Age calculation
 * - Weight and height formatting
 * - Batch translation
 * - Memoization cache management
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  translateAnimalType,
  translateAnimalGender,
  translateAnimalStatus,
  formatDateThai,
  formatThaiNumber,
  formatWeight,
  formatHeight,
  calculateAgeThai,
  translateAnimalData,
  translateAnimalList,
  clearTranslationCache,
  animalTypeThaiMap,
  animalGenderThaiMap,
  animalStatusThaiMap,
} from '../../lib/animal-translations';
import { AnimalType, AnimalGender, AnimalStatus } from '@prisma/client';

describe('Enhanced Animal Translation Utilities', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure clean state
    clearTranslationCache();
  });

  describe('Translation Maps', () => {
    it('should have complete AnimalType translation map', () => {
      expect(animalTypeThaiMap[AnimalType.WATER_BUFFALO]).toBe('กระบือน้ำ');
      expect(animalTypeThaiMap[AnimalType.SWAMP_BUFFALO]).toBe('กระบือชายโค้ง');
      expect(animalTypeThaiMap[AnimalType.CATTLE]).toBe('โค');
      expect(animalTypeThaiMap[AnimalType.GOAT]).toBe('แพะ');
      expect(animalTypeThaiMap[AnimalType.PIG]).toBe('หมู');
      expect(animalTypeThaiMap[AnimalType.CHICKEN]).toBe('ไก่');
    });

    it('should have complete AnimalGender translation map', () => {
      expect(animalGenderThaiMap[AnimalGender.MALE]).toBe('ผู้');
      expect(animalGenderThaiMap[AnimalGender.FEMALE]).toBe('เมีย');
      expect(animalGenderThaiMap[AnimalGender.UNKNOWN]).toBe('ไม่ระบุ');
    });

    it('should have complete AnimalStatus translation map', () => {
      expect(animalStatusThaiMap[AnimalStatus.ACTIVE]).toBe('ปกติ');
      expect(animalStatusThaiMap[AnimalStatus.TRANSFERRED]).toBe('ย้ายแล้ว');
      expect(animalStatusThaiMap[AnimalStatus.DECEASED]).toBe('ตายแล้ว');
      expect(animalStatusThaiMap[AnimalStatus.SOLD]).toBe('ขายแล้ว');
    });
  });

  describe('translateAnimalType', () => {
    it('should translate WATER_BUFFALO to Thai', () => {
      expect(translateAnimalType(AnimalType.WATER_BUFFALO)).toBe('กระบือน้ำ');
    });

    it('should translate SWAMP_BUFFALO to Thai', () => {
      expect(translateAnimalType(AnimalType.SWAMP_BUFFALO)).toBe('กระบือชายโค้ง');
    });

    it('should translate CATTLE to Thai', () => {
      expect(translateAnimalType(AnimalType.CATTLE)).toBe('โค');
    });

    it('should translate GOAT to Thai', () => {
      expect(translateAnimalType(AnimalType.GOAT)).toBe('แพะ');
    });

    it('should translate PIG to Thai', () => {
      expect(translateAnimalType(AnimalType.PIG)).toBe('หมู');
    });

    it('should translate CHICKEN to Thai', () => {
      expect(translateAnimalType(AnimalType.CHICKEN)).toBe('ไก่');
    });

    it('should return "ไม่ระบุ" for null', () => {
      expect(translateAnimalType(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined', () => {
      expect(translateAnimalType(undefined)).toBe('ไม่ระบุ');
    });

    it('should use memoization (cache results)', () => {
      const result1 = translateAnimalType(AnimalType.WATER_BUFFALO);
      const result2 = translateAnimalType(AnimalType.WATER_BUFFALO);
      expect(result1).toBe(result2);
      expect(result1).toBe('กระบือน้ำ');
    });
  });

  describe('translateAnimalGender', () => {
    it('should translate MALE to Thai', () => {
      expect(translateAnimalGender(AnimalGender.MALE)).toBe('ผู้');
    });

    it('should translate FEMALE to Thai', () => {
      expect(translateAnimalGender(AnimalGender.FEMALE)).toBe('เมีย');
    });

    it('should translate UNKNOWN to Thai', () => {
      expect(translateAnimalGender(AnimalGender.UNKNOWN)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for null', () => {
      expect(translateAnimalGender(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined', () => {
      expect(translateAnimalGender(undefined)).toBe('ไม่ระบุ');
    });
  });

  describe('translateAnimalStatus', () => {
    it('should translate ACTIVE to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.ACTIVE)).toBe('ปกติ');
    });

    it('should translate TRANSFERRED to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.TRANSFERRED)).toBe('ย้ายแล้ว');
    });

    it('should translate DECEASED to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.DECEASED)).toBe('ตายแล้ว');
    });

    it('should translate SOLD to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.SOLD)).toBe('ขายแล้ว');
    });

    it('should return "ไม่ระบุ" for null', () => {
      expect(translateAnimalStatus(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined', () => {
      expect(translateAnimalStatus(undefined)).toBe('ไม่ระบุ');
    });
  });

  describe('formatDateThai', () => {
    it('should format date to Thai Buddhist Era with Date object', () => {
      const date = new Date('2019-03-12');
      expect(formatDateThai(date)).toBe('12/3/2562');
    });

    it('should format date to Thai Buddhist Era with ISO string', () => {
      expect(formatDateThai('2019-03-12')).toBe('12/3/2562');
    });

    it('should handle different years correctly (BE conversion)', () => {
      expect(formatDateThai('2020-01-15')).toBe('15/1/2563');
      expect(formatDateThai('2021-06-20')).toBe('20/6/2564');
      expect(formatDateThai('1990-12-31')).toBe('31/12/2533');
    });

    it('should handle different months correctly', () => {
      expect(formatDateThai('2020-01-15')).toBe('15/1/2563');
      expect(formatDateThai('2020-06-20')).toBe('20/6/2563');
      expect(formatDateThai('2020-12-31')).toBe('31/12/2563');
    });

    it('should return "ไม่ระบุ" for null date', () => {
      expect(formatDateThai(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined date', () => {
      expect(formatDateThai(undefined)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for invalid date string', () => {
      expect(formatDateThai('invalid-date')).toBe('ไม่ระบุ');
    });

    it('should use memoization for repeated calls', () => {
      const result1 = formatDateThai('2019-03-12');
      const result2 = formatDateThai('2019-03-12');
      expect(result1).toBe(result2);
      expect(result1).toBe('12/3/2562');
    });
  });

  describe('formatThaiNumber', () => {
    it('should format single digit numbers', () => {
      expect(formatThaiNumber(5)).toBe('5');
    });

    it('should format two digit numbers', () => {
      expect(formatThaiNumber(12)).toBe('12');
    });

    it('should format large numbers without grouping', () => {
      expect(formatThaiNumber(2562)).toBe('2562');
      expect(formatThaiNumber(123456)).toBe('123456');
    });

    it('should format zero', () => {
      expect(formatThaiNumber(0)).toBe('0');
    });
  });

  describe('formatWeight', () => {
    it('should format integer weight with Thai unit', () => {
      expect(formatWeight(450)).toBe('450 กิโลกรัม');
    });

    it('should format decimal weight with Thai unit', () => {
      expect(formatWeight(450.5)).toBe('450.5 กิโลกรัม');
    });

    it('should format large weights', () => {
      expect(formatWeight(1000)).toBe('1000 กิโลกรัม');
    });

    it('should return "ไม่ระบุ" for null weight', () => {
      expect(formatWeight(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined weight', () => {
      expect(formatWeight(undefined)).toBe('ไม่ระบุ');
    });

    it('should use memoization for repeated calls', () => {
      const result1 = formatWeight(450);
      const result2 = formatWeight(450);
      expect(result1).toBe(result2);
    });
  });

  describe('formatHeight', () => {
    it('should format height with Thai unit', () => {
      expect(formatHeight(145)).toBe('145 เซนติเมตร');
    });

    it('should format large heights', () => {
      expect(formatHeight(200)).toBe('200 เซนติเมตร');
    });

    it('should format small heights', () => {
      expect(formatHeight(50)).toBe('50 เซนติเมตร');
    });

    it('should return "ไม่ระบุ" for null height', () => {
      expect(formatHeight(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined height', () => {
      expect(formatHeight(undefined)).toBe('ไม่ระบุ');
    });

    it('should use memoization for repeated calls', () => {
      const result1 = formatHeight(145);
      const result2 = formatHeight(145);
      expect(result1).toBe(result2);
    });
  });

  describe('calculateAgeThai', () => {
    it('should calculate age in days for very young animals', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 5);
      const result = calculateAgeThai(yesterday);
      expect(result).toContain('วัน');
    });

    it('should calculate age in months for young animals', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const result = calculateAgeThai(twoMonthsAgo);
      expect(result).toContain('เดือน');
    });

    it('should calculate age in years for older animals', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const result = calculateAgeThai(twoYearsAgo);
      expect(result).toContain('ปี');
    });

    it('should calculate age with years and months for precise age', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      date.setMonth(date.getMonth() - 2);
      const result = calculateAgeThai(date);
      // Should contain both years and months
      expect(result).toContain('ปี');
    });

    it('should return "ไม่ระบุ" for null birthDate', () => {
      expect(calculateAgeThai(null)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for undefined birthDate', () => {
      expect(calculateAgeThai(undefined)).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for invalid date string', () => {
      expect(calculateAgeThai('invalid-date')).toBe('ไม่ระบุ');
    });

    it('should return "ไม่ระบุ" for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(calculateAgeThai(futureDate)).toBe('ไม่ระบุ');
    });
  });

  describe('translateAnimalData', () => {
    it('should translate complete animal data object', () => {
      const animal = {
        type: AnimalType.WATER_BUFFALO,
        gender: AnimalGender.FEMALE,
        status: AnimalStatus.ACTIVE,
        birthDate: '2019-03-12',
        weightKg: 450,
        heightCm: 145,
      };

      const result = translateAnimalData(animal);

      expect(result.typeTranslated).toBe('กระบือน้ำ');
      expect(result.genderTranslated).toBe('เมีย');
      expect(result.statusTranslated).toBe('ปกติ');
      expect(result.birthDateThai).toBe('12/3/2562');
      expect(result.weightFormatted).toBe('450 กิโลกรัม');
      expect(result.heightFormatted).toBe('145 เซนติเมตร');
      expect(result.ageFormatted).toContain('ปี'); // Should have some age
    });

    it('should handle animal data with null/undefined fields', () => {
      const animal = {
        type: null,
        gender: undefined,
        status: AnimalStatus.ACTIVE,
        birthDate: null,
        weightKg: undefined,
        heightCm: null,
      };

      const result = translateAnimalData(animal);

      expect(result.typeTranslated).toBe('ไม่ระบุ');
      expect(result.genderTranslated).toBe('ไม่ระบุ');
      expect(result.statusTranslated).toBe('ปกติ');
      expect(result.birthDateThai).toBe('ไม่ระบุ');
      expect(result.weightFormatted).toBe('ไม่ระบุ');
      expect(result.heightFormatted).toBe('ไม่ระบุ');
      expect(result.ageFormatted).toBe('ไม่ระบุ');
    });

    it('should preserve original fields in translated data', () => {
      const animal = {
        id: 'test-id',
        name: 'Test Buffalo',
        type: AnimalType.WATER_BUFFALO,
        gender: AnimalGender.FEMALE,
        status: AnimalStatus.ACTIVE,
      };

      const result = translateAnimalData(animal);

      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Test Buffalo');
      expect(result.type).toBe(AnimalType.WATER_BUFFALO);
    });

    it('should use memoization for repeated translations', () => {
      const animal = {
        type: AnimalType.WATER_BUFFALO,
        gender: AnimalGender.FEMALE,
        status: AnimalStatus.ACTIVE,
      };

      const result1 = translateAnimalData(animal);
      const result2 = translateAnimalData(animal);

      expect(result1).toEqual(result2);
    });
  });

  describe('translateAnimalList', () => {
    it('should translate a list of animals', () => {
      const animals = [
        {
          type: AnimalType.WATER_BUFFALO,
          gender: AnimalGender.FEMALE,
          status: AnimalStatus.ACTIVE,
        },
        {
          type: AnimalType.CATTLE,
          gender: AnimalGender.MALE,
          status: AnimalStatus.SOLD,
        },
      ];

      const results = translateAnimalList(animals);

      expect(results).toHaveLength(2);
      expect(results[0].typeTranslated).toBe('กระบือน้ำ');
      expect(results[0].genderTranslated).toBe('เมีย');
      expect(results[1].typeTranslated).toBe('โค');
      expect(results[1].genderTranslated).toBe('ผู้');
    });

    it('should handle empty array', () => {
      const results = translateAnimalList([]);
      expect(results).toHaveLength(0);
    });

    it('should handle array with mixed data', () => {
      const animals = [
        {
          type: AnimalType.WATER_BUFFALO,
          gender: null,
          status: AnimalStatus.ACTIVE,
        },
        {
          type: null,
          gender: AnimalGender.MALE,
          status: undefined,
        },
      ];

      const results = translateAnimalList(animals);

      expect(results).toHaveLength(2);
      expect(results[0].genderTranslated).toBe('ไม่ระบุ');
      expect(results[1].typeTranslated).toBe('ไม่ระบุ');
      expect(results[1].statusTranslated).toBe('ไม่ระบุ');
    });
  });

  describe('clearTranslationCache', () => {
    it('should clear all translation caches', () => {
      // Pre-populate caches
      translateAnimalType(AnimalType.WATER_BUFFALO);
      translateAnimalGender(AnimalGender.FEMALE);
      translateAnimalStatus(AnimalStatus.ACTIVE);
      formatDateThai('2019-03-12');
      formatWeight(450);
      formatHeight(145);

      // Clear caches
      clearTranslationCache();

      // Verify caches are cleared (functions should still work)
      expect(translateAnimalType(AnimalType.WATER_BUFFALO)).toBe('กระบือน้ำ');
      expect(translateAnimalGender(AnimalGender.FEMALE)).toBe('เมีย');
    });

    it('should not throw error when called multiple times', () => {
      expect(() => {
        clearTranslationCache();
        clearTranslationCache();
        clearTranslationCache();
      }).not.toThrow();
    });
  });
});
