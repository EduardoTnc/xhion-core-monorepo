import { useState, useMemo } from "react"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartDateRangePicker } from "@/components/charts/chart-date-range-picker"
import { formatCurrency } from "@/lib/formatCurrency"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Button } from "../ui/button"
import { type PresupuestoDepartamento, type MovimientoPresupuestoDepartamento, type MovimientoPresupuestoProyecto, TipoMovimientoPresupuesto } from "@/services/presupuestoService"

interface BudgetAnalyticsViewProps {
  presupuesto: PresupuestoDepartamento | any
  movimientos: (MovimientoPresupuestoDepartamento | MovimientoPresupuestoProyecto)[]
}

const COLORS = {
  ingresos: "hsl(142, 76%, 36%)",
  gastos: "hsl(0, 84%, 60%)",
  ajustes: "hsl(217, 91%, 60%)",
  transferencias: "hsl(271, 91%, 65%)",
  proyeccion: "hsl(47, 96%, 53%)",
}

const CHART_COLORS = ["#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"]

export function BudgetAnalyticsView({ presupuesto, movimientos }: BudgetAnalyticsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "custom">("30d")

  // Calcular métricas principales
  const metrics = useMemo(() => {
    const totalIngresos = movimientos
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.Asignacion)
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const totalGastos = movimientos
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.Gasto)
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const totalAjustes = movimientos
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.Ajuste)
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const totalTransferencias = movimientos
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.Transferencia)
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const montoTotal = Number(presupuesto.montoTotal)
    const montoGastado = Number(presupuesto.montoGastado)
    const montoDisponible = Number(presupuesto.montoDisponible)
    const porcentajeGastado = (montoGastado / montoTotal) * 100

    // Calcular promedio diario de gastos
    const diasTranscurridos = differenceInDays(new Date(), new Date(presupuesto.fechaInicio))
    const promedioDiario = diasTranscurridos > 0 ? totalGastos / diasTranscurridos : 0

    // Calcular días restantes
    const diasRestantes = differenceInDays(new Date(presupuesto.fechaFin), new Date())

    // Proyección de gastos
    const proyeccionGastos = promedioDiario * diasRestantes
    const proyeccionTotal = montoGastado + proyeccionGastos

    // Alerta de sobregasto
    const alertaSobregasto = proyeccionTotal > montoTotal

    return {
      totalIngresos,
      totalGastos,
      totalAjustes,
      totalTransferencias,
      montoTotal,
      montoGastado,
      montoDisponible,
      porcentajeGastado,
      promedioDiario,
      diasRestantes,
      proyeccionGastos,
      proyeccionTotal,
      alertaSobregasto,
    }
  }, [presupuesto, movimientos])

  // Datos para gráfico de gastos por día
  const gastosData = useMemo(() => {
    const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90
    const startDate = subDays(new Date(), days)
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() })

    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const gastosDelDia = movimientos
        .filter(
          (m) =>
            m.tipo === TipoMovimientoPresupuesto.Gasto &&
            format(new Date(m.fechaMovimiento), "yyyy-MM-dd") === dateStr
        )
        .reduce((sum, m) => sum + Number(m.monto), 0)

      return {
        date: dateStr,
        value: gastosDelDia,
      }
    })
  }, [movimientos, selectedPeriod])

  // Datos para gráfico de distribución por tipo
  const distribucionData = useMemo(() => {
    return [
      {
        name: "Asignaciones",
        value: metrics.totalIngresos,
        color: COLORS.ingresos,
      },
      {
        name: "Gastos",
        value: metrics.totalGastos,
        color: COLORS.gastos,
      },
      {
        name: "Ajustes",
        value: Math.abs(metrics.totalAjustes),
        color: COLORS.ajustes,
      },
      {
        name: "Transferencias",
        value: Math.abs(metrics.totalTransferencias),
        color: COLORS.transferencias,
      },
    ].filter((item) => item.value > 0)
  }, [metrics])

  // Datos para gráfico de gastos por categoría
  const gastosPorCategoria = useMemo(() => {
    const categorias = new Map<string, number>()

    movimientos
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.Gasto)
      .forEach((m) => {
        const categoria = m.categoria || "Sin categoría"
        categorias.set(categoria, (categorias.get(categoria) || 0) + Number(m.monto))
      })

    return Array.from(categorias.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categorías
  }, [movimientos])

  // Datos para gráfico de tendencia acumulada
  const tendenciaAcumulada = useMemo(() => {
    const sortedMovimientos = [...movimientos].sort(
      (a, b) => new Date(a.fechaMovimiento).getTime() - new Date(b.fechaMovimiento).getTime()
    )

    let acumulado = 0
    return sortedMovimientos.map((m) => {
      if (m.tipo === TipoMovimientoPresupuesto.Gasto) {
        acumulado += Number(m.monto)
      }
      return {
        date: format(new Date(m.fechaMovimiento), "dd MMM", { locale: es }),
        gastado: acumulado,
        presupuesto: metrics.montoTotal,
      }
    })
  }, [movimientos, metrics.montoTotal])

  // Datos para proyección
  const proyeccionData = useMemo(() => {
    const hoy = new Date()
    const fin = new Date(presupuesto.fechaFin)
    const diasRestantes = differenceInDays(fin, hoy)

    if (diasRestantes <= 0) return []

    const puntos = Math.min(diasRestantes, 30) // Máximo 30 puntos
    const incrementoDias = Math.ceil(diasRestantes / puntos)

    const data = []
    for (let i = 0; i <= puntos; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() + i * incrementoDias)

      const gastosProyectados = metrics.montoGastado + metrics.promedioDiario * i * incrementoDias

      data.push({
        date: format(fecha, "dd MMM", { locale: es }),
        real: i === 0 ? metrics.montoGastado : null,
        proyeccion: gastosProyectados,
        limite: metrics.montoTotal,
      })
    }

    return data
  }, [presupuesto, metrics])

  return (
    <div className="space-y-6">
      {/* Alerta de sobregasto */}
      {metrics.alertaSobregasto && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Alerta de Sobregasto</p>
              <p className="text-sm text-muted-foreground">
                La proyección indica que podrías exceder el presupuesto en{" "}
                <span className="font-semibold">
                  {formatCurrency(metrics.proyeccionTotal - metrics.montoTotal)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.montoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(presupuesto.fechaInicio), "dd MMM", { locale: es })} -{" "}
              {format(new Date(presupuesto.fechaFin), "dd MMM yyyy", { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastado</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.montoGastado)}</div>
            <Progress value={metrics.porcentajeGastado} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.porcentajeGastado.toFixed(1)}% del presupuesto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.montoDisponible)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.montoDisponible / metrics.montoTotal) * 100).toFixed(1)}% restante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.promedioDiario)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.diasRestantes} días restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con diferentes vistas */}
      <Tabs defaultValue="gastos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gastos">
            <BarChart3 className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="distribucion">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Distribución
          </TabsTrigger>
          <TabsTrigger value="tendencia">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendencia
          </TabsTrigger>
          <TabsTrigger value="proyeccion">
            <Calendar className="h-4 w-4 mr-2" />
            Proyección
          </TabsTrigger>
        </TabsList>

        {/* Tab: Gastos por Día */}
        <TabsContent value="gastos" className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("7d")}
            >
              7 días
            </Button>
            <Button
              variant={selectedPeriod === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("30d")}
            >
              30 días
            </Button>
            <Button
              variant={selectedPeriod === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("90d")}
            >
              90 días
            </Button>
          </div>

          <ChartDateRangePicker
            title="Gastos Diarios"
            description="Visualiza los gastos en el período seleccionado"
            data={gastosData}
            valueLabel="Gastos"
            valueFormatter={formatCurrency}
            chartColor={COLORS.gastos}
            showYAxis={true}
            showGrid={true}
          />

          {/* Gastos por Categoría */}
          {gastosPorCategoria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>Top 6 categorías con mayor gasto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS.gastos} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Distribución */}
        <TabsContent value="distribucion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Movimientos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribucionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribucionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Movimientos</CardTitle>
                <CardDescription>Totales por tipo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.ingresos }} />
                    <span className="text-sm">Asignaciones</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(metrics.totalIngresos)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.gastos }} />
                    <span className="text-sm">Gastos</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(metrics.totalGastos)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.ajustes }} />
                    <span className="text-sm">Ajustes</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(Math.abs(metrics.totalAjustes))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.transferencias }} />
                    <span className="text-sm">Transferencias</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(Math.abs(metrics.totalTransferencias))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Tendencia */}
        <TabsContent value="tendencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Acumulada de Gastos</CardTitle>
              <CardDescription>Evolución del gasto total vs presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={tendenciaAcumulada}>
                  <defs>
                    <linearGradient id="colorGastado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.gastos} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.gastos} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
                  <Area
                    type="monotone"
                    dataKey="gastado"
                    stroke={COLORS.gastos}
                    fillOpacity={1}
                    fill="url(#colorGastado)"
                    name="Gastado"
                  />
                  <Line
                    type="monotone"
                    dataKey="presupuesto"
                    stroke={COLORS.ingresos}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Presupuesto"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Proyección */}
        <TabsContent value="proyeccion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Gastos</CardTitle>
              <CardDescription>
                Estimación basada en el promedio diario de {formatCurrency(metrics.promedioDiario)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={proyeccionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke={COLORS.gastos}
                    strokeWidth={3}
                    name="Gasto Real"
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proyeccion"
                    stroke={COLORS.proyeccion}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Proyección"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="limite"
                    stroke={COLORS.ingresos}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Límite Presupuesto"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Resumen de proyección */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gasto Actual</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.montoGastado)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Proyección Final</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.proyeccionTotal)}</p>
                  {metrics.alertaSobregasto && (
                    <Badge variant="destructive" className="mt-1">
                      Excede presupuesto
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Diferencia</p>
                  <p
                    className={`text-2xl font-bold ${
                      metrics.proyeccionTotal > metrics.montoTotal ? "text-destructive" : "text-green-500"
                    }`}
                  >
                    {formatCurrency(metrics.montoTotal - metrics.proyeccionTotal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
