"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
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

interface DatePickerBirthProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePickerBirth({
  date,
  onDateChange,
  placeholder = "Selecciona tu fecha de nacimiento",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerBirthProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate)
            setOpen(false)
          }}
          locale={es}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear()}
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
