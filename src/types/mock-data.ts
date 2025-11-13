/**
 * Mock Data Type Definitions
 * 
 * This file contains TypeScript interfaces that exactly match the Prisma schema
 * for use in mock data generation and User Profile Interface development.
 * 
 * All field names, types, and relationships are consistent with:
 * - prisma/schema.prisma
 * - @prisma/client generated types
 * 
 * @see prisma/schema.prisma for the authoritative schema definition
 */

/**
 * Enums - Must match Prisma schema exactly
 */
export enum Role {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export enum AnimalType {
  WATER_BUFFALO = 'WATER_BUFFALO',
  SWAMP_BUFFALO = 'SWAMP_BUFFALO',
  CATTLE = 'CATTLE',
  GOAT = 'GOAT',
  PIG = 'PIG',
  CHICKEN = 'CHICKEN',
}

export enum AnimalGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export enum AnimalStatus {
  ACTIVE = 'ACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
  SOLD = 'SOLD',
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

/**
 * Mock User Type
 * Matches Prisma User model
 * 
 * Note: In production, user data comes from database via better-auth session
 * In mock mode, this represents the authenticated user
 */
export interface MockUser {
  id: string; // UUID format
  lineId?: string | null;
  username?: string | null;
  passwordHash?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Farm Type
 * Matches Prisma Farm model
 * 
 * Note: ownerId should be set to session.user.id in real usage
 */
export interface MockFarm {
  id: string; // UUID format
  name: string; // farm_name in DB
  ownerId: string; // owner_id in DB - should be session.user.id
  province?: string | null;
  code?: string | null; // farm_code in DB - unique
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Farm Member Type
 * Matches Prisma FarmMember model
 */
export interface MockFarmMember {
  id: string; // UUID format
  farmId: string; // farm_id in DB
  userId: string; // user_id in DB
  role: Role;
  joinedAt: Date;
}

/**
 * Mock Animal Type
 * Matches Prisma Animal model
 * 
 * Note: All optional fields can be null as per schema
 * Decimal fields (weightKg) are represented as number in TypeScript
 */
export interface MockAnimal {
  id: string; // UUID format
  farmId: string; // farm_id in DB
  tagId: string; // tag_id in DB
  name?: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate?: Date | null; // birth_date in DB - Date type
  color?: string | null;
  weightKg?: number | null; // weight_kg in DB - Decimal(8,2)
  heightCm?: number | null; // height_cm in DB - Int
  motherTag?: string | null; // mother_tag in DB
  fatherTag?: string | null; // father_tag in DB
  genome?: string | null;
  imageUrl?: string | null; // image_url in DB
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Activity Type
 * Matches Prisma Activity model
 * 
 * Note: createdBy should reference the user who created the activity
 * completedBy and completedAt are optional until activity is completed
 */
export interface MockActivity {
  id: string; // UUID format
  farmId: string; // farm_id in DB
  animalId: string; // animal_id in DB
  title: string;
  description?: string | null;
  activityDate: Date; // activity_date in DB - Date type
  dueDate?: Date | null; // due_date in DB - Date type
  status: ActivityStatus;
  statusReason?: string | null; // status_reason in DB
  createdBy: string; // created_by in DB - references User.id
  completedBy?: string | null; // completed_by in DB - references User.id
  completedAt?: Date | null; // completed_at in DB - Timestamptz
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Data Collection
 * Aggregates all mock data types for easy consumption
 */
export interface MockDataCollection {
  user: MockUser;
  farms: MockFarm[];
  animals: MockAnimal[];
  activities: MockActivity[];
  farmMembers: MockFarmMember[];
}

/**
 * Session User Type
 * Represents the minimal user data from better-auth session
 * Used for integrating real session data with mock data
 */
export interface SessionUser {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}
