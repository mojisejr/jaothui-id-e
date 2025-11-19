"use client";

/**
 * ActivityDetailCard Component - Jaothui ID-Trace System
 * 
 * Mobile-first activity detail display component following AnimalDetailCard pattern.
 * 
 * Features:
 * - TopNavigation integration
 * - Single column vertical layout with information card
 * - Icon + Label + Description pattern for each field
 * - Thai language support with Buddhist calendar dates
 * - Status badge display
 * - Action buttons for status updates (PENDING activities)
 * - Bottom navigation buttons (Back, Activities list)
 * - 48px minimum touch targets for accessibility
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * 
 * @framework Next.js 14 (App Router)
 * @language TypeScript (strict mode)
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  List, 
  Calendar, 
  FileText, 
  AlertCircle,
  Check,
  X,
  User
} from "lucide-react";
import TopNavigation from "@/components/profile/TopNavigation";
import { Activity, ActivityStatus } from "@/types/activity";

/**
 * ActivityDetailCard Props
 */
export interface ActivityDetailCardProps {
  /** Activity information to display */
  activity: Activity;
  /** Additional CSS classes */
  className?: string;
}

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
 * ActivityDetailCard Component
 * 
 * @param props - Component props
 * @returns Single column activity detail card with comprehensive information display
 */
export function ActivityDetailCard({ 
  activity,
  className 
}: ActivityDetailCardProps): React.ReactElement {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  /**
   * Handle activity status update
   */
  const handleStatusUpdate = async (newStatus: ActivityStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          statusReason: newStatus === 'COMPLETED' ? 'ทำเสร็จแล้ว' : 'ยกเลิกแล้ว',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update activity status');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Failed to update activity:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const showActions = activity.status === 'PENDING';
  const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && activity.status === 'PENDING';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Activity Information Card */}
          <Card className="bg-card/80 backdrop-blur-xs border-border shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {activity.title}
                  </h2>
                  <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {activity.description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">คำอธิบาย</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              )}

              {/* Animal Information */}
              {activity.animal && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">กระบือ</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.animal.name || activity.animal.tagId || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">วันที่ทำกิจกรรม</p>
                  <p className="text-sm text-muted-foreground">{formatDate(activity.activityDate)}</p>
                </div>
              </div>

              {/* Due Date */}
              {activity.dueDate && (
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    "w-5 h-5 flex-shrink-0 mt-0.5",
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">วันครบกำหนด</p>
                    <p className={cn(
                      "text-sm",
                      isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                      {formatDate(activity.dueDate)}
                      {isOverdue && " (เลยกำหนดแล้ว)"}
                    </p>
                  </div>
                </div>
              )}

              {/* Creator Information */}
              {activity.creator && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">สร้างโดย</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.creator.firstName} {activity.creator.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Completion Information */}
              {activity.status === 'COMPLETED' && activity.completer && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">ทำเสร็จโดย</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.completer.firstName} {activity.completer.lastName}
                    </p>
                    {activity.completedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status Reason */}
              {activity.statusReason && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">หมายเหตุ</p>
                    <p className="text-sm text-muted-foreground">{activity.statusReason}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons for PENDING status */}
              {showActions && (
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm font-medium text-foreground mb-2">จัดการกิจกรรม</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px]"
                      onClick={() => handleStatusUpdate('COMPLETED')}
                      disabled={isUpdating}
                      aria-label="ทำเสร็จแล้ว"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      เสร็จแล้ว
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px]"
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={isUpdating}
                      aria-label="ยกเลิก"
                    >
                      <X className="w-4 h-4 mr-2" />
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full min-h-[48px]"
              onClick={() => router.back()}
              aria-label="กลับ"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <Link href="/profile" className="w-full">
              <Button
                variant="ghost"
                className="w-full min-h-[48px]"
                aria-label="กลับหน้าหลัก"
              >
                <List className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetailCard;
