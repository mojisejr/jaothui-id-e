import React from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Types based on Prisma schema
type AnimalType = 'WATER_BUFFALO' | 'SWAMP_BUFFALO' | 'CATTLE' | 'GOAT' | 'PIG' | 'CHICKEN'
type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN'
type AnimalStatus = 'ACTIVE' | 'TRANSFERRED' | 'DECEASED' | 'SOLD'

interface AnimalCardProps {
  animal: {
    id: string
    tagId: string
    name?: string | null
    type: AnimalType
    gender: AnimalGender
    status: AnimalStatus
    birthDate?: string | null
    color?: string | null
    imageUrl?: string | null
  }
  notificationCount?: number
  onPress?: () => void
}

const getStatusBadgeVariant = (status: AnimalStatus): "success" | "info" | "destructive" | "secondary" => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'TRANSFERRED':
      return 'info'
    case 'DECEASED':
      return 'destructive'
    case 'SOLD':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: AnimalStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'ใช้งาน'
    case 'TRANSFERRED':
      return 'ย้าย'
    case 'DECEASED':
      return 'ตาย'
    case 'SOLD':
      return 'ขาย'
    default:
      return status
  }
}

const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  notificationCount = 0,
  onPress
}) => {
  const handleCardClick = () => {
    if (onPress) {
      onPress()
    }
  }

  const formatBirthDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear() + 543 // Convert to BE calendar
      return `${day}/${month}/${year}`
    } catch {
      return '-'
    }
  }

  const getGenderText = (gender: AnimalGender): string => {
    switch (gender) {
      case 'MALE':
        return 'ผู้'
      case 'FEMALE':
        return 'เมีย'
      case 'UNKNOWN':
        return 'ไม่ทราบ'
      default:
        return gender
    }
  }

  return (
    <Card
      className="w-full border-border hover:shadow-xs transition-all cursor-pointer bg-card/80 backdrop-blur-xs"
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        {/* Single Row Layout */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Animal Name and Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                ชื่อ: {animal.name || '-'}
              </h3>
              <p className="text-[11px] text-muted-foreground/70">
                หมายเลขแท็ก: {animal.tagId}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>ว/ด/ป เกิด: {formatBirthDate(animal.birthDate)}</span>
              <span>•</span>
              <span>สี: {animal.color || '-'}</span>
              <span>•</span>
              <span>เพศ: {getGenderText(animal.gender)}</span>
            </div>
          </div>

          {/* Right: Status and Notification */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={getStatusBadgeVariant(animal.status)} className="text-xs">
              {getStatusText(animal.status)}
            </Badge>
            
            {/* Notification Bell */}
            {notificationCount > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4 text-destructive" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] font-bold"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AnimalCard