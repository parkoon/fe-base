import { CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { $dayjs } from '@/lib/dayjs'
import { cn } from '@/lib/utils'

type DateRangePickerProps = {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartChange: (date: Date | undefined) => void
  onEndChange: (date: Date | undefined) => void
  disabled?: boolean
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  disabled,
}: DateRangePickerProps) {
  const today = useMemo(() => new Date(), [])

  return (
    <div className="flex items-center gap-2">
      <SingleDatePicker
        label="시작일"
        date={startDate}
        onChange={onStartChange}
        disabled={disabled}
        minDate={today}
      />
      <span className="text-muted-foreground">~</span>
      <SingleDatePicker
        label="종료일"
        date={endDate}
        onChange={onEndChange}
        disabled={disabled}
        minDate={startDate ?? today}
      />
    </div>
  )
}

type SingleDatePickerProps = {
  label: string
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  minDate?: Date
}

function SingleDatePicker({ label, date, onChange, disabled, minDate }: SingleDatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-9 w-[160px] justify-start gap-2 px-3 font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? $dayjs(date).format('YYYY.MM.DD') : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d)
            setOpen(false)
          }}
          disabled={(d) => (minDate ? d < $dayjs(minDate).startOf('day').toDate() : false)}
        />
      </PopoverContent>
    </Popover>
  )
}
