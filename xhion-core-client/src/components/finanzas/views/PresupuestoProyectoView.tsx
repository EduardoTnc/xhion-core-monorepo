import { useEffect, useState } from 'react';
import { useFinanzasStore } from '@/store/finanzasStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Briefcase, Plus, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RegistrarMovimientoModal from '../forms/RegistrarMovimientoModal';

interface PresupuestoProyectoViewProps {
  proyectoId: string;
  proyectoNombre?: string;
}

export default function PresupuestoProyectoView({
  proyectoId,
  proyectoNombre,
}: PresupuestoProyectoViewProps) {
  const { presupuestoProyecto, loading, obtenerPresupuestoProyecto } = useFinanzasStore();
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);

  useEffect(() => {
    obtenerPresupuestoProyecto(proyectoId);
  }, [proyectoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando presupuesto...</div>
      </div>
    );
  }

  if (!presupuestoProyecto) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No hay presupuesto asignado</p>
          <Button>Crear Presupuesto</Button>
        </CardContent>
      </Card>
    );
  }

  const {
    montoTotal,
    montoGastado,
    montoDisponible,
    estado,
    descripcion,
    movimientos = [],
  } = presupuestoProyecto;

  const porcentajeGastado = (montoGastado / montoTotal) * 100;

  const getEstadoBadge = () => {
    switch (estado) {
      case 'Activo':
        return <Badge className="bg-green-600">Activo</Badge>;
      case 'Agotado':
        return <Badge className="bg-red-600">Agotado</Badge>;
      case 'Cerrado':
        return <Badge variant="outline">Cerrado</Badge>;
      case 'Suspendido':
        return <Badge className="bg-yellow-600">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getProgressColor = () => {
    if (porcentajeGastado >= 90) return 'bg-red-600';
    if (porcentajeGastado >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header con información del presupuesto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Presupuesto de Proyecto
              </CardTitle>
              <CardDescription>
                {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Gestión del presupuesto'}
              </CardDescription>
            </div>
            {getEstadoBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {descripcion && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="text-sm">{descripcion}</p>
            </div>
          )}

          {/* Métricas de presupuesto */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${montoTotal.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monto Gastado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${montoGastado.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {porcentajeGastado.toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monto Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${montoDisponible.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 - porcentajeGastado).toFixed(1)}% disponible
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ejecución del Presupuesto</span>
              <span className="font-semibold">{porcentajeGastado.toFixed(1)}%</span>
            </div>
            <Progress value={porcentajeGastado} className={getProgressColor()} />
            {porcentajeGastado >= 90 && (
              <p className="text-xs text-red-600">⚠️ Presupuesto casi agotado</p>
            )}
          </div>

          {/* Botón para registrar movimiento */}
          <Button
            onClick={() => setShowMovimientoModal(true)}
            disabled={estado === 'Cerrado' || estado === 'Suspendido'}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar Movimiento
          </Button>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Historial de Movimientos
          </CardTitle>
          <CardDescription>Todos los movimientos del presupuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientos.map((mov: any) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        {format(new Date(mov.fecha), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{mov.tipo}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {mov.descripcion}
                      </TableCell>
                      <TableCell>{mov.categoria || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${mov.monto.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de movimiento */}
      <RegistrarMovimientoModal
        open={showMovimientoModal}
        onOpenChange={setShowMovimientoModal}
        tipo="proyecto"
        id={proyectoId}
        nombre={proyectoNombre}
        montoDisponible={montoDisponible}
        onSuccess={() => obtenerPresupuestoProyecto(proyectoId)}
      />
    </div>
  );
}
