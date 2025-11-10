import { Module } from '@nestjs/common';
import { SolicitudesAccesoController } from './solicitudes-acceso.controller';
import { SolicitudesAccesoService } from './solicitudes-acceso.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [SolicitudesAccesoController],
  providers: [SolicitudesAccesoService],
  exports: [SolicitudesAccesoService],
})
export class SolicitudesAccesoModule {}
