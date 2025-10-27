// xhion-core-api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedPermisos } from './seeds/permisos.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed de XHION Core...\n');

  // ========================================
  // 1) SEED DE PERMISOS
  // ========================================
  console.log('📋 PASO 1: Creando catálogo de permisos...');
  const totalPermisos = await seedPermisos(prisma);
  console.log('');

  // ========================================
  // 2) CREAR ROL ADMINISTRADOR
  // ========================================
  console.log('👑 PASO 2: Creando rol Administrador...');
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {
      color: 'bg-destructive',
      descripcion: 'Acceso total al sistema con todos los permisos',
    },
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema con todos los permisos',
      color: 'bg-destructive',
    },
  });
  console.log(`✅ Rol Administrador: ${adminRol.id}`);
  console.log('');

  // ========================================
  // 3) ASIGNAR TODOS LOS PERMISOS AL ADMINISTRADOR
  // ========================================
  console.log('🔐 PASO 3: Asignando todos los permisos al Administrador...');
  
  // Obtener todos los permisos
  const todosLosPermisos = await prisma.permiso.findMany();
  
  // Eliminar permisos existentes del rol (para re-seed)
  await prisma.rolPermiso.deleteMany({
    where: { rolId: adminRol.id },
  });

  // Asignar todos los permisos
  await prisma.rolPermiso.createMany({
    data: todosLosPermisos.map((permiso) => ({
      rolId: adminRol.id,
      permisoId: permiso.id,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ ${todosLosPermisos.length} permisos asignados al Administrador`);
  console.log('');

  // ========================================
  // 4) DEPARTAMENTO BASE
  // ========================================
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

  // ========================================
  // 5) USUARIO ADMINISTRADOR
  // ========================================
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

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 SEED COMPLETADO CON ÉXITO');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   ✅ Permisos creados: ${totalPermisos}`);
  console.log(`   ✅ Roles creados: 1 (Administrador)`);
  console.log(`   ✅ Permisos asignados: ${todosLosPermisos.length}`);
  console.log(`   ✅ Departamentos: 1 (General)`);
  console.log(`   ✅ Usuarios: 1 (Administrador)`);
  console.log('');
  console.log('🔑 Credenciales de acceso:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('');
  console.log('📝 Nota: Los demás roles deben ser creados desde la UI');
  console.log('         por el administrador según las necesidades de la empresa.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
