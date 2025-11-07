import { useEventosStore } from '@/store/eventosStore';
import { TipoEvento, EstadoEvento } from '@/services/eventosService';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function FiltrosCalendario() {
  const { filtros, setFiltros, clearFiltros } = useEventosStore();

  const tieneFiltrosActivos = Object.keys(filtros).length > 0;

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {tieneFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFiltros}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo */}
        <div className="space-y-2">
          <Label>Tipo de Evento</Label>
          <Select
            value={filtros.tipo || ''}
            onValueChange={(value) =>
              setFiltros({ tipo: value as any || undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={TipoEvento.Reunion}>Reunión</SelectItem>
              <SelectItem value={TipoEvento.Tarea}>Tarea</SelectItem>
              <SelectItem value={TipoEvento.Proyecto}>Proyecto</SelectItem>
              <SelectItem value={TipoEvento.Personal}>Personal</SelectItem>
              <SelectItem value={TipoEvento.Recordatorio}>Recordatorio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={filtros.estado || ''}
            onValueChange={(value) =>
              setFiltros({ estado: value as any || undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={EstadoEvento.Pendiente}>Pendiente</SelectItem>
              <SelectItem value={EstadoEvento.En_Curso}>En Curso</SelectItem>
              <SelectItem value={EstadoEvento.Completado}>Completado</SelectItem>
              <SelectItem value={EstadoEvento.Cancelado}>Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
