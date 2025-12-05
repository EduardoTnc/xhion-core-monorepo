/**
 * SEED PRINCIPAL DE XHION CORE - VERSIÓN COMPLETA
 * 
 * Este archivo centraliza todo el proceso de seeding de la base de datos.
 * Incluye datos completos de empresa basados en Negocios Asociados Bigander S.A.C.
 */

import { PrismaClient, EstadoProyecto, EstadoTarea, PrioridadTarea, TipoEvento, RolProyecto, EstadoIdea, CategoriaIdea, EstadoUsuario } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { seedPermisos } from './seeds/permisos.seed';
import { seedProyectosCompletos } from './seeds/empresa-proyectos.seed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ============================================
// SEED BÁSICO: Permisos + Admin
// ============================================
async function seedBasico() {
  console.log('🚀 Iniciando seed BÁSICO de XHION Core...\n');

  // 1) SEED DE PERMISOS
  console.log('📋 PASO 1: Creando catálogo de permisos...');
  const totalPermisos = await seedPermisos(prisma);
  console.log('');

  // 2) CREAR ROL ADMINISTRADOR
  console.log('👑 PASO 2: Creando rol Administrador...');
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {
      color: 'bg-purple-600',
      descripcion: 'Acceso total al sistema con todos los permisos',
    },
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema con todos los permisos',
      color: 'bg-purple-600',
    },
  });
  console.log(`✅ Rol Administrador: ${adminRol.id}`);
  console.log('');

  // 3) ASIGNAR TODOS LOS PERMISOS AL ADMINISTRADOR
  console.log('🔐 PASO 3: Asignando todos los permisos al Administrador...');
  const todosLosPermisos = await prisma.permiso.findMany();
  await prisma.rolPermiso.deleteMany({ where: { rolId: adminRol.id } });
  await prisma.rolPermiso.createMany({
    data: todosLosPermisos.map((permiso) => ({
      rolId: adminRol.id,
      permisoId: permiso.id,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ ${todosLosPermisos.length} permisos asignados al Administrador`);
  console.log('');

  // 4) DEPARTAMENTO BASE
  console.log('🏢 PASO 4: Creando departamento base...');
  const generalDepto = await prisma.departamento.upsert({
    where: { nombre: 'General' },
    update: {},
    create: {
      nombre: 'General',
      descripcion: 'Departamento general de la organización',
    },
  });
  console.log(`✅ Departamento General: ${generalDepto.id}`);
  console.log('');

  // 5) USUARIO ADMINISTRADOR
  console.log('👤 PASO 5: Creando usuario administrador...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@xhion.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      nombreCompleto: 'Administrador XHION',
      passwordHash,
      rolId: adminRol.id,
      estado: 'ACTIVO',
    },
    create: {
      nombreCompleto: 'Administrador XHION',
      email: adminEmail,
      passwordHash,
      rolId: adminRol.id,
      estado: 'ACTIVO',
    },
  });

  console.log(`✅ Usuario Administrador creado:`);
  console.log(`   - Email: ${adminUser.email}`);
  console.log(`   - Password: ${adminPassword}`);
  console.log(`   - ID: ${adminUser.id}`);
  console.log('');

  return { totalPermisos, adminRol, adminUser, adminEmail, adminPassword };
}

// ============================================
// SEED COMPLETO: Básico + Empresa Completa
// ============================================
async function seedCompleto() {
  console.log('🚀 Iniciando seed COMPLETO de XHION Core (Empresa Bigander)...\n');

  // Ejecutar seed básico primero
  const { totalPermisos, adminRol } = await seedBasico();

  console.log('\n🏢 PASO 6: Creando datos de empresa completa...');
  console.log('═══════════════════════════════════════════════════════\n');

  // ROLES ADICIONALES
  console.log('📋 Creando roles adicionales...');

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

  // Asignar permisos a Jefe de Departamento
  const permisosJefe = [
    'proyectos.ver', 'proyectos.crear', 'proyectos.editar',
    'tareas.ver', 'tareas.crear', 'tareas.editar',
    'departamentos.ver', 'usuarios.ver',
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

  // DEPARTAMENTOS
  console.log('🏢 Creando departamentos...');

  const deptVentas = await prisma.departamento.upsert({
    where: { nombre: 'Ventas' },
    update: {},
    create: {
      nombre: 'Ventas',
      descripcion: 'Gestiona las operaciones de tiendas físicas, call center y ventas digitales para Fontech y Fumanía'
    }
  });

  const deptMarketing = await prisma.departamento.upsert({
    where: { nombre: 'Marketing' },
    update: {},
    create: {
      nombre: 'Marketing',
      descripcion: 'Responsable de la promoción de las marcas Fontech, Fumanía, Proyecto Sostenible Perú y la futura agencia'
    }
  });

  const deptDiseno = await prisma.departamento.upsert({
    where: { nombre: 'Diseño' },
    update: {},
    create: {
      nombre: 'Diseño',
      descripcion: 'Crea los activos visuales para marketing y publicidad. Actualmente usa Notion para gestión interna'
    }
  });

  const deptSistemas = await prisma.departamento.upsert({
    where: { nombre: 'Sistemas' },
    update: {},
    create: {
      nombre: 'Sistemas',
      descripcion: 'Desarrolla y mantiene las soluciones de software internas, incluyendo XHION Core y el Chatbot'
    }
  });

  const deptRRHH = await prisma.departamento.upsert({
    where: { nombre: 'Recursos Humanos' },
    update: {},
    create: {
      nombre: 'Recursos Humanos',
      descripcion: 'Gestiona el personal de las tiendas y las áreas administrativas'
    }
  });

  const deptMantenimiento = await prisma.departamento.upsert({
    where: { nombre: 'Mantenimiento y Taller' },
    update: {},
    create: {
      nombre: 'Mantenimiento y Taller',
      descripcion: 'Área para reparaciones de infraestructura de tiendas y fabricación para el proyecto sostenible'
    }
  });

  // USUARIOS
  console.log('👥 Creando usuarios...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Carlos Mendoza',
      email: 'gerente@gmail.com',
      passwordHash: hashedPassword,
      rolId: adminRol.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    }
  });

  const eduardo = await prisma.usuario.upsert({
    where: { email: 'eduardo.tanca@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Eduardo Tanca',
      email: 'eduardo.tanca@gmail.com',
      passwordHash: hashedPassword,
      rolId: adminRol.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo'
    }
  });

  const luz = await prisma.usuario.upsert({
    where: { email: 'luz.garcia@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Luz García',
      email: 'luz.garcia@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolGerenteProyecto.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luz'
    }
  });

  const maitet = await prisma.usuario.upsert({
    where: { email: 'maitet.rodriguez@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Maitet Rodríguez',
      email: 'maitet.rodriguez@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolGerenteProyecto.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maitet'
    }
  });

  const lucero = await prisma.usuario.upsert({
    where: { email: 'lucero.sanchez@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Lucero Sánchez',
      email: 'lucero.sanchez@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolJefeDepartamento.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucero'
    }
  });

  const ricardo = await prisma.usuario.upsert({
    where: { email: 'ricardo.torres@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Ricardo Torres',
      email: 'ricardo.torres@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo'
    }
  });

  const omar = await prisma.usuario.upsert({
    where: { email: 'omar.perez@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Omar Pérez',
      email: 'omar.perez@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar'
    }
  });

  const diseñadora1 = await prisma.usuario.upsert({
    where: { email: 'ana.flores@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Ana Flores',
      email: 'ana.flores@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
    }
  });

  const diseñadora2 = await prisma.usuario.upsert({
    where: { email: 'maria.castro@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'María Castro',
      email: 'maria.castro@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolMiembroEquipo.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    }
  });

  const vendedor1 = await prisma.usuario.upsert({
    where: { email: 'juan.ramirez@gmail.com' },
    update: {},
    create: {
      nombreCompleto: 'Juan Ramírez',
      email: 'juan.ramirez@gmail.com',
      passwordHash: hashedPassword,
      rolId: rolColaborador.id,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
    }
  });

  // Usuarios adicionales para testing (30 más)
  console.log('👥 Creando usuarios adicionales para testing...');

  const usuariosAdicionales = [
    { nombre: 'Patricia Morales', email: 'patricia.morales@gmail.com', seed: 'Patricia' },
    { nombre: 'Roberto Silva', email: 'roberto.silva@gmail.com', seed: 'Roberto' },
    { nombre: 'Carmen Vega', email: 'carmen.vega@gmail.com', seed: 'Carmen' },
    { nombre: 'Diego Fernández', email: 'diego.fernandez@gmail.com', seed: 'Diego' },
    { nombre: 'Sofía Ruiz', email: 'sofia.ruiz@gmail.com', seed: 'Sofia' },
    { nombre: 'Miguel Ángel Herrera', email: 'miguel.herrera@gmail.com', seed: 'Miguel' },
    { nombre: 'Valentina Ortiz', email: 'valentina.ortiz@gmail.com', seed: 'Valentina' },
    { nombre: 'Andrés Medina', email: 'andres.medina@gmail.com', seed: 'Andres' },
    { nombre: 'Isabella Rojas', email: 'isabella.rojas@gmail.com', seed: 'Isabella' },
    { nombre: 'Gabriel Núñez', email: 'gabriel.nunez@gmail.com', seed: 'Gabriel' },
    { nombre: 'Camila Vargas', email: 'camila.vargas@gmail.com', seed: 'Camila' },
    { nombre: 'Sebastián Cruz', email: 'sebastian.cruz@gmail.com', seed: 'Sebastian' },
    { nombre: 'Daniela Reyes', email: 'daniela.reyes@gmail.com', seed: 'Daniela' },
    { nombre: 'Mateo Jiménez', email: 'mateo.jimenez@gmail.com', seed: 'Mateo' },
    { nombre: 'Martina Delgado', email: 'martina.delgado@gmail.com', seed: 'Martina' },
    { nombre: 'Lucas Paredes', email: 'lucas.paredes@gmail.com', seed: 'Lucas' },
    { nombre: 'Emma Gutiérrez', email: 'emma.gutierrez@gmail.com', seed: 'Emma' },
    { nombre: 'Nicolás Mendoza', email: 'nicolas.mendoza@gmail.com', seed: 'Nicolas' },
    { nombre: 'Renata Campos', email: 'renata.campos@gmail.com', seed: 'Renata' },
    { nombre: 'Joaquín Salazar', email: 'joaquin.salazar@gmail.com', seed: 'Joaquin' },
    { nombre: 'Victoria Navarro', email: 'victoria.navarro@gmail.com', seed: 'Victoria' },
    { nombre: 'Emilio Cortés', email: 'emilio.cortes@gmail.com', seed: 'Emilio' },
    { nombre: 'Catalina Ríos', email: 'catalina.rios@gmail.com', seed: 'Catalina' },
    { nombre: 'Tomás Aguilar', email: 'tomas.aguilar@gmail.com', seed: 'Tomas' },
    { nombre: 'Florencia Peña', email: 'florencia.pena@gmail.com', seed: 'Florencia' },
    { nombre: 'Felipe Romero', email: 'felipe.romero@gmail.com', seed: 'Felipe' },
    { nombre: 'Julieta Soto', email: 'julieta.soto@gmail.com', seed: 'Julieta' },
    { nombre: 'Maximiliano Luna', email: 'maximiliano.luna@gmail.com', seed: 'Maximiliano' },
    { nombre: 'Antonella Bravo', email: 'antonella.bravo@gmail.com', seed: 'Antonella' },
    { nombre: 'Santiago Molina', email: 'santiago.molina@gmail.com', seed: 'Santiago' },
  ];

  for (const usuario of usuariosAdicionales) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: {
        nombreCompleto: usuario.nombre,
        email: usuario.email,
        passwordHash: hashedPassword,
        rolId: rolColaborador.id,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usuario.seed}`
      }
    });
  }

  console.log(`✅ ${usuariosAdicionales.length} usuarios adicionales creados`);

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

  console.log('✅ Usuarios y departamentos creados\n');

  // PROYECTOS, TAREAS, PRESUPUESTOS, IDEAS Y EVENTOS
  const statsProyectos = await seedProyectosCompletos(
    prisma,
    { deptVentas, deptMarketing, deptDiseno, deptSistemas, deptRRHH, deptMantenimiento },
    { gerente, eduardo, luz, maitet, lucero, ricardo, omar, diseñadora1, diseñadora2, vendedor1 }
  );

  console.log('✅ Seed de empresa completa finalizado\n');

  return {
    totalPermisos,
    roles: 5,
    departamentos: 6,
    usuarios: 41, // 11 originales + 30 adicionales
    proyectos: statsProyectos.proyectos,
    etapas: statsProyectos.etapas,
    tareas: statsProyectos.tareas,
    presupuestos: statsProyectos.presupuestos,
    ideas: statsProyectos.ideas,
    eventos: statsProyectos.eventos
  };
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  const seedMode = process.env.SEED_MODE || 'full';

  try {
    if (seedMode === 'full') {
      const result = await seedCompleto();

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🎉 SEED COMPLETO FINALIZADO CON ÉXITO');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📊 Resumen:');
      console.log(`   ✅ Permisos: ${result.totalPermisos}`);
      console.log(`   ✅ Roles: ${result.roles}`);
      console.log(`   ✅ Departamentos: ${result.departamentos}`);
      console.log(`   ✅ Usuarios: ${result.usuarios}`);
      console.log(`   ✅ Proyectos: ${result.proyectos}`);
      console.log(`   ✅ Etapas: ${result.etapas}`);
      console.log(`   ✅ Tareas: ${result.tareas}`);
      console.log(`   ✅ Presupuestos: ${result.presupuestos}`);
      console.log(`   ✅ Ideas: ${result.ideas}`);
      console.log(`   ✅ Eventos: ${result.eventos}`);
      console.log('');
      console.log('🔑 Credenciales principales:');
      console.log('   - gerente@gmail.com | Password123!');
      console.log('   - eduardo.tanca@gmail.com | Password123!');
      console.log('   - luz.garcia@gmail.com | Password123!');
      console.log('   - maitet.rodriguez@gmail.com | Password123!');
      console.log('   - lucero.sanchez@gmail.com | Password123!');
      console.log('');
    } else {
      const result = await seedBasico();

      console.log('═══════════════════════════════════════════════════════');
      console.log('🎉 SEED BÁSICO COMPLETADO CON ÉXITO');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📊 Resumen:');
      console.log(`   ✅ Permisos: ${result.totalPermisos}`);
      console.log(`   ✅ Roles: 1 (Administrador)`);
      console.log(`   ✅ Departamentos: 1 (General)`);
      console.log(`   ✅ Usuarios: 1 (Administrador)`);
      console.log('');
      console.log('🔑 Credenciales de acceso:');
      console.log(`   Email: ${result.adminEmail}`);
      console.log(`   Password: ${result.adminPassword}`);
      console.log('');
      console.log('💡 Para seed completo ejecuta: SEED_MODE=full npx prisma db seed');
      console.log('');
    }
    console.log('═══════════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
