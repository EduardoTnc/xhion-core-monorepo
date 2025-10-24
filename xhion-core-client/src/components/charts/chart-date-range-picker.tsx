"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ChartDataPoint {
  date: string
  value: number
  [key: string]: string | number
}

interface ChartDateRangePickerProps {
  title: string
  description: string
  data: ChartDataPoint[]
  valueLabel: string
  valueKey?: string
  valueFormatter?: (value: number) => string
  className?: string
  chartColor?: string
  showYAxis?: boolean
  showGrid?: boolean
}

export function ChartDateRangePicker({
  title,
  description,
  data,
  valueLabel,
  valueKey = "value",
  valueFormatter = (v) => v.toLocaleString("es-ES"),
  className,
  chartColor = "hsl(var(--primary))",
  showYAxis = false,
  showGrid = true,
}: ChartDateRangePickerProps) {
  // Determinar rango inicial basado en los datos
  const initialRange = React.useMemo(() => {
    if (data.length === 0) return undefined
    return {
      from: new Date(data[0].date),
      to: new Date(data[data.length - 1].date),
    }
  }, [data])

  const [range, setRange] = React.useState<DateRange | undefined>(initialRange)

  // Actualizar rango cuando cambien los datos
  React.useEffect(() => {
    if (data.length > 0 && !range) {
      setRange({
        from: new Date(data[0].date),
        to: new Date(data[data.length - 1].date),
      })
    }
  }, [data, range])

  // Filtrar datos según el rango seleccionado
  const filteredData = React.useMemo(() => {
    if (!range?.from && !range?.to) {
      return data
    }

    return data.filter((item) => {
      const date = new Date(item.date)
      if (range.from && range.to) {
        return date >= range.from && date <= range.to
      }
      if (range.from) {
        return date >= range.from
      }
      if (range.to) {
        return date <= range.to
      }
      return true
    })
  }, [range, data])

  // Calcular total
  const total = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr[valueKey] as number), 0)
  }, [filteredData, valueKey])

  // Configuración del gráfico
  const chartConfig = {
    [valueKey]: {
      label: valueLabel,
      color: chartColor,
    },
  } satisfies ChartConfig

  // Obtener rango de fechas de los datos originales para deshabilitar fechas fuera de rango
  const dataDateRange = React.useMemo(() => {
    if (data.length === 0) return undefined
    return {
      from: new Date(data[0].date),
      to: new Date(data[data.length - 1].date),
    }
  }, [data])

  return (
    <Card className={cn("@container/card w-full", className)}>
      <CardHeader className="flex flex-col border-b @md/card:grid">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="mt-2 @md/card:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4" />
                {range?.from && range?.to ? (
                  <>
                    {format(range.from, "dd MMM", { locale: es })} -{" "}
                    {format(range.to, "dd MMM yyyy", { locale: es })}
                  </>
                ) : (
                  "Seleccionar período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                className="w-full"
                mode="range"
                defaultMonth={range?.from}
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                locale={es}
                disabled={(date) => {
                  if (!dataDateRange) return false
                  return date < dataDateRange.from || date > dataDateRange.to
                }}
              />
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 pt-4">
        {filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: showYAxis ? 12 : 0,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return format(date, "dd MMM", { locale: es })
                }}
              />
              {showYAxis && (
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => valueFormatter(value)}
                />
              )}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    nameKey={valueKey}
                    labelFormatter={(value) => {
                      return format(new Date(value), "EEEE, d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })
                    }}
                    formatter={(value) => valueFormatter(value as number)}
                  />
                }
              />
              <Bar
                dataKey={valueKey}
                fill={chartColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No hay datos para el período seleccionado
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Total del período:
          </span>
          <span className="font-semibold text-lg">
            {valueFormatter(total)}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
