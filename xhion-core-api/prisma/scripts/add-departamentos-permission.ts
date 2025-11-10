import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDepartamentosPermission() {
  try {
    console.log('🔧 Agregando permiso departamentos.ver al rol Administrador...');

    // Buscar el permiso
    const permiso = await prisma.permiso.findFirst({
      where: { nombreAccion: 'departamentos.ver' }
    });

    if (!permiso) {
      console.error('❌ Permiso departamentos.ver no encontrado');
      return;
    }

    // Buscar el rol Administrador
    const rolAdmin = await prisma.rol.findFirst({
      where: { nombre: 'Administrador' }
    });

    if (!rolAdmin) {
      console.error('❌ Rol Administrador no encontrado');
      return;
    }

    // Verificar si ya existe la relación
    const existeRelacion = await prisma.rolPermiso.findUnique({
      where: {
        rolId_permisoId: {
          rolId: rolAdmin.id,
          permisoId: permiso.id
        }
      }
    });

    if (existeRelacion) {
      console.log('✅ El permiso ya está asignado');
      return;
    }

    // Crear la relación
    await prisma.rolPermiso.create({
      data: {
        rolId: rolAdmin.id,
        permisoId: permiso.id
      }
    });

    console.log('✅ Permiso departamentos.ver agregado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDepartamentosPermission();
