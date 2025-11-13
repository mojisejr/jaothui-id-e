/**
 * Mock Data System for User Profile Interface
 * 
 * This file provides comprehensive mock data that matches the Prisma schema exactly.
 * It integrates with better-auth session to use real user data where available.
 * 
 * Usage:
 * ```typescript
 * import { getMockData, getMockFarm, getMockAnimals } from '@/lib/mock-data';
 * 
 * // Get all mock data for a user (with session integration)
 * const mockData = await getMockData(session.user);
 * 
 * // Get specific mock data
 * const farm = getMockFarm(userId);
 * const animals = getMockAnimals(farmId);
 * ```
 * 
 * @see src/types/mock-data.ts for type definitions
 * @see prisma/schema.prisma for schema reference
 */

import {
  MockUser,
  MockFarm,
  MockAnimal,
  MockActivity,
  MockFarmMember,
  MockDataCollection,
  SessionUser,
  Role,
  AnimalType,
  AnimalGender,
  AnimalStatus,
  ActivityStatus,
} from '@/types/mock-data';

/**
 * UUID Generator for Mock Data
 * Generates consistent UUIDs for mock data
 */
function generateMockUUID(seed: string): string {
  // Simple deterministic UUID generation for mock data
  // In real app, UUIDs come from database
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(0, 3)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
}

/**
 * Create Mock User
 * 
 * In real usage, user data comes from session (session.user)
 * This is only used for development when no session exists
 * 
 * @param sessionUser - Optional session user data (preferred)
 * @returns MockUser with real session data if available
 */
export function createMockUser(sessionUser?: SessionUser | null): MockUser {
  const now = new Date();
  
  // If session user provided, use real data
  if (sessionUser) {
    return {
      id: sessionUser.id,
      lineId: null,
      username: sessionUser.username || null,
      passwordHash: null,
      email: sessionUser.username || null,
      emailVerified: null,
      firstName: sessionUser.firstName || null,
      lastName: sessionUser.lastName || null,
      avatarUrl: sessionUser.avatarUrl || null,
      createdAt: now,
      updatedAt: now,
    };
  }
  
  // Fallback mock user for development without session
  return {
    id: generateMockUUID('mock-user-1'),
    lineId: null,
    username: 'เจ้าของฟาร์ม',
    passwordHash: null,
    email: 'owner@jaothui.local',
    emailVerified: null,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    avatarUrl: null,
    createdAt: new Date('2025-01-15T08:00:00.000Z'),
    updatedAt: now,
  };
}

/**
 * Create Mock Farm: ศรีวนาลัย
 * 
 * Farm data as specified in requirements:
 * - Name: ศรีวนาลัย
 * - Code: F002
 * - Province: จังหวัดนครราชสีมา
 * 
 * @param userId - Real user ID from session (session.user.id)
 * @returns MockFarm with real ownerId
 */
export function getMockFarm(userId: string): MockFarm {
  const now = new Date();
  
  return {
    id: generateMockUUID('farm-srivanmalai'),
    name: 'ศรีวนาลัย',
    ownerId: userId, // Real session.user.id
    province: 'จังหวัดนครราชสีมา',
    code: 'F002',
    createdAt: new Date('2025-01-15T08:00:00.000Z'),
    updatedAt: now,
  };
}

/**
 * Create Mock Farm Member
 * Links user to farm with OWNER role
 * 
 * @param farmId - Farm UUID
 * @param userId - User UUID from session
 * @returns MockFarmMember
 */
export function getMockFarmMember(farmId: string, userId: string): MockFarmMember {
  return {
    id: generateMockUUID(`member-${farmId}-${userId}`),
    farmId,
    userId,
    role: Role.OWNER,
    joinedAt: new Date('2025-01-15T08:00:00.000Z'),
  };
}

/**
 * Create Mock Animals
 * 3-5 sample buffalo records with realistic Thai names and data
 * 
 * @param farmId - Farm UUID
 * @returns Array of MockAnimal
 */
