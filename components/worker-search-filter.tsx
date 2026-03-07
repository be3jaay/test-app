'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Calendar } from 'lucide-react'

interface WorkerSearchFilterProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onDistanceChange: (distance: number) => void
  onDateChange?: (value: string) => void
  onLocationChange?: (value: string) => void
}

const skillCategories = [
  'All Skills',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Mechanic',
  'Appliance Repair',
]

const dateOptions = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const distances = [
  { value: '100', label: 'Any distance' },
  { value: '1', label: 'Within 1 km' },
  { value: '3', label: 'Within 3 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
]

export function WorkerSearchFilter({
  onSearchChange,
  onCategoryChange,
  onDistanceChange,
  onDateChange,
  onLocationChange,
}: WorkerSearchFilterProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Search bar - first, full width, mobile-first */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search services... e.g. Electrical, Plumbing"
          className="pl-10 h-11 rounded-xl border-border bg-muted/30 text-base"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters row - stack on mobile, compact */}
      <div className="flex flex-wrap gap-2">
        <Select defaultValue="All Skills" onValueChange={onCategoryChange}>
          <SelectTrigger className="h-10 min-w-[120px] flex-1 rounded-lg border-border">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            {skillCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue="any"
          onValueChange={(v) => onDateChange?.(v)}
        >
          <SelectTrigger className="h-10 min-w-[110px] flex-1 rounded-lg border-border">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground mr-1.5 shrink-0" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        <Select
          defaultValue="100"
          onValueChange={(value) => onDistanceChange(Number(value))}
        >
          <SelectTrigger className="h-10 min-w-[120px] flex-1 rounded-lg border-border">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            {distances.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
