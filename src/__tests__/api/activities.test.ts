/**
 * Integration Tests for Activities API
 * GET /api/activities and POST /api/activities endpoints
 *
 * Tests comprehensive validation, authentication, authorization,
 * and database operations for activity management functionality.
 *
 * Coverage:
 * - Success scenarios (200, 201)
 * - Validation errors (400)
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Not found errors (404)
 * - Farm owner access scenarios
 * - Staff member access scenarios
 * - Unauthorized access scenarios
 * - Farm isolation security
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
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    animal: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock headers function
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import { GET, POST } from '@/app/api/activities/route';
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
};

const mockAnimal = {
  id: 'animal-id-123',
  farmId: 'farm-id-123',
  tagId: '001',
  type: 'WATER_BUFFALO',
  name: 'Test Buffalo',
  gender: 'FEMALE',
  status: 'ACTIVE',
  birthDate: null,
  color: null,
  weightKg: null,
  heightCm: null,
  motherTag: null,
  fatherTag: null,
  genome: null,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockActivity = {
  id: 'activity-id-123',
  farmId: 'farm-id-123',
  animalId: 'animal-id-123',
  title: 'Test Activity',
  description: 'Test Description',
  activityDate: new Date('2025-11-18'),
  dueDate: null,
  status: 'PENDING',
  statusReason: null,
  createdBy: 'owner-user-id',
  completedBy: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe('Activities API', () => {
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

    // Mock prisma functions with proper typing
    (prisma.activity.findMany as jest.Mock) = jest.fn();
    (prisma.activity.count as jest.Mock) = jest.fn();
    (prisma.activity.create as jest.Mock) = jest.fn();
    (prisma.animal.findUnique as jest.Mock) = jest.fn();
  });

  describe('Farm Owner Access', () => {
    it('should allow farm owner to list activities (GET)', async () => {
      // Arrange
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);
      (prisma.activity.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/activities');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.activities).toBeDefined();
      expect(data.data.pagination).toBeDefined();
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
    });

    it('should allow farm owner to create activity (POST)', async () => {
      // Arrange
      const activityData = {
        animalId: 'animal-id-123',
        title: 'Feeding Time',
        description: 'Morning feeding',
        activityDate: '2025-11-18T10:00:00Z',
        status: 'PENDING',
      };

      (prisma.animal.findUnique as jest.Mock).mockResolvedValue(mockAnimal);
      (prisma.activity.create as jest.Mock).mockResolvedValue(mockActivity);

      const request = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify(activityData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.activity).toBeDefined();
      expect(data.message).toBe('สร้างกิจกรรมสำเร็จแล้ว');
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
      expect(prisma.animal.findUnique).toHaveBeenCalledWith({
        where: { id: activityData.animalId },
      });
    });

    it('should return correct data structure for farm owner', async () => {
      // Arrange
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);
      (prisma.activity.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/activities?page=1&limit=20');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.activities).toHaveLength(1);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(20);
      expect(data.data.pagination.total).toBe(1);
      expect(data.data.pagination.totalPages).toBe(1);
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

    it('should allow staff member to list farm activities (GET)', async () => {
      // Arrange
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);
      (prisma.activity.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/activities');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.activities).toBeDefined();
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { farmId: mockFarm.id },
        })
      );
    });

    it('should allow staff member to create activity for farm animal (POST)', async () => {
      // Arrange
      const activityData = {
        animalId: 'animal-id-123',
        title: 'Health Check',
        description: 'Regular health inspection',
        activityDate: '2025-11-18T14:00:00Z',
      };

      (prisma.animal.findUnique as jest.Mock).mockResolvedValue(mockAnimal);
      (prisma.activity.create as jest.Mock).mockResolvedValue({
        ...mockActivity,
        title: activityData.title,
        createdBy: mockStaffUser.id,
      });

      const request = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify(activityData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.activity).toBeDefined();
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
    });

    it('should enforce farm isolation for staff member activities', async () => {
      // Arrange
      const otherFarmAnimal = { ...mockAnimal, farmId: 'other-farm-id' };
      const activityData = {
        animalId: 'animal-id-123',
        title: 'Test Activity',
        activityDate: '2025-11-18T10:00:00Z',
      };

      (prisma.animal.findUnique as jest.Mock).mockResolvedValue(otherFarmAnimal);

      const request = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify(activityData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toBe('คุณไม่มีสิทธิ์สร้างกิจกรรมสำหรับกระบือนี้');
    });

    it('should return correct data for staff member with filtering', async () => {
      // Arrange
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);
      (prisma.activity.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/activities?status=PENDING&animalId=animal-123');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            farmId: mockFarm.id,
            animalId: 'animal-123',
            status: 'PENDING',
          },
        })
      );
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject access for users with no session (401)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue(null);

      const getRequest = new NextRequest('http://localhost:3000/api/activities');
      const postRequest = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const postResponse = await POST(postRequest);

      // Assert
      expect(getResponse.status).toBe(401);
      expect(postResponse.status).toBe(401);

      const getData = await getResponse.json();
      const postData = await postResponse.json();

      expect(getData.success).toBe(false);
      expect(getData.error.code).toBe('UNAUTHORIZED');
      expect(postData.success).toBe(false);
      expect(postData.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject access for users with no farm access (403)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockUnauthorizedUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );

      const getRequest = new NextRequest('http://localhost:3000/api/activities');
      const postRequest = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const postResponse = await POST(postRequest);

      // Assert
      expect(getResponse.status).toBe(403);
      expect(postResponse.status).toBe(403);

      const getData = await getResponse.json();
      const postData = await postResponse.json();

      expect(getData.success).toBe(false);
      expect(getData.error.code).toBe('NO_FARM_ACCESS');
      expect(postData.success).toBe(false);
      expect(postData.error.code).toBe('NO_FARM_ACCESS');
    });

    it('should handle farm context database errors (500)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockOwnerUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new Error('Database connection failed')
      );

      const getRequest = new NextRequest('http://localhost:3000/api/activities');
      const postRequest = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const postResponse = await POST(postRequest);

      // Assert
      expect(getResponse.status).toBe(500);
      expect(postResponse.status).toBe(500);

      const getData = await getResponse.json();
      const postData = await postResponse.json();

      expect(getData.success).toBe(false);
      expect(getData.error.code).toBe('INTERNAL_ERROR');
      expect(postData.success).toBe(false);
      expect(postData.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Route-Specific Operations', () => {
    describe('GET /api/activities', () => {
      it('should handle pagination parameters correctly', async () => {
        // Arrange
        (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.activity.count as jest.Mock).mockResolvedValue(0);

        const request = new NextRequest('http://localhost:3000/api/activities?page=2&limit=10');

        // Act
        await GET(request);

        // Assert
        expect(prisma.activity.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 10, // (page - 1) * limit
            take: 10,
          })
        );
      });

      it('should validate status parameter', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/activities?status=INVALID');

        // Act
        const response = await GET(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('INVALID_STATUS');
        expect(data.error.message).toBe('สถานะไม่ถูกต้อง');
      });

      it('should handle date range filtering', async () => {
        // Arrange
        (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.activity.count as jest.Mock).mockResolvedValue(0);

        const request = new NextRequest(
          'http://localhost:3000/api/activities?startDate=2025-11-01&endDate=2025-11-30'
        );

        // Act
        await GET(request);

        // Assert
        expect(prisma.activity.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              farmId: mockFarm.id,
              activityDate: {
                gte: new Date('2025-11-01'),
                lte: new Date('2025-11-30'),
              },
            },
          })
        );
      });
    });

    describe('POST /api/activities', () => {
      it('should validate required fields', async () => {
        // Arrange
        const invalidData = {
          // Missing animalId and title
          description: 'Test description',
        };

        const request = new NextRequest('http://localhost:3000/api/activities', {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.details).toBeDefined();
      });

      it('should validate UUID format for animalId', async () => {
        // Arrange
        const invalidData = {
          animalId: 'invalid-uuid',
          title: 'Test Activity',
          activityDate: '2025-11-18T10:00:00Z',
        };

        const request = new NextRequest('http://localhost:3000/api/activities', {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.details.some((detail: any) => detail.field === 'animalId')).toBe(true);
      });

      it('should handle animal not found (404)', async () => {
        // Arrange
        const activityData = {
          animalId: 'non-existent-animal-id',
          title: 'Test Activity',
          activityDate: '2025-11-18T10:00:00Z',
        };

        (prisma.animal.findUnique as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/activities', {
          method: 'POST',
          body: JSON.stringify(activityData),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('ANIMAL_NOT_FOUND');
        expect(data.error.message).toBe('ไม่พบข้อมูลกระบือ');
      });

      it('should handle database foreign key constraint errors', async () => {
        // Arrange
        const activityData = {
          animalId: 'animal-id-123',
          title: 'Test Activity',
          activityDate: '2025-11-18T10:00:00Z',
        };

        (prisma.animal.findUnique as jest.Mock).mockResolvedValue(mockAnimal);
        (prisma.activity.create as jest.Mock).mockRejectedValue({
          code: 'P2003',
          name: 'PrismaClientKnownRequestError',
        });

        const request = new NextRequest('http://localhost:3000/api/activities', {
          method: 'POST',
          body: JSON.stringify(activityData),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('INVALID_REFERENCE');
        expect(data.error.message).toBe('ข้อมูลอ้างอิงไม่ถูกต้อง');
      });

      it('should apply default status PENDING when not provided', async () => {
        // Arrange
        const activityData = {
          animalId: 'animal-id-123',
          title: 'Test Activity',
          activityDate: '2025-11-18T10:00:00Z',
          // No status field - should default to PENDING
        };

        (prisma.animal.findUnique as jest.Mock).mockResolvedValue(mockAnimal);
        (prisma.activity.create as jest.Mock).mockResolvedValue({
          ...mockActivity,
          status: 'PENDING',
        });

        const request = new NextRequest('http://localhost:3000/api/activities', {
          method: 'POST',
          body: JSON.stringify(activityData),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(201);
        expect(prisma.activity.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: 'PENDING',
            }),
          })
        );
      });
    });
  });

  describe('Response Structure', () => {
    it('should return correct structure for successful GET (200)', async () => {
      // Arrange
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([mockActivity]);
      (prisma.activity.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/activities');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data).toEqual({
        success: true,
        data: {
          activities: [mockActivity],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
        timestamp: expect.any(String),
      });
    });

    it('should return correct structure for successful POST (201)', async () => {
      // Arrange
      const activityData = {
        animalId: 'animal-id-123',
        title: 'Test Activity',
        activityDate: '2025-11-18T10:00:00Z',
      };

      (prisma.animal.findUnique as jest.Mock).mockResolvedValue(mockAnimal);
      (prisma.activity.create as jest.Mock).mockResolvedValue(mockActivity);

      const request = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify(activityData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data).toEqual({
        success: true,
        data: {
          activity: mockActivity,
        },
        message: 'สร้างกิจกรรมสำเร็จแล้ว',
        timestamp: expect.any(String),
      });
    });

    it('should return correct structure for validation errors (400)', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/activities', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('ข้อมูลไม่ถูกต้อง');
      expect(data.error.details).toBeDefined();
      expect(Array.isArray(data.error.details)).toBe(true);
      expect(data.timestamp).toBeDefined();
    });
  });
});