# GhostLogoutButton Component

## Overview
A reusable ghost-styled logout button component for Thai buffalo farmers' profile interface.

## Installation
The component is already available in the project at:
```
src/components/profile/GhostLogoutButton.tsx
```

## Basic Usage

### Import the Component
```tsx
import { GhostLogoutButton } from "@/components/profile/GhostLogoutButton";
```

### Simple Usage
```tsx
export default function ProfilePage() {
  return (
    <div>
      <h1>Profile Page</h1>
      <GhostLogoutButton />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLogout` | `() => Promise<void>` | `undefined` | Optional custom logout handler. If not provided, uses default better-auth signOut |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |

## Examples

### Default Button
```tsx
<GhostLogoutButton />
```

### Full-Width Button
```tsx
<GhostLogoutButton className="w-full" />
```

### Disabled Button
```tsx
<GhostLogoutButton disabled={true} />
```

### With Custom Logout Handler
```tsx
const customLogout = async () => {
  // Custom logout logic here
  console.log("Custom logout");
  await signOut();
};

<GhostLogoutButton onLogout={customLogout} />
```

### With Additional Styling
```tsx
<GhostLogoutButton className="mt-8 w-full max-w-xs mx-auto" />
```

## Integration Example: Profile Page

Replace the existing destructive logout button in `src/app/profile/page.tsx`:

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { GhostLogoutButton } from "@/components/profile/GhostLogoutButton";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  // ... existing code for loading and error states ...

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              profile page
            </CardTitle>
            <CardDescription className="text-center">
              ข้อมูลโปรไฟล์ของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              {/* ... user info display ... */}
            </div>

            {/* Replace the existing destructive button with GhostLogoutButton */}
            <GhostLogoutButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## Features

✅ **Ghost Button Styling** - Light border with transparent background
✅ **Thai Language** - "ออกจากระบบ" (Logout) text
✅ **Age-Optimized** - 100px × 48px minimum touch target for 30+ users
✅ **Better-Auth Integration** - Uses existing `signOut()` function
✅ **Loading States** - Shows spinner with "กำลังออกจากระบบ..." text
✅ **Error Handling** - Gracefully redirects to `/login` on errors
✅ **Accessibility** - ARIA labels and keyboard navigation support
✅ **Mobile-First** - Responsive design for 375px minimum width
✅ **Dark Mode** - Automatic dark mode support

## Styling

The component includes comprehensive styling:

- **Default State**: Transparent background with light gray border
- **Hover State**: Light gray background (#f9fafb)
- **Active State**: Slightly darker background (#f3f4f6)
- **Loading State**: Disabled with spinner animation
- **Disabled State**: Reduced opacity (50%)
- **Focus State**: Ring outline for keyboard navigation

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- `aria-label="ออกจากระบบ"` for screen readers
- `aria-busy` attribute for loading state indication
- Semantic `<button>` element with `type="button"`
- Keyboard navigation support with visible focus ring
- Minimum 48px touch target height

## Browser Support

The component works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The component automatically redirects to `/login` after successful logout
- Error handling ensures users are logged out even if signOut fails
- Loading state prevents multiple logout attempts
- Component is fully typed with TypeScript
- No external dependencies beyond project's existing libraries
