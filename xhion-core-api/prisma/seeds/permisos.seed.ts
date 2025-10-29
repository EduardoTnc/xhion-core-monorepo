import { PrismaClient } from '@prisma/client';

/**
 * Catálogo completo de permisos del sistema XHION Core
 * Organizados por módulos para facilitar la gestión
 */

export interface PermisoDefinicion {
  nombreAccion: string;
  descripcion: string;
  modulo: string;
}

export const PERMISOS_CATALOGO: PermisoDefinicion[] = [
  // ========================================
  // MÓDULO: PROYECTOS
  // ========================================
  {
    nombreAccion: 'proyectos.crear',
    descripcion: 'Permite crear nuevos proyectos en el sistema',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.ver',
    descripcion: 'Permite ver proyectos donde el usuario es responsable o miembro',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.ver_todos',
    descripcion: 'Permite ver TODOS los proyectos del sistema sin restricciones',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.editar',
    descripcion: 'Permite editar información de proyectos',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.eliminar',
    descripcion: 'Permite eliminar proyectos del sistema',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.archivar',
    descripcion: 'Permite archivar proyectos completados o en pausa',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.gestionar_miembros',
    descripcion: 'Permite agregar, remover y gestionar miembros del proyecto',
    modulo: 'Proyectos',
  },
  {
    nombreAccion: 'proyectos.gestionar_etapas',
    descripcion: 'Permite crear, editar y reordenar etapas del proyecto',
    modulo: 'Proyectos',
  },

  // ========================================
  // MÓDULO: TAREAS
  // ========================================
  {
    nombreAccion: 'tareas.crear',
    descripcion: 'Permite crear nuevas tareas en proyectos',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.ver',
    descripcion: 'Permite ver tareas asignadas o del proyecto donde es miembro',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.ver_todas',
    descripcion: 'Permite ver TODAS las tareas del sistema sin restricciones',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.editar',
    descripcion: 'Permite editar información de tareas',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.eliminar',
    descripcion: 'Permite eliminar tareas del sistema',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.asignar',
    descripcion: 'Permite asignar tareas a usuarios',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.cambiar_estado',
    descripcion: 'Permite cambiar el estado de tareas (Por Hacer, En Progreso, Hecho)',
    modulo: 'Tareas',
  },
  {
    nombreAccion: 'tareas.comentar',
    descripcion: 'Permite agregar comentarios a tareas',
    modulo: 'Tareas',
  },

  // ========================================
  // MÓDULO: DEPARTAMENTOS
  // ========================================
  {
    nombreAccion: 'departamentos.crear',
    descripcion: 'Permite crear nuevos departamentos en la organización',
    modulo: 'Departamentos',
  },
  {
    nombreAccion: 'departamentos.ver',
    descripcion: 'Permite ver departamentos y su información',
    modulo: 'Departamentos',
  },
  {
    nombreAccion: 'departamentos.editar',
    descripcion: 'Permite editar información de departamentos',
    modulo: 'Departamentos',
  },
  {
    nombreAccion: 'departamentos.eliminar',
    descripcion: 'Permite eliminar departamentos del sistema',
    modulo: 'Departamentos',
  },
  {
    nombreAccion: 'departamentos.gestionar_empleados',
    descripcion: 'Permite asignar, cambiar puesto y remover empleados de departamentos',
    modulo: 'Departamentos',
  },
  {
    nombreAccion: 'departamentos.gestionar_puestos',
    descripcion: 'Permite crear, editar y eliminar puestos de trabajo en departamentos',
    modulo: 'Departamentos',
  },

  // ========================================
  // MÓDULO: PRESUPUESTOS
  // ========================================
  {
    nombreAccion: 'presupuestos.crear',
    descripcion: 'Permite crear nuevos presupuestos para proyectos o departamentos',
    modulo: 'Presupuestos',
  },
  {
    nombreAccion: 'presupuestos.ver',
    descripcion: 'Permite ver presupuestos y sus movimientos',
    modulo: 'Presupuestos',
  },
  {
    nombreAccion: 'presupuestos.editar',
    descripcion: 'Permite editar presupuestos existentes',
    modulo: 'Presupuestos',
  },
  {
    nombreAccion: 'presupuestos.eliminar',
    descripcion: 'Permite eliminar presupuestos del sistema',
    modulo: 'Presupuestos',
  },
  {
    nombreAccion: 'presupuestos.aprobar',
    descripcion: 'Permite aprobar gastos y movimientos de presupuesto',
    modulo: 'Presupuestos',
  },
  {
    nombreAccion: 'presupuestos.registrar_movimientos',
    descripcion: 'Permite registrar gastos, asignaciones y transferencias',
    modulo: 'Presupuestos',
  },

  // ========================================
  // MÓDULO: CONOCIMIENTO (BASE DE CONOCIMIENTO)
  // ========================================
  {
    nombreAccion: 'conocimiento.crear',
    descripcion: 'Permite crear documentos en la base de conocimiento',
    modulo: 'Conocimiento',
  },
  {
    nombreAccion: 'conocimiento.ver',
    descripcion: 'Permite ver documentos de la base de conocimiento',
    modulo: 'Conocimiento',
  },
  {
    nombreAccion: 'conocimiento.editar',
    descripcion: 'Permite editar documentos de la base de conocimiento',
    modulo: 'Conocimiento',
  },
  {
    nombreAccion: 'conocimiento.eliminar',
    descripcion: 'Permite eliminar documentos de la base de conocimiento',
    modulo: 'Conocimiento',
  },

  // ========================================
  // MÓDULO: USUARIOS
  // ========================================
  {
    nombreAccion: 'usuarios.crear',
    descripcion: 'Permite crear nuevos usuarios en el sistema',
    modulo: 'Usuarios',
  },
  {
    nombreAccion: 'usuarios.ver',
    descripcion: 'Permite ver usuarios y su información',
    modulo: 'Usuarios',
  },
  {
    nombreAccion: 'usuarios.editar',
    descripcion: 'Permite editar información de usuarios',
    modulo: 'Usuarios',
  },
  {
    nombreAccion: 'usuarios.eliminar',
    descripcion: 'Permite eliminar usuarios del sistema',
    modulo: 'Usuarios',
  },
  {
    nombreAccion: 'usuarios.gestionar_roles',
    descripcion: 'Permite asignar y cambiar roles de usuarios',
    modulo: 'Usuarios',
  },
  {
    nombreAccion: 'usuarios.invitar',
    descripcion: 'Permite enviar invitaciones a nuevos usuarios',
    modulo: 'Usuarios',
  },

  // ========================================
  // MÓDULO: ROLES Y PERMISOS
  // ========================================
  {
    nombreAccion: 'roles.crear',
    descripcion: 'Permite crear nuevos roles en el sistema',
    modulo: 'Roles',
  },
  {
    nombreAccion: 'roles.ver',
    descripcion: 'Permite ver roles y sus permisos',
    modulo: 'Roles',
  },
  {
    nombreAccion: 'roles.editar',
    descripcion: 'Permite editar información de roles',
    modulo: 'Roles',
  },
  {
    nombreAccion: 'roles.eliminar',
    descripcion: 'Permite eliminar roles del sistema',
    modulo: 'Roles',
  },
  {
    nombreAccion: 'roles.asignar_permisos',
    descripcion: 'Permite asignar y gestionar permisos de roles',
    modulo: 'Roles',
  },

  // ========================================
  // MÓDULO: AUDITORÍA
  // ========================================
  {
    nombreAccion: 'auditoria.ver',
    descripcion: 'Permite ver registros de auditoría del sistema',
    modulo: 'Auditoría',
  },
  {
    nombreAccion: 'auditoria.exportar',
    descripcion: 'Permite exportar registros de auditoría',
    modulo: 'Auditoría',
  },

  // ========================================
  // MÓDULO: SISTEMA
  // ========================================
  {
    nombreAccion: 'sistema.configurar',
    descripcion: 'Permite configurar parámetros del sistema',
    modulo: 'Sistema',
  },
  {
    nombreAccion: 'sistema.ver_estadisticas',
    descripcion: 'Permite ver estadísticas y métricas del sistema',
    modulo: 'Sistema',
  },
  {
    nombreAccion: 'sistema.gestionar_catalogos',
    descripcion: 'Permite gestionar catálogos de configuración',
    modulo: 'Sistema',
  },

  // ========================================
  // MÓDULO: INVITACIONES
  // ========================================
  {
    nombreAccion: 'invitaciones.crear',
    descripcion: 'Permite crear invitaciones para nuevos usuarios',
    modulo: 'Invitaciones',
  },
  {
    nombreAccion: 'invitaciones.ver',
    descripcion: 'Permite ver invitaciones pendientes y aceptadas',
    modulo: 'Invitaciones',
  },
  {
    nombreAccion: 'invitaciones.cancelar',
    descripcion: 'Permite cancelar invitaciones pendientes',
    modulo: 'Invitaciones',
  },
];

