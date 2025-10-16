// xhion-core-api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding base data...');

  // 1) Roles base con colores
  const [adminRol, gerenteRol, colaboradorRol] = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'Admin' },
      update: { color: 'bg-destructive', descripcion: 'Administrador del sistema con control total' },
      create: { 
        nombre: 'Admin', 
        descripcion: 'Administrador del sistema con control total',
        color: 'bg-destructive',
      },
    }),
    prisma.rol.upsert({
      where: { nombre: 'Gerente' },
      update: { color: 'bg-primary', descripcion: 'Líder de proyecto con permisos de gestión' },
      create: { 
        nombre: 'Gerente', 
        descripcion: 'Líder de proyecto con permisos de gestión',
        color: 'bg-primary',
      },
    }),
    prisma.rol.upsert({
      where: { nombre: 'Colaborador' },
      update: { color: 'bg-chart-2', descripcion: 'Miembro del equipo con permisos básicos' },
      create: { 
        nombre: 'Colaborador', 
        descripcion: 'Miembro del equipo con permisos básicos',
        color: 'bg-chart-2',
      },
    }),
  ]);

  // 2) Departamento base
  const generalDepto = await prisma.departamento.upsert({
    where: { nombre: 'General' },
    update: {},
    create: { nombre: 'General' },
  });

  // 3) Usuario admin (si no existe)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
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
