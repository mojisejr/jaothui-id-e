# EditAnimalForm Component

## Overview

The `EditAnimalForm` component is a comprehensive form for editing existing buffalo information in the Jaothui ID-Trace system. It follows mobile-first design principles with Thai language support and integrates seamlessly with the PUT `/api/animals/[id]` endpoint.

## Features

- ✅ Pre-populated form with existing animal data
- ✅ Real-time validation with Zod schema
- ✅ Read-only display for immutable fields (tagId, type, gender, birthDate)
- ✅ Editable fields: name, color, weightKg, heightCm, motherTag, fatherTag, genome
- ✅ Mobile-first responsive design (320px minimum width)
- ✅ 48px minimum touch targets for accessibility
- ✅ Thai error messages
- ✅ Loading states and error handling
- ✅ WCAG 2.1 AA accessibility compliance

## Usage

### Basic Usage

```tsx
import { EditAnimalForm } from '@/components/animals/EditAnimalForm';

function MyComponent() {
  const animal = {
    id: 'uuid',
    farmId: 'farm-uuid',
    tagId: '001',
    name: 'นาเดีย',
    type: 'WATER_BUFFALO',
    gender: 'FEMALE',
    status: 'ACTIVE',
    birthDate: '2019-03-15',
    color: 'ดำ',
    weightKg: 450.5,
    heightCm: 145,
    motherTag: 'M001',
    fatherTag: 'F001',
    genome: 'Genome data',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <EditAnimalForm
      animal={animal}
      onSuccess={(updatedAnimal) => {
        console.log('Animal updated:', updatedAnimal);
      }}
      onCancel={() => {
        console.log('Edit cancelled');
      }}
    />
  );
}
```

### Integration with Animal Panel

To integrate the `EditAnimalForm` into the existing Animal Panel at `/animals/[id]/panel`:

**File:** `src/app/animals/[id]/panel/AnimalPanelContent.tsx`

```tsx
import { EditAnimalForm } from '@/components/animals/EditAnimalForm';

// Inside the AnimalPanelContent component, replace the placeholder content:

{activeTab === "edit" && (
  <EditAnimalForm
    animal={animal}
    onSuccess={(updatedAnimal) => {
      // Handle successful update
      router.refresh(); // Refresh the page to show updated data
      // Or redirect to animal detail page
      // router.push(`/animals/${animal.id}`);
    }}
    onCancel={() => {
      // Handle cancel - go back to detail page
      router.push(`/animals/${animal.id}`);
    }}
  />
)}
```

### Full Panel Integration Example

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EditAnimalForm } from "@/components/animals/EditAnimalForm";
import TopNavigation from "@/components/profile/TopNavigation";

