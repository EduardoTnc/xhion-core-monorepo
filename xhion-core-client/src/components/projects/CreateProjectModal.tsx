import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { type DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useCreateProject, useDepartments, useUsers } from "@/hooks/queries";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Calendar,
  Sparkles,
  Bot,
  ArrowLeft,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aiService, type AiProjectAssistResponse } from "@/services/aiService";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentoIdPredeterminado?: string;
  onSuccess?: () => void;
}

interface ProjectFormData {
  nombre: string;
  descripcion: string;
  responsableId: string;
  departamentoId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

type CreationMode = "manual" | "ai";
type AIStep = "input" | "generating" | "result";

export function CreateProjectModal({ open, onOpenChange, departamentoIdPredeterminado, onSuccess }: CreateProjectModalProps) {
  // TanStack Query mutations
  const createProjectMutation = useCreateProject();
  const { user } = useAuthStore();

  // Check if user has permission to assign any responsible (granular permissions only)
  const canAssignResponsable = user?.permisos?.includes('proyectos.asignar_responsable');

  // Check if user has AI permission (granular permissions only)
  const canUseAI = user?.permisos?.includes('ai.projects.assist');

  // TanStack Query for departments
  const { data: departamentos = [] } = useDepartments({ enabled: open });

  // TanStack Query for users (only fetch if user can assign)
  const { data: usuarios = [] } = useUsers({ enabled: open && canAssignResponsable });

  // Form state
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>(departamentoIdPredeterminado || "");
  const [selectedResponsable, setSelectedResponsable] = useState<string>(user?.id || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // AI state
  const [mode, setMode] = useState<CreationMode>("manual");
  const [aiStep, setAiStep] = useState<AIStep>("input");
  const [aiDescription, setAiDescription] = useState("");
  const [aiResponse, setAiResponse] = useState<AiProjectAssistResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Editable fields from AI generation
  const [editableProjectName, setEditableProjectName] = useState("");
  const [editableProjectDescription, setEditableProjectDescription] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      responsableId: user?.id || "",
    },
  });

  // Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setMode("manual");
      setAiStep("input");
      setAiDescription("");
      setAiResponse(null);
      setAiError(null);
      setSelectedDepartamento(departamentoIdPredeterminado || "");
      setSelectedResponsable(user?.id || "");
      setDateRange(undefined);
      setEditableProjectName("");
      setEditableProjectDescription("");
    }
  }, [open, reset, departamentoIdPredeterminado, user?.id]);

  // Sync editable fields when AI responds
  useEffect(() => {
    if (aiResponse) {
      setEditableProjectName(aiResponse.suggestedProject.nombre);
      setEditableProjectDescription(aiResponse.suggestedProject.descripcion);
    }
  }, [aiResponse]);

  // Actualizar departamento seleccionado cuando cambie la prop
  useEffect(() => {
    if (departamentoIdPredeterminado) {
      setSelectedDepartamento(departamentoIdPredeterminado);
      setValue("departamentoId", departamentoIdPredeterminado);
    }
  }, [departamentoIdPredeterminado, setValue]);

  // Handle AI Generation
  const handleGenerateWithAI = async () => {
    if (!aiDescription.trim()) {
      toast.error("Por favor, describe tu proyecto");
      return;
    }

    setAiStep("generating");
    setAiError(null);

    try {
      const response = await aiService.assistProject({
        description: aiDescription.trim(),
        departmentId: selectedDepartamento && selectedDepartamento !== "none" ? selectedDepartamento : undefined,
      });

      setAiResponse(response);
      setAiStep("result");
      toast.success("¡Estructura generada con IA!", {
        description: `Confianza: ${Math.round(response.confidence * 100)}%`
      });
    } catch (err: any) {
      console.error("Error generating AI project:", err);
      setAiError(err.response?.data?.message || err.message || "Error al generar con IA");
      setAiStep("input");
      toast.error("Error al generar con IA", {
        description: "Verifica que tienes permisos de IA o intenta de nuevo"
      });
    }
  };

  // Handle AI Project Creation - Creates project with stages and tasks
  const handleCreateAIProject = async () => {
    if (!aiResponse) return;

    const responsableId = selectedResponsable || user?.id;
    if (!responsableId) {
      toast.error("No se pudo determinar el responsable del proyecto");
      return;
    }

    try {
      // Step 1: Create the project
      const newProject = await createProjectMutation.mutateAsync({
        nombre: editableProjectName,
        descripcion: editableProjectDescription,
        responsableId: responsableId,
        departamentoId: selectedDepartamento && selectedDepartamento !== "none" ? selectedDepartamento : undefined,
        fechaInicio: new Date().toISOString(),
        fechaFin: aiResponse.suggestedProject.fechaFin,
        usaEtapas: true, // Enable stages for AI projects
      });

      toast.loading("Creando etapas y tareas...", { id: "ai-project-creation" });

      // Step 2: Create stages and their tasks
      const { projectService } = await import("@/services/projectService");
      const { taskService } = await import("@/services/taskService");

      for (let i = 0; i < aiResponse.stages.length; i++) {
        const stageData = aiResponse.stages[i];

        // Create stage
        const newStage = await projectService.createEtapa(newProject.id, {
          nombre: stageData.name,
          descripcion: `Etapa generada por IA: ${stageData.name}`,
          orden: i + 1,
        });

        // Create tasks for this stage
        for (const taskData of stageData.tasks) {
          await taskService.create({
            titulo: taskData.title,
            descripcion: taskData.description || `Tarea: ${taskData.title}`,
            proyectoId: newProject.id,
            etapaId: newStage.id,
            prioridad: taskData.priority === "high" ? "Alta" : taskData.priority === "low" ? "Baja" : "Media",
          });
        }
      }

      toast.success("¡Proyecto creado exitosamente con IA!", {
        id: "ai-project-creation",
        description: `${aiResponse.stages.length} etapas y ${aiResponse.stages.reduce((acc, s) => acc + s.tasks.length, 0)} tareas creadas`
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Error al crear proyecto con IA", {
        id: "ai-project-creation",
        description: error.message || "Intenta de nuevo"
      });
    }
  };

  // Handle Manual Submit
  const onSubmit = async (data: ProjectFormData) => {
    const responsableId = canAssignResponsable ? selectedResponsable : user?.id;
    if (!responsableId) {
      toast.error("No se pudo determinar el responsable del proyecto");
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        responsableId: responsableId,
        departamentoId: selectedDepartamento && selectedDepartamento !== "none" ? selectedDepartamento : undefined,
        fechaInicio: dateRange?.from?.toISOString(),
        fechaFin: dateRange?.to?.toISOString(),
      });

      reset();
      setSelectedDepartamento("");
      setSelectedResponsable(user?.id || "");
      setDateRange(undefined);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  // Calculate total duration from AI response
  const totalDays = aiResponse?.stages.reduce((acc, stage) => acc + stage.durationDays, 0) || 0;
  const totalWeeks = Math.ceil(totalDays / 7);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Find selected user for display
  const selectedUser = usuarios.find(u => u.id === selectedResponsable);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "ai" && aiStep !== "input" ? (
              <>
                <Bot className="h-5 w-5 text-primary" />
                Proyecto Asistido por IA
              </>
            ) : (
              "Crear Nuevo Proyecto"
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "manual"
              ? "Completa la información del proyecto o usa IA para generar la estructura."
              : aiStep === "result"
                ? "Revisa la propuesta generada por IA y crea el proyecto."
                : "Describe tu proyecto en lenguaje natural."}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Tabs - Only show when not in AI result mode */}
        {!(mode === "ai" && aiStep === "result") && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as CreationMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <Target className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2" disabled={!canUseAI}>
                <Sparkles className="h-4 w-4" />
                Asistido por IA
                {!canUseAI && <span className="text-xs">(sin permiso)</span>}
              </TabsTrigger>
            </TabsList>

            {/* Manual Creation Tab */}
            <TabsContent value="manual" className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre del Proyecto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Rediseño de la plataforma web"
                    {...register("nombre", {
                      required: "El nombre es requerido",
                      minLength: {
                        value: 3,
                        message: "El nombre debe tener al menos 3 caracteres",
                      },
                    })}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe el objetivo y alcance del proyecto..."
                    rows={3}
                    {...register("descripcion")}
                  />
                </div>

                {/* Responsable Selection */}
                <div className="space-y-2">
                  <Label htmlFor="responsableId">
                    <User className="inline h-4 w-4 mr-1" />
                    Responsable <span className="text-destructive">*</span>
                  </Label>

                  {canAssignResponsable ? (
                    <>
                      <Select value={selectedResponsable} onValueChange={setSelectedResponsable}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un responsable">
                            {selectedUser && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={selectedUser.avatarUrl || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(selectedUser.nombreCompleto)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{selectedUser.nombreCompleto}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={usuario.avatarUrl || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(usuario.nombreCompleto)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{usuario.nombreCompleto}</span>
                                {usuario.email && (
                                  <span className="text-xs text-muted-foreground">({usuario.email})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Tienes permiso para asignar cualquier usuario como responsable
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        id="responsableId"
                        value={user?.nombreCompleto || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Por defecto, tú serás el responsable del proyecto
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamentoId">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Departamento (Opcional)
                  </Label>
                  <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin departamento</SelectItem>
                      {departamentos?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.nombre}
                        </SelectItem>
                      )) || null}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechas">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fechas del Proyecto (Opcional)
                  </Label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={(range) => {
                      setDateRange(range);
                      setValue("fechaInicio", range?.from);
                      setValue("fechaFin", range?.to);
                    }}
                    placeholder="Selecciona inicio y fin"
                    minDate={new Date()}
                    numberOfMonths={2}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={createProjectMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Proyecto
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            {/* AI Creation Tab */}
            <TabsContent value="ai" className="mt-4">
              {aiStep === "input" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Describe tu proyecto</p>
                        <p className="text-xs text-muted-foreground">
                          La IA analizará proyectos similares, generará etapas, tareas y detectará riesgos potenciales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-description">¿Qué proyecto necesitas crear?</Label>
                    <Textarea
                      id="ai-description"
                      placeholder="Ej: Sistema de inventario para ferretería con control de stock, facturación electrónica y reportes. Plazo 3 meses..."
                      rows={4}
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Incluye objetivos, plazos y características importantes.
                    </p>
                  </div>

                  {/* Responsable Selection for AI */}
                  {canAssignResponsable && (
                    <div className="space-y-2">
                      <Label>
                        <User className="inline h-4 w-4 mr-1" />
                        Responsable
                      </Label>
                      <Select value={selectedResponsable} onValueChange={setSelectedResponsable}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un responsable">
                            {selectedUser && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={selectedUser.avatarUrl || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(selectedUser.nombreCompleto)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{selectedUser.nombreCompleto}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={usuario.avatarUrl || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(usuario.nombreCompleto)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{usuario.nombreCompleto}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Departamento (Opcional)
                    </Label>
                    <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin departamento</SelectItem>
                        {departamentos?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.nombre}
                          </SelectItem>
                        )) || null}
                      </SelectContent>
                    </Select>
                  </div>

                  {aiError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {aiError}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleGenerateWithAI}
                      disabled={!aiDescription.trim()}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generar con IA
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {aiStep === "generating" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <Loader2 className="h-20 w-20 absolute -top-2 -left-2 text-primary/30 animate-spin" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Generando estructura con IA...</h3>
                    <p className="text-muted-foreground text-sm">
                      Analizando proyectos similares y detectando riesgos
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* AI Result View */}
        {mode === "ai" && aiStep === "result" && aiResponse && (
          <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6" style={{ maxHeight: 'calc(70vh - 200px)' }}>
            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-3">
                <div className="flex items-start gap-3">
                  <Bot className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">Resumen Ejecutivo</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(aiResponse.confidence * 100)}% confianza
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiResponse.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Name - Editable */}
              <div className="space-y-1">
                <Label className="text-sm">Nombre del Proyecto <span className="text-destructive">*</span></Label>
                <Input
                  value={editableProjectName}
                  onChange={(e) => setEditableProjectName(e.target.value)}
                  placeholder="Nombre del proyecto"
                />
              </div>

              {/* Description - Editable */}
              <div className="space-y-1">
                <Label className="text-sm">Descripción</Label>
                <Textarea
                  value={editableProjectDescription}
                  onChange={(e) => setEditableProjectDescription(e.target.value)}
                  placeholder="Descripción del proyecto"
                  rows={2}
                />
              </div>

              {/* Timeline Info */}
              <div className="flex items-center gap-4 p-2.5 bg-muted/30 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{totalDays}</strong> días ({totalWeeks} semanas)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-muted-foreground">{aiResponse.suggestedProject.metodologia}</span>
              </div>

              {/* Stages */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Etapas ({aiResponse.stages.length})</span>
                </div>
                <div className="space-y-2">
                  {aiResponse.stages.map((stage, index) => (
                    <div key={index} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{stage.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{stage.durationDays} días</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                      {stage.tasks.length > 0 && (
                        <div className="ml-8 space-y-0.5">
                          {stage.tasks.slice(0, 3).map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-primary/60" />
                              <span>{task.title}</span>
                            </div>
                          ))}
                          {stage.tasks.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-4">+{stage.tasks.length - 3} más...</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              {aiResponse.risks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">Riesgos Detectados ({aiResponse.risks.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {aiResponse.risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Result Footer */}
        {mode === "ai" && aiStep === "result" && (
          <DialogFooter className="border-t pt-4 mt-2">
            <Button
              variant="ghost"
              onClick={() => setAiStep("input")}
              disabled={createProjectMutation.isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createProjectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAIProject}
              disabled={createProjectMutation.isPending || !editableProjectName.trim()}
              className="gap-2"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Crear Proyecto
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
