/**
 * Activity Type Definitions - Jaothui ID-Trace System
 * 
 * Central type definitions for Activity feature to avoid Prisma client dependencies
 * during build time. These types match the Prisma schema exactly.
 * 
 * @see prisma/schema.prisma - Activity model
 */

/**
 * Activity Status Enum
 * Matches Prisma ActivityStatus enum
 */
export type ActivityStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

/**
 * Activity with complete relations
 * Used for displaying activity details
 */
export interface Activity {
  id: string;
  farmId: string;
  animalId: string;
  title: string;
  description?: string | null;
  activityDate: Date | string;
  dueDate?: Date | string | null;
  status: ActivityStatus;
  statusReason?: string | null;
  createdBy: string;
  completedBy?: string | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  animal?: {
    id: string;
    tagId: string;
    name?: string | null;
    imageUrl?: string | null;
  };
  creator?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  completer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

/**
 * Activity list item (simplified for list views)
 */
export interface ActivityListItem {
  id: string;
  title: string;
  description?: string | null;
  activityDate: Date | string;
  dueDate?: Date | string | null;
  status: ActivityStatus;
  animal?: {
    id: string;
    tagId: string;
    name?: string | null;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API Response types
 */
export interface ActivitiesResponse {
  success: boolean;
  data: {
    activities: Activity[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}

export interface ActivityResponse {
  success: boolean;
  data: {
    activity: Activity;
  };
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
