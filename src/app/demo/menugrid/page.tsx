/**
 * MenuGrid Demo Page - Jaothui ID-Trace System
 * 
 * This page demonstrates the MenuGrid component in action.
 * For testing and visual verification purposes.
 * 
 * Usage: Navigate to /demo/menugrid to see the component
 */

import { MenuGrid, defaultMenuItems } from "@/components/profile/MenuGrid";

export default function MenuGridDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            MenuGrid Component Demo
          </h1>
          <p className="text-sm text-muted-foreground">
            3×2 Grid Menu with Age-Optimized Touch Targets
          </p>
        </div>

        {/* MenuGrid Component */}
        <div className="bg-card/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-border">
          <MenuGrid menuItems={defaultMenuItems} />
        </div>

        {/* Specifications */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <h2 className="text-lg font-semibold mb-3 text-foreground">
            Component Specifications
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 3×2 Grid Layout (6 menu items)</li>
            <li>✓ 64px Icons for elderly visibility</li>
            <li>✓ Thai labels (16px, bold) + English help text (12px)</li>
            <li>✓ 100px × 80px minimum touch targets</li>
            <li>✓ Mobile-first responsive design (375px viewport)</li>
            <li>✓ Accessibility features (ARIA labels, keyboard navigation)</li>
            <li>✓ High contrast colors (WCAG AA compliant)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
