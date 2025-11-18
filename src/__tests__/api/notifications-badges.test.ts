/**
 * Integration Tests for Notifications Badge API
 * GET /api/notifications/badge endpoint
 *
 * Tests comprehensive validation, authentication, authorization,
 * and database operations for notification badge functionality.
 *
 * Coverage:
 * - Success scenarios (200)
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Farm owner access scenarios
 * - Staff member access scenarios
 * - Unauthorized access scenarios
 * - Farm isolation security
 * - Notification count calculations
 *
 * Note: These tests use mocked dependencies to avoid external API calls
 * and database connections during unit testing.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { getUserFarmContext, FarmContextError } from '@/lib/farm-context';

// Mock the dependencies
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/farm-context', () => ({
  getUserFarmContext: jest.fn(),
  FarmContextError: jest.fn().mockImplementation((message, code) => {
    const error = new Error(message) as any;
    error.code = code;
    error.name = 'FarmContextError';
    return error;
  }),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      count: jest.fn(),
    },
  },
}));

// Mock headers function
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import { GET } from '@/app/api/notifications/badge/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as any;
const mockGetUserFarmContext = getUserFarmContext as jest.MockedFunction<typeof getUserFarmContext>;

// Mock data
const mockOwnerUser = {
  id: 'owner-user-id',
  email: 'owner@test.com',
  name: 'Farm Owner',
};

const mockStaffUser = {
  id: 'staff-user-id',
  email: 'staff@test.com',
  name: 'Staff Member',
};

const mockUnauthorizedUser = {
  id: 'unauthorized-user-id',
  email: 'unauthorized@test.com',
  name: 'Unauthorized User',
};

const mockFarm = {
  id: 'farm-id-123',
  name: 'Test Farm',
  province: 'Bangkok',
  code: 'TF001',
  ownerId: 'owner-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe('Notifications Badge API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful auth for owner
    mockAuth.api.getSession.mockResolvedValue({
      user: mockOwnerUser,
    });

    // Default successful farm context for owner
    mockGetUserFarmContext.mockResolvedValue({
      farm: mockFarm,
      role: 'OWNER',
      accessLevel: 'full',
    });

    // Default zero counts
    (prisma.activity.count as jest.Mock) = jest.fn().mockResolvedValue(0);
  });

  describe('Farm Owner Access', () => {
    it('should allow farm owner to get notification badge count', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(5) // pending count
        .mockResolvedValueOnce(3); // overdue count

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(8); // 5 + 3
      expect(data.data.breakdown.pending).toBe(5);
      expect(data.data.breakdown.overdue).toBe(3);
      expect(data.data.farmCounts).toHaveLength(1);
      expect(data.data.farmCounts[0].farmId).toBe(mockFarm.id);
      expect(data.data.farmCounts[0].farmName).toBe(mockFarm.name);
      expect(data.data.farmCounts[0].count).toBe(8);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
    });

    it('should return zero counts when no activities exist', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(0);
      expect(data.data.breakdown.pending).toBe(0);
      expect(data.data.breakdown.overdue).toBe(0);
      expect(data.data.farmCounts[0].count).toBe(0);
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id,
          status: 'PENDING',
        },
      });
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id,
          status: 'OVERDUE',
        },
      });
    });

    it('should handle only pending activities', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(10) // pending count
        .mockResolvedValueOnce(0); // overdue count

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(10);
      expect(data.data.breakdown.pending).toBe(10);
      expect(data.data.breakdown.overdue).toBe(0);
      expect(data.data.farmCounts[0].count).toBe(10);
    });

    it('should handle only overdue activities', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(0) // pending count
        .mockResolvedValueOnce(7); // overdue count

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(7);
      expect(data.data.breakdown.pending).toBe(0);
      expect(data.data.breakdown.overdue).toBe(7);
      expect(data.data.farmCounts[0].count).toBe(7);
    });

    it('should enforce farm isolation for owner notifications', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      await GET(request);

      // Assert
      expect(prisma.activity.count).toHaveBeenCalledTimes(2);
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id, // Only owner's farm
          status: 'PENDING',
        },
      });
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id, // Only owner's farm
          status: 'OVERDUE',
        },
      });
    });
  });

  describe('Staff Member Access', () => {
    beforeEach(() => {
      // Setup staff user authentication
      mockAuth.api.getSession.mockResolvedValue({
        user: mockStaffUser,
      });

      // Setup staff farm context (member of owner's farm)
      mockGetUserFarmContext.mockResolvedValue({
        farm: mockFarm,
        role: 'MEMBER',
        accessLevel: 'limited',
      });
    });

    it('should allow staff member to get notification badge count', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(4) // pending count
        .mockResolvedValueOnce(1); // overdue count

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(5); // 4 + 1
      expect(data.data.breakdown.pending).toBe(4);
      expect(data.data.breakdown.overdue).toBe(1);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
    });

    it('should enforce farm isolation for staff member notifications', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      await GET(request);

      // Assert
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id, // Only staff member's farm
          status: 'PENDING',
        },
      });
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: {
          farmId: mockFarm.id, // Only staff member's farm
          status: 'OVERDUE',
        },
      });
    });

    it('should return correct farm information for staff member', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.farmCounts).toHaveLength(1);
      expect(data.data.farmCounts[0]).toEqual({
        farmId: mockFarm.id,
        farmName: mockFarm.name,
        count: 0, // Default from mock
      });
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject access for users with no session (401)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('ต้องเข้าสู่ระบบก่อน');
      expect(data.timestamp).toBeDefined();
    });

    it('should reject access for users with no farm access (403)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockUnauthorizedUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_FARM_ACCESS');
      expect(data.error.message).toBe('ไม่พบฟาร์มของคุณ');
      expect(data.timestamp).toBeDefined();
    });

    it('should handle farm context database errors (500)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockOwnerUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('เกิดข้อผิดพลาดในการดึงข้อมูล');
      expect(data.timestamp).toBeDefined();
    });

    it('should handle activity count database errors (500)', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock).mockRejectedValue(
        new Error('Database query failed')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('เกิดข้อผิดพลาดในการดึงข้อมูล');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Route-Specific Operations', () => {
    it('should handle large notification counts', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(100) // pending count
        .mockResolvedValueOnce(50); // overdue count

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(150);
      expect(data.data.breakdown.pending).toBe(100);
      expect(data.data.breakdown.overdue).toBe(50);
    });

    it('should handle null/undefined activity counts gracefully', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(null as any)
        .mockResolvedValueOnce(undefined as any);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badgeCount).toBe(0); // Should handle null/undefined as 0
    });

    it('should ignore query parameters (farmId is optional)', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/notifications/badge?farmId=some-id&otherParam=value'
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Query parameters should be ignored, uses user's farm context
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
    });

    it('should ensure consistent data structure across all scenarios', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          badgeCount: 3,
          breakdown: {
            pending: 1,
            overdue: 2,
          },
          farmCounts: [
            {
              farmId: mockFarm.id,
              farmName: mockFarm.name,
              count: 3,
            },
          ],
        },
        timestamp: expect.any(String),
      });
    });
  });

  describe('Response Structure', () => {
    it('should return correct structure for successful response (200)', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.badgeCount).toBeDefined();
      expect(data.data.breakdown).toBeDefined();
      expect(data.data.breakdown.pending).toBeDefined();
      expect(data.data.breakdown.overdue).toBeDefined();
      expect(data.data.farmCounts).toBeDefined();
      expect(Array.isArray(data.data.farmCounts)).toBe(true);
      expect(data.data.farmCounts[0]).toEqual({
        farmId: expect.any(String),
        farmName: expect.any(String),
        count: expect.any(Number),
      });
      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
    });

    it('should return correct structure for unauthorized error (401)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('ต้องเข้าสู่ระบบก่อน');
      expect(data.timestamp).toBeDefined();
    });

    it('should return correct structure for forbidden error (403)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockUnauthorizedUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('NO_FARM_ACCESS');
      expect(data.error.message).toBe('ไม่พบฟาร์มของคุณ');
      expect(data.timestamp).toBeDefined();
    });

    it('should return correct structure for internal error (500)', async () => {
      // Arrange
      (prisma.activity.count as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('เกิดข้อผิดพลาดในการดึงข้อมูล');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Integration with getUserFarmContext', () => {
    it('should properly integrate with farm context resolver for owners', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      await GET(request);

      // Assert
      expect(mockGetUserFarmContext).toHaveBeenCalledTimes(1);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
    });

    it('should properly integrate with farm context resolver for staff', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockStaffUser,
      });

      mockGetUserFarmContext.mockResolvedValue({
        farm: mockFarm,
        role: 'MEMBER',
        accessLevel: 'limited',
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      await GET(request);

      // Assert
      expect(mockGetUserFarmContext).toHaveBeenCalledTimes(1);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
    });

    it('should handle FarmContextError correctly', async () => {
      // Arrange
      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('Specific farm context error', 'SPECIFIC_ERROR')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications/badge');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_FARM_ACCESS');
      expect(data.error.message).toBe('ไม่พบฟาร์มของคุณ');
    });
  });
});