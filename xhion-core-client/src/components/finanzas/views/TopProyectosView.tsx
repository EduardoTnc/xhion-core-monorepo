import { useEffect, useState } from 'react';
import { useFinanzasStore } from '@/store/finanzasStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface TopProyectosViewProps {
  limite?: number;
}

export default function TopProyectosView({ limite = 10 }: TopProyectosViewProps) {
  const { topProyectos, loading, obtenerTopProyectos } = useFinanzasStore();
  const [ordenarPor, setOrdenarPor] = useState<'ingresos' | 'utilidad' | 'roi'>('utilidad');

  useEffect(() => {
    obtenerTopProyectos(limite, ordenarPor);
  }, [limite, ordenarPor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando proyectos...</div>
      </div>
    );
  }

  const getPosicionBadge = (posicion: number) => {
    if (posicion === 1) return <Badge className="bg-yellow-500">🥇 1°</Badge>;
    if (posicion === 2) return <Badge className="bg-gray-400">🥈 2°</Badge>;
    if (posicion === 3) return <Badge className="bg-orange-600">🥉 3°</Badge>;
    return <Badge variant="outline">{posicion}°</Badge>;
  };

  const chartData = topProyectos.map((proyecto: any) => ({
    nombre: proyecto.nombre.length > 15 ? proyecto.nombre.substring(0, 15) + '...' : proyecto.nombre,
    ingresos: proyecto.ingresos,
    gastos: proyecto.gastos,
    utilidad: proyecto.utilidad,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Top Proyectos
          </h2>
          <p className="text-muted-foreground">Proyectos más rentables</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={ordenarPor === 'ingresos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrdenarPor('ingresos')}
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Ingresos
          </Button>
          <Button
            variant={ordenarPor === 'utilidad' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrdenarPor('utilidad')}
          >
            <TrendingUp className="mr-1 h-4 w-4" />
            Utilidad
          </Button>
          <Button
            variant={ordenarPor === 'roi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrdenarPor('roi')}
          >
            <Percent className="mr-1 h-4 w-4" />
            ROI
          </Button>
        </div>
      </div>

      {/* Gráfico de barras */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación Visual</CardTitle>
          <CardDescription>Ingresos, gastos y utilidad por proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
              <Bar dataKey="utilidad" fill="#3b82f6" name="Utilidad" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cards de proyectos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topProyectos.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No hay proyectos disponibles</p>
            </CardContent>
          </Card>
        ) : (
          topProyectos.map((proyecto: any, index: number) => (
            <Card key={proyecto.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{proyecto.nombre}</CardTitle>
                  {getPosicionBadge(index + 1)}
                </div>
                <CardDescription>{proyecto.descripcion || 'Sin descripción'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ingresos</span>
                    <span className="font-semibold text-green-600">
                      ${proyecto.ingresos.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gastos</span>
                    <span className="font-semibold text-red-600">
                      ${proyecto.gastos.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Utilidad</span>
                    <span className={`font-semibold ${proyecto.utilidad >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${proyecto.utilidad.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ROI y Margen */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-lg font-bold text-purple-600">{proyecto.roi.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Margen</p>
                    <p className="text-lg font-bold text-orange-600">{proyecto.margen.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Estado financiero */}
                <div className="flex justify-center pt-2">
                  {proyecto.estadoFinanciero === 'Excelente' && (
                    <Badge className="bg-green-600">Excelente</Badge>
                  )}
                  {proyecto.estadoFinanciero === 'Bueno' && (
                    <Badge className="bg-blue-600">Bueno</Badge>
                  )}
                  {proyecto.estadoFinanciero === 'Regular' && (
                    <Badge className="bg-yellow-600">Regular</Badge>
                  )}
                  {proyecto.estadoFinanciero === 'Malo' && (
                    <Badge className="bg-red-600">Malo</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
