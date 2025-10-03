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
    private readonly reflector: Reflector, // reflector es la herramienta de NestJS para leer metadatos
    private readonly auditoriaService: AuditoriaService, // auditoriaService es el servicio que se encarga de registrar la auditoria
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler(); // handler es el controlador que se ejecuta
    const accion = this.reflector.get<string>(AUDIT_ACTION_KEY, handler); // accion es el valor que se le pasa al decorador @Auditar

    // si no hay accion, no se hace nada y se continua ejecutando el controlador
    if (!accion) {
      return next.handle();
    }

    const ctx = context.switchToHttp(); // ctx es el contexto http
    const request = ctx.getRequest(); // request es el request

    return next.handle().pipe(
      tap(async () => {
        try {
          const usuarioId = request.user?.id ?? request.auditUsuarioId ?? null; // usuarioId es el id del usuario que hizo la accion
          const detalles = request.auditDetalles ?? null; // detalles es el detalle de la accion
          const ip = request.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() ?? request.ip ?? null; // ip es la ip del usuario
          await this.auditoriaService.registrarAccion(usuarioId, accion, detalles, ip); // registrar la accion
        } catch (error) {
          // swallow
        }
      }),
    );
  }
}
