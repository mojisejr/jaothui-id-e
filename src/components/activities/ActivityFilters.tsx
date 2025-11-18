/**
 * ActivityFilters Component - Jaothui ID-Trace System
 * 
 * Status filtering component for activities list.
 * Provides filter buttons for all activity statuses.
 * 
 * Features:
 * - Status filter buttons (ALL, PENDING, COMPLETED, OVERDUE, CANCELLED)
 * - Active state indication
 * - Mobile-first responsive design
 * - Thai language support
 * - Accessibility compliance
 * - Elderly-friendly (44px touch targets)
 * 
 * @see /src/types/activity.ts - Type definitions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ActivityStatus } from '@/types/activity';

interface ActivityFiltersProps {
  activeFilter: ActivityStatus | 'ALL';
  onFilterChange: (filter: ActivityStatus | 'ALL') => void;
  className?: string;
}

/**
 * Filter options with Thai labels
 */
const filterOptions: Array<{ value: ActivityStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'COMPLETED', label: 'เสร็จสิ้น' },
  { value: 'OVERDUE', label: 'เลยกำหนด' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  activeFilter,
  onFilterChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={activeFilter === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(option.value)}
          className="min-h-[44px] px-4 text-sm font-medium whitespace-nowrap flex-shrink-0"
          aria-label={`กรองตามสถานะ: ${option.label}`}
          aria-pressed={activeFilter === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ActivityFilters;
