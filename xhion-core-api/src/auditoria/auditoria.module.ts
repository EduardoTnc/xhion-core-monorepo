import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaService } from './auditoria.service';
import { AuditInterceptor } from './audit.interceptor';
import { AuditoriaController } from './auditoria.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditInterceptor],
  exports: [AuditoriaService, AuditInterceptor],
})
export class AuditoriaModule { }
