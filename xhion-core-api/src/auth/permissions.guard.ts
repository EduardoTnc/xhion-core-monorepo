import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard para validar permisos granulares
 * 
 * Este guard verifica que el usuario autenticado tenga los permisos
 * específicos requeridos para ejecutar una acción.
 * 
 * Uso:
 * ```typescript
 * @RequiresPermission('proyectos.crear', 'proyectos.editar')
 * async createProject() { ... }
 * ```
 * 
 * Características:
 * - Valida múltiples permisos (el usuario debe tener TODOS)
 * - Cachea permisos del usuario en la request para optimizar
 * - Maneja casos de usuarios sin rol o sin permisos
 * - Proporciona mensajes de error descriptivos
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener permisos requeridos del decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Obtener usuario de la request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new UnauthorizedException(
        'Usuario no autenticado. Debes iniciar sesión para acceder a este recurso.',
      );
    }

    // 3. Verificar si ya tenemos los permisos cacheados en la request
    if (!request.userPermissions) {
      // Obtener permisos del usuario desde la base de datos
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.sub },
        include: {
          rol: {
            include: {
              permisos: {
                include: {
                  permiso: {
                    select: {
                      nombreAccion: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!usuario) {
        throw new UnauthorizedException(
          'Usuario no encontrado en el sistema.',
        );
      }

      if (!usuario.rol) {
        throw new ForbiddenException(
          'Tu usuario no tiene un rol asignado. Contacta al administrador.',
        );
      }

      // Extraer nombres de permisos y cachear en la request
      request.userPermissions = usuario.rol.permisos.map(
        (rp) => rp.permiso.nombreAccion,
      );

      // También cachear información del rol para otros guards
      request.userRole = {
        id: usuario.rol.id,
        nombre: usuario.rol.nombre,
      };
    }

    const userPermissions: string[] = request.userPermissions;

    // 4. Verificar si el usuario tiene TODOS los permisos requeridos
    const missingPermissions = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission),
    );

    if (missingPermissions.length > 0) {
      // Crear mensaje descriptivo de error
      const permisosRequeridos = requiredPermissions.join(', ');
      const permisosFaltantes = missingPermissions.join(', ');

      throw new ForbiddenException({
        message: 'No tienes los permisos necesarios para realizar esta acción',
        permisosRequeridos,
        permisosFaltantes,
        tusPermisos: userPermissions,
        sugerencia:
          'Contacta al administrador para solicitar los permisos necesarios',
      });
    }

    // 5. Usuario tiene todos los permisos requeridos
    return true;
  }
}

/**
 * Extensión de tipos para TypeScript
 * Agrega propiedades personalizadas a la Request
 */
declare global {
  namespace Express {
    interface Request {
      userPermissions?: string[];
      userRole?: {
        id: string;
        nombre: string;
      };
    }
  }
}
