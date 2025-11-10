import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  FileText, 
  Building2,
  Briefcase 
} from 'lucide-react';
import IngresosGastosView from '@/components/finanzas/views/IngresosGastosView';
import RentabilidadDashboard from '@/components/finanzas/dashboards/RentabilidadDashboard';

export default function FinanzasPage() {
  const [selectedProyectoId] = useState<string>('');
  const [selectedDepartamentoId] = useState<string>('');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finanzas</h2>
          <p className="text-muted-foreground">
            Gestión completa de ingresos, gastos y presupuestos
          </p>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="proyectos" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Por Proyecto
          </TabsTrigger>
          <TabsTrigger value="departamentos" className="gap-2">
            <Building2 className="h-4 w-4" />
            Por Departamento
          </TabsTrigger>
          <TabsTrigger value="reportes" className="gap-2">
            <FileText className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$0</div>
                <p className="text-xs text-muted-foreground">Todos los proyectos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">$0</div>
                <p className="text-xs text-muted-foreground">Todos los proyectos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presupuestos Activos</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Departamentos y proyectos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Retorno de inversión</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
              <CardDescription>
                Vista general del estado financiero de la organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Selecciona un proyecto o departamento para ver el análisis detallado
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Por Proyecto */}
        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finanzas por Proyecto</CardTitle>
              <CardDescription>
                Gestiona ingresos, gastos y presupuestos de proyectos específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProyectoId ? (
                <Tabs defaultValue="ingresos-gastos" className="w-full">
                  <TabsList>
                    <TabsTrigger value="ingresos-gastos">Ingresos y Gastos</TabsTrigger>
                    <TabsTrigger value="rentabilidad">Rentabilidad</TabsTrigger>
                    <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ingresos-gastos">
                    <IngresosGastosView 
                      proyectoId={selectedProyectoId}
                      proyectoNombre="Proyecto Ejemplo"
                    />
                  </TabsContent>

                  <TabsContent value="rentabilidad">
                    <RentabilidadDashboard 
                      proyectoId={selectedProyectoId}
                      proyectoNombre="Proyecto Ejemplo"
                    />
                  </TabsContent>

                  <TabsContent value="presupuesto">
                    <div className="text-center text-muted-foreground py-12">
                      Vista de presupuesto del proyecto
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un proyecto para ver sus finanzas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Por Departamento */}
        <TabsContent value="departamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos por Departamento</CardTitle>
              <CardDescription>
                Gestiona presupuestos y movimientos de departamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDepartamentoId ? (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground py-12">
                    Vista de presupuesto del departamento
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un departamento para ver su presupuesto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Reportes */}
        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Financieros</CardTitle>
              <CardDescription>
                Análisis y reportes consolidados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reportes financieros y análisis comparativos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
