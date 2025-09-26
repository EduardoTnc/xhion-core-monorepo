import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaService } from './auditoria.service';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [PrismaModule],
  providers: [AuditoriaService, AuditInterceptor],
  exports: [AuditoriaService, AuditInterceptor],
})
export class AuditoriaModule {}
