/**
 * Mock Data for Jaothui ID-Trace System
 * 
 * This file contains mock data structures that match the Prisma schema exactly.
 * These mocks are used for UI development and will be replaced with real API calls later.
 * 
 * IMPORTANT: All interfaces must match the Prisma schema field names and types.
 * When integrating with the real backend, only the data source changes - no prop/name changes.
 */

/**
 * Farm Interface
 * Matches: prisma/schema.prisma -> model Farm
 */
export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  province: string | null;
  code: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Farm Data
 * Based on design specifications from issue #52
 * 
 * Farm Identity:
 * - Name: ศรีวนาลัย
 * - Province: จังหวัดนครราชสีมา
 * - Code: F002
 * 
 * NOTE: ownerId should be set to real session.user.id at runtime
 */
export const mockFarm: Farm = {
  id: "mock-farm-001",
  name: "ศรีวนาลัย",
  code: "F002",
  province: "จังหวัดนครราชสีมา",
  ownerId: "", // To be replaced with session.user.id at runtime
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

/**
 * Get Mock Farm with Real Owner ID
 * 
 * @param userId - Real user ID from session
 * @returns Farm object with real owner ID
 */
export function getMockFarmForUser(userId: string): Farm {
  return {
    ...mockFarm,
    ownerId: userId,
  };
}
