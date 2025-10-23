"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  MoreVertical,
  UserPlus,
  UserMinus,
  Edit,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  avatarUrl?: string;
  puestoTrabajo?: {
    id?: string;
    titulo: string;
  };
  rol?: {
    nombre: string;
    color?: string;
  };
}

interface PuestoTrabajo {
  id: string;
  titulo: string;
  descripcion?: string;
  _count: {
    usuarios: number;
  };
}

interface DepartmentTeamViewProps {
  departamentoId: string;
  departamentoNombre: string;
  jefe?: Usuario;
  empleados?: Usuario[];
  puestosTrabajo?: PuestoTrabajo[];
  totalEmpleados: number;
}

export function DepartmentTeamView({
  departamentoId,
  departamentoNombre,
  jefe,
  empleados,
  puestosTrabajo,
  totalEmpleados,
}: DepartmentTeamViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPuesto, setFilterPuesto] = useState<string>("all");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredEmpleados = empleados?.filter((emp) => {
    const matchesSearch =
      emp.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPuesto =
      filterPuesto === "all" || emp.puestoTrabajo?.id === filterPuesto;
    return matchesSearch && matchesPuesto;
  });

  if (totalEmpleados === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No hay empleados asignados"
        description={`El departamento ${departamentoNombre} aún no tiene empleados. Asigna empleados para comenzar a formar el equipo.`}
        actionLabel="Asignar Empleados"
        onAction={() => {
          // TODO: Abrir modal de asignar empleados
          console.log("Asignar empleados a departamento:", departamentoId);
        }}
        secondaryActionLabel="Ver Todos los Empleados"
        onSecondaryAction={() => {
          // TODO: Navegar a vista de empleados
          console.log("Navegar a empleados");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Equipo</h2>
          <p className="text-sm text-muted-foreground">
            {totalEmpleados} empleado{totalEmpleados !== 1 ? "s" : ""} en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Asignar Empleado
          </Button>
        </div>
      </div>

      {/* Jefe del Departamento */}
      {jefe && (
        <Card className="border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={jefe.avatarUrl} alt={jefe.nombreCompleto} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(jefe.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{jefe.nombreCompleto}</h3>
                  <Badge className="bg-primary text-primary-foreground">Jefe de Departamento</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{jefe.email}</span>
                  </div>
                  {jefe.telefono && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{jefe.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Cambiar Jefe
            </Button>
          </div>
        </Card>
      )}

      {/* Puestos de Trabajo */}
      {puestosTrabajo && puestosTrabajo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Puestos de Trabajo</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {puestosTrabajo.map((puesto) => (
              <Card key={puesto.id} className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{puesto.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {puesto._count.usuarios} empleado{puesto._count.usuarios !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {puestosTrabajo && puestosTrabajo.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar por Puesto
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPuesto("all")}>
                Todos los puestos
              </DropdownMenuItem>
              {puestosTrabajo.map((puesto) => (
                <DropdownMenuItem key={puesto.id} onClick={() => setFilterPuesto(puesto.id)}>
                  {puesto.titulo}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Lista de Empleados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmpleados?.map((empleado) => (
          <Card key={empleado.id} className="border-border bg-card p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={empleado.avatarUrl} alt={empleado.nombreCompleto} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {getInitials(empleado.nombreCompleto)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {empleado.nombreCompleto}
                    </h4>
                    {empleado.puestoTrabajo && (
                      <p className="text-xs text-muted-foreground">{empleado.puestoTrabajo.titulo}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Cambiar Puesto
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remover del Departamento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Rol */}
              {empleado.rol && (
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: empleado.rol.color
                      ? `${empleado.rol.color}20`
                      : undefined,
                    borderColor: empleado.rol.color || undefined,
                    color: empleado.rol.color || undefined,
                  }}
                >
                  {empleado.rol.nombre}
                </Badge>
              )}

              {/* Contacto */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{empleado.email}</span>
                </div>
                {empleado.telefono && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{empleado.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEmpleados && filteredEmpleados.length === 0 && (
        <Card className="border-dashed border-2 border-border bg-muted/30 p-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No se encontraron empleados con los filtros aplicados</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setFilterPuesto("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
