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
import { DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const fuentesIngreso = [
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Publicidad', label: 'Publicidad' },
  { value: 'Suscripciones', label: 'Suscripciones' },
  { value: 'Licencias', label: 'Licencias' },
  { value: 'Otro', label: 'Otro' },
] as const;

const formSchema = z.object({
  fuente: z.enum(['Ventas', 'Servicios', 'Publicidad', 'Suscripciones', 'Licencias', 'Otro'], {
    required_error: 'Selecciona una fuente de ingreso',
  }),
  monto: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'Ingresa un monto válido',
  }).positive('El monto debe ser mayor a 0'),
  descripcion: z.string().optional(),
  fechaIngreso: z.string({
    required_error: 'La fecha es requerida',
  }),
  comprobante: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrarIngresoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  proyectoNombre?: string;
  onSuccess?: () => void;
}

export default function RegistrarIngresoModal({
  open,
  onOpenChange,
  proyectoId,
  proyectoNombre,
  onSuccess,
}: RegistrarIngresoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registrarIngreso } = useFinanzasStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuente: 'Ventas',
      monto: 0,
      descripcion: '',
      fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
      comprobante: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await registrarIngreso(proyectoId, {
        ...data,
        fechaIngreso: new Date(data.fechaIngreso).toISOString(),
      });

      toast.success('Ingreso registrado exitosamente', {
        description: `$${data.monto.toLocaleString()} de ${data.fuente}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al registrar ingreso', {
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
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Ingreso
          </DialogTitle>
          <DialogDescription>
            {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Registra un nuevo ingreso para el proyecto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fuente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente de Ingreso *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la fuente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fuentesIngreso.map((fuente) => (
                        <SelectItem key={fuente.value} value={fuente.value}>
                          {fuente.label}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaIngreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Ingreso *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                      placeholder="Descripción del ingreso (opcional)"
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
                Registrar Ingreso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
