import { prisma } from '@/lib/prisma';

export const createMockFarm = (overrides = {}) => ({
  id: 'test-farm-id',
  name: 'ฟาร์มทดสอบ',
  province: 'จังหวัดทดสอบ',
  code: 'F001',
  ownerId: 'test-user-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockFarmOperations = {
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

export const setupFarmMocks = () => {
  (prisma.farm as any).findFirst = mockFarmOperations.findFirst;
  (prisma.farm as any).create = mockFarmOperations.create;
  (prisma.farm as any).update = mockFarmOperations.update;
  
  return mockFarmOperations;
};