export function getMockAnimals(farmId: string): MockAnimal[] {
  const now = new Date();
  
  return [
    {
      id: generateMockUUID('animal-001'),
      farmId,
      tagId: '001',
      name: 'นาเดีย',
      type: AnimalType.WATER_BUFFALO,
      gender: AnimalGender.FEMALE,
      status: AnimalStatus.ACTIVE,
      birthDate: new Date('2019-03-15'), // BE 2562-03-15
      color: 'ดำ',
      weightKg: 450.5,
      heightCm: 145,
      motherTag: 'M001',
      fatherTag: 'F001',
      genome: null,
      imageUrl: null,
      createdAt: new Date('2025-01-15T08:00:00.000Z'),
      updatedAt: now,
    },
    {
      id: generateMockUUID('animal-002'),
      farmId,
      tagId: '002',
      name: 'ทองดี',
      type: AnimalType.WATER_BUFFALO,
      gender: AnimalGender.MALE,
      status: AnimalStatus.ACTIVE,
      birthDate: new Date('2020-05-20'), // BE 2563-05-20
      color: 'น้ำตาล',
      weightKg: 520.0,
      heightCm: 150,
      motherTag: 'M001',
      fatherTag: 'F002',
      genome: null,
      imageUrl: null,
      createdAt: new Date('2025-01-15T08:00:00.000Z'),
      updatedAt: now,
    },
    {
      id: generateMockUUID('animal-003'),
      farmId,
      tagId: '003',
      name: 'สมศรี',
      type: AnimalType.WATER_BUFFALO,
      gender: AnimalGender.FEMALE,
      status: AnimalStatus.ACTIVE,
      birthDate: new Date('2021-08-10'), // BE 2564-08-10
      color: 'ดำเข้ม',
      weightKg: 380.25,
      heightCm: 138,
      motherTag: 'M002',
      fatherTag: 'F001',
      genome: null,
      imageUrl: null,
      createdAt: new Date('2025-02-10T10:30:00.000Z'),
      updatedAt: now,
    },
    {
      id: generateMockUUID('animal-004'),
      farmId,
      tagId: '004',
      name: 'แดง',
      type: AnimalType.WATER_BUFFALO,
      gender: AnimalGender.MALE,
      status: AnimalStatus.ACTIVE,
      birthDate: new Date('2022-01-25'), // BE 2565-01-25
      color: 'น้ำตาลแดง',
      weightKg: 420.75,
      heightCm: 142,
      motherTag: 'M003',
      fatherTag: 'F002',
      genome: null,
      imageUrl: null,
      createdAt: new Date('2025-02-20T14:15:00.000Z'),
      updatedAt: now,
    },
    {
      id: generateMockUUID('animal-005'),
      farmId,
      tagId: '005',
      name: 'มาลี',
      type: AnimalType.WATER_BUFFALO,
      gender: AnimalGender.FEMALE,
      status: AnimalStatus.ACTIVE,
      birthDate: new Date('2023-04-12'), // BE 2566-04-12
      color: 'ดำ',
      weightKg: 350.0,
      heightCm: 135,
      motherTag: 'M002',
      fatherTag: 'F003',
      genome: null,
      imageUrl: null,
      createdAt: new Date('2025-03-05T09:45:00.000Z'),
      updatedAt: now,
    },
  ];
}

/**
 * Create Mock Activities
 * Sample feeding, medication, and vaccination activities
 * 
 * @param farmId - Farm UUID
 * @param animals - Array of animals to create activities for
 * @param userId - User UUID for createdBy field
 * @returns Array of MockActivity
 */
