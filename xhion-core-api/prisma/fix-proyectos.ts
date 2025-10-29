import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigiendo proyectos...\n');

  // 1. Obtener el usuario administrador
  const admin = await prisma.usuario.findUnique({
    where: { email: 'admin@xhion.com' },
  });

  if (!admin) {
    console.error('❌ Usuario administrador no encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuario admin encontrado: ${admin.email} (${admin.id})\n`);

  // 2. Obtener todos los proyectos sin responsable o con responsable diferente
  const proyectos = await prisma.proyecto.findMany({
    where: {
      fechaEliminacion: null,
    },
    select: {
      id: true,
      nombre: true,
      responsableId: true,
      responsable: {
        select: {
          nombreCompleto: true,
        },
      },
    },
  });

  console.log(`📊 Total de proyectos activos: ${proyectos.length}\n`);

  // 3. Actualizar proyectos para asignar al admin como responsable
  let actualizados = 0;
  let yaAsignados = 0;

  for (const proyecto of proyectos) {
    if (proyecto.responsableId === admin.id) {
      console.log(`✓ ${proyecto.nombre} - Ya asignado a admin`);
      yaAsignados++;
    } else {
      await prisma.proyecto.update({
        where: { id: proyecto.id },
        data: { responsableId: admin.id },
      });
      console.log(`✅ ${proyecto.nombre} - Asignado a admin`);
      actualizados++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 CORRECCIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Proyectos actualizados: ${actualizados}`);
  console.log(`   ✓ Proyectos ya asignados: ${yaAsignados}`);
  console.log(`   📁 Total de proyectos: ${proyectos.length}\n`);
  console.log('💡 Ahora refresca el frontend para ver los proyectos\n');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
