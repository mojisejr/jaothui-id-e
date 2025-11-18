import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ActivityStatus } from "@/types/activity"

import { cn } from "@/lib/utils"

// Status configuration with Thai labels and styling
const statusConfig = {
  PENDING: {
    icon: "○",
    label: "รอดำเนินการ",
    colorClasses: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  COMPLETED: {
    icon: "✅",
    label: "ดำเนินการแล้ว",
    colorClasses: "text-green-600 bg-green-50 border-green-200",
  },
  CANCELLED: {
    icon: "❌",
    label: "ยกเลิก",
    colorClasses: "text-red-600 bg-red-50 border-red-200",
  },
  OVERDUE: {
    icon: "⏰",
    label: "เลยกำหนด",
    colorClasses: "text-orange-600 bg-orange-50 border-orange-200",
  },
} as const

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      size: {
        sm: "text-xs min-h-[32px]",
        md: "text-sm min-h-[44px]",
        lg: "text-base min-h-[48px] px-3 py-1",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: ActivityStatus
  showLabel?: boolean
}

function StatusBadge({
  status,
  showLabel = true,
  size,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        statusBadgeVariants({ size }),
        config.colorClasses,
        className
      )}
      role="status"
      aria-label={`สถานะ: ${config.label}`}
      {...props}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants, statusConfig }
