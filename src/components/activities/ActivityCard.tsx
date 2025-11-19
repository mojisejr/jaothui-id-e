/**
 * ActivityCard Component - Jaothui ID-Trace System
 * 
 * Activity display card following AnimalCard styling patterns for consistency.
 * Displays activity information with prominent due date display.
 * 
 * Features:
 * - Single row compact layout (mobile-first)
 * - Prominent due date display (Option 1 approach)
 * - Status badge with appropriate colors
 * - Action buttons (COMPLETE/CANCEL) for pending activities
 * - Animal information display
 * - Thai language support
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Elderly-friendly (44px touch targets)
 * 
 * Design Pattern: Follows AnimalCard.tsx exactly for UI consistency
 * 
 * @see /src/components/animals/AnimalCard.tsx - Styling reference
 * @see /src/types/activity.ts - Type definitions
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, AlertCircle, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, ActivityStatus } from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
  onStatusUpdate?: (activityId: string, status: ActivityStatus) => Promise<void>;
  onPress?: () => void;
}

/**
 * Get status badge variant based on activity status
 */
const getStatusBadgeVariant = (status: ActivityStatus): "success" | "secondary" | "destructive" => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'secondary';
    case 'OVERDUE':
      return 'destructive';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Get status text in Thai
 */
const getStatusText = (status: ActivityStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'รอดำเนินการ';
    case 'COMPLETED':
      return 'เสร็จสิ้น';
    case 'CANCELLED':
      return 'ยกเลิก';
    case 'OVERDUE':
      return 'เลยกำหนด';
    default:
      return status;
  }
};

/**
 * Format date to Thai Buddhist calendar
 */
const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // Convert to BE calendar
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

/**
 * Check if activity is overdue
 */
const isOverdue = (dueDate?: string | Date | null, status?: ActivityStatus): boolean => {
  if (!dueDate || status === 'COMPLETED' || status === 'CANCELLED') {
    return false;
  }
  
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onStatusUpdate,
  onPress
}) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    }
    
    // Navigate to activity detail page
    setIsNavigating(true);
    router.push(`/activities/${activity.id}`);
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onStatusUpdate) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(activity.id, 'COMPLETED');
    } catch (error) {
      console.error('Failed to complete activity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onStatusUpdate) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(activity.id, 'CANCELLED');
    } catch (error) {
      console.error('Failed to cancel activity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const showOverdueWarning = isOverdue(activity.dueDate, activity.status);
  const showActions = activity.status === 'PENDING' && onStatusUpdate;

  return (
    <Card
      className="w-full border-border hover:shadow-xs transition-all cursor-pointer bg-card/80 backdrop-blur-xs"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียดกิจกรรม: ${activity.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className="p-3">
        {/* Loading overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center rounded-xl z-10">
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
              aria-label="กำลังโหลด"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                กำลังโหลด...
              </span>
            </div>
          </div>
        )}
        {/* Single Row Layout */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Activity Info */}
          <div className="flex-1 min-w-0">
            {/* Title and Animal */}
            <div className="mb-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {activity.title}
              </h3>
              <p className="text-[11px] text-muted-foreground/70">
                กระบือ: {activity.animal?.name || activity.animal?.tagId || '-'}
              </p>
            </div>

            {/* Date Information - PROMINENT DUE DATE */}
            <div className="flex items-center gap-3 text-xs flex-wrap mb-2">
              {/* Activity Date */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>วันที่: {formatDate(activity.activityDate)}</span>
              </div>

              {/* Due Date - Prominent with conditional styling */}
              {activity.dueDate && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className={`flex items-center gap-1 font-medium ${
                    showOverdueWarning 
                      ? 'text-destructive' 
                      : activity.status === 'PENDING'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}>
                    {showOverdueWarning && <AlertCircle className="w-3 h-3" />}
                    <span>ครบกำหนด: {formatDate(activity.dueDate)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons for PENDING status */}
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleComplete}
                  disabled={isUpdating}
                  className="h-8 px-3 text-xs"
                  aria-label="ทำเสร็จแล้ว"
                >
                  <Check className="w-3 h-3 mr-1" />
                  เสร็จแล้ว
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="h-8 px-3 text-xs"
                  aria-label="ยกเลิก"
                >
                  <X className="w-3 h-3 mr-1" />
                  ยกเลิก
                </Button>
              </div>
            )}
          </div>

          {/* Right: Status Badge */}
          <div className="flex items-start flex-shrink-0">
            <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
              {getStatusText(activity.status)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
