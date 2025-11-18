/**
 * StatusBadge Component Demo
 * 
 * This file demonstrates all the features and variants of the StatusBadge component.
 * It is not part of the application but serves as documentation and visual reference.
 */

import { StatusBadge } from '@/components/ui/status-badge';
import { ActivityStatus } from '@/types/activity';

export default function StatusBadgeDemo() {
  const allStatuses: ActivityStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE'];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold mb-4">StatusBadge Component Demo</h1>
        <p className="text-gray-600">
          Comprehensive showcase of the StatusBadge component for activity status display
        </p>
      </div>

      {/* All Status Types */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Status Types</h2>
        <div className="flex flex-wrap gap-4">
          {allStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      {/* With and Without Labels */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Label Visibility</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">With Labels (default)</h3>
            <div className="flex flex-wrap gap-4">
              {allStatuses.map((status) => (
                <StatusBadge key={status} status={status} showLabel={true} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Icons Only</h3>
            <div className="flex flex-wrap gap-4">
              {allStatuses.map((status) => (
                <StatusBadge key={status} status={status} showLabel={false} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Size Variants</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Small (32px min-height)</h3>
            <div className="flex flex-wrap gap-4">
              {allStatuses.map((status) => (
                <StatusBadge key={`sm-${status}`} status={status} size="sm" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Medium (44px min-height - default, touch-friendly)</h3>
            <div className="flex flex-wrap gap-4">
              {allStatuses.map((status) => (
                <StatusBadge key={`md-${status}`} status={status} size="md" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Large (48px min-height)</h3>
            <div className="flex flex-wrap gap-4">
              {allStatuses.map((status) => (
                <StatusBadge key={`lg-${status}`} status={status} size="lg" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>
        <div className="space-y-6">
          {/* Activity List Item */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Activity List Item</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ให้อนม</p>
                <p className="text-sm text-gray-500">กระบือ: นาเดีย (001)</p>
              </div>
              <StatusBadge status="PENDING" />
            </div>
          </div>

          {/* Compact Display */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Compact Display (icon only)</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">ตรวจสุขภาพ</span>
              <StatusBadge status="COMPLETED" showLabel={false} size="sm" />
            </div>
          </div>

          {/* Mobile View */}
          <div className="border rounded-lg p-4 max-w-sm">
            <h3 className="text-sm font-medium mb-3">Mobile View (touch-friendly)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">ให้อาหาร</span>
                <StatusBadge status="COMPLETED" size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ตรวจสุขภาพ</span>
                <StatusBadge status="OVERDUE" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>ARIA role=&quot;status&quot; for semantic meaning</li>
          <li>ARIA labels in Thai for screen reader support</li>
          <li>Icons marked as aria-hidden to avoid duplication</li>
          <li>High contrast colors for elderly users</li>
          <li>Touch-friendly sizing (44px minimum for medium)</li>
          <li>Keyboard accessible with focus states</li>
        </ul>
      </section>

      {/* Color System */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Color System</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <StatusBadge status="PENDING" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Yellow (Pending)</p>
              <p>Warning/Caution theme</p>
            </div>
          </div>
          <div className="space-y-2">
            <StatusBadge status="COMPLETED" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Green (Completed)</p>
              <p>Success theme</p>
            </div>
          </div>
          <div className="space-y-2">
            <StatusBadge status="CANCELLED" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Red (Cancelled)</p>
              <p>Error/Danger theme</p>
            </div>
          </div>
          <div className="space-y-2">
            <StatusBadge status="OVERDUE" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Orange (Overdue)</p>
              <p>Alert theme</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>TypeScript:</strong> Fully typed with ActivityStatus from Prisma</p>
          <p><strong>Styling:</strong> Tailwind CSS with class-variance-authority</p>
          <p><strong>Base Component:</strong> Extends existing Badge patterns</p>
          <p><strong>Mobile-First:</strong> Responsive design with touch optimization</p>
          <p><strong>Accessibility:</strong> WCAG 2.1 AA compliant</p>
          <p><strong>Thai Language:</strong> Native Thai labels and proper font rendering</p>
        </div>
      </section>
    </div>
  );
}
