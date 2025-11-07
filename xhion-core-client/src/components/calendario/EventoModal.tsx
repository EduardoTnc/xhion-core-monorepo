import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEventosStore } from '@/store/eventosStore';
import { type CreateEventoDto, TipoEvento, EstadoEvento } from '@/services/eventosService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// DateTimePicker no disponible, usar Input type datetime-local

interface EventoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId?: string;
}

export function EventoModal({ open, onOpenChange, eventoId }: EventoModalProps) {
  const { createEvento, updateEvento, loading } = useEventosStore();
  const [todoElDia, setTodoElDia] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEventoDto>({
    defaultValues: {
      tipo: TipoEvento.Reunion,
      estado: EstadoEvento.Pendiente,
      todoElDia: false,
    },
  });

  const onSubmit = async (data: CreateEventoDto) => {
    const resultado = eventoId
      ? await updateEvento(eventoId, data)
      : await createEvento(data);

    if (resultado) {
      reset();
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {eventoId ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register('titulo', { required: 'El título es requerido' })}
              placeholder="Ej: Reunión de planificación Sprint 8"
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Describe el evento..."
              rows={3}
            />
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={watch('tipo')}
                onValueChange={(value) => setValue('tipo', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoEvento.Reunion}>Reunión</SelectItem>
                  <SelectItem value={TipoEvento.Tarea}>Tarea</SelectItem>
                  <SelectItem value={TipoEvento.Proyecto}>Proyecto</SelectItem>
                  <SelectItem value={TipoEvento.Personal}>Personal</SelectItem>
                  <SelectItem value={TipoEvento.Recordatorio}>Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={watch('estado')}
                onValueChange={(value) => setValue('estado', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoEvento.Pendiente}>Pendiente</SelectItem>
                  <SelectItem value={EstadoEvento.En_Curso}>En Curso</SelectItem>
                  <SelectItem value={EstadoEvento.Completado}>Completado</SelectItem>
                  <SelectItem value={EstadoEvento.Cancelado}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Todo el día */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="todoElDia"
              checked={todoElDia}
              onCheckedChange={(checked) => {
                setTodoElDia(checked as boolean);
                setValue('todoElDia', checked as boolean);
              }}
            />
            <Label htmlFor="todoElDia" className="cursor-pointer">
              Evento de todo el día
            </Label>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
              <Input
                id="fechaInicio"
                type={todoElDia ? 'date' : 'datetime-local'}
                {...register('fechaInicio', { required: 'La fecha de inicio es requerida' })}
              />
              {errors.fechaInicio && (
                <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin *</Label>
              <Input
                id="fechaFin"
                type={todoElDia ? 'date' : 'datetime-local'}
                {...register('fechaFin', { required: 'La fecha de fin es requerida' })}
              />
              {errors.fechaFin && (
                <p className="text-sm text-destructive">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              {...register('ubicacion')}
              placeholder="Ej: Sala de Juntas 2"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              {...register('color')}
              className="h-10 w-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : eventoId ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
