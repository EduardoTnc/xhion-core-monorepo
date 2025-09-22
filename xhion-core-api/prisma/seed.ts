import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding base data...');

  // 1) Roles base
  const [adminRol, gerenteRol, colaboradorRol] = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'Admin' },
      update: {},
      create: { nombre: 'Admin', descripcion: 'Administrador del sistema' },
    }),
    prisma.rol.upsert({
      where: { nombre: 'Gerente' },
      update: {},
      create: { nombre: 'Gerente', descripcion: 'Líder de proyecto / Gerencia' },
    }),
    prisma.rol.upsert({
      where: { nombre: 'Colaborador' },
      update: {},
      create: { nombre: 'Colaborador', descripcion: 'Miembro del equipo' },
    }),
  ]);

  // 2) Departamento base
  const generalDepto = await prisma.departamento.upsert({
    where: { nombre: 'General' },
    update: {},
    create: { nombre: 'General' },
  });

  // 3) Usuario admin (si no existe)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@xhion.local';
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

  console.log('Seed completado con éxito. IDs útiles para pruebas:');
  console.log({
    roles: {
      admin: adminRol.id,
      gerente: gerenteRol.id,
      colaborador: colaboradorRol.id,
    },
    departamento: {
      general: generalDepto.id,
    },
    admin: {
      id: adminUser.id,
      email: adminUser.email,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
