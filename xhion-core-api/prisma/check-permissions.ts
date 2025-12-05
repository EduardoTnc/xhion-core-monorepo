import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
    console.log('Checking permission: sistema.configurar_empresa');

    const permiso = await prisma.permiso.findFirst({
        where: { nombreAccion: 'sistema.configurar_empresa' }
    });

    if (!permiso) {
        console.log('❌ Permission DOES NOT exist in DB.');
    } else {
        console.log('✅ Permission exists:', permiso.id);
    }

    const adminEmail = 'admin@xhion.com';
    const user = await prisma.usuario.findUnique({
        where: { email: adminEmail },
        include: {
            rol: {
                include: {
                    permisos: {
                        include: {
                            permiso: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        console.log('❌ Admin user not found.');
        return;
    }

    console.log(`User Role: ${user.rol.nombre}`);

    const hasPermission = user.rol.permisos.some(rp => rp.permiso.nombreAccion === 'sistema.configurar_empresa');

    if (hasPermission) {
        console.log('✅ User has the permission.');
    } else {
        console.log('❌ User DOES NOT have the permission.');

        // Fix it
        if (permiso) {
            console.log('Attempting to assign permission...');
            await prisma.rolPermiso.create({
                data: {
                    rolId: user.rolId,
                    permisoId: permiso.id
                }
            });
            console.log('✅ Permission assigned to Admin role.');
        }
    }
}

checkPermissions()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
