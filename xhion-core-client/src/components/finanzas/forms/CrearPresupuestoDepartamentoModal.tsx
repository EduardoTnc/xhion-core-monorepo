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
import { Wallet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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
  periodo: z.string().min(1, 'El período es requerido'),
  fechaInicio: z.string({
    required_error: 'La fecha de inicio es requerida',
  }),
  fechaFin: z.string({
    required_error: 'La fecha de fin es requerida',
  }),
  descripcion: z.string().optional(),
  estado: z.enum(['Activo', 'Agotado', 'Cerrado', 'Suspendido']).optional(),
}).refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin'],
});

type FormValues = z.infer<typeof formSchema>;

interface CrearPresupuestoDepartamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentoId: string;
  departamentoNombre?: string;
  onSuccess?: () => void;
}

export default function CrearPresupuestoDepartamentoModal({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  onSuccess,
}: CrearPresupuestoDepartamentoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { crearPresupuestoDepartamento } = useFinanzasStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      montoTotal: 0,
      periodo: '',
      fechaInicio: format(new Date(), 'yyyy-MM-dd'),
      fechaFin: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd'),
      descripcion: '',
      estado: 'Activo',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await crearPresupuestoDepartamento(departamentoId, data);

      toast.success('Presupuesto creado exitosamente', {
        description: `$${data.montoTotal.toLocaleString()} para ${data.periodo}`,
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Crear Presupuesto de Departamento
          </DialogTitle>
          <DialogDescription>
            {departamentoNombre ? `Departamento: ${departamentoNombre}` : 'Define el presupuesto para el departamento'}
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
              name="periodo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 2024-Q1, 2024, Enero 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
