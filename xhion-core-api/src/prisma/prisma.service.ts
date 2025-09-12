// xhion-core-api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Conexión a la base de datos al iniciar el módulo
    await this.$connect();
  }

  async onModuleDestroy() {
    // Cierra la conexión a la base de datos al destruir el módulo
    await this.$disconnect();
  }
}