/**
 * useActivities Hook - Jaothui ID-Trace System
 * 
 * Custom React hook for fetching and managing activity data with infinite scroll.
 * Provides data fetching, pagination, filtering, and status update capabilities.
 * 
 * Features:
 * - Automatic data fetching with pagination
 * - Infinite scroll support
 * - Status filtering
 * - Activity status updates (COMPLETE/CANCEL)
 * - Error handling with Thai messages
 * - Loading states
 * - Optimistic updates
 * 
 * @see /src/types/activity.ts - Type definitions
 * @see /src/app/api/activities/route.ts - API endpoint
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, ActivitiesResponse, ApiError, ActivityStatus } from '@/types/activity';

/**
 * Hook configuration options
 */
export interface UseActivitiesOptions {
  /** Initial page number */
  initialPage?: number;
  /** Items per page */
  limit?: number;
  /** Filter by status */
  status?: ActivityStatus | 'ALL';
  /** Filter by animal ID */
  animalId?: string;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

/**
 * Hook return type
 */
export interface UseActivitiesReturn {
  /** Activities data */
  activities: Activity[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Has more pages to load */
  hasMore: boolean;
  /** Current page number */
  page: number;
  /** Total count */
  total: number;
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
  /** Update activity status */
  updateActivityStatus: (activityId: string, status: ActivityStatus, statusReason?: string) => Promise<void>;
  /** Set status filter */
  setStatusFilter: (status: ActivityStatus | 'ALL') => void;
}

/**
 * Custom hook for activity data management
 */
export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
  const {
    initialPage = 1,
    limit = 20,
    status: initialStatus = 'ALL',
    animalId,
    autoFetch = true,
  } = options;

  // State management
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'ALL'>(initialStatus);
  const [hasMore, setHasMore] = useState(true);

  // Ref to prevent duplicate fetches
  const isFetchingRef = useRef(false);

  /**
   * Fetch activities from API
   */
  const fetchActivities = useCallback(async (pageNum: number, append: boolean = false) => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      if (animalId) {
        params.append('animalId', animalId);
      }

      // Fetch data
      const response = await fetch(`/api/activities?${params.toString()}`);

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      }

      const data: ActivitiesResponse = await response.json();

      // Update state
      setActivities(prev => append ? [...prev, ...data.data.activities] : data.data.activities);
      setTotal(data.data.pagination.total);
      setHasMore(data.data.pagination.page < data.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [limit, statusFilter, animalId]);

  /**
   * Load more activities (for infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) {
      return;
    }

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchActivities(nextPage, true);
  }, [page, hasMore, isLoading, fetchActivities]);

  /**
   * Refresh activities (reset to page 1)
   */
  const refresh = useCallback(async () => {
    setPage(1);
    setActivities([]);
    await fetchActivities(1, false);
  }, [fetchActivities]);

  /**
   * Update activity status
   */
  const updateActivityStatus = useCallback(async (
    activityId: string,
    status: ActivityStatus,
    statusReason?: string
  ) => {
    try {
      setError(null);

      // Optimistic update
      setActivities(prev => prev.map(activity =>
        activity.id === activityId
          ? { ...activity, status, statusReason: statusReason || null }
          : activity
      ));

      // API call
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          statusReason,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error?.message || 'ไม่สามารถอัปเดตสถานะได้');
      }

      const data = await response.json();

      // Update with server response
      setActivities(prev => prev.map(activity =>
        activity.id === activityId ? data.data.activity : activity
      ));
    } catch (err) {
      console.error('Failed to update activity status:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      
      // Revert optimistic update
      await refresh();
      throw err;
    }
  }, [refresh]);

  /**
   * Handle status filter change
   */
  const handleSetStatusFilter = useCallback((newStatus: ActivityStatus | 'ALL') => {
    setStatusFilter(newStatus);
    setPage(1);
    setActivities([]);
  }, []);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (autoFetch) {
      fetchActivities(1, false);
    }
    // Intentionally omitting fetchActivities from deps to avoid infinite loop
    // fetchActivities is memoized with useCallback and depends on filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, statusFilter, animalId]); // Re-fetch when filters change

  return {
    activities,
    isLoading,
    error,
    hasMore,
    page,
    total,
    loadMore,
    refresh,
    updateActivityStatus,
    setStatusFilter: handleSetStatusFilter,
  };
}