export function AnimalPanelContent({ 
  animal,
  notificationCount = 0,
}: AnimalPanelContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>("edit");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <TopNavigation 
        notificationCount={notificationCount}
        onNotificationClick={() => router.push('/animals?tab=notifications')}
      />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Tab Navigation */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-1">
            {/* Tab buttons here */}
          </div>

          {/* Tab Content */}
          {activeTab === "edit" && (
            <EditAnimalForm
              animal={animal}
              onSuccess={(updatedAnimal) => {
                // Show success message (optional - use toast library)
                alert('อัปเดตข้อมูลสำเร็จ');
                
                // Refresh data or redirect
                router.refresh();
              }}
              onCancel={() => {
                // Go back to animal detail page
                router.push(`/animals/${animal.id}`);
              }}
            />
          )}

          {activeTab === "activities" && (
            // Activities management content
            <div>Activities content here</div>
          )}
        </div>
      </main>
    </div>
  );
}
```

## Props

### EditAnimalFormProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `animal` | `Animal` | Yes | Complete animal data object to edit |
| `onSuccess` | `(animal: any) => void` | No | Callback function called when update succeeds |
| `onCancel` | `() => void` | No | Callback function called when user cancels |
| `isLoading` | `boolean` | No | External loading state to disable form |

### Animal Interface

```typescript
interface Animal {
  id: string;
  farmId: string;
  tagId: string;
  name: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate: string | Date | null;
  color: string | null;
  weightKg: Prisma.Decimal | number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
```

## Validation

The form uses the `updateAnimalSchema` from `@/lib/validations/animal`:

**Editable Fields:**
- `name`: String, max 255 characters, optional
- `color`: String, max 255 characters, optional
- `weightKg`: Positive number, optional
- `heightCm`: Positive integer, optional
- `motherTag`: String, max 255 characters, optional
- `fatherTag`: String, max 255 characters, optional
- `genome`: String, optional

**Validation Rules:**
- Weight must be a positive number
- Height must be a positive integer
- All text fields limited to 255 characters
- Empty strings are converted to `null` before submission

## API Integration

The component integrates with the PUT `/api/animals/[id]` endpoint:

**Request:**
```typescript
PUT /api/animals/:id
Content-Type: application/json

{
  "name": "นาเดียทอง",
  "color": "ดำเข้ม",
  "weightKg": 465.5,
  "heightCm": 147,
  "motherTag": "M002",
  "fatherTag": "F001",
  "genome": "Updated genome data"
}
```

**Success Response:**
```typescript
{
  "success": true,
  "data": {
    "animal": { /* updated animal object */ }
  },
  "message": "อัปเดตข้อมูลกระบือสำเร็จแล้ว",
  "timestamp": "2025-11-16T10:00:00.000Z"
}
```

**Error Response:**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้อง",
    "details": [
      {
        "field": "weightKg",
        "message": "น้ำหนักต้องมากกว่า 0"
      }
    ]
  },
  "timestamp": "2025-11-16T10:00:00.000Z"
}
```

## Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Proper ARIA labels and descriptions
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ 48px minimum touch targets
- ✅ High contrast for elderly users
- ✅ Error messages with `role="alert"`

## Mobile Responsiveness

- Single column layout on mobile (320px minimum)
- Two-column button layout on desktop (sm breakpoint)
- 48px touch targets for all interactive elements
- Large text sizes (text-base = 16px minimum)
- Glassmorphic card with backdrop blur

## Testing

The component includes comprehensive unit tests covering:

- Form rendering and pre-population
- Form submission and API integration
- Validation (positive/negative cases)
- Cancel functionality
- Accessibility features
- Mobile responsiveness
- Edge cases (null values, empty strings)

**Run tests:**
```bash
npm test EditAnimalForm.test.tsx
```

**Test Coverage:**
- 20 unit tests
- 100% pass rate
- All edge cases covered

## Design System Compliance

- Uses shadcn-ui components (Button, Input, Card)
- Follows Tailwind CSS v4 styling patterns
- Matches glassmorphic design language
- Thai typography with Inter font
- Consistent with CreateAnimalForm patterns

## Known Limitations

- Requires authentication (handled by API middleware)
- Farm membership verification (handled by API)
- Cannot edit immutable fields (tagId, type, gender, birthDate, status)
- Image upload not included (separate feature)

## Related Components

- `CreateAnimalForm` - Create new animal records
- `AnimalDetailCard` - Display animal information
- `AnimalPanelContent` - Animal management panel
- `TopNavigation` - Top navigation bar

## Related Files

- `src/lib/validations/animal.ts` - Validation schemas
- `src/app/api/animals/[id]/route.ts` - PUT endpoint
- `src/__tests__/components/EditAnimalForm.test.tsx` - Unit tests

## See Also

- [Context Issue #150](https://github.com/mojisejr/jaothui-id-e/issues/150) - Animal Panel - Activity Management Feature
- [Task Issue #154](https://github.com/mojisejr/jaothui-id-e/issues/154) - Create Edit Animal Form Component
- API Documentation - `/docs/API.md`
- UI/UX Documentation - `/docs/UI-UX.md`
