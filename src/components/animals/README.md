# Animals Components

React components for animal management in the Jaothui ID-Trace system.

## Components

### CreateAnimalForm

Complete animal creation form with react-hook-form and Zod validation.

**Features:**
- ✅ Real-time validation with inline error messages
- ✅ 10 form fields organized in 3 logical sections
- ✅ Mobile-first responsive design (320px minimum)
- ✅ Elderly-friendly (44px touch targets)
- ✅ Thai language native
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Dark mode support

**Usage:**

```tsx
import { CreateAnimalForm } from '@/components/animals/CreateAnimalForm';

function MyPage() {
  const handleSuccess = (animal) => {
    console.log('Animal created:', animal);
    // Redirect or show success message
  };

  const handleCancel = () => {
    // Go back or close form
  };

  return (
    <CreateAnimalForm
      farmId="farm-uuid-here"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
```

**Props:**

- `farmId` (string, required) - Farm ID from session context
- `onSuccess` (function, optional) - Callback when animal is created successfully
- `onCancel` (function, optional) - Callback when user cancels form
- `isLoading` (boolean, optional) - External loading state

**Form Sections:**

1. **ข้อมูลกระบือ (Basic Information)**
   - Tag ID* (required)
   - Animal Name (optional)
   - Animal Type* (required, dropdown)
   - Color (optional)
   - Birth Date (optional)
   - Weight in kg (optional, decimal)
   - Height in cm (optional, integer)

2. **เพศกระบือ (Gender)**
   - Gender selection (radio buttons: Male, Female, Unknown)

3. **พันธุกรรม (Genetics)**
   - Mother's Tag ID (optional)
   - Father's Tag ID (optional)
   - Genome Information (optional)

**Validation:**

All validation is handled by Zod schema from `/src/lib/validations/animal.ts`:
- Tag ID: Required, max 255 characters
- Type: Required, must be valid enum value
- Weight: Must be positive number if provided
- Height: Must be positive integer if provided
- All other fields: Optional with max length constraints

**API Integration:**

Posts to `/api/animals` endpoint with the following payload:

```json
{
  "farmId": "farm-uuid",
  "tagId": "001",
  "type": "WATER_BUFFALO",
  "name": "นาเดีย",
  "gender": "FEMALE",
  "birthDate": "2023-03-15",
  "color": "ดำ",
  "weightKg": 450.5,
  "heightCm": 145,
  "motherTag": "M001",
  "fatherTag": "F001",
  "genome": "genetic-data"
}
```

**Related Files:**

- Validation Schema: `/src/lib/validations/animal.ts`
- API Endpoint: `/src/app/api/animals/route.ts` (Task 1.3)
- Parent Page: `/src/app/animals/create/page.tsx` (Task 1.4)

**Issue References:**

- Task Issue: #106
- Context Issue: #79
- Related Tasks: Task 1.1 (validation), Task 1.3 (API), Task 1.4 (page)
