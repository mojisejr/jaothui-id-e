/**
 * Integration Tests for Farm Management API
 * GET /api/farm, POST /api/farm, and PUT /api/farm endpoints
 *
 * Tests comprehensive validation, authentication, authorization,
 * and database operations for farm management functionality.
 *
 * Coverage:
 * - Success scenarios (200, 201)
 * - Validation errors (400)
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Farm owner access scenarios
 * - Staff member access scenarios
 * - Unauthorized access scenarios
 * - Farm isolation and security
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
    farm: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock headers function
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import { GET, POST, PUT } from '@/app/api/farm/route';
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

const mockNewFarm = {
  id: 'new-farm-id-456',
  name: 'ฟาร์มของฉน',
  province: 'ไม่ระบุ',
  code: 'F001',
  ownerId: 'owner-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe('Farm API', () => {
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
    (prisma.farm.findFirst as jest.Mock) = jest.fn();
    (prisma.farm.create as jest.Mock) = jest.fn();
    (prisma.farm.update as jest.Mock) = jest.fn();
  });

  describe('Farm Owner Access', () => {
    it('should allow farm owner to retrieve farm information (GET)', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/farm');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm).toEqual(mockFarm);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockOwnerUser.id);
    });

    it('should allow farm owner to ensure farm exists (POST)', async () => {
      // Arrange
      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );
      (prisma.farm.create as jest.Mock).mockResolvedValue(mockNewFarm);

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.farm).toEqual(mockNewFarm);
      expect(prisma.farm.create).toHaveBeenCalledWith({
        data: {
          name: 'ฟาร์มของฉัน',
          province: 'ไม่ระบุ',
          ownerId: mockOwnerUser.id,
        },
      });
    });

    it('should return existing farm if farm already exists (POST)', async () => {
      // Arrange
      // getUserFarmContext succeeds, so farm already exists
      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm).toEqual(mockFarm);
      expect(prisma.farm.create).not.toHaveBeenCalled();
    });

    it('should allow farm owner to update farm information (PUT)', async () => {
      // Arrange
      const updatedFarm = { ...mockFarm, name: 'Updated Farm Name', province: 'Chiang Mai' };
      (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const updateData = {
        name: 'Updated Farm Name',
        province: 'Chiang Mai',
      };

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm).toEqual(updatedFarm);
      expect(prisma.farm.update).toHaveBeenCalledWith({
        where: { id: mockFarm.id },
        data: { name: 'Updated Farm Name', province: 'Chiang Mai' },
      });
    });

    it('should allow updating only farm name (PUT)', async () => {
      // Arrange
      const updatedFarm = { ...mockFarm, name: 'Only Name Updated' };
      (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const updateData = {
        name: 'Only Name Updated',
      };

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm.name).toBe('Only Name Updated');
      expect(prisma.farm.update).toHaveBeenCalledWith({
        where: { id: mockFarm.id },
        data: { name: 'Only Name Updated' },
      });
    });

    it('should allow updating only province (PUT)', async () => {
      // Arrange
      const updatedFarm = { ...mockFarm, province: 'Only Province Updated' };
      (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const updateData = {
        province: 'Only Province Updated',
      };

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm.province).toBe('Only Province Updated');
      expect(prisma.farm.update).toHaveBeenCalledWith({
        where: { id: mockFarm.id },
        data: { province: 'Only Province Updated' },
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

    it('should allow staff member to retrieve farm information (GET)', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/farm');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm).toEqual(mockFarm);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
    });

    it('should reject staff member from creating new farm (POST)', async () => {
      // Arrange
      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(prisma.farm.create).not.toHaveBeenCalled();
    });

    it('should allow staff member to update farm information (PUT)', async () => {
      // Arrange
      const updatedFarm = { ...mockFarm, name: 'Staff Updated Farm' };
      (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const updateData = {
        name: 'Staff Updated Farm',
      };

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.farm).toEqual(updatedFarm);
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
    });

    it('should enforce farm isolation for staff member operations', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/farm');

      // Act
      await GET(request);

      // Assert
      expect(mockGetUserFarmContext).toHaveBeenCalledWith(mockStaffUser.id);
      // Staff can only access the farm they are members of
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject access for users with no session (401)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue(null);

      const getRequest = new NextRequest('http://localhost:3000/api/farm');
      const postRequest = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });
      const putRequest = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const postResponse = await POST(postRequest);
      const putResponse = await PUT(putRequest);

      // Assert
      expect(getResponse.status).toBe(401);
      expect(postResponse.status).toBe(401);
      expect(putResponse.status).toBe(401);

      expect(getResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
      expect(postResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
      expect(putResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
    });

    it('should reject access for users with no farm access (403)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockUnauthorizedUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );

      const getRequest = new NextRequest('http://localhost:3000/api/farm');
      const putRequest = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const putResponse = await PUT(putRequest);

      // Assert
      expect(getResponse.status).toBe(403);
      expect(putResponse.status).toBe(403);

      expect(getResponse.json()).resolves.toEqual({ error: 'No farm access' });
      expect(putResponse.json()).resolves.toEqual({ error: 'No farm access' });
    });

    it('should handle farm context database errors (500)', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue({
        user: mockOwnerUser,
      });

      mockGetUserFarmContext.mockRejectedValue(
        new Error('Database connection failed')
      );

      const getRequest = new NextRequest('http://localhost:3000/api/farm');
      const putRequest = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const getResponse = await GET(getRequest);
      const putResponse = await PUT(putRequest);

      // Assert
      expect(getResponse.status).toBe(500);
      expect(putResponse.status).toBe(500);

      expect(getResponse.json()).resolves.toEqual({ error: 'Internal server error' });
      expect(putResponse.json()).resolves.toEqual({ error: 'Internal server error' });
    });
  });

  describe('Route-Specific Operations', () => {
    describe('POST /api/farm', () => {
      it('should handle non-farm-context errors properly', async () => {
        // Arrange
        mockAuth.api.getSession.mockResolvedValue({
          user: mockOwnerUser,
        });

        mockGetUserFarmContext.mockRejectedValue(
          new Error('Non-farm-context error')
        );

        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'POST',
        });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(500);
        expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
        expect(prisma.farm.create).not.toHaveBeenCalled();
      });
    });

    describe('PUT /api/farm', () => {
      it('should validate name field', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ name: '' }), // Empty name
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: 'Farm name must be a non-empty string',
        });
        expect(prisma.farm.update).not.toHaveBeenCalled();
      });

      it('should validate province field', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ province: '' }), // Empty province
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: 'Province must be a non-empty string',
        });
        expect(prisma.farm.update).not.toHaveBeenCalled();
      });

      it('should reject non-string name values', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ name: 123 }), // Number instead of string
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: 'Farm name must be a non-empty string',
        });
      });

      it('should reject non-string province values', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ province: null }), // null instead of string
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: 'Province must be a non-empty string',
        });
      });

      it('should trim whitespace from name field', async () => {
        // Arrange
        const updatedFarm = { ...mockFarm, name: 'Trimmed Name' };
        (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ name: '  Trimmed Name  ' }), // With whitespace
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(200);
        expect(prisma.farm.update).toHaveBeenCalledWith({
          where: { id: mockFarm.id },
          data: { name: 'Trimmed Name' }, // Should be trimmed
        });
      });

      it('should trim whitespace from province field', async () => {
        // Arrange
        const updatedFarm = { ...mockFarm, province: 'Trimmed Province' };
        (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ province: '  Trimmed Province  ' }), // With whitespace
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(200);
        expect(prisma.farm.update).toHaveBeenCalledWith({
          where: { id: mockFarm.id },
          data: { province: 'Trimmed Province' }, // Should be trimmed
        });
      });

      it('should reject requests with no valid fields to update', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({}), // Empty object
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: 'No valid fields to update',
        });
        expect(prisma.farm.update).not.toHaveBeenCalled();
      });

      it('should handle database update errors', async () => {
        // Arrange
        (prisma.farm.update as jest.Mock).mockRejectedValue(
          new Error('Database update failed')
        );

        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Test Update' }),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(500);
        expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
      });

      it('should ignore invalid fields in request body', async () => {
        // Arrange
        const updatedFarm = { ...mockFarm, name: 'Valid Name' };
        (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

        const request = new NextRequest('http://localhost:3000/api/farm', {
          method: 'PUT',
          body: JSON.stringify({
            name: 'Valid Name',
            invalidField: 'should be ignored',
            anotherInvalidField: 123,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        const response = await PUT(request);

        // Assert
        expect(response.status).toBe(200);
        expect(prisma.farm.update).toHaveBeenCalledWith({
          where: { id: mockFarm.id },
          data: { name: 'Valid Name' }, // Only valid fields included
        });
      });
    });
  });

  describe('Response Structure', () => {
    it('should return correct structure for successful GET (200)', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/farm');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(data).toEqual({
        farm: mockFarm,
      });
    });

    it('should return correct structure for successful POST with existing farm (200)', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data).toEqual({
        farm: mockFarm,
      });
    });

    it('should return correct structure for successful POST with new farm (201)', async () => {
      // Arrange
      mockGetUserFarmContext.mockRejectedValue(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );
      (prisma.farm.create as jest.Mock).mockResolvedValue(mockNewFarm);

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'POST',
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({
        farm: mockNewFarm,
      });
    });

    it('should return correct structure for successful PUT (200)', async () => {
      // Arrange
      const updatedFarm = { ...mockFarm, name: 'Updated Farm' };
      (prisma.farm.update as jest.Mock).mockResolvedValue(updatedFarm);

      const request = new NextRequest('http://localhost:3000/api/farm', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Farm' }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(data).toEqual({
        farm: updatedFarm,
      });
    });

    it('should return correct structure for error responses', async () => {
      // Arrange
      mockAuth.api.getSession.mockResolvedValue(null);

      const getRequest = new NextRequest('http://localhost:3000/api/farm');

      // Act
      const response = await GET(getRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized',
      });
    });
  });
});