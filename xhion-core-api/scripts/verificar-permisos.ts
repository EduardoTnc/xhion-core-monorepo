/**
 * Script para verificar el estado de permisos en la base de datos
 * Ejecutar: npx ts-node scripts/verificar-permisos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarPermisos() {
  console.log('🔍 Verificando estado de permisos...\n');

  try {
    // 1. Contar permisos
    const totalPermisos = await prisma.permiso.count();
    console.log(`📋 Total de permisos en BD: ${totalPermisos}`);

    // 2. Buscar rol Administrador
    const adminRol = await prisma.rol.findFirst({
      where: { nombre: 'Administrador' },
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    });

    if (!adminRol) {
      console.log('❌ Rol Administrador NO encontrado');
      console.log('\n💡 Solución: Ejecutar "pnpm prisma db seed"\n');
      return;
    }

    console.log(`\n👑 Rol Administrador encontrado:`);
    console.log(`   - ID: ${adminRol.id}`);
    console.log(`   - Nombre: ${adminRol.nombre}`);
    console.log(`   - Color: ${adminRol.color}`);
    console.log(`   - Usuarios con este rol: ${adminRol._count.usuarios}`);
    console.log(`   - Permisos asignados: ${adminRol.permisos.length}/${totalPermisos}`);

    // 3. Verificar si tiene todos los permisos
    if (adminRol.permisos.length === 0) {
      console.log('\n❌ El rol Administrador NO tiene permisos asignados');
      console.log('💡 Solución: Ejecutar "pnpm prisma db seed"\n');
      return;
    }

    if (adminRol.permisos.length < totalPermisos) {
      console.log(
        `\n⚠️  El rol Administrador tiene ${adminRol.permisos.length} permisos de ${totalPermisos}`,
      );
      console.log('💡 Solución: Ejecutar "pnpm prisma db seed" para actualizar\n');
    } else {
      console.log('\n✅ El rol Administrador tiene TODOS los permisos asignados');
    }

    // 4. Mostrar permisos por módulo
    const permisosPorModulo = adminRol.permisos.reduce(
      (acc, rp) => {
        const nombreAccion = rp.permiso.nombreAccion;
        const modulo = nombreAccion.split('.')[0];
        if (!acc[modulo]) {
          acc[modulo] = [];
        }
        acc[modulo].push(nombreAccion);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    console.log('\n📊 Permisos por módulo:');
    Object.entries(permisosPorModulo)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([modulo, permisos]) => {
        console.log(`   - ${modulo}: ${permisos.length} permisos`);
      });

    // 5. Buscar usuario administrador
    const adminUser = await prisma.usuario.findFirst({
      where: {
        rol: {
          nombre: 'Administrador',
        },
      },
      include: {
        rol: true,
      },
    });

    if (!adminUser) {
      console.log('\n❌ Usuario Administrador NO encontrado');
      console.log('💡 Solución: Ejecutar "pnpm prisma db seed"\n');
      return;
    }

    console.log(`\n👤 Usuario Administrador encontrado:`);
    console.log(`   - ID: ${adminUser.id}`);
    console.log(`   - Nombre: ${adminUser.nombreCompleto}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Estado: ${adminUser.estado}`);
    console.log(`   - Rol: ${adminUser.rol?.nombre || 'Sin rol'}`);

    // 6. Resumen final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Permisos en BD: ${totalPermisos}`);
    console.log(`   ✅ Rol Administrador: Encontrado`);
    console.log(`   ✅ Permisos asignados: ${adminRol.permisos.length}/${totalPermisos}`);
    console.log(`   ✅ Usuario Administrador: Encontrado`);

    if (adminRol.permisos.length === totalPermisos) {
      console.log('\n🎉 Todo está configurado correctamente!');
      console.log('   Puedes iniciar sesión con:');
      console.log(`   - Email: ${adminUser.email}`);
      console.log('   - Password: Admin12345! (si es primera vez)\n');
    } else {
      console.log('\n⚠️  Ejecuta "pnpm prisma db seed" para completar la configuración\n');
    }
  } catch (error) {
    console.error('❌ Error al verificar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPermisos();
