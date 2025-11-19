/**
 * ActivitiesTab Component - Jaothui ID-Trace System
 * 
 * Main activities list component with filtering and infinite scroll.
 * Replaces MockNotificationsTab with real activity management functionality.
 * 
 * Features:
 * - Activity list with ActivityCard components
 * - Status filtering using ActivityFilters with URL parameter support
 * - Multi-select status filtering (PENDING, OVERDUE, etc.)
 * - URL parameter parsing (?status=pending,overdue)
 * - Infinite scroll using Intersection Observer
 * - Loading states and error handling
 * - Empty state messages
 * - Pull-to-refresh (manual refresh button)
 * - Activity status updates
 * - Mobile-first responsive design
 * - Thai language support
 * - Accessibility compliance
 * 
 * @see /src/hooks/useActivities.ts - Data fetching hook
 * @see /src/components/activities/ActivityCard.tsx - Activity card component
 * @see /src/components/activities/ActivityFilters.tsx - Filter component
 */

'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActivities } from '@/hooks/useActivities';
import { ActivityStatus } from '@/types/activity';
import ActivityCard from './ActivityCard';
import ActivityFilters from './ActivityFilters';

interface ActivitiesTabProps {
  className?: string;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ className = '' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse status filters from URL parameter (e.g., ?status=pending,overdue)
  const statusParam = searchParams.get('status');
  const initialStatusFilters = React.useMemo(() => {
    if (!statusParam) return [];
    return statusParam
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => ['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE'].includes(s)) as ActivityStatus[];
  }, [statusParam]);

  const [activeStatusFilters, setActiveStatusFilters] = useState<ActivityStatus[]>(initialStatusFilters);

  // Build combined status filter for the hook
  const combinedStatusFilter = activeStatusFilters.length > 0 ? activeStatusFilters.join(',') : 'ALL';

  const {
    activities,
    isLoading,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
    updateActivityStatus,
  } = useActivities({
    limit: 20,
    autoFetch: true,
    status: combinedStatusFilter as any,
  });

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /**
   * Setup intersection observer for infinite scroll
   */
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoading, loadMore]);

  /**
   * Setup observer on mount and cleanup
   */
  useEffect(() => {
    setupIntersectionObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  /**
   * Handle activity card click (navigate to detail page)
   */
  const handleActivityClick = (activityId: string) => {
    // Navigation is handled by ActivityCard component
    // This function is kept for backward compatibility
  };

  /**
   * Handle activity status update
   */
  const handleStatusUpdate = async (activityId: string, status: any) => {
    try {
      await updateActivityStatus(activityId, status);
    } catch (error) {
      // Error is already handled by the hook
      console.error('Status update error:', error);
    }
  };

  /**
   * Handle status filter toggle
   */
  const handleFilterToggle = useCallback((status: ActivityStatus) => {
    const newFilters = activeStatusFilters.includes(status)
      ? activeStatusFilters.filter(s => s !== status)
      : [...activeStatusFilters, status];

    setActiveStatusFilters(newFilters);

    // Update URL with new filters
    const currentParams = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) {
      currentParams.set('status', newFilters.map(s => s.toLowerCase()).join(','));
    } else {
      currentParams.delete('status');
    }

    // Keep the tab parameter if it exists
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      currentParams.set('tab', tabParam);
    }

    router.push(`?${currentParams.toString()}`);
  }, [activeStatusFilters, searchParams, router]);

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setActiveStatusFilters([]);
    
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('status');
    
    // Keep the tab parameter if it exists
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      currentParams.set('tab', tabParam);
    }

    router.push(`?${currentParams.toString()}`);
  }, [searchParams, router]);

  /**
   * Sync active filters with URL parameter on mount and when URL changes
   */
  useEffect(() => {
    if (JSON.stringify(initialStatusFilters) !== JSON.stringify(activeStatusFilters)) {
      setActiveStatusFilters(initialStatusFilters);
    }
  }, [initialStatusFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`w-full ${className}`}>
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">รายการกิจกรรม</h2>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              ทั้งหมด {total} กิจกรรม
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-10"
          aria-label="รีเฟรช"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <ActivityFilters
            activeFilters={activeStatusFilters}
            onFilterToggle={handleFilterToggle}
            className="flex-1"
          />
          {activeStatusFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-2 h-10 px-3 text-muted-foreground"
              aria-label="ล้างตัวกรอง"
            >
              <X className="w-4 h-4 mr-1" />
              ล้าง
            </Button>
          )}
        </div>
        
        {/* Active filters indicator */}
        {activeStatusFilters.length > 0 && (
          <p className="text-xs text-muted-foreground">
            กำลังกรอง: {activeStatusFilters.length} สถานะ
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-md bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-destructive mb-1">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm text-destructive/90">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-2"
            >
              ลองใหม่
            </Button>
          </div>
        </div>
      )}

      {/* Loading State (Initial) */}
      {isLoading && activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="กำลังโหลด"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              กำลังโหลด...
            </span>
          </div>
          <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ไม่พบกิจกรรม
            </h3>
            <p className="text-sm text-muted-foreground">
              ยังไม่มีกิจกรรมในระบบ
            </p>
          </div>
        </div>
      )}

      {/* Activities List */}
      {activities.length > 0 && (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onStatusUpdate={handleStatusUpdate}
              onPress={() => handleActivityClick(activity.id)}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && activities.length > 0 && (
        <div ref={loadMoreRef} className="flex justify-center py-6">
          {isLoading && (
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
              aria-label="กำลังโหลดเพิ่มเติม"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                กำลังโหลดเพิ่มเติม...
              </span>
            </div>
          )}
        </div>
      )}

      {/* End of List Message */}
      {!hasMore && activities.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            แสดงครบทั้งหมดแล้ว
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;
