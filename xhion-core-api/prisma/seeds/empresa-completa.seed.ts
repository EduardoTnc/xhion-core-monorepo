import { PrismaClient, EstadoProyecto, EstadoTarea, PrioridadTarea, TipoEvento, RolProyecto, EstadoIdea, CategoriaIdea, EstadoUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * SEED COMPLETO DE EMPRESA REAL - VERSIÓN CORREGIDA
 * Basado en la estructura de Negocios Asociados Bigander S.A.C.
 * 
 * ✅ CORRECCIONES APLICADAS:
 * - Todos los campos en camelCase (proyectoId, fechaInicio, etc.)
 * - Enums correctos según schema (Activo, En_Progreso, Hecho, etc.)
 * - RolProyecto enum (Responsable, Miembro, Observador)
 * - passwordHash en lugar de password
 * - EstadoUsuario.ACTIVO
 * 
 * Estructura:
 * - 6 Departamentos
 * - 11 Usuarios con roles específicos
 * - 7 Proyectos (5 principales + 2 sub-proyectos)
 * - 20+ Etapas
 * - 30+ Tareas
 * - 5 Presupuestos
 * - 3 Ideas con comentarios y votos
 * - 5 Eventos de calendario
 */

async function seedEmpresaCompleta() {
  console.log('🚀 Iniciando seed de empresa completa...');

  // ============================================
  // 1. ROLES Y PERMISOS BASE
  // ============================================
  console.log('📋 Creando roles base...');

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema',
      color: 'bg-purple-600'
    }
    });

  const rolJefeDepartamento = await prisma.rol.upsert({
    where: { nombre: 'Jefe de Departamento' },
    update: {},
    create: {
      nombre: 'Jefe de Departamento',
      descripcion: 'Gestiona proyectos y usuarios de su departamento',
      color: 'bg-blue-600'
    }
    });

  const rolGerenteProyecto = await prisma.rol.upsert({
    where: { nombre: 'Gerente de Proyecto' },
    update: {},
    create: {
      nombre: 'Gerente de Proyecto',
      descripcion: 'Gestiona proyectos específicos, etapas y tareas',
      color: 'bg-green-600'
    }
    });

  const rolMiembroEquipo = await prisma.rol.upsert({
    where: { nombre: 'Miembro de Equipo' },
    update: {},
    create: {
      nombre: 'Miembro de Equipo',
      descripcion: 'Ejecuta tareas asignadas',
      color: 'bg-yellow-600'
    }
    });

  const rolColaborador = await prisma.rol.upsert({
    where: { nombre: 'Colaborador' },
    update: {},
    create: {
      nombre: 'Colaborador',
      descripcion: 'Permiso básico para ver información y proponer ideas',
      color: 'bg-gray-600'
    }
    });

  // ============================================
  // 1.5. ASIGNAR PERMISOS A ROLES
  // ============================================
  console.log('🔐 Asignando permisos a roles...');

  // Permisos críticos que necesita el Administrador
  const permisosAdmin = [
    'proyectos.ver_todos',
    'proyectos.crear',
    'proyectos.editar',
    'proyectos.eliminar',
    'tareas.ver_todas',
    'tareas.crear',
    'tareas.editar',
    'departamentos.ver',
    'departamentos.crear',
    'departamentos.editar',
    'usuarios.ver',
    'usuarios.crear',
    'roles.ver',
    'roles.asignar_permisos',
    'finanzas:ver',
    'finanzas:crear_ingreso',
    'finanzas:crear_gasto',
  ];

  for (const nombrePermiso of permisosAdmin) {
    const permiso = await prisma.permiso.findFirst({
      where: { nombreAccion: nombrePermiso }
    });

    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: rolAdmin.id,
            permisoId: permiso.id
          }
        },
        update: {},
        create: {
          rolId: rolAdmin.id,
          permisoId: permiso.id
        }
      });
    }
  }

  // Permisos para Jefe de Departamento
  const permisosJefe = [
    'proyectos.ver',
    'proyectos.crear',
    'proyectos.editar',
    'tareas.ver',
    'tareas.crear',
    'tareas.editar',
    'departamentos.ver',
    'usuarios.ver',
  ];

  for (const nombrePermiso of permisosJefe) {
    const permiso = await prisma.permiso.findFirst({
      where: { nombreAccion: nombrePermiso }
    });

    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: rolJefeDepartamento.id,
            permisoId: permiso.id
          }
        },
        update: {},
        create: {
          rolId: rolJefeDepartamento.id,
          permisoId: permiso.id
        }
      });
    }
  }

  console.log('✅ Permisos asignados correctamente');

  // ============================================
  // 2. DEPARTAMENTOS
  // ============================================
  console.log('🏢 Creando departamentos...');

  const deptVentas = await prisma.departamento.create({
    data: {
      nombre: 'Ventas',
      descripcion: 'Gestiona las operaciones de tiendas físicas, call center y ventas digitales para Fontech y Fumanía'
    }
    });

  const deptMarketing = await prisma.departamento.create({
    data: {
      nombre: 'Marketing',
      descripcion: 'Responsable de la promoción de las marcas Fontech, Fumanía, Proyecto Sostenible Perú y la futura agencia'
    }
    });

  const deptDiseno = await prisma.departamento.create({
    data: {
      nombre: 'Diseño',
      descripcion: 'Crea los activos visuales para marketing y publicidad. Actualmente usa Notion para gestión interna'
    }
    });

  const deptSistemas = await prisma.departamento.create({
    data: {
      nombre: 'Sistemas',
      descripcion: 'Desarrolla y mantiene las soluciones de software internas, incluyendo XHION Core y el Chatbot'
    }
    });

  const deptRRHH = await prisma.departamento.create({
    data: {
      nombre: 'Recursos Humanos',
      descripcion: 'Gestiona el personal de las tiendas y las áreas administrativas'
    }
    });

  const deptMantenimiento = await prisma.departamento.create({
    data: {
      nombre: 'Mantenimiento y Taller',
      descripcion: 'Área para reparaciones de infraestructura de tiendas y fabricación para el proyecto sostenible'
    }
    });

  // ============================================
  // 3. USUARIOS
  // ============================================
  console.log('👥 Creando usuarios...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Gerente General
  const gerente = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Carlos Mendoza',
      email: 'gerente@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolAdmin.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    }
    });

  // Desarrollador (Eduardo)
  const eduardo = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Eduardo Tanca',
      email: 'eduardo.tanca@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolAdmin.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo'
    }
    });

  // Jefa de Fumanía
  const luz = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Luz García',
      email: 'luz.garcia@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolGerenteProyecto.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luz'
    }
    });

  // Jefa de Fontech
  const maitet = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Maitet Rodríguez',
      email: 'maitet.rodriguez@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolGerenteProyecto.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maitet'
    }
    });

  // Jefa de Marketing
  const lucero = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Lucero Sánchez',
      email: 'lucero.sanchez@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolJefeDepartamento.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucero'
    }
    });

  // Técnico de Mantenimiento
  const ricardo = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Ricardo Torres',
      email: 'ricardo.torres@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo'
    }
    });

  // Desarrollador de Sistemas
  const omar = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Omar Pérez',
      email: 'omar.perez@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar'
    }
    });

  // Diseñadora 1
  const diseñadora1 = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Ana Flores',
      email: 'ana.flores@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
    }
    });

  // Diseñadora 2
  const diseñadora2 = await prisma.usuario.create({
    data: {
      nombreCompleto: 'María Castro',
      email: 'maria.castro@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    }
    });

  // Vendedor de Tienda
  const vendedor1 = await prisma.usuario.create({
    data: {
      nombreCompleto: 'Juan Ramírez',
      email: 'juan.ramirez@bigander.com',
      passwordHash: hashedPassword,
      rolId: rolColaborador.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
    }
    });

  // Asignar jefes a departamentos
  await prisma.departamento.update({
    where: { id: deptVentas.id },
    data: { jefeId: luz.id }
    });

  await prisma.departamento.update({
    where: { id: deptMarketing.id },
    data: { jefeId: lucero.id }
    });

  await prisma.departamento.update({
    where: { id: deptSistemas.id },
    data: { jefeId: eduardo.id }
    });

  // ============================================
  // 4. PROYECTOS Y SUB-PROYECTOS
  // ============================================
  console.log('📁 Creando proyectos...');

  // PROYECTO 1: Negocio de Telefonía (Fontech y Fumanía)
  const proyectoTelefonia = await prisma.proyecto.create({
    data: {
      nombre: 'Negocio de Telefonía - Fontech y Fumanía',
      descripcion: 'Negocio principal de venta y reparación de celulares. Cadena de tiendas físicas.',
      departamentoId: deptVentas.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2025-12-31'),
      responsableId: gerente.id,
      miembros: {
        create: [
          { usuarioId: luz.id, rol: RolProyecto.Responsable },
          { usuarioId: maitet.id, rol: RolProyecto.Responsable },
          { usuarioId: vendedor1.id, rol: RolProyecto.Miembro },
        ]
    }
    }
    });

  // Sub-Proyecto 1.1: Call Center
  const proyectoCallCenter = await prisma.proyecto.create({
    data: {
      nombre: 'Implementación de Call Center',
      descripcion: 'Centro de atención telefónica para consultas y ventas',
      departamentoId: deptVentas.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-06-01'),
      fechaFin: new Date('2024-12-31'),
      responsableId: gerente.id,
      miembros: {
        create: [
          { usuarioId: luz.id, rol: RolProyecto.Responsable },
        ]
    }
    }
    });

  // Etapas del Call Center
  const etapaCallCenter1 = await prisma.etapa.create({
    data: {
      nombre: 'Planificación',
      descripcion: 'Definir requisitos y proveedores',
      proyectoId: proyectoCallCenter.id,
      orden: 1,
      fechaInicio: new Date('2024-06-01'),
      fechaFin: new Date('2024-07-01')
    }
    });

  const etapaCallCenter2 = await prisma.etapa.create({
    data: {
      nombre: 'Adquisición de Tecnología',
      descripcion: 'Comprar software y hardware necesario',
      proyectoId: proyectoCallCenter.id,
      orden: 2,
      fechaInicio: new Date('2024-07-01'),
      fechaFin: new Date('2024-08-01')
    }
    });

  const etapaCallCenter3 = await prisma.etapa.create({
    data: {
      nombre: 'Contratación y Capacitación',
      descripcion: 'Contratar y capacitar agentes',
      proyectoId: proyectoCallCenter.id,
      orden: 3,
      fechaInicio: new Date('2024-08-01'),
      fechaFin: new Date('2024-10-01')
    }
    });

  const etapaCallCenter4 = await prisma.etapa.create({
    data: {
      nombre: 'Lanzamiento',
      descripcion: 'Poner en operación el call center',
      proyectoId: proyectoCallCenter.id,
      orden: 4,
      fechaInicio: new Date('2024-10-01'),
      fechaFin: new Date('2024-12-31')
    }
    });

  // Tareas del Call Center
  await prisma.tarea.createMany({
    data: [
      {
        titulo: 'Investigar proveedores de software de Call Center',
        descripcion: 'Comparar opciones: Zendesk, Freshdesk, etc.',
        proyectoId: proyectoCallCenter.id,
        etapaId: etapaCallCenter1.id,
        asignadoId: luz.id,
        creadorId: gerente.id,
        estado: EstadoTarea.Hecho,
        prioridad: PrioridadTarea.Alta,
        fechaVencimiento: new Date('2024-06-15'),
        fechaCompletado: new Date('2024-06-14')
    },
      {
        titulo: 'Definir scripts de atención al cliente',
        descripcion: 'Crear guiones para diferentes tipos de consultas',
        proyectoId: proyectoCallCenter.id,
        etapaId: etapaCallCenter1.id,
        asignadoId: luz.id,
        creadorId: gerente.id,
        estado: EstadoTarea.Hecho,
        prioridad: PrioridadTarea.Alta,
        fechaVencimiento: new Date('2024-07-01'),
        fechaCompletado: new Date('2024-06-30')
    },
      {
        titulo: 'Comprar licencias de software',
        descripcion: 'Adquirir 10 licencias de Zendesk',
        proyectoId: proyectoCallCenter.id,
        etapaId: etapaCallCenter2.id,
        asignadoId: gerente.id,
        creadorId: gerente.id,
        estado: EstadoTarea.En_Progreso,
        prioridad: PrioridadTarea.Alta,
        // fechaInicio: new Date('2024-07-01'),
        fechaVencimiento: new Date('2024-07-15')
    },
      {
        titulo: 'Contratar 8 agentes de call center',
        descripcion: 'Proceso de reclutamiento y selección',
        proyectoId: proyectoCallCenter.id,
        etapaId: etapaCallCenter3.id,
        asignadoId: luz.id,
        creadorId: gerente.id,
        estado: EstadoTarea.Por_Hacer,
        prioridad: PrioridadTarea.Alta,
        // fechaInicio: new Date('2024-08-01'),
        fechaVencimiento: new Date('2024-09-01')
    },
      {
        titulo: 'Capacitar nuevos agentes',
        descripcion: 'Programa de capacitación de 2 semanas',
        proyectoId: proyectoCallCenter.id,
        etapaId: etapaCallCenter3.id,
        asignadoId: luz.id,
        creadorId: gerente.id,
        estado: EstadoTarea.Por_Hacer,
        prioridad: PrioridadTarea.Media,
        fechaVencimiento: new Date('2024-09-15')
    },
    ]
    });

  // Sub-Proyecto 1.2: Chatbot Inteligente
  const proyectoChatbot = await prisma.proyecto.create({
    data: {
      nombre: 'Desarrollo de Chatbot Inteligente',
      descripcion: 'Chatbot con IA para atención automatizada 24/7',
      departamentoId: deptSistemas.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-07-01'),
      fechaFin: new Date('2025-03-31'),
      responsableId: eduardo.id,
      miembros: {
        create: [
          { usuarioId: eduardo.id, rol: RolProyecto.Responsable },
          { usuarioId: omar.id, rol: RolProyecto.Miembro },
        ]
    }
    }
    });

  // Etapas del Chatbot
  const etapaChatbot1 = await prisma.etapa.create({
    data: {
      nombre: 'Análisis y Diseño',
      descripcion: 'Definir flujos de conversación y arquitectura',
      proyectoId: proyectoChatbot.id,
      orden: 1,
      fechaInicio: new Date('2024-07-01'),
      fechaFin: new Date('2024-08-01')
    }
    });

  const etapaChatbot2 = await prisma.etapa.create({
    data: {
      nombre: 'Desarrollo',
      descripcion: 'Implementar chatbot con IA',
      proyectoId: proyectoChatbot.id,
      orden: 2,
      fechaInicio: new Date('2024-08-01'),
      fechaFin: new Date('2024-12-01')
    }
    });

  const etapaChatbot3 = await prisma.etapa.create({
    data: {
      nombre: 'Entrenamiento IA',
      descripcion: 'Entrenar modelo con datos reales',
      proyectoId: proyectoChatbot.id,
      orden: 3,
      fechaInicio: new Date('2024-12-01'),
      fechaFin: new Date('2025-02-01')
    }
    });

  const etapaChatbot4 = await prisma.etapa.create({
    data: {
      nombre: 'Integración',
      descripcion: 'Integrar con Call Center y sistemas',
      proyectoId: proyectoChatbot.id,
      orden: 4,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-03-31')
    }
    });

  // Tareas del Chatbot
  await prisma.tarea.createMany({
    data: [
      {
        titulo: 'Definir preguntas frecuentes (FAQs)',
        descripcion: 'Recopilar las 100 preguntas más comunes de clientes',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot1.id,
        asignadoId: eduardo.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.Hecho,
        prioridad: PrioridadTarea.Alta,
        // fechaInicio: new Date('2024-07-01'),
        fechaVencimiento: new Date('2024-07-15'),
        fechaCompletado: new Date('2024-07-14')
    },
      {
        titulo: 'Diseñar flujos de conversación',
        descripcion: 'Crear diagramas de flujo para diferentes escenarios',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot1.id,
        asignadoId: eduardo.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.Hecho,
        prioridad: PrioridadTarea.Alta,
        fechaVencimiento: new Date('2024-08-01'),
        fechaCompletado: new Date('2024-07-31')
    },
      {
        titulo: 'Implementar backend del chatbot',
        descripcion: 'Desarrollar API con Node.js y OpenAI',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot2.id,
        asignadoId: omar.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.En_Progreso,
        prioridad: PrioridadTarea.Alta,
        // fechaInicio: new Date('2024-08-01'),
        fechaVencimiento: new Date('2024-10-01')
    },
      {
        titulo: 'Desarrollar interfaz de chat',
        descripcion: 'Crear widget de chat para el sitio web',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot2.id,
        asignadoId: eduardo.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.En_Progreso,
        prioridad: PrioridadTarea.Media,
        fechaVencimiento: new Date('2024-11-01')
    },
      {
        titulo: 'Entrenar modelo con historial de consultas',
        descripcion: 'Usar datos del call center para mejorar respuestas',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot3.id,
        asignadoId: omar.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.Por_Hacer,
        prioridad: PrioridadTarea.Alta,
        fechaVencimiento: new Date('2025-01-15')
    },
      {
        titulo: 'Integrar chatbot con Call Center',
        descripcion: 'Transferir conversaciones complejas a agentes humanos',
        proyectoId: proyectoChatbot.id,
        etapaId: etapaChatbot4.id,
        asignadoId: eduardo.id,
        creadorId: eduardo.id,
        estado: EstadoTarea.Por_Hacer,
        prioridad: PrioridadTarea.Alta,
        fechaVencimiento: new Date('2025-03-01')
    },
    ]
    });

  // PROYECTO 2: Bumblebee (Eventos)
  const proyectoBumblebee = await prisma.proyecto.create({
    data: {
      nombre: 'Bumblebee - Alquiler para Eventos',
      descripcion: 'Alquiler de disfraz de Bumblebee para eventos corporativos y sorpresas',
      departamentoId: deptMarketing.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-01-01'),
      responsableId: lucero.id
    }
    });

  // Etapas de Bumblebee
  await prisma.etapa.createMany({
    data: [
      {
        nombre: 'Reservas',
        descripcion: 'Gestión de reservas y contratos',
        proyectoId: proyectoBumblebee.id,
        orden: 1,
        fechaInicio: new Date('2024-01-01')
    },
      {
        nombre: 'Logística',
        descripcion: 'Coordinación de envío y transporte',
        proyectoId: proyectoBumblebee.id,
        orden: 2,
        fechaInicio: new Date('2024-01-01')
    },
      {
        nombre: 'Ejecución',
        descripcion: 'Realización del evento',
        proyectoId: proyectoBumblebee.id,
        orden: 3,
        fechaInicio: new Date('2024-01-01')
    },
      {
        nombre: 'Mantenimiento',
        descripcion: 'Limpieza y reparaciones post-evento',
        proyectoId: proyectoBumblebee.id,
        orden: 4,
        fechaInicio: new Date('2024-01-01')
    },
    ]
    });

  // PROYECTO 3: Proyecto Sostenible Perú
  const proyectoSostenible = await prisma.proyecto.create({
    data: {
      nombre: 'Proyecto Sostenible Perú',
      descripcion: 'Estaciones de carga solar para celulares y notebooks financiadas con publicidad',
      departamentoId: deptMantenimiento.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-03-01'),
      responsableId: gerente.id,
      miembros: {
        create: [
          { usuarioId: ricardo.id, rol: RolProyecto.Miembro },
          { usuarioId: lucero.id, rol: RolProyecto.Miembro },
        ]
    }
    }
    });

  // Etapas del Proyecto Sostenible
  await prisma.etapa.createMany({
    data: [
      {
        nombre: 'Diseño',
        descripcion: 'Diseño de estaciones de carga',
        proyectoId: proyectoSostenible.id,
        orden: 1,
        fechaInicio: new Date('2024-03-01'),
        fechaFin: new Date('2024-04-01')
    },
      {
        nombre: 'Fabricación',
        descripcion: 'Construcción en taller',
        proyectoId: proyectoSostenible.id,
        orden: 2,
        fechaInicio: new Date('2024-04-01')
    },
      {
        nombre: 'Instalación',
        descripcion: 'Instalación en ubicaciones estratégicas',
        proyectoId: proyectoSostenible.id,
        orden: 3,
        fechaInicio: new Date('2024-05-01')
    },
      {
        nombre: 'Mantenimiento',
        descripcion: 'Mantenimiento preventivo y correctivo',
        proyectoId: proyectoSostenible.id,
        orden: 4,
        fechaInicio: new Date('2024-06-01')
    },
      {
        nombre: 'Venta de Publicidad',
        descripcion: 'Comercialización de espacios publicitarios',
        proyectoId: proyectoSostenible.id,
        orden: 5,
        fechaInicio: new Date('2024-06-01')
    },
    ]
    });

  // PROYECTO 4: Agencia de Marketing (Futuro)
  const proyectoAgencia = await prisma.proyecto.create({
    data: {
      nombre: 'Agencia de Marketing y Productora',
      descripcion: 'Nueva unidad de negocio: estudio, sala de reuniones, computadoras de edición',
      departamentoId: deptMarketing.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-12-31'),
      responsableId: gerente.id,
      miembros: {
        create: [
          { usuarioId: lucero.id, rol: RolProyecto.Responsable },
          { usuarioId: diseñadora1.id, rol: RolProyecto.Miembro },
          { usuarioId: diseñadora2.id, rol: RolProyecto.Miembro },
        ]
    }
    }
    });

  // Etapas de la Agencia
  await prisma.etapa.createMany({
    data: [
      {
        nombre: 'Definición de Servicios',
        descripcion: 'Definir portafolio de servicios',
        proyectoId: proyectoAgencia.id,
        orden: 1,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-02-01')
    },
      {
        nombre: 'Adquisición de Equipos',
        descripcion: 'Comprar computadoras, cámaras, etc.',
        proyectoId: proyectoAgencia.id,
        orden: 2,
        fechaInicio: new Date('2025-02-01'),
        fechaFin: new Date('2025-04-01')
    },
      {
        nombre: 'Acondicionamiento de Espacio',
        descripcion: 'Preparar estudio y sala de reuniones',
        proyectoId: proyectoAgencia.id,
        orden: 3,
        fechaInicio: new Date('2025-04-01'),
        fechaFin: new Date('2025-06-01')
    },
      {
        nombre: 'Búsqueda de Clientes',
        descripcion: 'Marketing y ventas de servicios',
        proyectoId: proyectoAgencia.id,
        orden: 4,
        fechaInicio: new Date('2025-06-01')
    },
    ]
    });

  // PROYECTO 5: XHION Core (Proyecto Interno)
  const proyectoXhion = await prisma.proyecto.create({
    data: {
      nombre: 'XHION Core - Plataforma de Gestión',
      descripcion: 'Desarrollo de plataforma de gestión de proyectos impulsada por IA',
      departamentoId: deptSistemas.id,
      estado: EstadoProyecto.Activo,
      fechaInicio: new Date('2024-09-01'),
      fechaFin: new Date('2025-06-01'),
      responsableId: eduardo.id,
      miembros: {
        create: [
          { usuarioId: eduardo.id, rol: RolProyecto.Responsable },
          { usuarioId: omar.id, rol: RolProyecto.Miembro },
        ]
    }
    }
    });

  // ============================================
  // 5. PRESUPUESTOS
  // ============================================
  console.log('💰 Creando presupuestos...');

  await prisma.presupuestoProyecto.createMany({
    data: [
      {
        proyectoId: proyectoCallCenter.id,
        montoTotal: 50000,
        montoGastado: 15000,
        montoDisponible: 35000,
        creadoPorId: gerente.id,
        descripcion: 'Presupuesto para implementación de call center'
    },
      {
        proyectoId: proyectoChatbot.id,
        montoTotal: 30000,
        montoGastado: 12000,
        montoDisponible: 18000,
        creadoPorId: eduardo.id,
        descripcion: 'Presupuesto para desarrollo de chatbot'
    },
      {
        proyectoId: proyectoSostenible.id,
        montoTotal: 100000,
        montoGastado: 45000,
        montoDisponible: 55000,
        creadoPorId: gerente.id,
        descripcion: 'Presupuesto para fabricación de estaciones solares'
    },
      {
        proyectoId: proyectoAgencia.id,
        montoTotal: 150000,
        montoGastado: 0,
        montoDisponible: 150000,
        creadoPorId: gerente.id,
        descripcion: 'Presupuesto para lanzamiento de agencia'
    },
      {
        proyectoId: proyectoXhion.id,
        montoTotal: 40000,
        montoGastado: 25000,
        montoDisponible: 15000,
        creadoPorId: eduardo.id,
        descripcion: 'Presupuesto para desarrollo de XHION Core'
    },
    ]
    });

  // ============================================
  // 6. IDEAS
  // ============================================
  console.log('💡 Creando ideas...');

  const idea1 = await prisma.idea.create({
    data: {
      titulo: 'Programa de Fidelización para Clientes',
      descripcion: 'Implementar un sistema de puntos para clientes frecuentes de las tiendas',
      categoria: CategoriaIdea.Feature,
      autorId: vendedor1.id,
      estado: EstadoIdea.Evaluating
    }
    });

  const idea2 = await prisma.idea.create({
    data: {
      titulo: 'App Móvil para Seguimiento de Reparaciones',
      descripcion: 'Crear una app donde los clientes puedan ver el estado de sus reparaciones en tiempo real',
      categoria: CategoriaIdea.Innovation,
      autorId: luz.id,
      estado: EstadoIdea.Evaluating
    }
    });

  const idea3 = await prisma.idea.create({
    data: {
      titulo: 'Estaciones de Carga en Universidades',
      descripcion: 'Expandir el proyecto sostenible a universidades con alto tráfico de estudiantes',
      categoria: CategoriaIdea.Improvement,
      autorId: ricardo.id,
      estado: EstadoIdea.Approved
    }
    });

  // Comentarios en ideas
  await prisma.comentarioIdea.createMany({
    data: [
      {
        ideaId: idea1.id,
        usuarioId: gerente.id,
        contenido: 'Excelente idea! Esto podría aumentar la retención de clientes significativamente.'
    },
      {
        ideaId: idea1.id,
        usuarioId: luz.id,
        contenido: 'Podríamos integrarlo con el sistema de ventas actual.'
    },
      {
        ideaId: idea2.id,
        usuarioId: eduardo.id,
        contenido: 'Técnicamente viable. Podríamos desarrollarlo en 3 meses.'
    },
      {
        ideaId: idea3.id,
        usuarioId: gerente.id,
        contenido: 'Aprobada! Coordinemos con Ricardo para iniciar el proyecto.'
    },
    ]
    });

  // ============================================
  // 7. EVENTOS DE CALENDARIO
  // ============================================
  console.log('📅 Creando eventos...');

  await prisma.evento.createMany({
    data: [
      {
        titulo: 'Reunión de Planificación - Call Center',
        descripcion: 'Revisión de avances y próximos pasos',
        fechaInicio: new Date('2024-11-15T09:00:00'),
        fechaFin: new Date('2024-11-15T11:00:00'),
        tipo: TipoEvento.Reunion,
        proyectoId: proyectoCallCenter.id,
        creadorId: luz.id
    },
      {
        titulo: 'Demo del Chatbot',
        descripcion: 'Presentación del prototipo al gerente',
        fechaInicio: new Date('2024-11-20T15:00:00'),
        fechaFin: new Date('2024-11-20T16:00:00'),
        tipo: TipoEvento.Reunion,
        proyectoId: proyectoChatbot.id,
        creadorId: eduardo.id
    },
      {
        titulo: 'Evento Bumblebee - Senati Pisco',
        descripcion: 'Presentación de Bumblebee en evento de Senati',
        fechaInicio: new Date('2024-11-25T10:00:00'),
        fechaFin: new Date('2024-11-25T18:00:00'),
        tipo: TipoEvento.Personal,
        proyectoId: proyectoBumblebee.id,
        creadorId: lucero.id
    },
      {
        titulo: 'Instalación de Estación Solar - Plaza de Armas',
        descripcion: 'Instalación de nueva estación de carga',
        fechaInicio: new Date('2024-11-18T08:00:00'),
        fechaFin: new Date('2024-11-18T12:00:00'),
        tipo: TipoEvento.Tarea,
        proyectoId: proyectoSostenible.id,
        creadorId: ricardo.id
    },
      {
        titulo: 'Sprint Planning - XHION Core',
        descripcion: 'Planificación del próximo sprint de desarrollo',
        fechaInicio: new Date('2024-11-11T14:00:00'),
        fechaFin: new Date('2024-11-11T16:00:00'),
        tipo: TipoEvento.Reunion,
        proyectoId: proyectoXhion.id,
        creadorId: eduardo.id
    },
    ]
    });

  console.log('✅ Seed de empresa completa finalizado!');
  console.log(`
  📊 Resumen:
  - Departamentos: 6
  - Usuarios: 11
  - Proyectos: 7 (5 principales + 2 sub-proyectos)
  - Etapas: 20+
  - Tareas: 15+
  - Presupuestos: 5
  - Ideas: 3
  - Comentarios: 4
  - Eventos: 5
  
  🔑 Credenciales de acceso:
  - Email: gerente@bigander.com | Password: Password123!
  - Email: eduardo.tanca@bigander.com | Password: Password123!
  - Email: luz.garcia@bigander.com | Password: Password123!
  - Email: maitet.rodriguez@bigander.com | Password: Password123!
  - Email: lucero.sanchez@bigander.com | Password: Password123!
  `);
}

// Ejecutar seed
seedEmpresaCompleta()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
