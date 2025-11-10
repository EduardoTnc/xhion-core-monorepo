import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFinanzasStore } from '@/store/finanzasStore';
import { toast } from 'sonner';
import { Briefcase, Loader2 } from 'lucide-react';

const estadosPresupuesto = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Agotado', label: 'Agotado' },
  { value: 'Cerrado', label: 'Cerrado' },
  { value: 'Suspendido', label: 'Suspendido' },
] as const;

const formSchema = z.object({
  montoTotal: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'Ingresa un monto válido',
  }).positive('El monto debe ser mayor a 0'),
  descripcion: z.string().optional(),
  estado: z.enum(['Activo', 'Agotado', 'Cerrado', 'Suspendido']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CrearPresupuestoProyectoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  proyectoNombre?: string;
  onSuccess?: () => void;
}

export default function CrearPresupuestoProyectoModal({
  open,
  onOpenChange,
  proyectoId,
  proyectoNombre,
  onSuccess,
}: CrearPresupuestoProyectoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { crearPresupuestoProyecto } = useFinanzasStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      montoTotal: 0,
      descripcion: '',
      estado: 'Activo',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await crearPresupuestoProyecto(proyectoId, data);

      toast.success('Presupuesto creado exitosamente', {
        description: `$${data.montoTotal.toLocaleString()} asignado al proyecto`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al crear presupuesto', {
        description: error.response?.data?.message || 'Intenta nuevamente',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Crear Presupuesto de Proyecto
          </DialogTitle>
          <DialogDescription>
            {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Define el presupuesto para el proyecto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="montoTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Total *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estadosPresupuesto.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del presupuesto (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Presupuesto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
