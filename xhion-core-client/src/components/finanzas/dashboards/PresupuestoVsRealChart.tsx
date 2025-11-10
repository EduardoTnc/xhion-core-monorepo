import { useEffect } from 'react';
import { useFinanzasStore } from '@/store/finanzasStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PresupuestoVsRealChartProps {
  tipo: 'departamento' | 'proyecto';
  id: string;
  nombre?: string;
}

export default function PresupuestoVsRealChart({ tipo, id, nombre }: PresupuestoVsRealChartProps) {
  const { presupuestoVsReal, loading, analizarPresupuestoVsRealDepartamento, analizarPresupuestoVsRealProyecto } = useFinanzasStore();

  useEffect(() => {
    if (tipo === 'departamento') {
      analizarPresupuestoVsRealDepartamento(id);
    } else {
      analizarPresupuestoVsRealProyecto(id);
    }
  }, [tipo, id, analizarPresupuestoVsRealDepartamento, analizarPresupuestoVsRealProyecto]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando análisis...</div>
        </CardContent>
      </Card>
    );
  }

  if (!presupuestoVsReal) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No hay datos disponibles</div>
        </CardContent>
      </Card>
    );
  }

  const { presupuestado, gastado, disponible, porcentajeEjecucion, desviacion } = presupuestoVsReal;

  const chartData = [
    {
      categoria: 'Presupuesto',
      Presupuestado: presupuestado,
      Gastado: gastado,
      Disponible: disponible,
    },
  ];

  const getEstadoBadge = () => {
    if (porcentajeEjecucion < 70) return <Badge className="bg-green-600">Dentro del presupuesto</Badge>;
    if (porcentajeEjecucion < 90) return <Badge className="bg-yellow-600">Alerta</Badge>;
    if (porcentajeEjecucion < 100) return <Badge className="bg-orange-600">Crítico</Badge>;
    return <Badge className="bg-red-600">Excedido</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Presupuesto vs Real
            </CardTitle>
            <CardDescription>
              {nombre ? `${tipo === 'departamento' ? 'Departamento' : 'Proyecto'}: ${nombre}` : 'Análisis de ejecución presupuestaria'}
            </CardDescription>
          </div>
          {getEstadoBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Presupuestado</p>
            <p className="text-2xl font-bold text-blue-600">${presupuestado.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastado</p>
            <p className="text-2xl font-bold text-red-600">${gastado.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Disponible</p>
            <p className="text-2xl font-bold text-green-600">${disponible.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ejecución</p>
            <p className={`text-2xl font-bold ${porcentajeEjecucion >= 100 ? 'text-red-600' : 'text-blue-600'}`}>
              {porcentajeEjecucion.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Desviación */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">Desviación del Presupuesto</span>
          <span className={`text-lg font-bold ${desviacion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {desviacion >= 0 ? '+' : ''}{desviacion.toFixed(1)}%
          </span>
        </div>

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Presupuestado" fill="#3b82f6" name="Presupuestado" />
            <Bar dataKey="Gastado" fill="#ef4444" name="Gastado" />
            <Bar dataKey="Disponible" fill="#10b981" name="Disponible" />
            <Line type="monotone" dataKey="Presupuestado" stroke="#8b5cf6" strokeWidth={2} name="Línea de Presupuesto" />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Alertas */}
        {porcentajeEjecucion >= 90 && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ <strong>Alerta:</strong> El presupuesto está {porcentajeEjecucion >= 100 ? 'excedido' : 'casi agotado'}. 
              Se recomienda revisar los gastos y considerar ajustes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
