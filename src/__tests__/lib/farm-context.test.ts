/**
 * Farm Context Resolver Utility Tests
 *
 * Comprehensive test coverage for the farm context resolver utility.
 * Tests all scenarios including ownership, membership, edge cases, and error handling.
 */

import { getUserFarmContext, getAllUserFarmContexts, checkUserFarmAccess, FarmContextError } from '../../lib/farm-context';
import { prisma } from '../../lib/prisma';
import type { Farm, FarmMember, Role } from '@/types/farm';

// Mock the prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    farm: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    farmMember: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Farm Context Resolver', () => {
  const mockUserId = 'user-uuid-123';
  const mockFarmId = 'farm-uuid-456';
  const mockAnotherFarmId = 'farm-uuid-789';

  const mockFarm: Farm = {
    id: mockFarmId,
    name: 'Test Farm',
    ownerId: mockUserId,
    province: 'Bangkok',
    code: 'TF001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnotherFarm: Farm = {
    id: mockAnotherFarmId,
    name: 'Another Farm',
    ownerId: 'another-owner-uuid',
    province: 'Chiang Mai',
    code: 'AF002',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFarmMember: FarmMember & { farm: Farm } = {
    id: 'membership-uuid-123',
    farmId: mockAnotherFarmId,
    userId: mockUserId,
    role: 'MEMBER' as Role,
    joinedAt: new Date(),
    farm: mockAnotherFarm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFarmContext', () => {
    it('should return owner context when user owns a farm', async () => {
      // Arrange - Mock the optimized query result for ownership
      const queryResult = [{
        access_type: 'owner' as const,
        id: mockFarmId,
        farm_name: 'Test Farm',
        farm_code: 'TF001',
        description: null,
        province: 'Bangkok',
        owner_id: mockUserId,
        created_at: mockFarm.createdAt,
        updated_at: mockFarm.updatedAt,
        member_role: null,
      }];
      mockPrisma.$queryRaw.mockResolvedValue(queryResult);

      // Act
      const result = await getUserFarmContext(mockUserId);

      // Assert
      expect(result).toEqual({
        farm: expect.objectContaining({
          id: mockFarmId,
          name: 'Test Farm',
          ownerId: mockUserId,
        }),
        role: 'OWNER',
        accessLevel: 'full',
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return member context when user is farm member', async () => {
      // Arrange - Mock the optimized query result for membership
      const queryResult = [{
        access_type: 'member' as const,
        id: mockAnotherFarmId,
        farm_name: 'Another Farm',
        farm_code: 'AF002',
        description: null,
        province: 'Chiang Mai',
        owner_id: 'another-owner-uuid',
        created_at: mockAnotherFarm.createdAt,
        updated_at: mockAnotherFarm.updatedAt,
        member_role: 'MEMBER',
      }];
      mockPrisma.$queryRaw.mockResolvedValue(queryResult);

      // Act
      const result = await getUserFarmContext(mockUserId);

      // Assert
      expect(result).toEqual({
        farm: expect.objectContaining({
          id: mockAnotherFarmId,
          name: 'Another Farm',
        }),
        role: 'MEMBER',
        accessLevel: 'limited',
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return owner context when user has both owned farm and membership', async () => {
      // Arrange - Mock query returns ownership first (due to ORDER BY access_type DESC)
      const queryResult = [{
        access_type: 'owner' as const,
        id: mockFarmId,
        farm_name: 'Test Farm',
        farm_code: 'TF001',
        description: null,
        province: 'Bangkok',
        owner_id: mockUserId,
        created_at: mockFarm.createdAt,
        updated_at: mockFarm.updatedAt,
        member_role: null,
      }];
      mockPrisma.$queryRaw.mockResolvedValue(queryResult);

      // Act
      const result = await getUserFarmContext(mockUserId);

      // Assert
      expect(result.role).toBe('OWNER');
      expect(result.accessLevel).toBe('full');
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should check specific farm access when farmId is provided', async () => {
      // Arrange
      mockPrisma.farm.findFirst.mockResolvedValue(mockFarm);

      // Act
      const result = await getUserFarmContext(mockUserId, { farmId: mockFarmId });

      // Assert
      expect(result).toEqual({
        farm: mockFarm,
        role: 'OWNER',
        accessLevel: 'full',
      });
      expect(mockPrisma.farm.findFirst).toHaveBeenCalledWith({
        where: { id: mockFarmId, ownerId: mockUserId },
      });
    });

    it('should check membership for specific farm when not owner', async () => {
      // Arrange
      mockPrisma.farm.findFirst
        .mockResolvedValueOnce(null) // First call for specific farm ownership
        .mockResolvedValueOnce(null); // Second call for general ownership
      mockPrisma.farmMember.findFirst.mockResolvedValue(mockFarmMember);

      // Act
      const result = await getUserFarmContext(mockUserId, { farmId: mockAnotherFarmId });

      // Assert
      expect(result).toEqual({
        farm: mockAnotherFarm,
        role: 'MEMBER',
        accessLevel: 'limited',
      });
    });

    it('should throw NO_ACCESS error when user has no farm access', async () => {
      // Arrange - Mock query returns empty array
      mockPrisma.$queryRaw.mockResolvedValue([]);

      // Act & Assert
      await expect(getUserFarmContext(mockUserId)).rejects.toThrow(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );
    });

    it('should throw NO_ACCESS error when user has no access to specific farm', async () => {
      // Arrange
      mockPrisma.farm.findFirst.mockResolvedValue(null);
      mockPrisma.farmMember.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserFarmContext(mockUserId, { farmId: mockFarmId })).rejects.toThrow(
        new FarmContextError(`User has no access to farm with ID: ${mockFarmId}`, 'NO_ACCESS')
      );
    });

    it('should throw INVALID_USER error when userId is invalid', async () => {
      // Act & Assert
      await expect(getUserFarmContext('')).rejects.toThrow(
        new FarmContextError('Invalid user ID provided', 'INVALID_USER')
      );
      await expect(getUserFarmContext(null as any)).rejects.toThrow(
        new FarmContextError('Invalid user ID provided', 'INVALID_USER')
      );
    });

    it('should throw DATABASE_ERROR when prisma throws error', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      // Act & Assert
      await expect(getUserFarmContext(mockUserId)).rejects.toThrow(
        new FarmContextError('Failed to resolve farm context due to database error', 'DATABASE_ERROR')
      );
    });

    it('should handle OWNER role in membership with full access', async () => {
      // Arrange - Mock query returns member with OWNER role
      const queryResult = [{
        access_type: 'member' as const,
        id: mockAnotherFarmId,
        farm_name: 'Another Farm',
        farm_code: 'AF002',
        description: null,
        province: 'Chiang Mai',
        owner_id: 'another-owner-uuid',
        created_at: mockAnotherFarm.createdAt,
        updated_at: mockAnotherFarm.updatedAt,
        member_role: 'OWNER',
      }];
      mockPrisma.$queryRaw.mockResolvedValue(queryResult);

      // Act
      const result = await getUserFarmContext(mockUserId);

      // Assert
      expect(result).toEqual({
        farm: expect.objectContaining({
          id: mockAnotherFarmId,
        }),
        role: 'OWNER',
        accessLevel: 'full',
      });
    });
  });

  describe('getAllUserFarmContexts', () => {
    it('should return all owned and member farms', async () => {
      // Arrange
      const mockOwnedFarms = [mockFarm];
      const mockMemberships = [mockFarmMember];

      mockPrisma.farm.findMany.mockResolvedValue(mockOwnedFarms);
      mockPrisma.farmMember.findMany.mockResolvedValue(mockMemberships);

      // Act
      const result = await getAllUserFarmContexts(mockUserId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        farm: mockFarm,
        role: 'OWNER',
        accessLevel: 'full',
      });
      expect(result[1]).toEqual({
        farm: mockAnotherFarm,
        role: 'MEMBER',
        accessLevel: 'limited',
      });
    });

    it('should return only owned farms when no memberships', async () => {
      // Arrange
      const mockOwnedFarms = [mockFarm];
      mockPrisma.farm.findMany.mockResolvedValue(mockOwnedFarms);
      mockPrisma.farmMember.findMany.mockResolvedValue([]);

      // Act
      const result = await getAllUserFarmContexts(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('OWNER');
    });

    it('should return only memberships when no owned farms', async () => {
      // Arrange
      mockPrisma.farm.findMany.mockResolvedValue([]);
      mockPrisma.farmMember.findMany.mockResolvedValue([mockFarmMember]);

      // Act
      const result = await getAllUserFarmContexts(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('MEMBER');
    });

    it('should filter out memberships with null farm', async () => {
      // Arrange
      const membershipWithNullFarm: FarmMember & { farm: Farm | null } = {
        ...mockFarmMember,
        farm: null,
      };
      mockPrisma.farm.findMany.mockResolvedValue([]);
      mockPrisma.farmMember.findMany.mockResolvedValue([membershipWithNullFarm]);

      // Act
      const result = await getAllUserFarmContexts(mockUserId);

      // Assert
      expect(result).toHaveLength(0);
      await expect(getAllUserFarmContexts(mockUserId)).rejects.toThrow(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );
    });

    it('should throw NO_ACCESS error when user has no farm access', async () => {
      // Arrange
      mockPrisma.farm.findMany.mockResolvedValue([]);
      mockPrisma.farmMember.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(getAllUserFarmContexts(mockUserId)).rejects.toThrow(
        new FarmContextError('User has no access to any farm', 'NO_ACCESS')
      );
    });

    it('should throw INVALID_USER error when userId is invalid', async () => {
      // Act & Assert
      await expect(getAllUserFarmContexts('')).rejects.toThrow(
        new FarmContextError('Invalid user ID provided', 'INVALID_USER')
      );
    });

    it('should throw DATABASE_ERROR when prisma throws error', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrisma.farm.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(getAllUserFarmContexts(mockUserId)).rejects.toThrow(
        new FarmContextError('Failed to resolve farm contexts due to database error', 'DATABASE_ERROR')
      );
    });
  });

  describe('checkUserFarmAccess', () => {
    it('should return true when user has farm access', async () => {
      // Arrange - Mock query returns ownership
      const queryResult = [{
        access_type: 'owner' as const,
        id: mockFarmId,
        farm_name: 'Test Farm',
        farm_code: 'TF001',
        description: null,
        province: 'Bangkok',
        owner_id: mockUserId,
        created_at: mockFarm.createdAt,
        updated_at: mockFarm.updatedAt,
        member_role: null,
      }];
      mockPrisma.$queryRaw.mockResolvedValue(queryResult);

      // Act
      const result = await checkUserFarmAccess(mockUserId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user has no farm access', async () => {
      // Arrange - Mock query returns empty array
      mockPrisma.$queryRaw.mockResolvedValue([]);

      // Act
      const result = await checkUserFarmAccess(mockUserId);

      // Assert
      expect(result).toBe(false);
    });

    it('should re-throw non-access errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      // Act & Assert
      await expect(checkUserFarmAccess(mockUserId)).rejects.toThrow(
        new FarmContextError('Failed to resolve farm context due to database error', 'DATABASE_ERROR')
      );
    });
  });

  describe('FarmContextError', () => {
    it('should create error with correct properties', () => {
      // Act
      const error = new FarmContextError('Test message', 'NO_ACCESS');

      // Assert
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('NO_ACCESS');
      expect(error.name).toBe('FarmContextError');
    });

    it('should be instanceof Error and FarmContextError', () => {
      // Act
      const error = new FarmContextError('Test message', 'DATABASE_ERROR');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FarmContextError);
    });
  });
});