import { useEffect } from 'react';
import { useFinanzasStore } from '@/store/finanzasStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import FinanzasMetricsCards from './FinanzasMetricsCards';

interface RentabilidadDashboardProps {
  proyectoId: string;
  proyectoNombre?: string;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function RentabilidadDashboard({ proyectoId, proyectoNombre }: RentabilidadDashboardProps) {
  const { rentabilidad, loading, analizarRentabilidad } = useFinanzasStore();

  useEffect(() => {
    analizarRentabilidad(proyectoId);
  }, [proyectoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando análisis de rentabilidad...</div>
      </div>
    );
  }

  if (!rentabilidad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No hay datos de rentabilidad disponibles</div>
      </div>
    );
  }

  const { totalIngresos, totalGastos, utilidadNeta, roi, margen, estadoFinanciero } = rentabilidad;

  // Datos para gráfico de líneas (Ingresos vs Gastos)
  const lineData = [
    { name: 'Inicio', ingresos: 0, gastos: 0 },
    { name: 'Actual', ingresos: totalIngresos, gastos: totalGastos },
  ];

  // Datos para gráfico de pastel (Distribución)
  const pieData = [
    { name: 'Utilidad', value: utilidadNeta > 0 ? utilidadNeta : 0 },
    { name: 'Gastos', value: totalGastos },
  ];

  // Badge de estado financiero
  const getEstadoBadge = () => {
    switch (estadoFinanciero) {
      case 'Excelente':
        return <Badge className="bg-green-600">Excelente</Badge>;
      case 'Bueno':
        return <Badge className="bg-blue-600">Bueno</Badge>;
      case 'Regular':
        return <Badge className="bg-yellow-600">Regular</Badge>;
      case 'Malo':
        return <Badge className="bg-red-600">Malo</Badge>;
      default:
        return <Badge variant="outline">Sin datos</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análisis de Rentabilidad</h2>
          <p className="text-muted-foreground">
            {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Análisis financiero del proyecto'}
          </p>
        </div>
        {getEstadoBadge()}
      </div>

      {/* Métricas principales */}
      <FinanzasMetricsCards
        totalIngresos={totalIngresos}
        totalGastos={totalGastos}
        utilidadNeta={utilidadNeta}
        roi={roi}
        margenPromedio={margen}
      />

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Líneas - Ingresos vs Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ingresos vs Gastos
            </CardTitle>
            <CardDescription>Comparación de ingresos y gastos acumulados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pastel - Distribución */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Distribución Financiera
            </CardTitle>
            <CardDescription>Proporción de utilidad y gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores Clave */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI (Retorno de Inversión)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Percent className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-3xl font-bold">{roi.toFixed(2)}%</div>
                <p className="text-sm text-muted-foreground">
                  {roi >= 20 ? 'Excelente retorno' : roi >= 0 ? 'Retorno positivo' : 'Retorno negativo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Margen de Utilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold">{margen.toFixed(2)}%</div>
                <p className="text-sm text-muted-foreground">
                  {margen >= 30 ? 'Margen saludable' : margen >= 0 ? 'Margen aceptable' : 'Margen negativo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-3xl font-bold">{getEstadoBadge()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Basado en ROI y margen de utilidad
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
