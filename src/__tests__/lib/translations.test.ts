/**
 * Translation Utilities Tests - Jaothui ID-Trace System
 * 
 * Tests for Thai translation functions and date formatting utilities.
 * Ensures proper translation of enum values and correct Thai calendar conversion.
 */

import { describe, it, expect } from '@jest/globals';
import {
  translateAnimalType,
  translateAnimalGender,
  translateAnimalStatus,
  formatThaiDate,
  formatWeight,
  formatHeight,
} from '../../lib/translations';
import { AnimalType, AnimalGender, AnimalStatus } from '@/types/animal';

describe('Translation Utilities', () => {
  describe('translateAnimalType', () => {
    it('should translate WATER_BUFFALO to Thai', () => {
      expect(translateAnimalType(AnimalType.WATER_BUFFALO)).toBe('กระบือน้ำ');
    });

    it('should translate SWAMP_BUFFALO to Thai', () => {
      expect(translateAnimalType(AnimalType.SWAMP_BUFFALO)).toBe('กระบือบึง');
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
  });

  describe('translateAnimalGender', () => {
    it('should translate MALE to Thai', () => {
      expect(translateAnimalGender(AnimalGender.MALE)).toBe('ผู้');
    });

    it('should translate FEMALE to Thai', () => {
      expect(translateAnimalGender(AnimalGender.FEMALE)).toBe('เมีย');
    });

    it('should translate UNKNOWN to Thai', () => {
      expect(translateAnimalGender(AnimalGender.UNKNOWN)).toBe('ไม่ทราบ');
    });
  });

  describe('translateAnimalStatus', () => {
    it('should translate ACTIVE to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.ACTIVE)).toBe('ใช้งานอยู่');
    });

    it('should translate TRANSFERRED to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.TRANSFERRED)).toBe('โอนย้าย');
    });

    it('should translate DECEASED to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.DECEASED)).toBe('เสียชีวิต');
    });

    it('should translate SOLD to Thai', () => {
      expect(translateAnimalStatus(AnimalStatus.SOLD)).toBe('ขายแล้ว');
    });
  });

  describe('formatThaiDate', () => {
    it('should format date to Thai Buddhist Era (long format)', () => {
      const date = new Date('2019-03-12');
      expect(formatThaiDate(date, 'long')).toBe('12 มีนาคม 2562');
    });

    it('should format date to Thai Buddhist Era (short format)', () => {
      const date = new Date('2019-03-12');
      expect(formatThaiDate(date, 'short')).toBe('12/03/2562');
    });

    it('should default to long format', () => {
      const date = new Date('2019-03-12');
      expect(formatThaiDate(date)).toBe('12 มีนาคม 2562');
    });

    it('should format ISO string date', () => {
      expect(formatThaiDate('2019-03-12', 'short')).toBe('12/03/2562');
    });

    it('should return "-" for null date', () => {
      expect(formatThaiDate(null)).toBe('-');
    });

    it('should return "-" for undefined date', () => {
      expect(formatThaiDate(undefined)).toBe('-');
    });

    it('should return "-" for invalid date string', () => {
      expect(formatThaiDate('invalid-date')).toBe('-');
    });

    it('should handle different months correctly', () => {
      expect(formatThaiDate('2020-01-15', 'long')).toBe('15 มกราคม 2563');
      expect(formatThaiDate('2020-06-20', 'long')).toBe('20 มิถุนายน 2563');
      expect(formatThaiDate('2020-12-31', 'long')).toBe('31 ธันวาคม 2563');
    });

    it('should pad single digit days and months in short format', () => {
      expect(formatThaiDate('2020-01-05', 'short')).toBe('05/01/2563');
      expect(formatThaiDate('2020-09-09', 'short')).toBe('09/09/2563');
    });
  });

  describe('formatWeight', () => {
    it('should format number weight with unit', () => {
      expect(formatWeight(450.5)).toBe('450.50 กก.');
    });

    it('should format string weight with unit', () => {
      expect(formatWeight('520.75')).toBe('520.75 กก.');
    });

    it('should handle integer weights', () => {
      expect(formatWeight(500)).toBe('500.00 กก.');
    });

    it('should return "-" for null weight', () => {
      expect(formatWeight(null)).toBe('-');
    });

    it('should return "-" for undefined weight', () => {
      expect(formatWeight(undefined)).toBe('-');
    });

    it('should return "-" for invalid string weight', () => {
      expect(formatWeight('invalid')).toBe('-');
    });
  });

  describe('formatHeight', () => {
    it('should format height with unit', () => {
      expect(formatHeight(145)).toBe('145 ซม.');
    });

    it('should handle large heights', () => {
      expect(formatHeight(200)).toBe('200 ซม.');
    });

    it('should return "-" for null height', () => {
      expect(formatHeight(null)).toBe('-');
    });

    it('should return "-" for undefined height', () => {
      expect(formatHeight(undefined)).toBe('-');
    });
  });
});
