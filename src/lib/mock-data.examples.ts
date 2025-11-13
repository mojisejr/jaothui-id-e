/**
 * Mock Data Usage Examples
 * 
 * This file demonstrates how to use the mock data system
 * with the User Profile Interface.
 * 
 * Delete this file after reviewing the examples.
 */

import { getMockData, createMockUser, getMockFarm, getMockAnimals } from '@/lib/mock-data';
import type { SessionUser, MockDataCollection } from '@/types/mock-data';

// Example 1: Get all mock data with session integration
async function example1WithSession() {
  // Assume we have a session from better-auth
  const sessionUser: SessionUser = {
    id: 'real-uuid-from-session',
    username: 'owner@example.com',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    avatarUrl: null,
  };
  
  // Get all mock data (uses real session.user.id for ownerId)
  const mockData: MockDataCollection = getMockData(sessionUser);
  
  console.log('User:', mockData.user);
  console.log('Farm:', mockData.farms[0]);
  console.log('Animals count:', mockData.animals.length);
  console.log('Activities count:', mockData.activities.length);
}

// Example 2: Get mock data without session (development mode)
function example2WithoutSession() {
  // When no session is available, fallback mock user is created
  const mockData: MockDataCollection = getMockData();
  
  console.log('Fallback mock user:', mockData.user);
  console.log('Farm ศรีวนาลัย:', mockData.farms[0]);
}

// Example 3: Get specific mock data pieces
function example3SpecificData() {
  const userId = 'test-user-id';
  
  // Get only the farm
  const farm = getMockFarm(userId);
  console.log('Farm:', farm);
  
  // Get only the animals
  const animals = getMockAnimals(farm.id);
  console.log('Animals:', animals);
  
  // Get only the user
  const user = createMockUser();
  console.log('User:', user);
}

// Example 4: Using in a Next.js Server Component
async function example4ServerComponent() {
  // In a real server component, you would do:
  // import { auth } from '@/lib/auth';
  // import { headers } from 'next/headers';
  //
  // const session = await auth.api.getSession({ headers: await headers() });
  // const mockData = getMockData(session?.user);
  
  // For now, just show structure:
  const mockData = getMockData();
  
  return {
    user: mockData.user,
    farm: mockData.farms[0],
    animals: mockData.animals,
    activities: mockData.activities,
  };
}

// Example 5: Filtering activities by status
function example5FilterActivities() {
  const mockData = getMockData();
  
  // Get pending activities
  const pendingActivities = mockData.activities.filter(
    activity => activity.status === 'PENDING'
  );
  
  // Get overdue activities
  const overdueActivities = mockData.activities.filter(
    activity => activity.status === 'OVERDUE'
  );
  
  // Get completed activities
  const completedActivities = mockData.activities.filter(
    activity => activity.status === 'COMPLETED'
  );
  
  console.log('Pending:', pendingActivities.length);
  console.log('Overdue:', overdueActivities.length);
  console.log('Completed:', completedActivities.length);
}

// Example 6: Filtering animals by status
function example6FilterAnimals() {
  const mockData = getMockData();
  
  // Get active animals
  const activeAnimals = mockData.animals.filter(
    animal => animal.status === 'ACTIVE'
  );
  
  // Get female animals
  const femaleAnimals = mockData.animals.filter(
    animal => animal.gender === 'FEMALE'
  );
  
  console.log('Active animals:', activeAnimals.length);
  console.log('Female animals:', femaleAnimals.length);
}

export {
  example1WithSession,
  example2WithoutSession,
  example3SpecificData,
  example4ServerComponent,
  example5FilterActivities,
  example6FilterAnimals,
};
