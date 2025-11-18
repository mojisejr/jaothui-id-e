/**
 * Thai Translation Utilities - Jaothui ID-Trace System
 * 
 * Provides translation functions for database enum values to Thai language.
 * Used across the application for consistent Thai language display.
 * 
 * Features:
 * - AnimalType enum translation
 * - AnimalGender enum translation
 * - AnimalStatus enum translation
 * - Thai calendar date formatting (BE calendar)
 * - Type-safe translations with fallback support
 * 
 * @language TypeScript (strict mode)
 */

import { AnimalType, AnimalGender, AnimalStatus } from '@/types/animal';

/**
 * Translate AnimalType enum to Thai
 * 
 * @param type - AnimalType enum value
 * @returns Thai translation of animal type
 */
export function translateAnimalType(type: AnimalType): string {
  const translations: Record<AnimalType, string> = {
    WATER_BUFFALO: 'กระบือน้ำ',
    SWAMP_BUFFALO: 'กระบือบึง',
    CATTLE: 'โค',
    GOAT: 'แพะ',
    PIG: 'หมู',
    CHICKEN: 'ไก่',
  };
  
  return translations[type] || type;
}

/**
 * Translate AnimalGender enum to Thai
 * 
 * @param gender - AnimalGender enum value
 * @returns Thai translation of gender
 */
export function translateAnimalGender(gender: AnimalGender): string {
  const translations: Record<AnimalGender, string> = {
    MALE: 'ผู้',
    FEMALE: 'เมีย',
    UNKNOWN: 'ไม่ทราบ',
  };
  
  return translations[gender] || gender;
}

/**
 * Translate AnimalStatus enum to Thai
 * 
 * @param status - AnimalStatus enum value
 * @returns Thai translation of status
 */
export function translateAnimalStatus(status: AnimalStatus): string {
  const translations: Record<AnimalStatus, string> = {
    ACTIVE: 'ใช้งานอยู่',
    TRANSFERRED: 'โอนย้าย',
    DECEASED: 'เสียชีวิต',
    SOLD: 'ขายแล้ว',
  };
  
  return translations[status] || status;
}

/**
 * Format date to Thai Buddhist Era (BE) calendar
 * Converts Gregorian year (CE) to Buddhist year by adding 543 years
 * 
 * @param date - Date object, ISO string, or null
 * @param format - Date format style ('short' | 'long'), default 'short'
 * @returns Formatted Thai date string or '-' if date is invalid/null
 * 
 * @example
 * formatThaiDate('2019-03-12') // '12 มีนาคม 2562' (long format)
 * formatThaiDate('2019-03-12', 'short') // '12/03/2562'
 * formatThaiDate(null) // '-'
 */
export function formatThaiDate(
  date: Date | string | null | undefined,
  format: 'short' | 'long' = 'long'
): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date object
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const gregorianYear = dateObj.getFullYear();
    const buddhistYear = gregorianYear + 543;
    
    if (format === 'short') {
      // Short format: DD/MM/YYYY (BE)
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = (month + 1).toString().padStart(2, '0');
      return `${dayStr}/${monthStr}/${buddhistYear}`;
    } else {
      // Long format: D Month YYYY (BE)
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
        'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
        'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      
      return `${day} ${thaiMonths[month]} ${buddhistYear}`;
    }
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return '-';
  }
}

/**
 * Format weight value for display
 * 
 * @param weightKg - Weight in kilograms (can be Decimal or number)
 * @returns Formatted weight string with unit or '-'
 */
export function formatWeight(weightKg: number | string | null | undefined): string {
  if (weightKg === null || weightKg === undefined) return '-';
  
  try {
    const weight = typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg;
    
    if (isNaN(weight)) return '-';
    
    return `${weight.toFixed(2)} กก.`;
  } catch {
    return '-';
  }
}

/**
 * Format height value for display
 * 
 * @param heightCm - Height in centimeters
 * @returns Formatted height string with unit or '-'
 */
export function formatHeight(heightCm: number | null | undefined): string {
  if (heightCm === null || heightCm === undefined) return '-';
  
  return `${heightCm} ซม.`;
}
