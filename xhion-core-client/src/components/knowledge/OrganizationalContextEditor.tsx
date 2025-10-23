"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, Loader2, Building2, Target, Eye, Lightbulb, Briefcase, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConocimientoStore } from "@/store/conocimientoStore"
import { toast } from "sonner"

const contextoSchema = z.object({
  mision: z.string().optional(),
  vision: z.string().optional(),
  objetivosEstrategicos: z.string().optional(),
  descripcionGeneral: z.string().optional(),
  industria: z.string().max(100).optional(),
  tamanoEmpresa: z.string().max(50).optional(),
  valoresEmpresariales: z.string().optional(),
})

type ContextoFormData = z.infer<typeof contextoSchema>

export function OrganizationalContextEditor() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  const {
    contextoOrganizacional,
    isLoading,
    fetchContextoOrganizacional,
    createContextoOrganizacional,
    updateContextoOrganizacional,
  } = useConocimientoStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ContextoFormData>({
    resolver: zodResolver(contextoSchema),
    defaultValues: {
      mision: "",
      vision: "",
      objetivosEstrategicos: "",
      descripcionGeneral: "",
      industria: "",
      tamanoEmpresa: "",
      valoresEmpresariales: "",
    },
  })

  useEffect(() => {
    fetchContextoOrganizacional()
  }, [])

  useEffect(() => {
    if (contextoOrganizacional) {
      reset({
        mision: contextoOrganizacional.mision || "",
        vision: contextoOrganizacional.vision || "",
        objetivosEstrategicos: contextoOrganizacional.objetivosEstrategicos || "",
        descripcionGeneral: contextoOrganizacional.descripcionGeneral || "",
        industria: contextoOrganizacional.industria || "",
        tamanoEmpresa: contextoOrganizacional.tamanoEmpresa || "",
        valoresEmpresariales: contextoOrganizacional.valoresEmpresariales || "",
      })
    }
  }, [contextoOrganizacional, reset])

  const onSubmit = async (data: ContextoFormData) => {
    setIsSubmitting(true)
    try {
      if (contextoOrganizacional) {
        await updateContextoOrganizacional(data)
        toast.success("Contexto organizacional actualizado exitosamente")
      } else {
        await createContextoOrganizacional(data)
        toast.success("Contexto organizacional creado exitosamente")
      }
      reset(data)
    } catch (error) {
      console.error("Error al guardar contexto:", error)
      toast.error("Error al guardar el contexto organizacional")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contexto Organizacional</h1>
          <p className="text-muted-foreground mt-1">
            Define la identidad y dirección estratégica de tu organización
          </p>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="estrategia" className="gap-2">
              <Target className="h-4 w-4" />
              Estrategia
            </TabsTrigger>
            <TabsTrigger value="cultura" className="gap-2">
              <Award className="h-4 w-4" />
              Cultura
            </TabsTrigger>
          </TabsList>

          {/* Tab: General */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card className="border-border bg-card p-6">
              <div className="space-y-6">
                {/* Descripción General */}
                <div className="space-y-2">
                  <Label htmlFor="descripcionGeneral" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Descripción General
                  </Label>
                  <Textarea
                    id="descripcionGeneral"
                    placeholder="Describe brevemente tu organización, su propósito y actividades principales..."
                    rows={4}
                    {...register("descripcionGeneral")}
                  />
                  {errors.descripcionGeneral && (
                    <p className="text-sm text-destructive">{errors.descripcionGeneral.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Una descripción clara ayuda a la IA a entender mejor el contexto de tu organización
                  </p>
                </div>

                {/* Industria */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industria" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Industria / Sector
                    </Label>
                    <Input
                      id="industria"
                      placeholder="Ej: Tecnología, Salud, Educación"
                      {...register("industria")}
                    />
                    {errors.industria && (
                      <p className="text-sm text-destructive">{errors.industria.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tamanoEmpresa" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Tamaño de la Empresa
                    </Label>
                    <Input
                      id="tamanoEmpresa"
                      placeholder="Ej: 50-200 empleados, Startup, Enterprise"
                      {...register("tamanoEmpresa")}
                    />
                    {errors.tamanoEmpresa && (
                      <p className="text-sm text-destructive">{errors.tamanoEmpresa.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Estrategia */}
          <TabsContent value="estrategia" className="space-y-6 mt-6">
            <Card className="border-border bg-card p-6">
              <div className="space-y-6">
                {/* Misión */}
                <div className="space-y-2">
                  <Label htmlFor="mision" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Misión
                  </Label>
                  <Textarea
                    id="mision"
                    placeholder="¿Cuál es el propósito fundamental de tu organización? ¿Qué problema resuelves?"
                    rows={4}
                    {...register("mision")}
                  />
                  {errors.mision && (
                    <p className="text-sm text-destructive">{errors.mision.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    La misión define tu razón de ser y el impacto que buscas generar
                  </p>
                </div>

                {/* Visión */}
                <div className="space-y-2">
                  <Label htmlFor="vision" className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Visión
                  </Label>
                  <Textarea
                    id="vision"
                    placeholder="¿Dónde quieres que esté tu organización en 3-5 años? ¿Qué quieres lograr?"
                    rows={4}
                    {...register("vision")}
                  />
                  {errors.vision && (
                    <p className="text-sm text-destructive">{errors.vision.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    La visión es tu aspiración a largo plazo, tu norte estratégico
                  </p>
                </div>

                {/* Objetivos Estratégicos */}
                <div className="space-y-2">
                  <Label htmlFor="objetivosEstrategicos" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Objetivos Estratégicos
                  </Label>
                  <Textarea
                    id="objetivosEstrategicos"
                    placeholder="Lista los principales objetivos estratégicos de tu organización (uno por línea)..."
                    rows={6}
                    {...register("objetivosEstrategicos")}
                  />
                  {errors.objetivosEstrategicos && (
                    <p className="text-sm text-destructive">
                      {errors.objetivosEstrategicos.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Objetivos SMART que guían las decisiones y prioridades de la organización
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Cultura */}
          <TabsContent value="cultura" className="space-y-6 mt-6">
            <Card className="border-border bg-card p-6">
              <div className="space-y-6">
                {/* Valores Empresariales */}
                <div className="space-y-2">
                  <Label htmlFor="valoresEmpresariales" className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Valores Empresariales
                  </Label>
                  <Textarea
                    id="valoresEmpresariales"
                    placeholder="Lista los valores fundamentales que guían el comportamiento y decisiones en tu organización..."
                    rows={8}
                    {...register("valoresEmpresariales")}
                  />
                  {errors.valoresEmpresariales && (
                    <p className="text-sm text-destructive">
                      {errors.valoresEmpresariales.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Los valores definen la cultura y el ADN de tu organización. Ejemplos: Innovación,
                    Transparencia, Excelencia, Colaboración
                  </p>
                </div>

                {/* Info Card */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        ¿Por qué es importante el contexto organizacional?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Este contexto es utilizado por la IA para generar proyectos alineados con tus
                        objetivos, analizar riesgos en función de tu estrategia, y proporcionar
                        recomendaciones personalizadas que se ajusten a la cultura y valores de tu
                        organización.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* Last Updated Info */}
      {contextoOrganizacional && (
        <Card className="border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Última actualización:{" "}
              {new Date(contextoOrganizacional.fechaActualizacion).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              Por: {contextoOrganizacional.actualizadoPor?.nombreCompleto || "Sistema"}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
