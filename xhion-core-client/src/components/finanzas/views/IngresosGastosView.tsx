import { useEffect, useState } from 'react';
import { useFinanzasStore } from '@/store/finanzasStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingDown, Search, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import RegistrarIngresoModal from '../forms/RegistrarIngresoModal';
import RegistrarGastoModal from '../forms/RegistrarGastoModal';

interface IngresosGastosViewProps {
  proyectoId: string;
  proyectoNombre?: string;
}

export default function IngresosGastosView({ proyectoId, proyectoNombre }: IngresosGastosViewProps) {
  const { ingresos, gastos, loading, obtenerIngresos, obtenerGastos, eliminarIngreso, eliminarGasto } = useFinanzasStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);

  useEffect(() => {
    obtenerIngresos(proyectoId);
    obtenerGastos(proyectoId);
  }, [proyectoId]);

  const handleEliminarIngreso = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      try {
        await eliminarIngreso(id);
        toast.success('Ingreso eliminado');
        obtenerIngresos(proyectoId);
      } catch (error) {
        toast.error('Error al eliminar ingreso');
      }
    }
  };

  const handleEliminarGasto = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      try {
        await eliminarGasto(id);
        toast.success('Gasto eliminado');
        obtenerGastos(proyectoId);
      } catch (error) {
        toast.error('Error al eliminar gasto');
      }
    }
  };

  const filteredIngresos = ingresos.filter(
    (ing) =>
      ing.fuente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGastos = gastos.filter(
    (gasto) =>
      gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);
  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  const ingresosPorFuente = ingresos.reduce((acc, ing) => {
    acc[ing.fuente] = (acc[ing.fuente] || 0) + ing.monto;
    return acc;
  }, {} as Record<string, number>);

  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header con Totales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIngresos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{ingresos.length} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalGastos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{gastos.length} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIngresos - totalGastos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIngresos - totalGastos).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalIngresos - totalGastos >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Ingresos y Gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingresos y Gastos</CardTitle>
              <CardDescription>
                {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Gestiona los ingresos y gastos del proyecto'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ingresos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingresos">
                Ingresos ({ingresos.length})
              </TabsTrigger>
              <TabsTrigger value="gastos">
                Gastos ({gastos.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab de Ingresos */}
            <TabsContent value="ingresos" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Ingresos por Fuente</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ingresosPorFuente).map(([fuente, monto]) => (
                      <Badge key={fuente} variant="outline" className="text-green-600">
                        {fuente}: ${(monto as number).toLocaleString()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setShowIngresoModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Ingreso
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Comprobante</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : filteredIngresos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay ingresos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIngresos.map((ingreso) => (
                        <TableRow key={ingreso.id}>
                          <TableCell>
                            {format(new Date(ingreso.fechaIngreso), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ingreso.fuente}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {ingreso.descripcion || '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ${ingreso.monto.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {ingreso.comprobante || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarIngreso(ingreso.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Tab de Gastos */}
            <TabsContent value="gastos" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Gastos por Categoría</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(gastosPorCategoria).map(([categoria, monto]) => (
                      <Badge key={categoria} variant="outline" className="text-red-600">
                        {categoria}: ${(monto as number).toLocaleString()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setShowGastoModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Gasto
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Comprobante</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : filteredGastos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay gastos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGastos.map((gasto) => (
                        <TableRow key={gasto.id}>
                          <TableCell>
                            {format(new Date(gasto.fechaGasto), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{gasto.categoria}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {gasto.concepto}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            ${gasto.monto.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {gasto.comprobante || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarGasto(gasto.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modales */}
      <RegistrarIngresoModal
        open={showIngresoModal}
        onOpenChange={setShowIngresoModal}
        proyectoId={proyectoId}
        proyectoNombre={proyectoNombre}
        onSuccess={() => obtenerIngresos(proyectoId)}
      />

      <RegistrarGastoModal
        open={showGastoModal}
        onOpenChange={setShowGastoModal}
        proyectoId={proyectoId}
        proyectoNombre={proyectoNombre}
        onSuccess={() => obtenerGastos(proyectoId)}
      />
    </div>
  );
}