/**
 * Función para ejecutar el seed de permisos
 */
export async function seedPermisos(prisma: PrismaClient) {
  console.log('🔐 Seeding permisos...');

  let permisosCreados = 0;
  let permisosActualizados = 0;

  for (const permiso of PERMISOS_CATALOGO) {
    const resultado = await prisma.permiso.upsert({
      where: { nombreAccion: permiso.nombreAccion },
      update: {
        descripcion: permiso.descripcion,
      },
      create: {
        nombreAccion: permiso.nombreAccion,
        descripcion: permiso.descripcion,
      },
    });

    // Contar si fue creado o actualizado
    const existe = await prisma.permiso.findUnique({
      where: { nombreAccion: permiso.nombreAccion },
    });

    if (existe) {
      permisosActualizados++;
    } else {
      permisosCreados++;
    }
  }

  console.log(`✅ Permisos procesados:`);
  console.log(`   - Total: ${PERMISOS_CATALOGO.length}`);
  console.log(`   - Creados: ${permisosCreados}`);
  console.log(`   - Actualizados: ${permisosActualizados}`);

  // Mostrar resumen por módulo
  const modulosUnicos = [...new Set(PERMISOS_CATALOGO.map(p => p.modulo))];
  console.log(`\n📊 Permisos por módulo:`);
  modulosUnicos.forEach(modulo => {
    const count = PERMISOS_CATALOGO.filter(p => p.modulo === modulo).length;
    console.log(`   - ${modulo}: ${count} permisos`);
  });

  return PERMISOS_CATALOGO.length;
}
