"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
  date?: Date
  onDateTimeChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  startHour?: number
  endHour?: number
  minuteInterval?: 15 | 30 | 60
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Selecciona fecha y hora",
  disabled = false,
  className,
  minDate,
  maxDate,
  startHour = 9,
  endHour = 18,
  minuteInterval = 15,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, "HH:mm") : "10:00"
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Generar slots de tiempo
  const timeSlots = React.useMemo(() => {
    const slots: string[] = []
    const totalHours = endHour - startHour
    const slotsPerHour = 60 / minuteInterval

    for (let i = 0; i <= totalHours * slotsPerHour; i++) {
      const totalMinutes = i * minuteInterval
      const hour = Math.floor(totalMinutes / 60) + startHour
      const minute = totalMinutes % 60

      if (hour <= endHour) {
        slots.push(
          `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        )
      }
    }

    return slots
  }, [startHour, endHour, minuteInterval])

  // Sincronizar con prop date
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date)
      setSelectedTime(format(date, "HH:mm"))
    }
  }, [date])

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      onDateTimeChange(newDate)
      setIsOpen(false)
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
    if (newDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const dateWithTime = new Date(newDate)
      dateWithTime.setHours(hours, minutes, 0, 0)
      // No cerramos el popover aquí, esperamos a que el usuario confirme
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            format(date, "PPP 'a las' HH:mm", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Card className="gap-0 p-0 border-0 shadow-none">
          <CardContent className="relative p-0 md:pr-48">
            <div className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={es}
                showOutsideDays={false}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
              />
            </div>
            <div className="inset-y-0 right-0 flex w-full flex-col border-t md:absolute md:w-48 md:border-t-0 md:border-l">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Hora</span>
                </div>
              </div>
              <ScrollArea className="h-[280px]">
                <div className="grid gap-2 p-4">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      size="sm"
                      className="w-full justify-start font-normal"
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      {time}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full flex-col gap-2">
              {selectedDate && selectedTime && (
                <div className="text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}{" "}
                  a las <span className="font-medium">{selectedTime}</span>
                </div>
              )}
              <Button
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className="w-full"
              >
                Confirmar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
