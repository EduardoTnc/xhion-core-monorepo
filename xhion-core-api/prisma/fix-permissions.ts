// Script para verificar y corregir permisos del administrador
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando permisos del administrador...\n');

  // 1. Buscar el rol de Administrador
  const adminRol = await prisma.rol.findFirst({
    where: { nombre: 'Administrador' },
    include: {
      permisos: {
        include: {
          permiso: true,
        },
      },
    },
  });

  if (!adminRol) {
    console.error('❌ No se encontró el rol de Administrador');
    console.log('💡 Ejecuta: pnpm run db:seed');
    return;
  }

  console.log(`✅ Rol Administrador encontrado: ${adminRol.id}`);
  console.log(`📊 Permisos actuales: ${adminRol.permisos.length}`);

  // 2. Obtener todos los permisos del sistema
  const todosLosPermisos = await prisma.permiso.findMany();
  console.log(`📋 Total de permisos en el sistema: ${todosLosPermisos.length}\n`);

  // 3. Verificar permisos faltantes
  const permisosAsignados = new Set(
    adminRol.permisos.map((rp) => rp.permisoId)
  );
  const permisosFaltantes = todosLosPermisos.filter(
    (p) => !permisosAsignados.has(p.id)
  );

  if (permisosFaltantes.length === 0) {
    console.log('✅ El administrador tiene TODOS los permisos asignados');
    console.log('\n📝 Permisos relacionados con proyectos:');
    const permisosProyectos = adminRol.permisos
      .filter((rp) => rp.permiso.nombreAccion.startsWith('proyectos.'))
      .map((rp) => `   ✓ ${rp.permiso.nombreAccion}`);
    console.log(permisosProyectos.join('\n'));
  } else {
    console.log(`⚠️  Faltan ${permisosFaltantes.length} permisos por asignar:`);
    permisosFaltantes.forEach((p) => {
      console.log(`   - ${p.nombreAccion}`);
    });

    console.log('\n🔧 Asignando permisos faltantes...');
    await prisma.rolPermiso.createMany({
      data: permisosFaltantes.map((permiso) => ({
        rolId: adminRol.id,
        permisoId: permiso.id,
      })),
      skipDuplicates: true,
    });
    console.log('✅ Permisos asignados correctamente');
  }

  // 4. Verificar usuarios con rol de Administrador
  const adminUsers = await prisma.usuario.findMany({
    where: { rolId: adminRol.id },
    select: {
      id: true,
      email: true,
      nombreCompleto: true,
      estado: true,
    },
  });

  console.log(`\n👥 Usuarios con rol Administrador: ${adminUsers.length}`);
  adminUsers.forEach((user) => {
    console.log(`   - ${user.email} (${user.estado})`);
  });

  console.log('\n✅ Verificación completada');
  console.log('💡 Si el problema persiste, cierra sesión y vuelve a iniciar sesión');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
