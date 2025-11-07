import { useState, useEffect } from 'react';
import { useEventosStore } from '@/store/eventosStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Grid3x3, List, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarioMensual } from '@/components/calendario/CalendarioMensual';
import { EventoModal } from '@/components/calendario/EventoModal';
import { FiltrosCalendario } from '@/components/calendario/FiltrosCalendario';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type VistaCalendario = 'mes' | 'semana' | 'dia' | 'ano';

export function CalendarioPage() {
  const [vistaActual, setVistaActual] = useState<VistaCalendario>('mes');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);

  const { eventos, fetchEventos, loading, filtros } = useEventosStore();
  const { user } = useAuthStore();

  // Cargar eventos al montar y cuando cambian los filtros
  useEffect(() => {
    if (user) {
      const fechaDesde = startOfMonth(fechaActual).toISOString();
      const fechaHasta = endOfMonth(fechaActual).toISOString();

      fetchEventos({
        ...filtros,
        usuarioId: user.id,
        fechaDesde,
        fechaHasta,
      });
    }
  }, [user, fechaActual, filtros]);

  const navegarFecha = (direccion: 'prev' | 'next' | 'today') => {
    if (direccion === 'prev') {
      setFechaActual(subMonths(fechaActual, 1));
    } else if (direccion === 'next') {
      setFechaActual(addMonths(fechaActual, 1));
    } else {
      setFechaActual(new Date());
    }
  };

  const formatearFecha = () => {
    return format(fechaActual, 'MMMM yyyy', { locale: es });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Título y Vista */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Calendario</h1>
              </div>

              {/* Selector de Vista */}
              <ToggleGroup
                type="single"
                value={vistaActual}
                onValueChange={(value) => value && setVistaActual(value as VistaCalendario)}
                className="hidden sm:flex bg-muted/50 p-1 rounded-lg"
              >
                <ToggleGroupItem value="dia" aria-label="Vista diaria" size="sm">
                  <List className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Día</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="semana" aria-label="Vista semanal" size="sm">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Semana</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="mes" aria-label="Vista mensual" size="sm">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Mes</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="ano" aria-label="Vista anual" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Año</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span>Nuevo Evento</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros (Colapsable) */}
        {showFiltros && (
          <div className="px-4 sm:px-6 pb-4">
            <FiltrosCalendario />
          </div>
        )}
      </div>

      {/* Navegación de Fecha */}
      <div className="border-b bg-card">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarFecha('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-lg font-semibold capitalize">
            {formatearFecha()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarFecha('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarFecha('today')}
            className="ml-2"
          >
            Hoy
          </Button>
        </div>
      </div>

      {/* Vista de Calendario */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Cargando eventos...</p>
            </div>
          </div>
        ) : (
          <>
            {vistaActual === 'mes' && (
              <CalendarioMensual
                fecha={fechaActual}
                eventos={eventos}
              />
            )}
            {vistaActual === 'semana' && (
              <div className="text-center text-muted-foreground py-12">
                Vista semanal en desarrollo
              </div>
            )}
            {vistaActual === 'dia' && (
              <div className="text-center text-muted-foreground py-12">
                Vista diaria en desarrollo
              </div>
            )}
            {vistaActual === 'ano' && (
              <div className="text-center text-muted-foreground py-12">
                Vista anual en desarrollo
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear Evento */}
      <EventoModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
