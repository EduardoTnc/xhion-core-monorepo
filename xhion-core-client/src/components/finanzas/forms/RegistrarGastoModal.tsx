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
import { TrendingDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const categoriasGasto = [
  { value: 'Personal', label: 'Personal' },
  { value: 'Software', label: 'Software' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Materiales', label: 'Materiales' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Otro', label: 'Otro' },
] as const;

const formSchema = z.object({
  categoria: z.enum(['Personal', 'Software', 'Hardware', 'Materiales', 'Servicios', 'Marketing', 'Infraestructura', 'Otro'], {
    required_error: 'Selecciona una categoría',
  }),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  monto: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'Ingresa un monto válido',
  }).positive('El monto debe ser mayor a 0'),
  fechaGasto: z.string({
    required_error: 'La fecha es requerida',
  }),
  comprobante: z.string().optional(),
  recursoId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrarGastoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  proyectoNombre?: string;
  onSuccess?: () => void;
}

export default function RegistrarGastoModal({
  open,
  onOpenChange,
  proyectoId,
  proyectoNombre,
  onSuccess,
}: RegistrarGastoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registrarGasto } = useFinanzasStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoria: 'Personal',
      concepto: '',
      monto: 0,
      fechaGasto: format(new Date(), 'yyyy-MM-dd'),
      comprobante: '',
      recursoId: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        fechaGasto: new Date(data.fechaGasto).toISOString(),
        recursoId: data.recursoId || undefined,
      };

      await registrarGasto(proyectoId, payload);

      toast.success('Gasto registrado exitosamente', {
        description: `$${data.monto.toLocaleString()} en ${data.categoria}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al registrar gasto', {
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
            <TrendingDown className="h-5 w-5 text-red-600" />
            Registrar Gasto
          </DialogTitle>
          <DialogDescription>
            {proyectoNombre ? `Proyecto: ${proyectoNombre}` : 'Registra un nuevo gasto para el proyecto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasGasto.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
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
              name="concepto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Licencias de software" {...field} />
                  </FormControl>
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
              name="fechaGasto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Gasto *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                Registrar Gasto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
