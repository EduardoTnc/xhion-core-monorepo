import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetTimelineQueryDto, ActualizarFechasProyectoDto } from './dto/timeline.dto';
import { EstadoProyecto, EstadoTarea, PrioridadTarea } from '@prisma/client';

/**
 * Servicio de Dashboard
 * 
 * Proporciona toda la lógica de negocio para los 4 widgets del dashboard minimalista
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * ============================================
   * CRONOGRAMA VIVO - TIMELINE MAESTRO
   * ============================================
   */

  /**
   * Obtener datos completos del timeline
   */
  async getTimelineData(filtros: GetTimelineQueryDto, usuarioId: string) {
    const where: any = {
      fechaEliminacion: null,
    };

    if (filtros.departamentoId) {
      where.departamentoId = filtros.departamentoId;
    }

    if (filtros.estado) {
      where.estado = filtros.estado as EstadoProyecto;
    }

    if (filtros.fechaInicio || filtros.fechaFin) {
      where.AND = [];
      if (filtros.fechaInicio) {
        where.AND.push({ fechaInicio: { gte: new Date(filtros.fechaInicio) } });
      }
      if (filtros.fechaFin) {
        where.AND.push({ fechaFin: { lte: new Date(filtros.fechaFin) } });
      }
    }

    const proyectos = await this.prisma.proyecto.findMany({
      where,
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        miembros: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
          },
        },
        etapas: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
            estado: true,
          },
        },
        tareas: {
          where: { fechaEliminacion: null },
          select: {
            id: true,
            estado: true,
            prioridad: true,
          },
        },
        presupuesto: {
          select: {
            montoTotal: true,
            montoGastado: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });

    // Transformar proyectos al formato del frontend
    const proyectosTimeline = await Promise.all(
      proyectos.map(async (proyecto: any) => {
        const tareasTotal = proyecto.tareas?.length || 0;
        const tareasCompletadas = proyecto.tareas?.filter(
          (t: any) => t.estado === 'Hecho',
        ).length || 0;
        const tareasEnProgreso = proyecto.tareas?.filter(
          (t: any) => t.estado === 'En_Progreso',
        ).length || 0;
        const tareasBloqueadas = proyecto.tareas?.filter(
          (t: any) => t.estado === 'Bloqueado',
        ).length || 0;

        const progreso =
          tareasTotal > 0 ? (tareasCompletadas / tareasTotal) * 100 : 0;

        // Calcular salud del proyecto
        const salud = this.calcularSaludProyecto(
          proyecto,
          progreso,
          tareasBloqueadas,
        );

        // Detectar alertas
        const alertas = await this.detectarAlertas(proyecto, progreso);

        // Detectar riesgos
        const riesgos = this.detectarRiesgos(proyecto, tareasBloqueadas);

        // Generar sugerencias IA
        const sugerenciasIA = this.generarSugerenciasIA(
          proyecto,
          alertas,
          riesgos,
        );

        // Transformar hitos (etapas)
        const hitos = (proyecto.etapas || []).map((etapa: any, index: number) => ({
          id: etapa.id,
          nombre: etapa.nombre,
          fecha: etapa.fechaInicio?.toISOString() || new Date().toISOString(),
          completado: etapa.estado === 'Completada',
          tipo:
            index === 0
              ? 'inicio'
              : index === (proyecto.etapas?.length || 0) - 1
                ? 'fin'
                : 'intermedio',
        }));

        // Calcular presupuesto
        const presupuestoTotal = proyecto.presupuesto?.montoTotal ? Number(proyecto.presupuesto.montoTotal) : 0;
        const presupuestoGastado = proyecto.presupuesto?.montoGastado ? Number(proyecto.presupuesto.montoGastado) : 0;
        const porcentajePresupuesto =
          presupuestoTotal > 0
            ? (presupuestoGastado / presupuestoTotal) * 100
            : 0;

        return {
          id: proyecto.id,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion || '',
          fechaInicio: proyecto.fechaInicio?.toISOString() || new Date().toISOString(),
          fechaFin: proyecto.fechaFin?.toISOString() || new Date().toISOString(),
          fechaFinProyectada: this.calcularFechaProyectada(proyecto, progreso),
          progreso: Math.round(progreso),
          salud,
          hitos,
          alertas,
          riesgos,
          presupuesto: {
            total: presupuestoTotal,
            gastado: presupuestoGastado,
            porcentaje: Math.round(porcentajePresupuesto),
            alertaPresupuesto: porcentajePresupuesto > 90,
          },
          equipo: (proyecto.miembros || []).map((m: any) => ({
            id: m.usuario.id,
            nombre: m.usuario.nombreCompleto,
            avatar: m.usuario.avatarUrl || '',
            rol: m.rol,
          })),
          dependencias: [], // TODO: Implementar dependencias
          sugerenciasIA,
          tareas: {
            total: tareasTotal,
            completadas: tareasCompletadas,
            enProgreso: tareasEnProgreso,
            bloqueadas: tareasBloqueadas,
          },
          departamento: {
            id: proyecto.departamento?.id || '',
            nombre: proyecto.departamento?.nombre || '',
          },
          responsable: {
            id: proyecto.responsable.id,
            nombre: proyecto.responsable.nombreCompleto,
            avatar: proyecto.responsable.avatarUrl || '',
          },
        };
      }),
    );

    // Calcular resumen
    const resumen = {
      activos: proyectosTimeline.filter((p) => p.salud !== 'critico').length,
      promedioProgreso:
        proyectosTimeline.reduce((acc, p) => acc + p.progreso, 0) /
        proyectosTimeline.length || 0,
      enRiesgo: proyectosTimeline.filter(
        (p) => p.salud === 'critico' || p.salud === 'atencion',
      ).length,
      completadosMes: await this.getProyectosCompletadosMes(),
      completadosSemana: await this.getProyectosCompletadosSemana(),
    };

    // Sugerencias globales
    const sugerenciasGlobales = this.generarSugerenciasGlobales(proyectosTimeline);

    return {
      proyectos: proyectosTimeline,
      resumen,
      sugerenciasGlobales,
      rangoFechas: {
        inicio: proyectosTimeline[0]?.fechaInicio || new Date().toISOString(),
        fin:
          proyectosTimeline[proyectosTimeline.length - 1]?.fechaFin ||
          new Date().toISOString(),
      },
    };
  }

  /**
   * Obtener proyecto específico del timeline
   */
  async getProyectoTimeline(proyectoId: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        miembros: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
          },
        },
        etapas: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
            estado: true,
          },
        },
        tareas: {
          where: { fechaEliminacion: null },
          select: {
            id: true,
            estado: true,
            prioridad: true,
          },
        },
        presupuesto: {
          select: {
            montoTotal: true,
            montoGastado: true,
          },
        },
      },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return proyecto;
  }

  /**
   * Actualizar fechas de proyecto
   */
  async actualizarFechasProyecto(
    proyectoId: string,
    dto: ActualizarFechasProyectoDto,
  ) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return this.prisma.proyecto.update({
      where: { id: proyectoId },
      data: {
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
      include: {
        responsable: true,
        departamento: true,
        miembros: { include: { usuario: true } },
        etapas: true,
        tareas: true,
      },
    });
  }

  /**
   * ============================================
   * MI DÍA - CENTRO DE COMANDO PERSONAL
   * ============================================
   */

  /**
   * Obtener datos de "Mi Día"
   */
  async getMyDayData(usuarioId: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Obtener tareas del usuario
    const tareas = await this.prisma.tarea.findMany({
      where: {
        asignadoId: usuarioId,
        fechaEliminacion: null,
        OR: [
          { fechaVencimiento: { gte: hoy, lt: manana } },
          { estado: { in: ['En_Progreso', 'Por_Hacer'] } },
        ],
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            departamento: {
              select: {
                color: true,
              },
            },
          },
        },
      },
      orderBy: [{ prioridad: 'desc' }, { fechaVencimiento: 'asc' }],
    });

    const completadas = tareas.filter((t) => t.estado === 'Hecho').length;
    const enProgreso = tareas.filter((t) => t.estado === 'En_Progreso').length;
    const pendientes = tareas.filter((t) => t.estado === 'Por_Hacer').length;

    // Próxima tarea (la de mayor prioridad pendiente)
    const proximaTarea = tareas.find(
      (t) => t.estado === 'Por_Hacer' || t.estado === 'En_Progreso',
    );

    return {
      estadisticas: {
        completadas,
        enProgreso,
        pendientes,
        total: tareas.length,
      },
      proximaTarea: proximaTarea
        ? {
            id: proximaTarea.id,
            titulo: proximaTarea.titulo,
            descripcion: proximaTarea.descripcion || '',
            prioridad: proximaTarea.prioridad,
            tiempoEstimado: 2, // TODO: Calcular tiempo estimado
            proyecto: {
              id: proximaTarea.proyecto.id,
              nombre: proximaTarea.proyecto.nombre,
              color: proximaTarea.proyecto.departamento?.color || '#3b82f6',
            },
            fechaVencimiento: proximaTarea.fechaVencimiento?.toISOString(),
          }
        : null,
      tareas: tareas.slice(0, 10).map((t) => ({
        id: t.id,
        titulo: t.titulo,
        prioridad: t.prioridad,
        estado: t.estado,
        proyecto: {
          id: t.proyecto.id,
          nombre: t.proyecto.nombre,
          color: t.proyecto.departamento?.color || '#3b82f6',
        },
      })),
    };
  }

  /**
   * ============================================
   * EQUIPO - MAPA DE CARGA
   * ============================================
   */

  /**
   * Obtener datos de carga del equipo
   */
  async getTeamLoadData(usuarioId: string) {
    // Obtener departamento del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        puestoTrabajo: {
          include: {
            departamento: true,
          },
        },
      },
    });

    const departamentoId = usuario?.puestoTrabajo?.departamento?.id;

    // Obtener todos los usuarios del departamento
    const miembros = await this.prisma.usuario.findMany({
      where: {
        puestoTrabajo: {
          departamentoId,
        },
        estado: 'ACTIVO',
        fechaEliminacion: null,
      },
      include: {
        tareasAsignadas: {
          where: {
            estado: { in: ['Por_Hacer', 'En_Progreso'] },
            fechaEliminacion: null,
          },
        },
        puestoTrabajo: {
          include: {
            departamento: true,
          },
        },
      },
    });

    // Calcular carga por miembro
    const miembrosConCarga = miembros.map((miembro) => {
      const tareasActivas = miembro.tareasAsignadas.length;
      const horasAsignadas = tareasActivas * 4; // Estimación: 4 horas por tarea
      const horasCapacidad = 40; // 40 horas semanales
      const porcentaje = (horasAsignadas / horasCapacidad) * 100;

      let estado: 'disponible' | 'normal' | 'sobrecargado';
      if (porcentaje < 50) estado = 'disponible';
      else if (porcentaje < 90) estado = 'normal';
      else estado = 'sobrecargado';

      return {
        id: miembro.id,
        nombre: miembro.nombreCompleto,
        avatar: miembro.avatarUrl || '',
        departamento: miembro.puestoTrabajo?.departamento?.nombre || '',
        carga: {
          horasAsignadas,
          horasCapacidad,
          porcentaje: Math.round(porcentaje),
          estado,
        },
        tareas: {
          total: miembro.tareasAsignadas.length,
          enProgreso: miembro.tareasAsignadas.filter(
            (t) => t.estado === 'En_Progreso',
          ).length,
        },
      };
    });

    // Calcular estadísticas
    const disponibles = miembrosConCarga.filter(
      (m) => m.carga.estado === 'disponible',
    ).length;
    const cargaNormal = miembrosConCarga.filter(
      (m) => m.carga.estado === 'normal',
    ).length;
    const sobrecargados = miembrosConCarga.filter(
      (m) => m.carga.estado === 'sobrecargado',
    ).length;

    // Generar alertas
    const alertas: any[] = [];
    if (sobrecargados > 0) {
      const miembrosSobrecargados = miembrosConCarga.filter(
        (m) => m.carga.estado === 'sobrecargado',
      );
      alertas.push({
        tipo: 'sobrecarga',
        mensaje: `${sobrecargados} miembro(s) sobrecargado(s)`,
        miembros: miembrosSobrecargados.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          avatar: m.avatar,
        })),
        accionSugerida: `Redistribuir ${miembrosSobrecargados.reduce((acc, m) => acc + (m.tareas?.total || 0), 0)} tareas entre ${disponibles} miembros disponibles`,
      });
    }

    return {
      estadisticas: {
        disponibles,
        cargaNormal,
        sobrecargados,
        total: miembrosConCarga.length,
      },
      alertas,
      miembros: miembrosConCarga,
    };
  }

  /**
   * ============================================
   * ASISTENTE IA - SUGERENCIAS INTELIGENTES
   * ============================================
   */

  /**
   * Obtener sugerencias globales de IA
   */
  async getSugerenciasGlobales(usuarioId: string) {
    // Por ahora retornamos sugerencias mock
    // TODO: Integrar con Gemini API
    return [];
  }

  /**
   * Aplicar sugerencia de IA
   */
  async aplicarSugerencia(sugerenciaId: string, usuarioId: string) {
    // TODO: Implementar lógica de aplicación de sugerencias
    return {
      success: true,
      mensaje: 'Sugerencia aplicada correctamente',
    };
  }

  /**
   * Descartar sugerencia de IA
   */
  async descartarSugerencia(sugerenciaId: string, usuarioId: string) {
    // TODO: Implementar lógica de descarte de sugerencias
    return { success: true };
  }

  /**
   * ============================================
   * MÉTODOS AUXILIARES
   * ============================================
   */

  private calcularSaludProyecto(
    proyecto: any,
    progreso: number,
    tareasBloqueadas: number,
  ): 'saludable' | 'atencion' | 'critico' {
    // Si hay tareas bloqueadas, es crítico
    if (tareasBloqueadas > 2) return 'critico';

    // Si el progreso está muy atrasado respecto a la fecha
    const diasTotales = proyecto.fechaFin && proyecto.fechaInicio
      ? Math.ceil(
          (new Date(proyecto.fechaFin).getTime() -
            new Date(proyecto.fechaInicio).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const diasTranscurridos = proyecto.fechaInicio
      ? Math.ceil(
          (new Date().getTime() - new Date(proyecto.fechaInicio).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const progresoEsperado = diasTotales > 0 ? (diasTranscurridos / diasTotales) * 100 : 0;
    const diferencia = progresoEsperado - progreso;

    if (diferencia > 20) return 'critico';
    if (diferencia > 10) return 'atencion';

    return 'saludable';
  }

  private async detectarAlertas(proyecto: any, progreso: number) {
    const alertas: any[] = [];

    // Alerta de retraso
    if (proyecto.fechaFin && new Date(proyecto.fechaFin) < new Date() && progreso < 100) {
      alertas.push({
        id: `alerta-retraso-${proyecto.id}`,
        tipo: 'retraso',
        severidad: 'alta',
        mensaje: 'Proyecto con retraso',
        fechaDeteccion: new Date().toISOString(),
        accionSugerida: 'Revisar tareas bloqueadas y reasignar recursos',
      });
    }

    // Alerta de presupuesto
    if (proyecto.presupuesto) {
      const montoTotal = Number(proyecto.presupuesto.montoTotal || 0);
      const montoGastado = Number(proyecto.presupuesto.montoGastado || 0);
      const porcentaje = montoTotal > 0 ? (montoGastado / montoTotal) * 100 : 0;
      
      if (porcentaje > 90) {
        alertas.push({
          id: `alerta-presupuesto-${proyecto.id}`,
          tipo: 'presupuesto',
          severidad: 'critica',
          mensaje: 'Presupuesto casi agotado',
          fechaDeteccion: new Date().toISOString(),
          accionSugerida: 'Solicitar ampliación de presupuesto',
        });
      }
    }

    return alertas;
  }

  private detectarRiesgos(proyecto: any, tareasBloqueadas: number) {
    const riesgos: any[] = [];

    if (tareasBloqueadas > 0) {
      riesgos.push({
        id: `riesgo-bloqueo-${proyecto.id}`,
        tipo: 'Tareas bloqueadas',
        probabilidad: 80,
        impacto: 'alto',
        descripcion: `${tareasBloqueadas} tareas bloqueadas pueden retrasar el proyecto`,
        mitigacion: 'Resolver dependencias y desbloquear tareas',
      });
    }

    return riesgos;
  }

  private generarSugerenciasIA(proyecto: any, alertas: any[], riesgos: any[]) {
    const sugerencias: any[] = [];

    if (alertas && alertas.length > 0) {
      sugerencias.push({
        id: `sugerencia-${proyecto.id}-1`,
        tipo: 'alerta',
        severidad: 'alta',
        titulo: 'Atención requerida',
        descripcion: `El proyecto "${proyecto.nombre}" tiene ${alertas.length} alerta(s)`,
        entidad: {
          tipo: 'proyecto',
          id: proyecto.id,
          nombre: proyecto.nombre,
        },
        accionSugerida: alertas[0]?.accionSugerida || 'Revisar proyecto',
        impacto: 'Evitar retrasos mayores',
        acciones: [
          { tipo: 'aplicar', label: 'Aplicar' },
          { tipo: 'ver', label: 'Ver Detalles' },
          { tipo: 'descartar', label: 'Descartar' },
        ],
      });
    }

    return sugerencias;
  }

  private generarSugerenciasGlobales(proyectos: any[]) {
    const sugerencias: any[] = [];

    // Sugerencia de proyectos en riesgo
    const proyectosEnRiesgo = (proyectos || []).filter(
      (p) => p.salud === 'critico' || p.salud === 'atencion',
    );

    if (proyectosEnRiesgo.length > 0) {
      const primerProyecto = proyectosEnRiesgo[0];
      sugerencias.push({
        id: 'sugerencia-global-1',
        tipo: 'alerta',
        severidad: 'alta',
        titulo: 'Proyectos requieren atención',
        descripcion: `${proyectosEnRiesgo.length} proyecto(s) en riesgo`,
        entidad: {
          tipo: 'proyecto',
          id: primerProyecto?.id || '',
          nombre: primerProyecto?.nombre || 'Proyecto',
        },
        accionSugerida: 'Revisar y redistribuir recursos',
        impacto: 'Mejorar salud de proyectos críticos',
        acciones: [
          { tipo: 'aplicar', label: 'Ver Proyectos' },
          { tipo: 'descartar', label: 'Descartar' },
        ],
      });
    }

    return sugerencias;
  }

  private calcularFechaProyectada(proyecto: any, progreso: number): string {
    if (!proyecto.fechaInicio || !proyecto.fechaFin) {
      return new Date().toISOString();
    }

    const inicio = new Date(proyecto.fechaInicio);
    const fin = new Date(proyecto.fechaFin);
    const diasTotales = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasTranscurridos = Math.ceil((new Date().getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    if (progreso === 0) return fin.toISOString();

    const velocidad = progreso / diasTranscurridos;
    const diasRestantes = (100 - progreso) / velocidad;
    const fechaProyectada = new Date();
    fechaProyectada.setDate(fechaProyectada.getDate() + diasRestantes);

    return fechaProyectada.toISOString();
  }

  private async getProyectosCompletadosMes(): Promise<number> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    return this.prisma.proyecto.count({
      where: {
        estado: 'Completado',
        fechaActualizacion: { gte: inicioMes },
      },
    });
  }

  private async getProyectosCompletadosSemana(): Promise<number> {
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    return this.prisma.proyecto.count({
      where: {
        estado: 'Completado',
        fechaActualizacion: { gte: inicioSemana },
      },
    });
  }
}
