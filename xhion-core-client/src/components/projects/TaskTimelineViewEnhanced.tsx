import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";

interface TaskTimelineViewEnhancedProps {
  tareas: Tarea[];
  etapas: Etapa[];
  onTaskClick?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

const prioridadColors = {
  Baja: { bg: "bg-gray-500", text: "text-gray-700", border: "border-gray-500", hover: "hover:bg-gray-600" },
  Media: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-500", hover: "hover:bg-blue-600" },
  Alta: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-500", hover: "hover:bg-orange-600" },
  Urgente: { bg: "bg-red-500", text: "text-red-700", border: "border-red-500", hover: "hover:bg-red-600" },
};

const estadoProgress = {
  Por_Hacer: 0,
  En_Progreso: 50,
  Hecho: 100,
  Bloqueado: 25,
};

export function TaskTimelineViewEnhanced({ tareas, etapas, onTaskClick, onEditTask, onDeleteTask }: TaskTimelineViewEnhancedProps) {
  // ===== ALL HOOKS MUST BE AT THE TOP (Rules of Hooks) =====
  
  // Zoom levels: pixels per day
  const zoomLevels = [8, 12, 16, 24, 32, 48, 64, 80];
  const [zoomIndex, setZoomIndex] = useState(4); // Start at 32px per day
  const pixelsPerDay = zoomLevels[zoomIndex];
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  
  // Infinite timeline state
  const [timelineStart, setTimelineStart] = useState<Date | null>(null);
  const [timelineEnd, setTimelineEnd] = useState<Date | null>(null);
  const DAYS_TO_LOAD = 90; // Load 90 days at a time

  // Calculate timeline range with infinite scroll support
  const allDates = [
    ...tareas.map((t) => t.fechaVencimiento).filter(Boolean),
    ...etapas.flatMap((e) => [e.fechaInicio, e.fechaFin]).filter(Boolean),
  ].map((d) => new Date(d!));

  // Extend timeline when scrolling near edges
  const handleScroll = useCallback((e: Event) => {
    const container = e.target as HTMLElement;
    if (!container) return;

    const scrollPosition = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Load more days when scrolling near the end (within 20% of edge)
    if (scrollPosition + clientWidth > scrollWidth * 0.8) {
      setTimelineEnd((prev) => {
        if (!prev) return prev;
        const newEnd = new Date(prev);
        newEnd.setDate(newEnd.getDate() + DAYS_TO_LOAD);
        return newEnd;
      });
    }

    // Load more days when scrolling near the start
    if (scrollPosition < scrollWidth * 0.2) {
      setTimelineStart((prev) => {
        if (!prev) return prev;
        const newStart = new Date(prev);
        newStart.setDate(newStart.getDate() - DAYS_TO_LOAD);
        return newStart;
      });
    }

    setScrollLeft(scrollPosition);
  }, [DAYS_TO_LOAD]);

  // Initialize timeline range
  useEffect(() => {
    if (allDates.length > 0 && !timelineStart) {
      const minTaskDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
      const maxTaskDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
      
      // Start 30 days before earliest task
      const start = new Date(minTaskDate);
      start.setDate(start.getDate() - 30);
      
      // End 60 days after latest task
      const end = new Date(maxTaskDate);
      end.setDate(end.getDate() + 60);
      
      setTimelineStart(start);
      setTimelineEnd(end);
    }
  }, [allDates.length, timelineStart]);

  // Handle scroll sync with infinite loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ===== END OF HOOKS =====

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Early returns AFTER all hooks
  if (allDates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3 p-8">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">No hay fechas definidas</p>
          <p className="text-sm text-muted-foreground">
            Agrega fechas de vencimiento a las tareas para visualizar el diagrama de Gantt
          </p>
        </div>
      </div>
    );
  }

