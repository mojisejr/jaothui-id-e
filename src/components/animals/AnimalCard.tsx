import React from 'react'
import Image from 'next/image'
import { Bell, Image as ImageIcon } from 'lucide-react'
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

  return (
    <Card
      className="shadow-none border-border hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Animal Photo - 80x80px */}
          <div className="relative flex-shrink-0">
            {animal.imageUrl ? (
              <div className="relative w-20 h-20">
                <Image
                  src={animal.imageUrl}
                  alt={animal.name || animal.tagId}
                  fill
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.parentElement?.querySelector('.fallback-image')
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex'
                    }
                  }}
                />
              </div>
            ) : null}
            {/* Fallback placeholder */}
            <div
              className={`fallback-image w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center ${animal.imageUrl ? 'hidden' : 'flex'}`}
            >
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* Animal Information */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {/* Tag ID */}
              <h3 className="font-medium text-sm truncate">
                รหัส: {animal.tagId}
              </h3>

              {/* Name */}
              {animal.name && (
                <p className="text-sm text-muted-foreground truncate">
                  ชื่อ: {animal.name}
                </p>
              )}

              {/* Status and Notifications */}
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(animal.status)}>
                  {getStatusText(animal.status)}
                </Badge>

                {/* Notification Bell */}
                {notificationCount > 0 && (
                  <div className="ml-auto flex items-center">
                    <div className="relative">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] min-w-[16px]"
                      >
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AnimalCard