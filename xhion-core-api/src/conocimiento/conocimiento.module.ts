import { Module } from '@nestjs/common';
import { ConocimientoController } from './conocimiento.controller';
import { ConocimientoService } from './conocimiento.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [ConocimientoController],
  providers: [ConocimientoService],
  exports: [ConocimientoService],
})
export class ConocimientoModule {}
