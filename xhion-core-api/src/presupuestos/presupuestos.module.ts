import { Module } from '@nestjs/common';
import { PresupuestosController } from './presupuestos.controller';
import { PresupuestosService } from './presupuestos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PresupuestosController],
  providers: [PresupuestosService],
  exports: [PresupuestosService],
})
export class PresupuestosModule {}