export function getMockActivities(
  farmId: string,
  animals: MockAnimal[],
  userId: string
): MockActivity[] {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activities: MockActivity[] = [];
  
  // Activity for animal 001 - Feeding (Completed)
  if (animals[0]) {
    activities.push({
      id: generateMockUUID('activity-001-feed'),
      farmId,
      animalId: animals[0].id,
      title: 'ให้อาหาร',
      description: 'ให้อาหารหญ้าสด 20 กก. และอาหารสำเร็จรูป 5 กก.',
      activityDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: ActivityStatus.COMPLETED,
      statusReason: 'ดำเนินการสำเร็จ',
      createdBy: userId,
      completedBy: userId,
      completedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // Yesterday 6 hours later
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });
  }
  
  // Activity for animal 002 - Vaccination (Pending)
  if (animals[1]) {
    activities.push({
      id: generateMockUUID('activity-002-vaccine'),
      farmId,
      animalId: animals[1].id,
      title: 'ฉีดวัคซีน',
      description: 'ฉีดวัคซีนป้องกันโรคปากและเท้าเปื่อย',
      activityDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: ActivityStatus.PENDING,
      statusReason: null,
      createdBy: userId,
      completedBy: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  // Activity for animal 003 - Health Check (Pending, Due Today)
  if (animals[2]) {
    activities.push({
      id: generateMockUUID('activity-003-health'),
      farmId,
      animalId: animals[2].id,
      title: 'ตรวจสุขภาพ',
      description: 'ตรวจสุขภาพทั่วไป ชั่งน้ำหนัก วัดอุณหภูมิ',
      activityDate: today,
      dueDate: today,
      status: ActivityStatus.PENDING,
      statusReason: null,
      createdBy: userId,
      completedBy: null,
      completedAt: null,
      createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });
  }
  
  // Activity for animal 004 - Medication (Overdue)
  if (animals[3]) {
    activities.push({
      id: generateMockUUID('activity-004-medicine'),
      farmId,
      animalId: animals[3].id,
      title: 'ให้ยา',
      description: 'ให้ยาถ่ายพยาธิ',
      activityDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: ActivityStatus.OVERDUE,
      statusReason: 'เลยกำหนด',
      createdBy: userId,
      completedBy: null,
      completedAt: null,
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });
  }
  
  // Activity for animal 005 - Feeding (Pending, Due Tomorrow)
  if (animals[4]) {
    activities.push({
      id: generateMockUUID('activity-005-feed'),
      farmId,
      animalId: animals[4].id,
      title: 'ให้อาหาร',
      description: 'ให้อาหารเสริมวิตามิน',
      activityDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
      status: ActivityStatus.PENDING,
      statusReason: null,
      createdBy: userId,
      completedBy: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  // Additional completed activity for animal 001 - Vaccination
  if (animals[0]) {
    activities.push({
      id: generateMockUUID('activity-001-vaccine-old'),
      farmId,
      animalId: animals[0].id,
      title: 'ฉีดวัคซีน',
      description: 'ฉีดวัคซีนป้องกันโรคปากและเท้าเปื่อย (รอบที่ 2)',
      activityDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      dueDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      status: ActivityStatus.COMPLETED,
      statusReason: 'ดำเนินการสำเร็จ',
      createdBy: userId,
      completedBy: userId,
      completedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      createdAt: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    });
  }
  
  return activities;
}

/**
 * Get Complete Mock Data Collection
 * 
 * This is the main function to get all mock data for the User Profile Interface.
 * It integrates with better-auth session to use real user data.
 * 
 * Usage:
 * ```typescript
 * import { auth } from '@/lib/auth';
 * import { getMockData } from '@/lib/mock-data';
 * 
 * // In a server component or API route
 * const session = await auth.api.getSession({ headers: await headers() });
 * const mockData = getMockData(session?.user);
 * ```
 * 
 * @param sessionUser - Optional session user data from better-auth
 * @returns Complete MockDataCollection with all related data
 */
export function getMockData(sessionUser?: SessionUser | null): MockDataCollection {
  // Create user (with real session data if available)
  const user = createMockUser(sessionUser);
  
  // Create farm (using real user.id)
  const farm = getMockFarm(user.id);
  
  // Create farm member relationship
  const farmMember = getMockFarmMember(farm.id, user.id);
  
  // Create animals
  const animals = getMockAnimals(farm.id);
  
  // Create activities
  const activities = getMockActivities(farm.id, animals, user.id);
  
  return {
    user,
    farms: [farm],
    animals,
    activities,
    farmMembers: [farmMember],
  };
}

/**
 * Default export for convenience
 */
export default getMockData;
