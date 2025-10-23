import { Module } from '@nestjs/common';
import { ConocimientoController } from './conocimiento.controller';
import { ConocimientoService } from './conocimiento.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConocimientoController],
  providers: [ConocimientoService],
  exports: [ConocimientoService],
})
export class ConocimientoModule {}
