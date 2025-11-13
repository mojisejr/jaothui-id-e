# Mock Data System

This directory contains the mock data system for the Jaothui ID-Trace User Profile Interface development.

## Files

- **`mock-data.ts`** - Mock data implementation with schema-accurate data
- **`mock-data.examples.ts`** - Usage examples (can be deleted after review)

## Type Definitions

Type definitions are located in `src/types/mock-data.ts` and include:

- `MockUser` - User model matching Prisma schema
- `MockFarm` - Farm model matching Prisma schema
- `MockAnimal` - Animal model matching Prisma schema
- `MockActivity` - Activity model matching Prisma schema
- `MockFarmMember` - FarmMember model matching Prisma schema
- `MockDataCollection` - Complete data collection
- All Prisma enums: `Role`, `AnimalType`, `AnimalGender`, `AnimalStatus`, `ActivityStatus`

## Usage

### Basic Usage

```typescript
import { getMockData } from '@/lib/mock-data';

// Get all mock data
const mockData = getMockData();

console.log(mockData.user);      // Mock user
console.log(mockData.farms);     // Array of farms
console.log(mockData.animals);   // Array of animals
console.log(mockData.activities); // Array of activities
```

### With Session Integration (Recommended)

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getMockData } from '@/lib/mock-data';

// In a server component
const session = await auth.api.getSession({ headers: await headers() });
const mockData = getMockData(session?.user);

// Now mockData.user.id and mockData.farms[0].ownerId
// will use the real session user ID
```

### Get Specific Data

```typescript
import {
  createMockUser,
  getMockFarm,
  getMockAnimals,
  getMockActivities,
} from '@/lib/mock-data';

const userId = 'your-user-id';

// Get individual pieces
const user = createMockUser();
const farm = getMockFarm(userId);
const animals = getMockAnimals(farm.id);
const activities = getMockActivities(farm.id, animals, userId);
```

## Mock Data Details

### Farm: ศรีวนาลัย
- **Name**: ศรีวนาลัย
- **Code**: F002
- **Province**: จังหวัดนครราชสีมา
- **Owner**: Uses real session.user.id

### Animals (5 Water Buffalo)
1. **นาเดีย** (001) - Female, Active, 450.5 kg
2. **ทองดี** (002) - Male, Active, 520.0 kg
3. **สมศรี** (003) - Female, Active, 380.25 kg
4. **แดง** (004) - Male, Active, 420.75 kg
5. **มาลี** (005) - Female, Active, 350.0 kg

### Activities (6 Total)
- **Completed**: Feeding (นาเดีย), Vaccination (นาเดีย)
- **Pending**: Vaccination (ทองดี), Health Check (สมศรี), Feeding (มาลี)
- **Overdue**: Medication (แดง)

## Schema Compliance

All mock data structures are 100% compliant with the Prisma schema defined in `prisma/schema.prisma`:

- ✅ All field names match database column names
- ✅ All data types match Prisma types
- ✅ All enums match Prisma enums
- ✅ All relationships are properly referenced
- ✅ Optional fields are correctly typed as nullable
- ✅ Date fields use proper Date types
- ✅ UUIDs are in proper format

## Integration with Real Backend

When ready to switch from mock data to real backend:

1. Replace `getMockData()` calls with actual database queries
2. Replace `getMockFarm()` with Prisma query: `prisma.farm.findMany()`
3. Replace `getMockAnimals()` with Prisma query: `prisma.animal.findMany()`
4. Replace `getMockActivities()` with Prisma query: `prisma.activity.findMany()`

The data structure will remain identical, making the transition seamless.

## TypeScript Support

Full TypeScript support with strict type checking:

```typescript
import type { MockDataCollection } from '@/types/mock-data';

const mockData: MockDataCollection = getMockData();

// TypeScript will enforce correct types
mockData.user.id        // string
mockData.farms[0].name  // string
mockData.animals[0].weightKg // number | null
mockData.activities[0].status // ActivityStatus enum
```

## Examples

See `mock-data.examples.ts` for comprehensive usage examples including:
- Session integration
- Filtering by status
- Server component usage
- Type-safe operations

## Validation

All mock data has been validated:
- ✅ `npm run build` - Passes with 0 errors
- ✅ `npm run lint` - Passes with 0 warnings
- ✅ `npx tsc --noEmit` - TypeScript compilation successful
- ✅ Schema accuracy verified against `prisma/schema.prisma`

## Notes

- Mock data uses deterministic UUID generation for consistency
- Session integration allows using real user IDs from authentication
- All dates are properly formatted as JavaScript Date objects
- Thai language names and descriptions for realistic data
- Activity dates include past, present, and future for testing
