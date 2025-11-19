/**
 * ActivityFilters Component - Jaothui ID-Trace System
 * 
 * Status filtering component for activities list with URL parameter support.
 * Provides filter buttons for all activity statuses with multi-select capability.
 * 
 * Features:
 * - Status filter buttons (PENDING, COMPLETED, OVERDUE, CANCELLED)
 * - Multi-select filter capability (additive filtering)
 * - URL parameter parsing (status=pending,overdue)
 * - Active state indication with visual chips
 * - Mobile-first responsive design
 * - Thai language support
 * - Accessibility compliance
 * - Elderly-friendly (44px touch targets)
 * 
 * @see /src/types/activity.ts - Type definitions
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ActivityStatus } from '@/types/activity';

interface ActivityFiltersProps {
  activeFilters: ActivityStatus[];
  onFilterToggle: (filter: ActivityStatus) => void;
  className?: string;
}

/**
 * Filter options with Thai labels
 */
const filterOptions: Array<{ value: ActivityStatus; label: string }> = [
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'OVERDUE', label: 'เลยกำหนด' },
  { value: 'COMPLETED', label: 'เสร็จสิ้น' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  activeFilters,
  onFilterToggle,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {filterOptions.map((option) => {
        const isActive = activeFilters.includes(option.value);
        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterToggle(option.value)}
            className="min-h-[44px] px-4 text-sm font-medium whitespace-nowrap flex-shrink-0"
            aria-label={`${isActive ? 'ปิด' : 'เปิด'}กรองตามสถานะ: ${option.label}`}
            aria-pressed={isActive}
          >
            {option.label}
            {isActive && <span className="ml-1.5">✓</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default ActivityFilters;
