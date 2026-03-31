import { format, isSameDay } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateRangePickerProps = {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

type DateRangeSelectionResult = {
  draftRange: DateRange | undefined
  committedRange: DateRange | undefined
  shouldClose: boolean
}

function formatDateRange(range: DateRange) {
  if (!range.from || !range.to) return null
  return `${format(range.from, 'yyyy-MM-dd')} - ${format(range.to, 'yyyy-MM-dd')}`
}

export function resolveDateRangeSelection(
  previousDraft: DateRange | undefined,
  nextRange: DateRange | undefined
): DateRangeSelectionResult {
  if (!nextRange?.from && !nextRange?.to) {
    return {
      draftRange: undefined,
      committedRange: undefined,
      shouldClose: false,
    }
  }

  if (nextRange?.from && nextRange?.to) {
    const isConfirmedSameDayRange =
      previousDraft?.from &&
      !previousDraft.to &&
      isSameDay(previousDraft.from, nextRange.from) &&
      isSameDay(nextRange.from, nextRange.to)

    if (!isConfirmedSameDayRange && isSameDay(nextRange.from, nextRange.to)) {
      return {
        draftRange: {
          from: nextRange.from,
          to: undefined,
        },
        committedRange: undefined,
        shouldClose: false,
      }
    }

    return {
      draftRange: nextRange,
      committedRange: nextRange,
      shouldClose: true,
    }
  }

  return {
    draftRange: nextRange,
    committedRange: undefined,
    shouldClose: false,
  }
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '开始日期 - 结束日期',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(value)

  const displayValue = value ? formatDateRange(value) : null

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setDraftRange(value)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'h-9 w-full justify-start text-left font-normal',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='size-4' />
          <span className='truncate'>{displayValue ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-0'>
        <Calendar
          mode='range'
          numberOfMonths={2}
          selected={draftRange}
          onSelect={(range) => {
            const { draftRange: nextDraftRange, committedRange, shouldClose } =
              resolveDateRangeSelection(draftRange, range)

            setDraftRange(nextDraftRange)

            if (!nextDraftRange) {
              onChange(undefined)
              return
            }

            if (committedRange) {
              onChange(committedRange)
            }

            if (shouldClose) {
              setOpen(false)
            }
          }}
          disabled={(date: Date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
        />
      </PopoverContent>
    </Popover>
  )
}
