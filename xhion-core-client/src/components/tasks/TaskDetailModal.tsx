import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskComments } from "./TaskComments";
import { useTaskStore } from "@/store/taskStore";
import type { Tarea, TareaAdjunto, TareaActividad } from "@/services/taskService";
import { Loader2, Calendar, User, FolderKanban, Flag, Edit, Trash2, Paperclip, MessageSquare, Clock5, Check, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface TaskDetailModalProps {
  tareaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (tarea: Tarea) => void;
  onDelete?: (tareaId: string) => void;
}

const prioridadColors = {
  Baja: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Media: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Urgente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const estadoColors = {
  Por_Hacer: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  En_Progreso: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Hecho: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Bloqueado: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function TaskDetailModal({ tareaId, open, onOpenChange, onEdit, onDelete }: TaskDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    tareas,
    tareaActual,
    fetchTareaById,
    isLoading,
    setTareaActual,
    updateTarea,
    adjuntos: adjuntosState,
    actividad: actividadState,
    fetchAdjuntos,
    uploadAdjunto,
    deleteAdjunto,
    fetchActividad,
    responderActividad,
  } = useTaskStore();

  const [attachmentDescription, setAttachmentDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false);
  const [isLoadingActividad, setIsLoadingActividad] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const currentAdjuntos = useMemo<TareaAdjunto[]>(
    () => (tareaId ? adjuntosState[tareaId] || [] : []),
    [adjuntosState, tareaId],
  );
  const currentActividad = useMemo<TareaActividad[]>(
    () => (tareaId ? actividadState[tareaId] || [] : []),
    [actividadState, tareaId],
  );

  useEffect(() => {
    if (!tareaId || !open) return;

    const cachedTask = tareas.find((t) => t.id === tareaId);
    if (cachedTask) {
      setTareaActual(cachedTask);
    }
  }, [tareaId, open, tareas, setTareaActual]);

  useEffect(() => {
    if (tareaId && open) {
      fetchTareaById(tareaId);
      setIsLoadingAdjuntos(true);
      fetchAdjuntos(tareaId).finally(() => setIsLoadingAdjuntos(false));
      setIsLoadingActividad(true);
      fetchActividad(tareaId).finally(() => setIsLoadingActividad(false));
    }
  }, [tareaId, open, fetchTareaById, fetchAdjuntos, fetchActividad]);

  useEffect(() => {
    if (tareaActual) {
      setTitleDraft(tareaActual.titulo);
    }
  }, [tareaActual]);

  const handleEstadoChange = async (estado: "Por_Hacer" | "En_Progreso" | "Hecho" | "Bloqueado") => {
    if (!tareaId) return;
    try {
      await updateTarea(tareaId, { estado });
      toast({ title: "Estado actualizado" });
    } catch (error: any) {
      toast({ title: "No se pudo actualizar el estado", description: error.message, variant: "destructive" });
    }
  };

  const handleAttachmentUpload = async (file: File) => {
    if (!tareaId) return;
    setIsUploading(true);
    try {
      await uploadAdjunto(tareaId, file, attachmentDescription.trim() || undefined);
      toast({ title: "Adjunto agregado" });
      setAttachmentDescription("");
    } catch (error: any) {
      toast({ title: "No se pudo subir el adjunto", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleAttachmentUpload(file).finally(() => {
      event.target.value = "";
    });
  };

  const handleDeleteAdjunto = async (archivoId: string) => {
    if (!tareaId) return;
    try {
      await deleteAdjunto(tareaId, archivoId);
      toast({ title: "Adjunto eliminado" });
    } catch (error: any) {
      toast({ title: "No se pudo eliminar el adjunto", description: error.message, variant: "destructive" });
    }
  };

  const handleResponderActividad = async (actividadId: string) => {
    if (!tareaId) return;
    const mensaje = replyInputs[actividadId]?.trim();
    if (!mensaje) return;
    setReplying((prev) => ({ ...prev, [actividadId]: true }));
    try {
      await responderActividad(tareaId, actividadId, { descripcion: mensaje });
      setReplyInputs((prev) => ({ ...prev, [actividadId]: "" }));
      toast({ title: "Respuesta publicada" });
    } catch (error: any) {
      toast({ title: "No se pudo responder", description: error.message, variant: "destructive" });
    } finally {
      setReplying((prev) => ({ ...prev, [actividadId]: false }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!tareaId) return null;

  const handleFieldSave = async (field: string, value: string) => {
    if (!tareaId || !tareaActual) return;
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    const payload: Record<string, unknown> = {};

    switch (field) {
      case "titulo":
        if (!trimmedValue || trimmedValue === tareaActual.titulo) {
          setEditingField(null);
          return;
        }
        payload.titulo = trimmedValue;
        break;
      case "descripcion":
        if (trimmedValue === (tareaActual.descripcion || "")) {
          setEditingField(null);
          return;
        }
        payload.descripcion = trimmedValue;
        break;
      case "prioridad":
        if (trimmedValue === tareaActual.prioridad) {
          setEditingField(null);
          return;
        }
        payload.prioridad = trimmedValue;
        break;
      case "fechaVencimiento":
        if ((tareaActual.fechaVencimiento || "") === trimmedValue) {
          setEditingField(null);
          return;
        }
        payload.fechaVencimiento = trimmedValue ? new Date(trimmedValue).toISOString() : null;
        break;
      default:
        return;
    }

    try {
      setSavingField(field);
      await updateTarea(tareaId, payload);
      toast({ title: "Tarea actualizada" });
      if (field === "titulo") {
        setTitleDraft(trimmedValue as string);
      }
    } catch (error: any) {
      toast({ title: "No se pudo actualizar la tarea", description: error.message, variant: "destructive" });
    } finally {
      setSavingField(null);
      setEditingField(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-none bg-transparent p-0"
        style={{ width: "min(1400px, 96vw)", maxWidth: "96vw" }}
      >
        <div className="flex h-[85vh] flex-col overflow-hidden rounded-2xl border bg-background">
          <div className="border-b bg-muted/40 px-8 py-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="flex-1 space-y-1">
                {editingField === "titulo" ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="text-2xl"
                      autoFocus
                      disabled={savingField === "titulo"}
                      onBlur={() => handleFieldSave("titulo", titleDraft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFieldSave("titulo", titleDraft);
                        } else if (e.key === "Escape") {
                          setEditingField(null);
                          setTitleDraft(tareaActual?.titulo || "");
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleFieldSave("titulo", titleDraft)}
                      disabled={savingField === "titulo"}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingField(null);
                        setTitleDraft(tareaActual?.titulo || "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <DialogTitle
                    className="text-2xl font-semibold hover:text-primary cursor-pointer"
                    onClick={() => setEditingField("titulo")}
                  >
                    {tareaActual?.titulo || "Detalles de la Tarea"}
                  </DialogTitle>
                )}
                <DialogDescription>
                  Información completa de la tarea, incluyendo adjuntos, actividad y comentarios.
                </DialogDescription>
                {tareaActual && (
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{tareaActual.proyecto.nombre}</Badge>
                    {tareaActual.etapa && <Badge variant="outline">{tareaActual.etapa.nombre}</Badge>}
                    <span>Actualizada {tareaActual.fechaActualizacion ? formatDistanceToNow(new Date(tareaActual.fechaActualizacion), { addSuffix: true, locale: es }) : "recientemente"}</span>
                  </div>
                )}
              </div>
              {tareaActual && (onEdit || onDelete) && (
                <div className="flex flex-wrap justify-end gap-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(tareaActual)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(tareaActual.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {tareaActual && (
            <div className="shrink-0 border-b bg-background/90 px-8 py-5">
              <QuickActions
                tarea={tareaActual}
                onEstadoChange={handleEstadoChange}
                onAttachClick={() => fileInputRef.current?.click()}
                isUploading={isUploading}
                attachmentDescription={attachmentDescription}
                onAttachmentDescriptionChange={setAttachmentDescription}
              />
            </div>
          )}

          <div className="flex-1 overflow-hidden px-8 py-6">
            {isLoading && !tareaActual ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tareaActual ? (
              <div className="grid h-full gap-6 overflow-hidden xl:grid-cols-[2fr_1fr]">
                <div className="flex flex-col gap-4 overflow-y-auto pr-4">
                  <TaskSummaryCard
                    tarea={tareaActual}
                    getInitials={getInitials}
                    editingField={editingField}
                    onStartEditing={setEditingField}
                    onSaveField={handleFieldSave}
                    savingField={savingField}
                  />
                  <AttachmentsSection
                    adjuntos={currentAdjuntos}
                    isLoading={isLoadingAdjuntos}
                    onDelete={handleDeleteAdjunto}
                  />
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pl-4">
                  <section className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Comentarios</h3>
                    </div>
                    <TaskComments tareaId={tareaActual.id} comentarios={tareaActual.comentarios || []} />
                  </section>
                  <ActivityTimeline
                    actividad={currentActividad}
                    isLoading={isLoadingActividad}
                    replyInputs={replyInputs}
                    setReplyInputs={setReplyInputs}
                    replying={replying}
                    onReply={handleResponderActividad}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">No se pudo cargar la tarea</p>
              </div>
            )}
          </div>
        </div>
        
        <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
      </DialogContent>
    </Dialog>
  );
}

interface QuickActionsProps {
  tarea: Tarea;
  onEstadoChange: (estado: "Por_Hacer" | "En_Progreso" | "Hecho" | "Bloqueado") => void;
  onAttachClick: () => void;
  isUploading: boolean;
  attachmentDescription: string;
  onAttachmentDescriptionChange: (value: string) => void;
}

function QuickActions({
  tarea,
  onEstadoChange,
  onAttachClick,
  isUploading,
  attachmentDescription,
  onAttachmentDescriptionChange,
}: QuickActionsProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-[220px] flex-1">
          <p className="text-xs uppercase text-muted-foreground">Estado rápido</p>
          <div className="mt-2">
            <Select value={tarea.estado} onValueChange={(value) => onEstadoChange(value as any)}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(estadoColors).map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs uppercase text-muted-foreground">Descripción del adjunto (opcional)</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={attachmentDescription}
              onChange={(e) => onAttachmentDescriptionChange(e.target.value)}
              placeholder="Notas para el archivo"
            />
            <Button variant="outline" onClick={onAttachClick} disabled={isUploading} className="whitespace-nowrap">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adjuntar archivo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskSummaryCard({
  tarea,
  getInitials,
  editingField,
  onStartEditing,
  onSaveField,
  savingField,
}: {
  tarea: Tarea;
  getInitials: (name: string) => string;
  editingField: string | null;
  onStartEditing: (field: string | null) => void;
  onSaveField: (field: string, value: string) => void;
  savingField: string | null;
}) {
  const detalleItems = [
    {
      field: "proyecto",
      label: "Proyecto",
      icon: <FolderKanban className="h-5 w-5" />,
      content: tarea.proyecto.nombre,
    },
    tarea.etapa && {
      field: "etapa",
      label: "Etapa",
      icon: <FolderKanban className="h-5 w-5" />,
      content: tarea.etapa.nombre,
    },
    tarea.asignado && {
      field: "asignado",
      label: "Asignado a",
      icon: <User className="h-5 w-5" />,
      content: (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={tarea.asignado.avatarUrl} />
            <AvatarFallback className="text-xs">{getInitials(tarea.asignado.nombreCompleto)}</AvatarFallback>
          </Avatar>
          <span>{tarea.asignado.nombreCompleto}</span>
        </div>
      ),
    },
    {
      field: "prioridad",
      label: "Prioridad",
      icon: <Flag className="h-5 w-5" />,
      content: (
        <Badge className={prioridadColors[tarea.prioridad]}>{tarea.prioridad}</Badge>
      ),
      editable: true,
      type: "select",
      value: tarea.prioridad,
      options: [
        { label: "Baja", value: "Baja" },
        { label: "Media", value: "Media" },
        { label: "Alta", value: "Alta" },
        { label: "Urgente", value: "Urgente" },
      ],
    },
    {
      field: "fechaVencimiento",
      label: "Vencimiento",
      icon: <Calendar className="h-5 w-5" />,
      content: tarea.fechaVencimiento
        ? format(new Date(tarea.fechaVencimiento), "PPP", { locale: es })
        : "Sin definir",
      editable: true,
      type: "date",
      value: tarea.fechaVencimiento
        ? format(new Date(tarea.fechaVencimiento), "yyyy-MM-dd")
        : "",
    },
    {
      field: "creador",
      label: "Creado por",
      icon: <User className="h-5 w-5" />,
      content: (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={tarea.creador.avatarUrl} />
            <AvatarFallback className="text-xs">{getInitials(tarea.creador.nombreCompleto)}</AvatarFallback>
          </Avatar>
          <span>{tarea.creador.nombreCompleto}</span>
        </div>
      ),
    },
  ].filter(Boolean) as {
    field: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
    editable?: boolean;
    type?: "select" | "date";
    value?: string;
    options?: { label: string; value: string }[];
  }[];

  return (
    <div className="space-y-6 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={estadoColors[tarea.estado]}>{tarea.estado.replace("_", " ")}</Badge>
      </div>

      <EditableDescription
        descripcion={tarea.descripcion || ""}
        isEditing={editingField === "descripcion"}
        onStartEditing={() => onStartEditing("descripcion")}
        onSave={(value) => onSaveField("descripcion", value)}
        saving={savingField === "descripcion"}
      />

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {detalleItems.map((item) => (
          <EditableInfoRow
            key={item.field}
            field={item.field}
            label={item.label}
            icon={item.icon}
            content={item.content}
            editable={item.editable}
            type={item.type}
            value={item.value}
            options={item.options}
            editingField={editingField}
            onStartEditing={onStartEditing}
            onSaveField={onSaveField}
            savingField={savingField}
          />
        ))}
      </div>
    </div>
  );
}

function EditableDescription({
  descripcion,
  isEditing,
  onStartEditing,
  onSave,
  saving,
}: {
  descripcion: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onSave: (value: string) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(descripcion);

  useEffect(() => {
    if (isEditing) {
      setDraft(descripcion);
    }
  }, [isEditing, descripcion]);

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Descripción</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave(draft)} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onSave(descripcion)}>
              Cancelar
            </Button>
          </div>
        </div>
        <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Descripción</h3>
        <Button size="sm" variant="ghost" onClick={onStartEditing}>
          Editar
        </Button>
      </div>
      {descripcion ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{descripcion}</p>
      ) : (
        <Button variant="link" className="px-0" onClick={onStartEditing}>
          Agregar descripción
        </Button>
      )}
    </div>
  );
}

function EditableInfoRow({
  field,
  label,
  icon,
  content,
  editable,
  type,
  value,
  options,
  editingField,
  onStartEditing,
  onSaveField,
  savingField,
}: {
  field: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  editable?: boolean;
  type?: "select" | "date";
  value?: string;
  options?: { label: string; value: string }[];
  editingField: string | null;
  onStartEditing: (field: string | null) => void;
  onSaveField: (field: string, value: string) => void;
  savingField: string | null;
}) {
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    if (editingField === field && value !== undefined) {
      setDraft(value);
    }
  }, [editingField, field, value]);

  const isEditing = editingField === field;
  const isSaving = savingField === field;

  const renderEditor = () => {
    if (type === "select" && options) {
      return (
        <Select value={draft} onValueChange={setDraft}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === "date") {
      return <Input type="date" value={draft} onChange={(e) => setDraft(e.target.value)} />;
    }

    return <Input value={draft} onChange={(e) => setDraft(e.target.value)} />;
  };

  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="w-full space-y-1">
        <p className="text-sm font-medium flex items-center justify-between">
          <span>{label}</span>
          {editable && !isEditing && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onStartEditing(field)}>
              Editar
            </Button>
          )}
        </p>
        {editable ? (
          isEditing ? (
            <div className="space-y-2">
              {renderEditor()}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onSaveField(field, draft)} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onStartEditing(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => onStartEditing(field)}>
              <div className="text-sm text-muted-foreground">{content}</div>
            </div>
          )
        ) : (
          <div className="text-sm text-muted-foreground">{content}</div>
        )}
      </div>
    </div>
  );
}

function AttachmentsSection({
  adjuntos,
  isLoading,
  onDelete,
}: {
  adjuntos: TareaAdjunto[];
  isLoading: boolean;
  onDelete: (archivoId: string) => void;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Adjuntos</h3>
        <Badge variant="secondary" className="ml-auto">
          {adjuntos.length}
        </Badge>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando adjuntos...
        </div>
      ) : adjuntos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay archivos adjuntos.</p>
      ) : (
        <ul className="space-y-3">
          {adjuntos.map((adjunto) => (
            <li key={adjunto.archivoId} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{adjunto.archivo.nombreArchivo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(adjunto.archivo.fechaCreacion), { addSuffix: true, locale: es })}
                  {adjunto.descripcion ? ` · ${adjunto.descripcion}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={adjunto.archivo.urlArchivo} target="_blank" rel="noopener noreferrer">
                    Descargar
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onDelete(adjunto.archivoId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityTimeline({
  actividad,
  isLoading,
  replyInputs,
  setReplyInputs,
  replying,
  onReply,
}: {
  actividad: TareaActividad[];
  isLoading: boolean;
  replyInputs: Record<string, string>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  replying: Record<string, boolean>;
  onReply: (actividadId: string) => void;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock5 className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Actividad</h3>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando actividad...
        </div>
      ) : actividad.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay actividad registrada.</p>
      ) : (
        <ul className="space-y-4">
          {actividad.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1 bg-border" style={{ width: 1 }} />
              </div>
              <div className="flex-1 space-y-2 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.creadoPor.nombreCompleto}</span>
                  <span>{formatDistanceToNow(new Date(item.fechaCreacion), { addSuffix: true, locale: es })}</span>
                </div>
                <p className="text-sm font-medium">{activityLabel(item)}</p>
                {item.descripcion && <p className="text-sm text-muted-foreground">{item.descripcion}</p>}
                {item.archivo && (
                  <a
                    href={item.archivo.urlArchivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Ver archivo adjunto
                  </a>
                )}
                {item.respuestas && item.respuestas.length > 0 && (
                  <div className="space-y-2 rounded-md bg-muted/40 p-2">
                    {item.respuestas.map((respuesta) => (
                      <div key={respuesta.id} className="text-sm">
                        <span className="font-medium">{respuesta.creadoPor.nombreCompleto}:</span>{" "}
                        <span className="text-muted-foreground">{respuesta.descripcion}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Responder a este evento"
                    value={replyInputs[item.id] || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={replying[item.id] || !replyInputs[item.id]?.trim()}
                      onClick={() => onReply(item.id)}
                    >
                      {replying[item.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function activityLabel(item: TareaActividad) {
  switch (item.tipoEvento) {
    case "CREACION":
      return "Tarea creada";
    case "ACTUALIZACION":
      return "Tarea actualizada";
    case "COMENTARIO":
      return "Nuevo comentario";
    case "RESPUESTA_COMENTARIO":
      return "Respuesta agregada";
    case "ADJUNTO_AGREGADO":
      return "Adjunto agregado";
    case "ADJUNTO_ELIMINADO":
      return "Adjunto eliminado";
    case "CAMBIO_ESTADO":
      return "Estado actualizado";
    case "CAMBIO_ETAPA":
      return "Etapa cambiada";
    default:
      return item.tipoEvento;
  }
}
