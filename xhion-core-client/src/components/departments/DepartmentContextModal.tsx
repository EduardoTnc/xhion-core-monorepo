import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useConocimientoStore } from "@/store/conocimientoStore";
import type { ContextoDepartamento } from "@/services/conocimientoService";

const contextSchema = z.object({
  funciones: z.string().optional(),
  responsabilidades: z.string().optional(),
  procesosClave: z.string().optional(),
  objetivos: z.string().optional(),
  kpis: z.string().optional(),
});

type ContextFormData = z.infer<typeof contextSchema>;

interface DepartmentContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentoId: string;
  departamentoNombre: string;
  contextoExistente?: ContextoDepartamento | null;
}

export function DepartmentContextModal({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  contextoExistente,
}: DepartmentContextModalProps) {
  const { createContextoDepartamento, updateContextoDepartamento, isLoading } =
    useConocimientoStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      funciones: contextoExistente?.funciones || "",
      responsabilidades: contextoExistente?.responsabilidades || "",
      procesosClave: contextoExistente?.procesosClave || "",
      objetivos: contextoExistente?.objetivos || "",
      kpis: contextoExistente?.kpis || "",
    },
  });

  useEffect(() => {
    if (contextoExistente) {
      reset({
        funciones: contextoExistente.funciones || "",
        responsabilidades: contextoExistente.responsabilidades || "",
        procesosClave: contextoExistente.procesosClave || "",
        objetivos: contextoExistente.objetivos || "",
        kpis: contextoExistente.kpis || "",
      });
    } else {
      reset({
        funciones: "",
        responsabilidades: "",
        procesosClave: "",
        objetivos: "",
        kpis: "",
      });
    }
  }, [contextoExistente, reset]);

  const onSubmit = async (data: ContextFormData) => {
    try {
      if (contextoExistente) {
        await updateContextoDepartamento(departamentoId, data);
      } else {
        await createContextoDepartamento({
          departamentoId,
          ...data,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error manejado por el store
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Contexto del Departamento: {departamentoNombre}
          </DialogTitle>
          <DialogDescription>
            Define el contexto y la base de conocimiento del departamento para mejorar las
            recomendaciones de IA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Funciones */}
          <div className="space-y-2">
            <Label htmlFor="funciones">Funciones Principales</Label>
            <Textarea
              id="funciones"
              placeholder="Describe las funciones principales del departamento..."
              rows={3}
              {...register("funciones")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ej: Desarrollo de software, mantenimiento de sistemas, soporte técnico
            </p>
          </div>

          {/* Responsabilidades */}
          <div className="space-y-2">
            <Label htmlFor="responsabilidades">Responsabilidades</Label>
            <Textarea
              id="responsabilidades"
              placeholder="Define las responsabilidades del departamento..."
              rows={3}
              {...register("responsabilidades")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ej: Garantizar la calidad del código, cumplir con los plazos de entrega
            </p>
          </div>

          {/* Procesos Clave */}
          <div className="space-y-2">
            <Label htmlFor="procesosClave">Procesos Clave</Label>
            <Textarea
              id="procesosClave"
              placeholder="Lista los procesos clave del departamento..."
              rows={3}
              {...register("procesosClave")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ej: Sprint planning, code review, deployment, testing
            </p>
          </div>

          {/* Objetivos */}
          <div className="space-y-2">
            <Label htmlFor="objetivos">Objetivos</Label>
            <Textarea
              id="objetivos"
              placeholder="Define los objetivos del departamento..."
              rows={3}
              {...register("objetivos")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ej: Reducir bugs en producción en un 40%, mejorar tiempo de respuesta
            </p>
          </div>

          {/* KPIs */}
          <div className="space-y-2">
            <Label htmlFor="kpis">KPIs (Indicadores Clave)</Label>
            <Textarea
              id="kpis"
              placeholder="Lista los KPIs del departamento..."
              rows={3}
              {...register("kpis")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ej: Velocidad de sprint, tasa de bugs, tiempo de resolución, cobertura de tests
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contextoExistente ? "Actualizar" : "Guardar"} Contexto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
