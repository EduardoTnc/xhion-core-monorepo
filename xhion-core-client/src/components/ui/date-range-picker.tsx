"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange?: DateRange
  onDateRangeChange: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  numberOfMonths?: 1 | 2
  minDate?: Date
  maxDate?: Date
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Selecciona un rango de fechas",
  disabled = false,
  className,
  numberOfMonths = 2,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                {format(dateRange.to, "dd MMM yyyy", { locale: es })}
              </>
            ) : (
              format(dateRange.from, "dd MMM yyyy", { locale: es })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={numberOfMonths}
          locale={es}
          disabled={(date) => {
            // Deshabilitar fechas antes de minDate
            if (minDate && date < minDate) {
              return true
            }
            // Deshabilitar fechas después de maxDate
            if (maxDate && date > maxDate) {
              return true
            }
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
