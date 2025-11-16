import React, { useState, useEffect, useCallback } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Types based on Prisma schema
type AnimalStatus = 'ACTIVE' | 'TRANSFERRED' | 'DECEASED' | 'SOLD'

interface SearchFilterProps {
  searchQuery: string
  statusFilter: AnimalStatus | 'all'
  onSearchChange: (query: string) => void
  onStatusChange: (status: AnimalStatus | 'all') => void
  onClear: () => void
}

interface StatusOption {
  value: AnimalStatus | 'all'
  label: string
  color: string
}

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'ทั้งหมด', color: 'gray' },
  { value: 'ACTIVE', label: 'เลี้ยงอยู่', color: 'green' },
  { value: 'TRANSFERRED', label: 'ย้ายฟาร์ม', color: 'blue' },
  { value: 'DECEASED', label: 'ตายแล้ว', color: 'red' },
  { value: 'SOLD', label: 'ขายแล้ว', color: 'gray' }
]

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onClear
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(statusFilter)

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearchChange(localSearchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchQuery, onSearchChange, searchQuery])

  // Sync local state with props
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setSelectedStatus(statusFilter)
  }, [statusFilter])

  // Handle status selection
  const handleStatusSelect = useCallback((status: AnimalStatus | 'all') => {
    setSelectedStatus(status)
    onStatusChange(status)
    setIsStatusDropdownOpen(false)
  }, [onStatusChange])

  // Handle clear filters
  const handleClear = useCallback(() => {
    setLocalSearchQuery('')
    setSelectedStatus('all')
    onClear()
    setIsStatusDropdownOpen(false)
  }, [onClear])

  // Get current status label
  const getCurrentStatusLabel = () => {
    const currentStatus = statusOptions.find(option => option.value === selectedStatus)
    return currentStatus?.label || 'ทั้งหมด'
  }

  // Check if filters are active
  const hasActiveFilters = localSearchQuery.trim() !== '' || selectedStatus !== 'all'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.status-dropdown')) {
        setIsStatusDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="bg-card/80 backdrop-blur-sm shadow-none rounded-lg border p-4 space-y-4 relative z-20 overflow-visible">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="ค้นหารหัสกระบือหรือชื่อ..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 shadow-none border-border bg-background focus:ring-primary"
          />
        </div>
      </div>

      {/* Status Dropdown and Clear Button */}
      <div className="flex gap-3">
        {/* Status Dropdown */}
  <div className="status-dropdown relative flex-1 z-30">
          <Button
            variant="outline"
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full h-12 justify-between shadow-none border-border bg-background hover:bg-accent/50 text-left"
            aria-label="เลือกสถานะ"
          >
            <span className="text-sm">{getCurrentStatusLabel()}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isStatusDropdownOpen && "transform rotate-180"
              )}
            />
          </Button>

          {/* Dropdown Options */}
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-none z-50">
              <div className="py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusSelect(option.value)}
                    className={cn(
                      "w-full px-3 py-3 text-left text-sm hover:bg-accent/50 transition-colors flex items-center justify-between",
                      selectedStatus === option.value && "bg-accent/30"
                    )}
                  >
                    <span>{option.label}</span>
                    {selectedStatus === option.value && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="h-12 px-4 shadow-none hover:bg-accent/50"
            aria-label="ล้างตัวกรอง"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {localSearchQuery.trim() && (
              <span className="bg-accent/50 px-2 py-1 rounded text-xs">
                ค้นหา: &ldquo;{localSearchQuery}&rdquo;
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="bg-accent/50 px-2 py-1 rounded text-xs">
                สถานะ: {getCurrentStatusLabel()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilter