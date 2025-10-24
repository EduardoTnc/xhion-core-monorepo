import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatCurrency"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts"
import { type MovimientoPresupuestoDepartamento, type MovimientoPresupuestoProyecto, TipoMovimientoPresupuesto } from "@/services/presupuestoService"

interface BudgetComparisonProps {
  movimientos: (MovimientoPresupuestoDepartamento | MovimientoPresupuestoProyecto)[]
  fechaInicio: string
  fechaFin: string
}

export function BudgetComparison({ movimientos, fechaInicio, fechaFin }: BudgetComparisonProps) {
  // Datos por mes
  const datosPorMes = useMemo(() => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const meses = eachMonthOfInterval({ start: inicio, end: fin })

    return meses.map((mes) => {
      const movimientosDelMes = movimientos.filter((m) =>
        isSameMonth(new Date(m.fechaMovimiento), mes)
      )

      const ingresos = movimientosDelMes
        .filter((m) => m.tipo === TipoMovimientoPresupuesto.Asignacion)
        .reduce((sum, m) => sum + Number(m.monto), 0)

      const gastos = movimientosDelMes
        .filter((m) => m.tipo === TipoMovimientoPresupuesto.Gasto)
        .reduce((sum, m) => sum + Number(m.monto), 0)

      const balance = ingresos - gastos

      return {
        mes: format(mes, "MMM yyyy", { locale: es }),
        ingresos,
        gastos,
        balance,
        fecha: mes,
      }
    })
  }, [movimientos, fechaInicio, fechaFin])

  // Comparación mes actual vs mes anterior
  const comparacionMensual = useMemo(() => {
    if (datosPorMes.length < 2) return null

    const mesActual = datosPorMes[datosPorMes.length - 1]
    const mesAnterior = datosPorMes[datosPorMes.length - 2]

    const diferenciaGastos = mesActual.gastos - mesAnterior.gastos
    const porcentajeCambioGastos =
      mesAnterior.gastos > 0 ? (diferenciaGastos / mesAnterior.gastos) * 100 : 0

    const diferenciaIngresos = mesActual.ingresos - mesAnterior.ingresos
    const porcentajeCambioIngresos =
      mesAnterior.ingresos > 0 ? (diferenciaIngresos / mesAnterior.ingresos) * 100 : 0

    return {
      mesActual: mesActual.mes,
      mesAnterior: mesAnterior.mes,
      gastosActual: mesActual.gastos,
      gastosAnterior: mesAnterior.gastos,
      diferenciaGastos,
      porcentajeCambioGastos,
      ingresosActual: mesActual.ingresos,
      ingresosAnterior: mesAnterior.ingresos,
      diferenciaIngresos,
      porcentajeCambioIngresos,
    }
  }, [datosPorMes])

  // Estadísticas generales
  const estadisticas = useMemo(() => {
    const totalIngresos = datosPorMes.reduce((sum, m) => sum + m.ingresos, 0)
    const totalGastos = datosPorMes.reduce((sum, m) => sum + m.gastos, 0)
    const promedioIngresos = totalIngresos / datosPorMes.length
    const promedioGastos = totalGastos / datosPorMes.length

    const mesConMayorGasto = datosPorMes.reduce((max, m) => (m.gastos > max.gastos ? m : max), datosPorMes[0])
    const mesConMenorGasto = datosPorMes.reduce((min, m) => (m.gastos < min.gastos ? m : min), datosPorMes[0])

    return {
      totalIngresos,
      totalGastos,
      promedioIngresos,
      promedioGastos,
      mesConMayorGasto,
      mesConMenorGasto,
    }
  }, [datosPorMes])

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = (value: number, inverse: boolean = false) => {
    if (inverse) {
      if (value > 0) return "text-green-500"
      if (value < 0) return "text-red-500"
    } else {
      if (value > 0) return "text-red-500"
      if (value < 0) return "text-green-500"
    }
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Comparación Mensual */}
      {comparacionMensual && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gastos: Mes Actual vs Anterior</CardTitle>
              <CardDescription>
                {comparacionMensual.mesActual} vs {comparacionMensual.mesAnterior}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mes Actual</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(comparacionMensual.gastosActual)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mes Anterior</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(comparacionMensual.gastosAnterior)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Diferencia</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(comparacionMensual.diferenciaGastos)}
                    <span className={`text-lg font-bold ${getTrendColor(comparacionMensual.diferenciaGastos)}`}>
                      {formatCurrency(Math.abs(comparacionMensual.diferenciaGastos))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cambio</span>
                  <Badge variant={comparacionMensual.porcentajeCambioGastos > 0 ? "destructive" : "default"}>
                    {comparacionMensual.porcentajeCambioGastos > 0 ? "+" : ""}
                    {comparacionMensual.porcentajeCambioGastos.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingresos: Mes Actual vs Anterior</CardTitle>
              <CardDescription>
                {comparacionMensual.mesActual} vs {comparacionMensual.mesAnterior}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mes Actual</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(comparacionMensual.ingresosActual)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mes Anterior</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(comparacionMensual.ingresosAnterior)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Diferencia</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(comparacionMensual.diferenciaIngresos)}
                    <span className={`text-lg font-bold ${getTrendColor(comparacionMensual.diferenciaIngresos, true)}`}>
                      {formatCurrency(Math.abs(comparacionMensual.diferenciaIngresos))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cambio</span>
                  <Badge variant={comparacionMensual.porcentajeCambioIngresos > 0 ? "default" : "destructive"}>
                    {comparacionMensual.porcentajeCambioIngresos > 0 ? "+" : ""}
                    {comparacionMensual.porcentajeCambioIngresos.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico Comparativo por Mes */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativa Mensual</CardTitle>
          <CardDescription>Ingresos vs Gastos por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={datosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="hsl(142, 76%, 36%)" name="Ingresos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="hsl(0, 84%, 60%)" name="Gastos" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                name="Balance"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ingresos</span>
              <span className="text-sm font-semibold">{formatCurrency(estadisticas.promedioIngresos)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Gastos</span>
              <span className="text-sm font-semibold">{formatCurrency(estadisticas.promedioGastos)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mayor Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{estadisticas.mesConMayorGasto.mes}</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(estadisticas.mesConMayorGasto.gastos)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Menor Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{estadisticas.mesConMenorGasto.mes}</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(estadisticas.mesConMenorGasto.gastos)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
