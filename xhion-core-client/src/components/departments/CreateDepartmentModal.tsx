import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, Search, Wallet, FolderPlus, UploadCloud, X } from "lucide-react";
import { useDepartmentStore } from "@/store/departmentStore";
import type { Departamento } from "@/services/departmentService";
import { DEPARTMENT_ICONS } from "@/lib/department-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TipoDocumentoDepartamento } from "@/services/conocimientoService";
import { useFinanzasStore } from "@/store/finanzasStore";
import { useConocimientoStore } from "@/store/conocimientoStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import "@/styles/estilos_personalizados.css";

const departmentSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  descripcion: z.string().optional(),
  objetivos: z.string().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
  jefeId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface UsuarioLigero {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string | null;
}

interface DocumentDraft {
  id: string;
  tipo: TipoDocumentoDepartamento;
  titulo: string;
  contenido: string;
  file?: File | null;
}

interface CreateDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamento?: Departamento | null;
}

const PRESET_COLORS = [
  { name: "Azul Ejecutivo", value: "bg-blue-600" },
  { name: "Azul Profundo", value: "bg-indigo-700" },
  { name: "Cobalto", value: "bg-sky-700" },
  { name: "Turquesa", value: "bg-teal-600" },
  { name: "Verde Bosque", value: "bg-emerald-700" },
  { name: "Verde Lima", value: "bg-lime-600" },
  { name: "Ámbar", value: "bg-amber-600" },
  { name: "Naranja", value: "bg-orange-600" },
  { name: "Coral", value: "bg-rose-600" },
  { name: "Magenta", value: "bg-fuchsia-700" },
  { name: "Violeta", value: "bg-purple-700" },
  { name: "Grafito", value: "bg-neutral-700" },
  { name: "Pizarra", value: "bg-slate-800" },
  { name: "Carbón", value: "bg-gray-900" },
  { name: "Acero", value: "bg-zinc-700" },
  { name: "Cian", value: "bg-cyan-600" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Resumen", value: TipoDocumentoDepartamento.Resumen },
  { label: "Objetivos", value: TipoDocumentoDepartamento.Objetivos },
  { label: "Especificaciones", value: TipoDocumentoDepartamento.Especificaciones },
  { label: "Lecciones", value: TipoDocumentoDepartamento.LeccionesAprendidas },
  { label: "Documentación", value: TipoDocumentoDepartamento.Documentacion },
  { label: "Notas", value: TipoDocumentoDepartamento.Notas },
];

export function CreateDepartmentModal({
  open,
  onOpenChange,
  departamento,
}: CreateDepartmentModalProps) {
  const {
    createDepartamento,
    updateDepartamento,
    asignarUsuariosDepartamento,
    isLoading,
  } = useDepartmentStore();
  const { crearPresupuestoDepartamento } = useFinanzasStore();
  const { createContextoDepartamento, createDocumentoDepartamento } = useConocimientoStore();
  const [selectedColor, setSelectedColor] = useState(departamento?.color || "bg-blue-500");
  const [selectedIcon, setSelectedIcon] = useState(departamento?.icono || "Building2");
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(departamento?.jefeId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioLigero[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [searchUsuario, setSearchUsuario] = useState("");
  const [teamEnabled, setTeamEnabled] = useState(false);
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [contextEnabled, setContextEnabled] = useState(false);
  const [documentsEnabled, setDocumentsEnabled] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    montoTotal: "",
    periodo: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
  });
  const [contextForm, setContextForm] = useState({
    funciones: "",
    responsabilidades: "",
    procesosClave: "",
    objetivos: "",
    kpis: "",
  });
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([
    { id: crypto.randomUUID(), tipo: TipoDocumentoDepartamento.Resumen, titulo: "", contenido: "", file: null },
  ]);
  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      nombre: departamento?.nombre || "",
      descripcion: departamento?.descripcion || "",
      objetivos: departamento?.objetivos || "",
      icono: departamento?.icono || "Building2",
      color: departamento?.color || "bg-blue-500",
      jefeId: departamento?.jefeId || "",
    },
  });

  const watchedNombre = watch("nombre");
  const watchedDescripcion = watch("descripcion");

  useEffect(() => {
    if (departamento) {
      reset({
        nombre: departamento.nombre,
        descripcion: departamento.descripcion || "",
        objetivos: departamento.objetivos || "",
        icono: departamento.icono || "Building2",
        color: departamento.color || "bg-blue-500",
        jefeId: departamento.jefeId || "",
      });
      setSelectedColor(departamento.color || "bg-blue-500");
      setSelectedIcon(departamento.icono || "Building2");
    } else {
      reset({
        nombre: "",
        descripcion: "",
        objetivos: "",
        icono: "Building2",
        color: "bg-blue-500",
        jefeId: "",
      });
      setSelectedColor("bg-blue-500");
      setSelectedIcon("Building2");
    }
    setBudgetForm({ montoTotal: "", periodo: "", fechaInicio: "", fechaFin: "", descripcion: "" });
    setContextForm({ funciones: "", responsabilidades: "", procesosClave: "", objetivos: "", kpis: "" });
    setDocumentDrafts([{ id: crypto.randomUUID(), tipo: TipoDocumentoDepartamento.Resumen, titulo: "", contenido: "", file: null }]);
    setSelectedUsers({});
    setSelectedLeaderId(departamento?.jefeId || null);
    setValue("jefeId", departamento?.jefeId || "");
    setTeamEnabled(false);
    setBudgetEnabled(false);
    setContextEnabled(false);
    setDocumentsEnabled(false);
  }, [departamento, reset]);

  useEffect(() => {
    if (open) {
      loadUsuarios();
    }
  }, [open]);

  const loadUsuarios = async () => {
    try {
      setUsuariosLoading(true);
      const response = await userService.obtenerTodosLosUsuarios();
      setUsuarios(response);
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar los usuarios.");
    } finally {
      setUsuariosLoading(false);
    }
  };

  const filteredUsuarios = useMemo(() => {
    if (!searchUsuario.trim()) return usuarios;
    const term = searchUsuario.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.nombreCompleto.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
    );
  }, [usuarios, searchUsuario]);

  const selectedUserIds = useMemo(() => Object.keys(selectedUsers).filter((id) => selectedUsers[id]), [selectedUsers]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const isSelected = !prev[userId];
      const next = { ...prev, [userId]: isSelected };
      if (!isSelected && selectedLeaderId === userId) {
        setSelectedLeaderId(null);
        setValue("jefeId", "");
      }
      return next;
    });
  };

  const handleSelectLeader = (userId: string) => {
    setSelectedUsers((prev) => ({ ...prev, [userId]: true }));
    setSelectedLeaderId(userId);
    setValue("jefeId", userId);
  };

  const handleBudgetChange = (field: keyof typeof budgetForm, value: string) => {
    setBudgetForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContextChange = (field: keyof typeof contextForm, value: string) => {
    setContextForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentChange = (id: string, field: keyof Omit<DocumentDraft, "id" | "file">, value: string) => {
    setDocumentDrafts((prev) => prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc)));
  };

  const handleDocumentFileChange = (id: string, files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setDocumentDrafts((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
            ...doc,
            file,
            titulo: doc.titulo || file.name,
            contenido: doc.contenido || file.name,
          }
          : doc
      )
    );
  };

  const removeDocumentFile = (id: string) => {
    setDocumentDrafts((prev) => prev.map((doc) => (doc.id === id ? { ...doc, file: null } : doc)));
  };

  const handleDocumentDrop = (id: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingDocId(null);
    const files = event.dataTransfer.files;
    if (files?.length) {
      handleDocumentFileChange(id, files);
    }
  };

  const addDocumentDraft = () => {
    setDocumentDrafts((prev) => [...prev, { id: crypto.randomUUID(), tipo: TipoDocumentoDepartamento.Resumen, titulo: "", contenido: "", file: null }]);
  };

  const removeDocumentDraft = (id: string) => {
    setDocumentDrafts((prev) => (prev.length === 1 ? prev : prev.filter((doc) => doc.id !== id)));
  };

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        nombre: data.nombre,
        icono: selectedIcon,
        color: selectedColor,
      };

      if (data.descripcion?.trim()) {
        payload.descripcion = data.descripcion.trim();
      }

      if (data.objetivos?.trim()) {
        payload.objetivos = data.objetivos.trim();
      }

      if (data.jefeId?.trim()) {
        payload.jefeId = data.jefeId.trim();
      }

      let targetDepartment = departamento;

      if (departamento) {
        await updateDepartamento(departamento.id, payload);
      } else {
        targetDepartment = await createDepartamento(payload);
      }

      if (!targetDepartment) {
        throw new Error("No se pudo obtener el departamento creado");
      }

      const followUpPromises: Promise<unknown>[] = [];

      if (teamEnabled && selectedUserIds.length > 0) {
        followUpPromises.push(
          asignarUsuariosDepartamento(targetDepartment.id, selectedUserIds)
        );
      }

      if (
        budgetEnabled &&
        budgetForm.montoTotal &&
        budgetForm.periodo &&
        budgetForm.fechaInicio &&
        budgetForm.fechaFin
      ) {
        followUpPromises.push(
          crearPresupuestoDepartamento(targetDepartment.id, {
            montoTotal: Number(budgetForm.montoTotal),
            periodo: budgetForm.periodo,
            fechaInicio: new Date(budgetForm.fechaInicio).toISOString(),
            fechaFin: new Date(budgetForm.fechaFin).toISOString(),
            descripcion: budgetForm.descripcion,
          } as any)
        );
      }

      if (contextEnabled) {
        const hasContextData = Object.values(contextForm).some((value) => value.trim().length);
        if (hasContextData) {
          followUpPromises.push(
            createContextoDepartamento({
              departamentoId: targetDepartment.id,
              ...contextForm,
            })
          );
        }
      }

      if (documentsEnabled) {
        const validDocuments = documentDrafts.filter((doc) => doc.file || (doc.titulo.trim() && doc.contenido.trim()));
        if (validDocuments.length > 0) {
          const documentsPayload = await Promise.all(
            validDocuments.map(async (doc) => {
              let contenido = doc.contenido.trim();
              if (doc.file) {
                contenido = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(doc.file!);
                });
              }
              return {
                departamentoId: targetDepartment!.id,
                tipo: doc.tipo,
                titulo: doc.titulo.trim() || doc.file?.name || "Documento",
                contenido,
              };
            })
          );
          followUpPromises.push(
            Promise.all(documentsPayload.map((payload) => createDocumentoDepartamento(payload)))
          );
        }
      }

      if (followUpPromises.length > 0) {
        await Promise.allSettled(followUpPromises);
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto pr-2 gantt-scroll">
        <DialogHeader>
          <DialogTitle>
            {departamento ? "Editar Departamento" : "Nuevo Departamento"}
          </DialogTitle>
          <DialogDescription>
            {departamento
              ? "Actualiza la información del departamento"
              : "Crea un nuevo departamento e impulsa su operatividad desde el inicio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre">
                      Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Desarrollo de Producto"
                      {...register("nombre")}
                      disabled={isLoading || isSubmitting}
                    />
                    {errors.nombre && (
                      <p className="text-sm text-destructive">{errors.nombre.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      rows={3}
                      placeholder="Describe el alcance estratégico del departamento"
                      {...register("descripcion")}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objetivos">Objetivos</Label>
                    <Textarea
                      id="objetivos"
                      rows={3}
                      placeholder="Define metas trimestrales o anuales"
                      {...register("objetivos")}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Icono representativo
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {DEPARTMENT_ICONS.map((iconOption) => {
                        const IconComponent = iconOption.icon;
                        const isActive = selectedIcon === iconOption.name;
                        return (
                          <button
                            key={iconOption.name}
                            type="button"
                            className={`h-12 rounded-lg border text-sm transition hover:border-primary/40 hover:bg-muted ${isActive ? "border-primary bg-primary/10" : "border-border/70"
                              }`}
                            onClick={() => {
                              setSelectedIcon(iconOption.name);
                              setValue("icono", iconOption.name);
                            }}
                            disabled={isLoading || isSubmitting}
                            title={iconOption.label}
                          >
                            <IconComponent className={`mx-auto h-5 w-5 ${iconOption.color}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Color institucional
                    </Label>
                    <div className="grid grid-cols-4 gap-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`h-11 rounded-xl transition focus-visible:ring-2 focus-visible:ring-offset-2 ${color.value} ${selectedColor === color.value
                              ? "ring-2 ring-primary ring-offset-2"
                              : "hover:scale-105"
                            }`}
                          onClick={() => {
                            setSelectedColor(color.value);
                            setValue("color", color.value);
                          }}
                          disabled={isLoading || isSubmitting}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Vista previa ejecutiva
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl ${selectedColor} flex items-center justify-center text-white`}>
                      {(() => {
                        const iconMeta = DEPARTMENT_ICONS.find((icon) => icon.name === selectedIcon);
                        if (!iconMeta) return null;
                        const IconComponent = iconMeta.icon;
                        return <IconComponent className="h-6 w-6" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-foreground">
                        {watchedNombre || "Nombre del departamento"}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {watchedDescripcion || "Describe el propósito principal"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              {/* Equipo */}
              <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Equipo inicial</p>
                    <h4 className="text-sm font-semibold text-foreground">Selecciona talento clave</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{teamEnabled ? "Activo" : "Configurar"}</span>
                    <Switch checked={teamEnabled} onCheckedChange={setTeamEnabled} />
                  </div>
                </div>
                {teamEnabled ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/10 p-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> Disponibles: {usuarios.length}
                      </div>
                      <Badge variant="secondary" className="rounded-full px-2 text-[10px]">
                        Seleccionados: {selectedUserIds.length}
                      </Badge>
                      <Badge variant={selectedLeaderId ? "default" : "secondary"} className="rounded-full px-2 text-[10px]">
                        Líder: {selectedLeaderId ? usuarios.find((u) => u.id === selectedLeaderId)?.nombreCompleto || "Asignado" : "Sin definir"}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchUsuario}
                        onChange={(e) => setSearchUsuario(e.target.value)}
                        placeholder="Buscar por nombre o correo"
                        className="pl-10"
                        disabled={usuariosLoading}
                      />
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60">
                      {usuariosLoading ? (
                        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando usuarios...
                        </div>
                      ) : usuarios.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                          No hay usuarios disponibles
                        </div>
                      ) : (
                        <ScrollArea className="h-60 pr-1">
                          <div className="divide-y divide-border/40">
                            {filteredUsuarios.length === 0 && (
                              <p className="py-4 text-center text-sm text-muted-foreground">Sin coincidencias</p>
                            )}
                            {filteredUsuarios.map((usuario) => {
                              const isSelected = !!selectedUsers[usuario.id];
                              return (
                                <div key={usuario.id} className="flex items-center gap-3 px-4 py-3">
                                  <Checkbox checked={isSelected} onCheckedChange={() => handleToggleUser(usuario.id)} />
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={usuario.avatarUrl ?? undefined} />
                                    <AvatarFallback className="text-[11px]">
                                      {usuario.nombreCompleto
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{usuario.nombreCompleto}</p>
                                    <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${selectedLeaderId === usuario.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/60 text-muted-foreground hover:text-foreground"
                                      }`}
                                    onClick={() => handleSelectLeader(usuario.id)}
                                  >
                                    {selectedLeaderId === usuario.id ? "Líder" : "Definir líder"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Activa este módulo para asignar colaboradores y definir al líder del departamento.
                  </p>
                )}
              </section>

              {/* Presupuesto */}
              <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Presupuesto inicial</p>
                    <h4 className="text-sm font-semibold text-foreground">Define recursos financieros</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{budgetEnabled ? "Activo" : "Configurar"}</span>
                    <Switch checked={budgetEnabled} onCheckedChange={setBudgetEnabled} />
                  </div>
                </div>
                {budgetEnabled ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                        <Wallet className="h-3.5 w-3.5" /> Monto (S/.)
                      </Label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={budgetForm.montoTotal}
                        onChange={(e) => handleBudgetChange("montoTotal", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide">Periodo</Label>
                      <Input
                        placeholder="2025-Q1"
                        value={budgetForm.periodo}
                        onChange={(e) => handleBudgetChange("periodo", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide">Inicio</Label>
                      <Input
                        type="date"
                        value={budgetForm.fechaInicio}
                        onChange={(e) => handleBudgetChange("fechaInicio", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide">Fin</Label>
                      <Input
                        type="date"
                        value={budgetForm.fechaFin}
                        onChange={(e) => handleBudgetChange("fechaFin", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide">Notas</Label>
                      <Textarea
                        rows={2}
                        placeholder="Detalle de supuestos o restricciones"
                        value={budgetForm.descripcion}
                        onChange={(e) => handleBudgetChange("descripcion", e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Activa para definir presupuesto desde esta vista.</p>
                )}
              </section>

              {/* Contexto */}
              <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Base de conocimiento</p>
                    <h4 className="text-sm font-semibold text-foreground">Contextualiza funciones</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{contextEnabled ? "Activo" : "Configurar"}</span>
                    <Switch checked={contextEnabled} onCheckedChange={setContextEnabled} />
                  </div>
                </div>
                {contextEnabled ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {(
                      [
                        { key: "funciones", label: "Funciones" },
                        { key: "responsabilidades", label: "Responsabilidades" },
                        { key: "procesosClave", label: "Procesos Clave" },
                        { key: "objetivos", label: "Objetivos" },
                        { key: "kpis", label: "KPIs" },
                      ] as const
                    ).map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[11px] font-semibold uppercase tracking-wide">{label}</Label>
                        <Textarea
                          rows={2}
                          value={contextForm[key]}
                          onChange={(e) => handleContextChange(key, e.target.value)}
                          placeholder={`Define ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Activa para documentar el contexto operativo y habilitar IA contextual.</p>
                )}
              </section>

              {/* Documentos */}
              <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Documentos clave</p>
                    <h4 className="text-sm font-semibold text-foreground">Adjunta entregables críticos</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{documentsEnabled ? "Activo" : "Configurar"}</span>
                    <Switch checked={documentsEnabled} onCheckedChange={setDocumentsEnabled} />
                  </div>
                </div>
                {documentsEnabled ? (
                  <div className="mt-3 space-y-3">
                    {documentDrafts.map((doc, index) => (
                      <div key={doc.id} className="rounded-xl border border-dashed border-border/60 p-3 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Documento #{index + 1}</span>
                          {documentDrafts.length > 1 && (
                            <button
                              type="button"
                              className="text-destructive underline-offset-2 hover:underline"
                              onClick={() => removeDocumentDraft(doc.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <Select
                            value={doc.tipo}
                            onValueChange={(value) => handleDocumentChange(doc.id, "tipo", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Título"
                            value={doc.titulo}
                            onChange={(e) => handleDocumentChange(doc.id, "titulo", e.target.value)}
                          />
                        </div>
                        <div
                          className={`rounded-xl border border-dashed border-border/70 bg-background/50 p-4 text-center text-sm transition ${draggingDocId === doc.id ? "border-primary bg-primary/5" : ""
                            }`}
                          onDragOver={(event) => event.preventDefault()}
                          onDragEnter={() => setDraggingDocId(doc.id)}
                          onDragLeave={() => setDraggingDocId(null)}
                          onDrop={(event) => handleDocumentDrop(doc.id, event)}
                        >
                          <input
                            id={`file-${doc.id}`}
                            type="file"
                            className="hidden"
                            onChange={(event) => handleDocumentFileChange(doc.id, event.target.files)}
                          />
                          <label htmlFor={`file-${doc.id}`} className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground">
                            <UploadCloud className="h-6 w-6" />
                            <span className="text-xs uppercase tracking-wide">
                              Arrastra tu archivo o haz clic para seleccionarlo
                            </span>
                          </label>
                          {doc.file ? (
                            <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-left text-xs text-foreground">
                              <div className="flex flex-col">
                                <span className="font-medium">{doc.file.name}</span>
                                <span className="text-[11px] text-muted-foreground">{(doc.file.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <button type="button" onClick={() => removeDocumentFile(doc.id)} className="text-destructive">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">Formatos admitidos: PDF, DOCX, PPT, imágenes.</p>
                          )}
                        </div>
                        <Textarea
                          rows={2}
                          placeholder="Notas o descripción opcional"
                          value={doc.contenido}
                          onChange={(e) => handleDocumentChange(doc.id, "contenido", e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full border border-dashed border-border/70"
                      onClick={addDocumentDraft}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" /> Añadir documento
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Activa para adjuntar documentación estratégica con drag & drop.</p>
                )}
              </section>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {departamento ? "Actualizar" : "Crear"} Departamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
