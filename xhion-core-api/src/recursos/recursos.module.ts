import { Module } from '@nestjs/common';
import { RecursosController } from './recursos.controller';
import { RecursosService } from './recursos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecursosController],
  providers: [RecursosService],
  exports: [RecursosService],
})
export class RecursosModule {}
