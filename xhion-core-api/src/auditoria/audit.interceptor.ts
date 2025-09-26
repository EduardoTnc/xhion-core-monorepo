import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service';
import { AUDIT_ACTION_KEY } from './auditar.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const accion = this.reflector.get<string>(AUDIT_ACTION_KEY, handler);

    if (!accion) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      tap(async () => {
        try {
          const usuarioId = request.user?.id ?? request.auditUsuarioId ?? null;
          const detalles = request.auditDetalles ?? null;
          const ip = request.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() ?? request.ip ?? null;
          await this.auditoriaService.registrarAccion(usuarioId, accion, detalles, ip);
        } catch (error) {
          // swallow
        }
      }),
    );
  }
}
