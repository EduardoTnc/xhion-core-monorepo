// xhion-core-api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter, log: ['query', 'info', 'warn', 'error'] });
  }

  async onModuleInit() {
    // Conexión a la base de datos al iniciar el módulo
    await this.$connect();
  }

  async onModuleDestroy() {
    // Cierra la conexión a la base de datos al destruir el módulo
    await this.$disconnect();
  }
}