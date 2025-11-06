import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  Crown,
  User,
  Eye,
  Plus,
  Mail,
  UserMinus,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Miembro {
  usuarioId: string
  usuario: {
    id: string
    nombre: string
    email: string
    avatar?: string
  }
  rol: "responsable" | "miembro" | "observador"
}

interface ProjectTeamWidgetProps {
  miembros: Miembro[]
  isPreview?: boolean
  onExpand?: () => void
  onAddMiembro?: () => void
  onRemoveMiembro?: (usuarioId: string) => void
}

export function ProjectTeamWidget({
  miembros,
  isPreview = false,
  onExpand,
  onAddMiembro,
  onRemoveMiembro,
}: ProjectTeamWidgetProps) {
  const [showFullView, setShowFullView] = useState(false)

  const handleExpand = () => {
    if (isPreview && onExpand) {
      onExpand()
    } else {
      setShowFullView(true)
    }
  }

  // Organizar miembros por rol
  const responsables = miembros.filter((m) => m.rol === "responsable")
  const miembrosRegulares = miembros.filter((m) => m.rol === "miembro")
  const observadores = miembros.filter((m) => m.rol === "observador")

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case "responsable":
        return "Responsable"
      case "miembro":
        return "Miembro"
      case "observador":
        return "Observador"
      default:
        return rol
    }
  }

  const getRolBadgeVariant = (rol: string): "default" | "secondary" | "outline" => {
    switch (rol) {
      case "responsable":
        return "default"
      case "miembro":
        return "secondary"
      case "observador":
        return "outline"
      default:
        return "outline"
    }
  }

  const renderMiembroCard = (miembro: Miembro, showActions: boolean = true) => (
    <div
      key={miembro.usuarioId}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        miembro.rol === "responsable" && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
        miembro.rol === "miembro" && "bg-card hover:bg-accent/50",
        miembro.rol === "observador" && "bg-muted/30"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={miembro.usuario.avatar} alt={miembro.usuario.nombre} />
        <AvatarFallback className="text-xs">
          {getInitials(miembro.usuario.nombre)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-semibold text-sm line-clamp-1">{miembro.usuario.nombre}</h4>
          {miembro.rol === "responsable" && (
            <Crown className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground line-clamp-1">
            {miembro.usuario.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getRolBadgeVariant(miembro.rol)} className="text-[10px] px-2 h-5">
          {getRolLabel(miembro.rol)}
        </Badge>

        {showActions && onRemoveMiembro && miembro.rol !== "responsable" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onRemoveMiembro(miembro.usuarioId)}
          >
            <UserMinus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center gap-1.5 mb-1">
            <Crown className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-[10px] text-muted-foreground">Responsables</span>
          </div>
          <span className="text-xl font-bold">{responsables.length}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[10px] text-muted-foreground">Miembros</span>
          </div>
          <span className="text-xl font-bold">{miembrosRegulares.length}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-[10px] text-muted-foreground">Observadores</span>
          </div>
          <span className="text-xl font-bold">{observadores.length}</span>
        </div>
      </div>

      {/* Lista de Miembros por Rol */}
      <div className="space-y-4">
        {miembros.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay miembros en el equipo</p>
            {!isPreview && onAddMiembro && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMiembro}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Miembro
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Responsables */}
            {responsables.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <h3 className="text-sm font-semibold">Responsables</h3>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-4">
                    {responsables.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {(isPreview ? responsables.slice(0, 2) : responsables).map((miembro) =>
                    renderMiembroCard(miembro, !isPreview)
                  )}
                </div>
              </div>
            )}

            {/* Miembros */}
            {miembrosRegulares.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold">Miembros</h3>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-4">
                    {miembrosRegulares.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {(isPreview ? miembrosRegulares.slice(0, 2) : miembrosRegulares).map((miembro) =>
                    renderMiembroCard(miembro, !isPreview)
                  )}
                </div>
              </div>
            )}

            {/* Observadores */}
            {observadores.length > 0 && !isPreview && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold">Observadores</h3>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-4">
                    {observadores.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {observadores.map((miembro) => renderMiembroCard(miembro, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ver más en vista previa */}
      {isPreview && miembros.length > 4 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleExpand}
        >
          Ver todo el equipo ({miembros.length})
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Botón agregar en vista completa */}
      {!isPreview && onAddMiembro && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onAddMiembro}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      )}
    </div>
  )

  if (isPreview) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExpand}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Equipo del Proyecto
            <Badge variant="secondary" className="ml-auto">
              {miembros.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {renderContent()}
      
      {/* Dialog para vista completa cuando no es preview */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Equipo del Proyecto
            </DialogTitle>
            <DialogDescription>
              Miembros organizados por rol: Responsables, Miembros y Observadores
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {renderContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
