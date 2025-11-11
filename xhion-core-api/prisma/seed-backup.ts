/**
 * SEED PRINCIPAL DE XHION CORE
 * 
 * Este archivo centraliza todo el proceso de seeding de la base de datos.
 * 
 * Modos de ejecución:
 * - SEED_MODE=basic (default): Crea solo permisos, rol admin y usuario admin
 * - SEED_MODE=full: Crea datos completos de empresa (departamentos, usuarios, proyectos, etc.)
 * 
 * Uso:
 * ```bash
 * # Seed básico
 * npx prisma db seed
 * 
 * # Seed completo
 * SEED_MODE=full npx prisma db seed
 * ```
 */

import { PrismaClient, EstadoProyecto, EstadoTarea, PrioridadTarea, TipoEvento, RolProyecto, EstadoIdea, CategoriaIdea, EstadoUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedPermisos } from './seeds/permisos.seed';

const prisma = new PrismaClient();

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
  console.log('🚀 Iniciando seed COMPLETO de XHION Core...\n');

  // Ejecutar seed básico primero
  const { totalPermisos, adminRol } = await seedBasico();

  console.log('\n🏢 PASO 6: Creando datos de empresa completa...');
  console.log('═══════════════════════════════════════════════════════\n');

  // Obtener roles adicionales
  const rolJefeDepartamento = await prisma.rol.upsert({
    where: { nombre: 'Jefe de Departamento' },
    update: {},
    create: {
      nombre: 'Jefe de Departamento',
      descripcion: 'Gestiona un departamento y sus proyectos',
      color: 'bg-blue-600'
    }
  });

  const rolGerenteProyecto = await prisma.rol.upsert({
    where: { nombre: 'Gerente de Proyecto' },
    update: {},
    create: {
      nombre: 'Gerente de Proyecto',
      descripcion: 'Gestiona proyectos específicos',
      color: 'bg-green-600'
    }
  });

  const rolMiembroEquipo = await prisma.rol.upsert({
    where: { nombre: 'Miembro de Equipo' },
    update: {},
    create: {
      nombre: 'Miembro de Equipo',
      descripcion: 'Colabora en proyectos y tareas',
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

  // DEPARTAMENTOS
  console.log('🏢 Creando departamentos...');
  const deptVentas = await prisma.departamento.upsert({
    where: { nombre: 'Ventas' },
    update: {},
    create: {
      nombre: 'Ventas',
      descripcion: 'Gestiona las operaciones de tiendas físicas, call center y ventas digitales'
    }
  });

  const deptMarketing = await prisma.departamento.upsert({
    where: { nombre: 'Marketing' },
    update: {},
    create: {
      nombre: 'Marketing',
      descripcion: 'Estrategias de marketing digital, contenido y publicidad'
    }
  });

  const deptDiseno = await prisma.departamento.upsert({
    where: { nombre: 'Diseño' },
    update: {},
    create: {
      nombre: 'Diseño',
      descripcion: 'Diseño gráfico, UX/UI y contenido visual'
    }
  });

  const deptSistemas = await prisma.departamento.upsert({
    where: { nombre: 'Sistemas' },
    update: {},
    create: {
      nombre: 'Sistemas',
      descripcion: 'Desarrollo de software, infraestructura y soporte técnico'
    }
  });

  const deptRRHH = await prisma.departamento.upsert({
    where: { nombre: 'Recursos Humanos' },
    update: {},
    create: {
      nombre: 'Recursos Humanos',
      descripcion: 'Gestión de talento, capacitación y bienestar laboral'
    }
  });

  const deptMantenimiento = await prisma.departamento.upsert({
    where: { nombre: 'Mantenimiento y Taller' },
    update: {},
    create: {
      nombre: 'Mantenimiento y Taller',
      descripcion: 'Mantenimiento de equipos y reparaciones técnicas'
    }
  });

  // USUARIOS
  console.log('👥 Creando usuarios adicionales...');
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

  console.log('✅ Seed completo finalizado');

  return { totalPermisos, departamentos: 6, usuarios: 11 };
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  const seedMode = process.env.SEED_MODE || 'basic';

  try {
    if (seedMode === 'full') {
      const result = await seedCompleto();
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🎉 SEED COMPLETO FINALIZADO CON ÉXITO');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📊 Resumen:');
      console.log(`   ✅ Permisos: ${result.totalPermisos}`);
      console.log(`   ✅ Departamentos: ${result.departamentos}`);
      console.log(`   ✅ Usuarios: ${result.usuarios}`);
      console.log('');
      console.log('🔑 Credenciales principales:');
      console.log('   - gerente@gmail.com | Password123!');
      console.log('   - eduardo.tanca@gmail.com | Password123!');
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
