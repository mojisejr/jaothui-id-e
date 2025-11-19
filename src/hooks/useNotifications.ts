/**
 * useNotifications Hook - Jaothui ID-Trace System
 * 
 * Custom React hook for fetching and managing farm-level notification badge count
 * using SWR library for efficient data fetching, caching, and auto-revalidation.
 * 
 * Features:
 * - SWR-based data fetching with auto-refetch on window focus
 * - Automatic revalidation on network reconnect
 * - Smart caching with deduplication (60 second cache)
 * - Error handling with retry mechanism
 * - Loading states management
 * - Manual refresh via mutate function
 * - TypeScript type safety (no any types)
 * 
 * @see /src/app/api/notifications/badge/route.ts - API endpoint
 * @see /src/lib/farm-context.ts - Farm context reference
 * @framework SWR v2.3.6
 * @language TypeScript (strict mode)
 */

import useSWR from 'swr';

/**
 * Notification breakdown by status type
 */
export interface NotificationBreakdown {
  /** Count of pending activities */
  pending: number;
  /** Count of overdue activities */
  overdue: number;
}

/**
 * API Response structure from /api/notifications/badge
 */
interface NotificationBadgeResponse {
  success: boolean;
  data: {
    badgeCount: number;
    breakdown: NotificationBreakdown;
    farmCounts: Array<{
      farmId: string;
      farmName: string;
      count: number;
    }>;
  };
  timestamp: string;
}

/**
 * Hook return type with strict TypeScript typing
 */
export interface UseNotificationsReturn {
  /** Total badge count (pending + overdue) */
  badgeCount: number;
  /** Breakdown by status */
  breakdown: NotificationBreakdown;
  /** Loading state */
  isLoading: boolean;
  /** Error state (null if no error) */
  error: Error | null;
  /** Manual refresh function */
  mutate: () => Promise<void>;
}

/**
 * SWR fetcher function for notification badge endpoint
 * 
 * @param url - API endpoint URL
 * @returns Promise with notification data
 * @throws Error on network errors or non-200 responses
 */
async function fetcher(url: string): Promise<NotificationBadgeResponse> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }
    }));
    
    // Handle specific HTTP status codes
    if (response.status === 401) {
      throw new Error('ต้องเข้าสู่ระบบก่อน');
    }
    
    if (response.status === 403) {
      throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูล');
    }

    throw new Error(errorData.error?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  }

  return response.json();
}

/**
 * useNotifications - Custom hook for notification badge management
 * 
 * Fetches farm-level notification badge count with SWR for optimal
 * caching, auto-revalidation, and manual refresh capabilities.
 * 
 * SWR Configuration:
 * - revalidateOnFocus: true - Auto-refetch when window regains focus
 * - revalidateOnReconnect: true - Auto-refetch on network reconnect
 * - dedupingInterval: 60000ms - Cache for 60 seconds
 * - focusThrottleInterval: 5000ms - Throttle focus refetch to 5 seconds
 * - errorRetryCount: 3 - Retry on error 3 times
 * - errorRetryInterval: 5000ms - Wait 5 seconds between retries
 * 
 * @returns UseNotificationsReturn - Notification data, states, and mutate function
 * 
 * @example
 * ```tsx
 * function NotificationBadge() {
 *   const { badgeCount, breakdown, isLoading, error, mutate } = useNotifications();
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 * 
 *   return (
 *     <div>
 *       <span>Notifications: {badgeCount}</span>
 *       <span>Pending: {breakdown.pending}</span>
 *       <span>Overdue: {breakdown.overdue}</span>
 *       <button onClick={() => mutate()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const { data, error, isLoading, mutate } = useSWR<NotificationBadgeResponse>(
    '/api/notifications/badge',
    fetcher,
    {
      // Auto-refetch on window focus
      revalidateOnFocus: true,
      
      // Auto-refetch on network reconnect
      revalidateOnReconnect: true,
      
      // Cache for 60 seconds (deduplication interval)
      dedupingInterval: 60000,
      
      // Throttle focus refetch to 5 seconds
      focusThrottleInterval: 5000,
      
      // Retry on error 3 times
      errorRetryCount: 3,
      
      // Wait 5 seconds between retries
      errorRetryInterval: 5000,
      
      // Don't retry on 401/403 errors (authentication/authorization)
      shouldRetryOnError: (err) => {
        // Don't retry on auth errors
        if (err.message.includes('ต้องเข้าสู่ระบบก่อน') || 
            err.message.includes('ไม่มีสิทธิ์เข้าถึงข้อมูล')) {
          return false;
        }
        return true;
      },
    }
  );

  // Log errors for debugging (only in development)
  if (error && process.env.NODE_ENV === 'development') {
    console.error('Notification fetch error:', error);
  }

  // Manual refresh wrapper function
  const handleMutate = async (): Promise<void> => {
    await mutate();
  };

  // Return hook data with proper defaults
  return {
    badgeCount: data?.data?.badgeCount ?? 0,
    breakdown: data?.data?.breakdown ?? { pending: 0, overdue: 0 },
    isLoading,
    error: error ?? null,
    mutate: handleMutate,
  };
}
