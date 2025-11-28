import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, RefreshCw, Filter, Calendar as CalendarIcon } from "lucide-react"
import { AuditTable } from "./audit-table"
import { AuditDetail } from "./audit-detail"
import { AuditStats } from "./audit-stats"
import { auditService, type AuditLog, type AuditStatsData, type ActiveUser } from "@/services/auditService"
import { toast } from "sonner"
import { userService } from "@/services/userService"
import { type Usuario } from "@/types"
import { UserDetailsModal } from "../users/user-details-modal"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ActiveUsersModal } from "./active-users-modal"

import { type DateRange } from "react-day-picker"



export function AuditView() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUser, setFilterUser] = useState("all")
  const [filterEvent, setFilterEvent] = useState("all")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [users, setUsers] = useState<Usuario[]>([])

  // Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  // Stats State
  const [stats, setStats] = useState<AuditStatsData | undefined>(undefined)

  // User Details Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

  // Active Users Modal State
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])

  // Date Filter State
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await auditService.getAll({
        page,
        limit,
        accion: filterEvent !== "all" ? filterEvent : undefined,
        usuarioId: filterUser !== "all" ? filterUser : undefined,
        search: searchQuery || undefined,
        fechaDesde: dateRange?.from ? dateRange.from.toISOString() : undefined,
        fechaHasta: dateRange?.to ? dateRange.to.toISOString() : undefined,
      })
      setLogs(response.data)
      setTotal(response.total)
    } catch (error: any) {
      // Ignore 401 errors as they are handled by the auth interceptor
      if (error?.response?.status === 401) return;
      console.error("Error fetching audit logs:", error)
      toast.error("Error al cargar registros de auditoría")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await auditService.getStats()
      setStats(data)
    } catch (error: any) {
      if (error?.response?.status === 401) return;
      console.error("Error fetching stats:", error)
    }
  }

  const fetchActiveUsers = async () => {
    try {
      const data = await auditService.getActiveUsers()
      setActiveUsers(data)
    } catch (error: any) {
      if (error?.response?.status === 401) return;
      console.error("Error fetching active users:", error)
      toast.error("Error al cargar usuarios activos")
    }
  }

  useEffect(() => {
    setPage(1) // Reset to page 1 when filters change
  }, [filterUser, filterEvent, searchQuery, dateRange])

  useEffect(() => {
    fetchLogs()
  }, [page, filterUser, filterEvent, searchQuery, dateRange])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData] = await Promise.all([
          userService.obtenerTodosLosUsuarios(),
          fetchStats()
        ])
        setUsers(usersData)
      } catch (error: any) {
        if (error?.response?.status === 401) return;
        console.error("Error loading initial data:", error)
      }
    }
    loadData()
  }, [])

  const handleExport = async () => {
    try {
      await auditService.exportCsv({
        accion: filterEvent !== "all" ? filterEvent : undefined,
        usuarioId: filterUser !== "all" ? filterUser : undefined,
        search: searchQuery || undefined,
        fechaDesde: dateRange?.from ? dateRange.from.toISOString() : undefined,
        fechaHasta: dateRange?.to ? dateRange.to.toISOString() : undefined,
      })
      toast.success("Exportación iniciada")
    } catch (error: any) {
      if (error?.response?.status === 401) return;
      toast.error("Error al exportar CSV")
    }
  }

  const handleLogClick = (id: string) => {
    const log = logs.find(l => l.id === id)
    if (log) setSelectedLog(log)
  }

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId)
    setIsUserModalOpen(true)
  }

  const handleActiveUsersClick = () => {
    fetchActiveUsers()
    setIsActiveUsersModalOpen(true)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Seguridad y Auditoría</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitoreo y control de actividad del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { fetchLogs(); fetchStats(); }} className="hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mt-6 flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, IP, Acción, Usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full lg:w-[200px] bg-background/50">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Usuario" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.nombreCompleto}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-full lg:w-[200px] bg-background/50">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                <SelectItem value="create">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Creación</span>
                  </div>
                </SelectItem>
                <SelectItem value="update">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Edición</span>
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Eliminación</span>
                  </div>
                </SelectItem>
                <SelectItem value="login">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>Login</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted transition-colors px-3 py-1 border-dashed"
            onClick={() => { setSearchQuery(""); setFilterEvent("all"); setFilterUser("all"); setDateRange(undefined); }}
          >
            Limpiar filtros
          </Badge>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200"
            onClick={() => setFilterEvent("delete")}
          >
            Eliminaciones
          </Badge>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200"
            onClick={() => setFilterEvent("login")}
          >
            Logins
          </Badge>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200"
            onClick={() => setFilterEvent("update")}
          >
            Modificaciones
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <AuditStats stats={stats} onActiveUsersClick={handleActiveUsersClick} />

        {/* Audit table */}
        <AuditTable
          logs={logs}
          isLoading={isLoading}
          onSelectLog={handleLogClick}
          onUserClick={handleUserClick}
        />

      </div>

      {/* Footer Area with Date Filter and Pagination */}
      <div className="border-t border-border p-4 bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Filtrar por fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {dateRange && (
            <Button variant="ghost" size="icon" onClick={() => setDateRange(undefined)}>
              <RefreshCw className="h-4 w-4 rotate-45" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l border-border">
          <SheetHeader className="mb-6">
            <SheetTitle>Detalle del Evento</SheetTitle>
            <SheetDescription>
              Información completa y técnica del registro de auditoría.
            </SheetDescription>
          </SheetHeader>
          {selectedLog && <AuditDetail log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </SheetContent>
      </Sheet>

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          open={isUserModalOpen}
          onOpenChange={setIsUserModalOpen}
        />
      )}

      {/* Active Users Modal */}
      <ActiveUsersModal
        users={activeUsers}
        open={isActiveUsersModalOpen}
        onOpenChange={setIsActiveUsersModalOpen}
      />
    </div>
  )
}
