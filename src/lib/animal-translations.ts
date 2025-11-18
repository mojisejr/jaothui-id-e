/**
 * Enhanced Thai Translation Utilities - Jaothui ID-Trace System
 * 
 * Provides enhanced translation functions for database enum values to Thai language
 * with performance optimizations through memoization and improved Thai text rendering.
 * 
 * Features:
 * - AnimalType enum translation with memoization
 * - AnimalGender enum translation with memoization
 * - AnimalStatus enum translation with memoization
 * - Enhanced Thai calendar date formatting (BE calendar)
 * - Thai number formatting for better readability
 * - Age calculation with Thai support
 * - Weight and height formatting with Thai units
 * - Batch translation utilities
 * - Type-safe translations with comprehensive null/undefined handling
 * 
 * @language TypeScript (strict mode)
 */

import { AnimalType, AnimalGender, AnimalStatus } from '@/types/animal';

/**
 * Simple memoization function for single-argument functions
 * Caches results to improve performance on repeated calls
 */
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R & { cache?: Map<T, R> } {
  const cache = new Map<T, R>();
  
  const memoized = (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
  
  // Expose cache for clearing if needed
  (memoized as any).cache = cache;
  
  return memoized as any;
}

/**
 * Thai translation maps for animal enums
 * These provide direct lookup for enum value translations
 */
export const animalTypeThaiMap: Record<AnimalType, string> = {
  WATER_BUFFALO: 'กระบือน้ำ',
  SWAMP_BUFFALO: 'กระบือชายโค้ง',
  CATTLE: 'โค',
  GOAT: 'แพะ',
  PIG: 'หมู',
  CHICKEN: 'ไก่'
};

export const animalGenderThaiMap: Record<AnimalGender, string> = {
  MALE: 'ผู้',
  FEMALE: 'เมีย',
  UNKNOWN: 'ไม่ระบุ'
};

export const animalStatusThaiMap: Record<AnimalStatus, string> = {
  ACTIVE: 'ปกติ',
  TRANSFERRED: 'ย้ายแล้ว',
  DECEASED: 'ตายแล้ว',
  SOLD: 'ขายแล้ว'
};

/**
 * Translate AnimalType enum to Thai with memoization
 * Handles null/undefined gracefully
 * 
 * @param type - AnimalType enum value (can be null or undefined)
 * @returns Thai translation or 'ไม่ระบุ' for null/undefined
 */
export const translateAnimalType = memoize((type: AnimalType | null | undefined): string => {
  return type ? animalTypeThaiMap[type] : 'ไม่ระบุ';
});

/**
 * Translate AnimalGender enum to Thai with memoization
 * Handles null/undefined gracefully
 * 
 * @param gender - AnimalGender enum value (can be null or undefined)
 * @returns Thai translation or 'ไม่ระบุ' for null/undefined
 */
export const translateAnimalGender = memoize((gender: AnimalGender | null | undefined): string => {
  return gender ? animalGenderThaiMap[gender] : 'ไม่ระบุ';
});

/**
 * Translate AnimalStatus enum to Thai with memoization
 * Handles null/undefined gracefully
 * 
 * @param status - AnimalStatus enum value (can be null or undefined)
 * @returns Thai translation or 'ไม่ระบุ' for null/undefined
 */
export const translateAnimalStatus = memoize((status: AnimalStatus | null | undefined): string => {
  return status ? animalStatusThaiMap[status] : 'ไม่ระบุ';
});

/**
 * Format date to Thai Buddhist Era (BE) calendar with memoization
 * Converts Gregorian year (CE) to Buddhist year by adding 543 years
 * Includes enhanced validation and error handling
 * 
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted Thai date string (DD/MM/YYYY in BE) or 'ไม่ระบุ'
 * 
 * @example
 * formatDateThai('2019-03-12') // '12/3/2562'
 * formatDateThai(new Date('2019-03-12')) // '12/3/2562'
 * formatDateThai(null) // 'ไม่ระบุ'
 */
export const formatDateThai = memoize((date: Date | string | null | undefined): string => {
  if (!date) return 'ไม่ระบุ';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date object
    if (isNaN(dateObj.getTime())) {
      return 'ไม่ระบุ';
    }
    
    const thaiYear = dateObj.getFullYear() + 543;
    const thaiMonth = dateObj.getMonth() + 1;
    const thaiDay = dateObj.getDate();
    
    // Enhanced formatting with Thai number formatting
    return `${formatThaiNumber(thaiDay)}/${formatThaiNumber(thaiMonth)}/${formatThaiNumber(thaiYear)}`;
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return 'ไม่ระบุ';
  }
});

/**
 * Enhanced Thai number formatting for better readability
 * Uses Thai locale formatting without grouping separators
 * 
 * @param num - Number to format
 * @returns Thai-formatted number string
 * 
 * @example
 * formatThaiNumber(123) // '123'
 * formatThaiNumber(2562) // '2562'
 */
export const formatThaiNumber = (num: number): string => {
  return num.toLocaleString('th-TH', { 
    useGrouping: false,
    minimumIntegerDigits: 1
  });
};