  if (!timelineStart || !timelineEnd) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3 p-8">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="text-sm text-muted-foreground">Cargando timeline...</p>
        </div>
      </div>
    );
  }

  const minDate = new Date(timelineStart);
  const maxDate = new Date(timelineEnd);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const timelineWidth = totalDays * pixelsPerDay;

  // Generate months for header
  const months: { name: string; days: number; startDay: number }[] = [];
  let currentDate = new Date(minDate);
  let dayCounter = 0;

  while (currentDate <= maxDate) {
    const monthStart = new Date(currentDate);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const endDate = monthEnd > maxDate ? maxDate : monthEnd;
    
    const daysInMonth = Math.ceil((endDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    months.push({
      name: currentDate.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      days: daysInMonth,
      startDay: dayCounter,
    });

    dayCounter += daysInMonth;
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  const getTaskPosition = (tarea: Tarea) => {
    if (!tarea.fechaVencimiento) return null;

    const dueDate = new Date(tarea.fechaVencimiento);
    const startDate = tarea.fechaCreacion 
      ? new Date(tarea.fechaCreacion) 
      : new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    const daysSinceStart = Math.ceil((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(
      Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      1
    );

    return {
      left: daysSinceStart * pixelsPerDay,
      width: duration * pixelsPerDay,
      startDate,
      dueDate,
      duration,
    };
  };


  const handleZoomIn = () => setZoomIndex(Math.min(zoomIndex + 1, zoomLevels.length - 1));
  const handleZoomOut = () => setZoomIndex(Math.max(zoomIndex - 1, 0));
  
  const handleZoomFit = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const idealPixelsPerDay = Math.floor(containerWidth / totalDays);
      const closestIndex = zoomLevels.reduce((prev, curr, idx) => 
        Math.abs(curr - idealPixelsPerDay) < Math.abs(zoomLevels[prev] - idealPixelsPerDay) ? idx : prev
      , 0);
      setZoomIndex(closestIndex);
    }
  };

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const today = new Date();
      const daysSinceStart = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const scrollPosition = (daysSinceStart * pixelsPerDay) - (scrollContainerRef.current.clientWidth / 2);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (fullscreenRef.current?.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };


  // Navigate timeline
  const navigateTimeline = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.7;
      const newPosition = scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, newPosition), behavior: 'smooth' });
    }
  };


  // Get today position
  const getTodayPosition = () => {
    const today = new Date();
    const daysSinceStart = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceStart >= 0 && daysSinceStart <= totalDays) {
      return daysSinceStart * pixelsPerDay;
    }
    return null;
  };

  const todayPosition = getTodayPosition();

  // Group tasks by etapa
  const groupedTareas = etapas.map((etapa) => ({
    etapa,
    tareas: tareas.filter((t) => t.etapaId === etapa.id),
  }));

  // Add tasks without etapa
  const tareasWithoutEtapa = tareas.filter((t) => !t.etapaId);
  if (tareasWithoutEtapa.length > 0) {
    groupedTareas.push({
      etapa: { id: "none", nombre: "Sin etapa", color: "#6B7280" } as any,
      tareas: tareasWithoutEtapa,
    });
  }

  return (
    <TooltipProvider>
      <div 
        ref={fullscreenRef}
        className={cn(
          "flex-1 overflow-hidden flex flex-col h-full transition-all",
          isFullscreen ? "fixed inset-0 z-50 bg-background" : "bg-background"
        )}
      >
        {/* Toolbar */}
        <div className="border-b bg-card p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Diagrama de Gantt</span>
            <Badge variant="secondary" className="ml-2">
              {tareas.length} tareas
            </Badge>
            <Badge variant="outline" className="ml-1">
              {totalDays} días
            </Badge>
            {isFullscreen && (
              <Badge variant="default" className="ml-2 animate-pulse">
                Pantalla Completa
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation buttons */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateTimeline('left')}
              title="Navegar a la izquierda"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollToToday}
              title="Ir a hoy"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Hoy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateTimeline('right')}
              title="Navegar a la derecha"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* Zoom controls */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={zoomIndex === 0}
              title="Alejar zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[70px] text-center font-mono">
              {pixelsPerDay}px/día
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoomIndex === zoomLevels.length - 1}
              title="Acercar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* Fullscreen toggle */}
            <Button 
              variant={isFullscreen ? "default" : "outline"}
              size="sm" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Salir
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="border-b bg-card shrink-0 sticky top-0 z-20">
          <div className="flex">
            <div className="w-80 shrink-0 border-r p-3 font-semibold bg-card flex items-center">
              Tareas
            </div>
            <div className="flex-1 overflow-hidden">
              <div style={{ width: timelineWidth, minWidth: '100%', marginLeft: -scrollLeft }}>
                {/* Months */}
                <div className="flex border-b h-10">
                  {months.map((month, idx) => (
                    <div
                      key={idx}
                      className="border-r px-2 py-2 text-center font-medium text-sm bg-card flex items-center justify-center"
                      style={{ width: month.days * pixelsPerDay }}
                    >
                      {month.name}
                    </div>
                  ))}
                </div>
                {/* Days */}
                <div className="flex h-8 text-xs text-muted-foreground relative bg-muted/20">
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const date = new Date(minDate);
                    date.setDate(date.getDate() + idx);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const showDay = pixelsPerDay >= 24 || (idx % 7 === 0);
                    
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "border-r flex items-center justify-center shrink-0 transition-colors",
                          isWeekend && "bg-muted/50"
                        )}
                        style={{ width: pixelsPerDay }}
                      >
                        {showDay && <span className="font-medium">{date.getDate()}</span>}
                      </div>
                    );
                  })}
                  {/* Today marker in header */}
                  {todayPosition !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30 shadow-sm"
                      style={{ left: todayPosition }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Body */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="min-h-full">
            {groupedTareas.map(({ etapa, tareas: etapaTareas }) => (
              <div key={etapa.id} className="border-b">
                {/* Etapa Header */}
                <div className="flex bg-muted/40 sticky top-0 z-10">
                  <div className="w-80 shrink-0 border-r p-3 bg-muted/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: etapa.color || '#6B7280' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{etapa.nombre}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {etapaTareas.length} {etapaTareas.length === 1 ? 'tarea' : 'tareas'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div 
                      className="relative h-full"
                      style={{ 
                        width: timelineWidth,
                        marginLeft: -scrollLeft 
                      }}
                    >
                      {/* Weekend columns */}
                      {Array.from({ length: totalDays }).map((_, idx) => {
                        const date = new Date(minDate);
                        date.setDate(date.getDate() + idx);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        
                        if (!isWeekend) return null;
                        
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 bg-muted/30 pointer-events-none"
                            style={{ 
                              left: idx * pixelsPerDay,
                              width: pixelsPerDay 
                            }}
                          />
                        );
                      })}
                      {/* Today marker */}
                      {todayPosition !== null && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none opacity-50"
                          style={{ left: todayPosition }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                {etapaTareas.map((tarea) => {
                  const position = getTaskPosition(tarea);

                  return (
                    <div 
                      key={tarea.id} 
                      className="flex border-b hover:bg-muted/30 transition-colors group"
                    >
                      <div 
                        className="w-80 shrink-0 border-r p-3 cursor-pointer"
                        onClick={() => onTaskClick?.(tarea.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-1 h-12 rounded-full shrink-0",
                              prioridadColors[tarea.prioridad].bg
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {tarea.titulo}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {tarea.asignado && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-5 w-5 cursor-pointer">
                                      <AvatarImage src={tarea.asignado.avatarUrl} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(tarea.asignado.nombreCompleto)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {tarea.asignado.nombreCompleto}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Badge
                                variant="outline"
                                className={cn("text-xs", prioridadColors[tarea.prioridad].text)}
                              >
                                {tarea.prioridad}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {tarea.estado.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div 
                          className="relative h-full py-3"
                          style={{ 
                            width: timelineWidth,
                            marginLeft: -scrollLeft 
                          }}
                        >
                          {/* Weekend columns */}
                          {Array.from({ length: totalDays }).map((_, idx) => {
                            const date = new Date(minDate);
                            date.setDate(date.getDate() + idx);
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            if (!isWeekend) return null;
                            
                            return (
                              <div
                                key={idx}
                                className="absolute top-0 bottom-0 bg-muted/30 pointer-events-none"
                                style={{ 
                                  left: idx * pixelsPerDay,
                                  width: pixelsPerDay 
                                }}
                              />
                            );
                          })}
                          {/* Today marker */}
                          {todayPosition !== null && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none opacity-50"
                              style={{ left: todayPosition }}
                            />
                          )}
                          {/* Task bar */}
                          {position && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 rounded-lg shadow-sm transition-all",
                                    "border-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:z-20",
                                    prioridadColors[tarea.prioridad].border,
                                    "group/bar"
                                  )}
                                  style={{
                                    left: position.left,
                                    width: Math.max(position.width, 40),
                                    height: 44,
                                  }}
                                  onClick={() => onTaskClick?.(tarea.id)}
                                >
                                  <div className="h-full flex flex-col overflow-hidden">
                                    <div className={cn(
                                      "flex-1 flex items-center justify-between px-3 rounded-t-md transition-colors",
                                      prioridadColors[tarea.prioridad].bg,
                                      prioridadColors[tarea.prioridad].hover,
                                      "bg-opacity-90 group-hover/bar:bg-opacity-100"
                                    )}>
                                      <span className="text-xs font-medium truncate flex-1 text-white">
                                        {position.width >= 60 ? tarea.titulo : ''}
                                      </span>
                                      {tarea.estado === 'Hecho' && (
                                        <span className="text-xs ml-2 shrink-0 text-white">✓</span>
                                      )}
                                    </div>
                                    <Progress 
                                      value={estadoProgress[tarea.estado]} 
                                      className="h-2 rounded-none rounded-b-md"
                                    />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-semibold text-base">{tarea.titulo}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {position.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} 
                                      {' → '}
                                      {position.dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-xs">
                                    ⏱️ Duración: <span className="font-medium">{position.duration}</span> {position.duration === 1 ? 'día' : 'días'}
                                  </p>
                                  {tarea.descripcion && (
                                    <p className="text-xs text-muted-foreground pt-2 border-t">
                                      {tarea.descripcion.slice(0, 150)}{tarea.descripcion.length > 150 ? '...' : ''}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 pt-2 border-t">
                                    <Badge variant="outline" className="text-xs">
                                      {tarea.estado.replace('_', ' ')}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", prioridadColors[tarea.prioridad].text)}
                                    >
                                      {tarea.prioridad}
                                    </Badge>
                                    {tarea.asignado && (
                                      <Badge variant="secondary" className="text-xs">
                                        👤 {tarea.asignado.nombreCompleto}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
