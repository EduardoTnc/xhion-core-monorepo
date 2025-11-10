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
import { ArrowRightLeft, Loader2 } from 'lucide-react';

const tiposMovimiento = [
  { value: 'Gasto', label: 'Gasto', description: 'Reduce el disponible' },
  { value: 'Ajuste', label: 'Ajuste', description: 'Ajuste positivo o negativo' },
  { value: 'Transferencia', label: 'Transferencia', description: 'Entre categorías' },
] as const;

const formSchema = z.object({
  tipo: z.enum(['Gasto', 'Ajuste', 'Transferencia'], {
    required_error: 'Selecciona un tipo de movimiento',
  }),
  monto: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'Ingresa un monto válido',
  }).positive('El monto debe ser mayor a 0'),
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  categoria: z.string().optional(),
  comprobante: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrarMovimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'departamento' | 'proyecto';
  id: string;
  nombre?: string;
  montoDisponible?: number;
  onSuccess?: () => void;
}

export default function RegistrarMovimientoModal({
  open,
  onOpenChange,
  tipo,
  id,
  nombre,
  montoDisponible,
  onSuccess,
}: RegistrarMovimientoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registrarMovimientoPresupuestoDepartamento, registrarMovimientoPresupuestoProyecto } = useFinanzasStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'Gasto',
      monto: 0,
      descripcion: '',
      categoria: '',
      comprobante: '',
    },
  });

  const tipoSeleccionado = form.watch('tipo');
  const montoIngresado = form.watch('monto');

  const onSubmit = async (data: FormValues) => {
    // Validar fondos disponibles para gastos
    if (data.tipo === 'Gasto' && montoDisponible !== undefined && data.monto > montoDisponible) {
      toast.error('Fondos insuficientes', {
        description: `Disponible: $${montoDisponible.toLocaleString()}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (tipo === 'departamento') {
        await registrarMovimientoPresupuestoDepartamento(id, data);
      } else {
        await registrarMovimientoPresupuestoProyecto(id, data);
      }

      toast.success('Movimiento registrado exitosamente', {
        description: `${data.tipo}: $${data.monto.toLocaleString()}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al registrar movimiento', {
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
            <ArrowRightLeft className="h-5 w-5 text-purple-600" />
            Registrar Movimiento de Presupuesto
          </DialogTitle>
          <DialogDescription>
            {nombre ? `${tipo === 'departamento' ? 'Departamento' : 'Proyecto'}: ${nombre}` : 'Registra un movimiento en el presupuesto'}
            {montoDisponible !== undefined && (
              <span className="block mt-1 text-sm font-medium">
                Disponible: ${montoDisponible.toLocaleString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimiento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposMovimiento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div>
                            <div className="font-medium">{tipo.label}</div>
                            <div className="text-xs text-muted-foreground">{tipo.description}</div>
                          </div>
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
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  {tipoSeleccionado === 'Gasto' && montoDisponible !== undefined && montoIngresado > montoDisponible && (
                    <p className="text-sm text-red-600">
                      ⚠️ Excede el monto disponible
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el movimiento"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Salarios, Equipamiento (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comprobante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comprobante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URL o referencia del comprobante (opcional)"
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
                Registrar Movimiento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