/**
 * Format weight value with Thai units and memoization
 * Handles null/undefined gracefully
 * 
 * @param weightKg - Weight in kilograms (can be null or undefined)
 * @returns Formatted weight string with unit or 'ไม่ระบุ'
 * 
 * @example
 * formatWeight(450.5) // '450.5 กิโลกรัม'
 * formatWeight(null) // 'ไม่ระบุ'
 */
export const formatWeight = memoize((weightKg: number | null | undefined): string => {
  if (weightKg === null || weightKg === undefined) return 'ไม่ระบุ';
  return `${formatThaiNumber(weightKg)} กิโลกรัม`;
});

/**
 * Format height value with Thai units and memoization
 * Handles null/undefined gracefully
 * 
 * @param heightCm - Height in centimeters (can be null or undefined)
 * @returns Formatted height string with unit or 'ไม่ระบุ'
 * 
 * @example
 * formatHeight(145) // '145 เซนติเมตร'
 * formatHeight(null) // 'ไม่ระบุ'
 */
export const formatHeight = memoize((heightCm: number | null | undefined): string => {
  if (heightCm === null || heightCm === undefined) return 'ไม่ระบุ';
  return `${formatThaiNumber(heightCm)} เซนติเมตร`;
});

/**
 * Calculate age with Thai support and memoization
 * Returns age in days, months, or years with Thai units
 * Handles null/undefined gracefully
 * 
 * @param birthDate - Birth date (Date, string, null, or undefined)
 * @returns Formatted age string in Thai or 'ไม่ระบุ'
 * 
 * @example
 * calculateAgeThai('2020-01-01') // '1 ปี 10 เดือน' (depending on current date)
 * calculateAgeThai(null) // 'ไม่ระบุ'
 */
export const calculateAgeThai = memoize((birthDate: Date | string | null | undefined): string => {
  if (!birthDate) return 'ไม่ระบุ';
  
  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    // Validate date object
    if (isNaN(birth.getTime())) {
      return 'ไม่ระบุ';
    }
    
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 0) {
      return 'ไม่ระบุ'; // Future date
    }
    
    if (ageInDays < 30) {
      return `${formatThaiNumber(ageInDays)} วัน`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${formatThaiNumber(months)} เดือน`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const remainingMonths = Math.floor((ageInDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${formatThaiNumber(years)} ปี ${formatThaiNumber(remainingMonths)} เดือน`;
      }
      return `${formatThaiNumber(years)} ปี`;
    }
  } catch (error) {
    console.error('Error calculating age:', error);
    return 'ไม่ระบุ';
  }
});

/**
 * Type definition for animal data with translations
 * Used by translateAnimalData function
 */
interface AnimalDataInput {
  type?: AnimalType | null;
  gender?: AnimalGender | null;
  status?: AnimalStatus | null;
  birthDate?: Date | string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  [key: string]: any;
}

interface TranslatedAnimalData extends AnimalDataInput {
  typeTranslated: string;
  genderTranslated: string;
  statusTranslated: string;
  birthDateThai: string;
  weightFormatted: string;
  heightFormatted: string;
  ageFormatted: string;
}

/**
 * Translate complete animal data with memoization
 * Adds translated versions of all relevant fields
 * 
 * @param animal - Animal data object
 * @returns Animal data with additional translated fields
 * 
 * @example
 * translateAnimalData({ 
 *   type: 'WATER_BUFFALO', 
 *   gender: 'FEMALE',
 *   status: 'ACTIVE'
 * })
 * // Returns object with typeTranslated, genderTranslated, etc.
 */
export const translateAnimalData = memoize((animal: AnimalDataInput): TranslatedAnimalData => {
  return {
    ...animal,
    typeTranslated: translateAnimalType(animal.type),
    genderTranslated: translateAnimalGender(animal.gender),
    statusTranslated: translateAnimalStatus(animal.status),
    birthDateThai: formatDateThai(animal.birthDate),
    weightFormatted: formatWeight(animal.weightKg),
    heightFormatted: formatHeight(animal.heightCm),
    ageFormatted: calculateAgeThai(animal.birthDate)
  };
});

/**
 * Translate a list of animals with batch processing
 * Uses memoization for individual animal translations
 * 
 * @param animals - Array of animal data objects
 * @returns Array of animals with translated fields
 */
export const translateAnimalList = (animals: AnimalDataInput[]): TranslatedAnimalData[] => {
  return animals.map(translateAnimalData);
};

/**
 * Clear all memoization caches
 * Useful for testing or when data has been updated
 * 
 * @example
 * clearTranslationCache(); // Clears all cached translations
 */
export const clearTranslationCache = (): void => {
  // Clear all memoized functions by accessing their cache property
  const functionsWithCache = [
    translateAnimalType,
    translateAnimalGender,
    translateAnimalStatus,
    formatDateThai,
    formatWeight,
    formatHeight,
    calculateAgeThai,
    translateAnimalData
  ];
  
  functionsWithCache.forEach((fn: any) => {
    if (fn.cache && typeof fn.cache.clear === 'function') {
      fn.cache.clear();
    }
  });
};
